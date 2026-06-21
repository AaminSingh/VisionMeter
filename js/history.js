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
      tx.objectStore(STORE).add(JSON.parse(JSON.stringify(AppState.results)));
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

  async function clearAll() {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    renderList();
  }

  async function renderList() {
    const listEl = document.getElementById("historyList");
    if (!listEl) return;
    const sessions = await getAllSessions();
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

  return { saveSession, getAllSessions, clearAll, renderList };
})();

window.History = History;
