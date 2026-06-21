/**
 * history.js
 * Persists each completed session to IndexedDB so a user can see trends
 * across visits instead of only ever having the most recent PDF.
 */

const History = (() => {
  const DB_NAME = "visionmeter";
  const STORE = "sessions";
  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  async function saveSession() {
    if (!("indexedDB" in window)) return;
    try {
      AppState.stamp();
      const db = await openDB();
      const tx = db.transaction(STORE, "readwrite");
      const record = JSON.parse(JSON.stringify(AppState.results));
      record.email = AppState.currentUser?.email || "guest";
      tx.objectStore(STORE).add(record);
    } catch (err) {
      console.warn("VisionMeter: could not save history", err);
    }
  }

  async function getAllSessions() {
    if (!("indexedDB" in window)) return [];
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result.reverse());
      req.onerror = () => reject(req.error);
    });
  }

  // Only this device's IndexedDB quota limits storage (typically hundreds of
  // MB+), so there's effectively no practical cap on how many sessions get
  // kept — no pruning or row limit is applied here.
  async function getSessionsForCurrentUser() {
    const email = AppState.currentUser?.email || "guest";
    const all = await getAllSessions();
    return all.filter(s => (s.email || "guest") === email);
  }

  async function clearAll() {
    const email = AppState.currentUser?.email || "guest";
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) { renderList(); return; }
      if ((cursor.value.email || "guest") === email) cursor.delete();
      cursor.continue();
    };
  }

  async function renderList() {
    const listEl = document.getElementById("historyList");
    if (!listEl) return;
    const sessions = await getSessionsForCurrentUser();
    if (!sessions.length) {
      listEl.innerHTML = `<p class="handwriting">No saved sessions yet — complete a test to start tracking.</p>`;
      return;
    }
    listEl.innerHTML = sessions.map(s => {
      const date = s.timestamp ? new Date(s.timestamp).toLocaleString() : "Unknown date";
      const right = s.acuity?.right?.snellen ?? "—";
      const left = s.acuity?.left?.snellen ?? "—";
      return `
        <div class="history-row">
          <div class="history-date">${date}</div>
          <div class="history-grid">
            <span>👁️ R ${right} / L ${left}</span>
            <span>🎨 ${s.color?.label ?? "—"}</span>
            <span>🤓 ${s.astigmatism ?? "—"}</span>
            <span>🐼 ${s.contrast ?? "—"}</span>
            <span>🦊 ${s.visualField?.label ?? "—"}</span>
          </div>
        </div>`;
    }).join("");
  }

  return { saveSession, getAllSessions, getSessionsForCurrentUser, clearAll, renderList };
})();

window.History = History;
