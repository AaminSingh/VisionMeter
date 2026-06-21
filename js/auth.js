/**
 * auth.js
 * Lightweight "remember me" identification, NOT secure authentication.
 *
 * There is no server here — everything runs in the browser. So this module
 * does not verify a password against anything; it just lets someone type
 * their name + email once, stores that locally in IndexedDB on this device,
 * and recognizes them automatically on return visits (via a small marker in
 * localStorage) so their saved test history shows up again.
 *
 * Anyone with access to this browser profile could type the same email and
 * see that history — it's convenience, not a lock. If real account security
 * is ever needed, this needs a real backend with hashed passwords/sessions.
 */

const Auth = (() => {
  const DB_NAME = "visionmeter_users";
  const STORE = "users";
  const REMEMBER_KEY = "vm_current_email";
  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "email" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function upsertUser(email, name) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const getReq = store.get(email);
      getReq.onsuccess = () => {
        const existing = getReq.result;
        const user = {
          email,
          name: name || existing?.name || email.split("@")[0],
          createdAt: existing?.createdAt || new Date().toISOString()
        };
        store.put(user);
        tx.oncomplete = () => resolve(user);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async function getUser(email) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(email);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  function setCurrentUser(user) {
    AppState.currentUser = user;
    if (user && user.email !== "guest") {
      localStorage.setItem(REMEMBER_KEY, user.email);
    }
    renderUserBadge();
  }

  function logout() {
    AppState.currentUser = null;
    localStorage.removeItem(REMEMBER_KEY);
    renderUserBadge();
    Nav.show("loginScreen");
  }

  function continueAsGuest() {
    setCurrentUser({ email: "guest", name: "Guest" });
    greetAndEnter();
  }

  function greetAndEnter() {
    const greetEl = document.getElementById("welcomeGreeting");
    if (greetEl && AppState.currentUser) {
      greetEl.textContent = AppState.currentUser.email === "guest"
        ? "Browsing as a guest — sign in any time to save your history under your name."
        : `Welcome back, ${AppState.currentUser.name} 👋`;
    }
    Nav.show("welcomeScreen");
  }

  function renderUserBadge() {
    const badge = document.getElementById("userBadge");
    if (!badge) return;
    if (!AppState.currentUser) { badge.innerHTML = ""; return; }
    const { name, email } = AppState.currentUser;
    badge.innerHTML = email === "guest"
      ? `<span>👤 Guest</span> <a href="#" id="switchUserLink">Sign in</a>`
      : `<span>👤 ${name}</span> <a href="#" id="switchUserLink">Switch user</a>`;
    const link = document.getElementById("switchUserLink");
    if (link) link.onclick = (e) => { e.preventDefault(); logout(); };
  }

  async function tryAutoLogin() {
    const savedEmail = localStorage.getItem(REMEMBER_KEY);
    if (!savedEmail) return false;
    try {
      const user = await getUser(savedEmail);
      if (user) {
        setCurrentUser(user);
        greetAndEnter();
        return true;
      }
    } catch (err) {
      console.warn("VisionMeter: auto-login failed", err);
    }
    return false;
  }

  function init() {
    const form = document.getElementById("loginForm");
    const nameInput = document.getElementById("loginName");
    const emailInput = document.getElementById("loginEmail");
    const statusEl = document.getElementById("loginStatus");
    const guestBtn = document.getElementById("guestBtn");

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim().toLowerCase();
        const name = nameInput.value.trim();
        if (!isValidEmail(email)) {
          statusEl.textContent = "Enter a valid email address.";
          statusEl.style.color = "var(--danger)";
          return;
        }
        const user = await upsertUser(email, name);
        setCurrentUser(user);
        greetAndEnter();
      };
    }
    if (guestBtn) guestBtn.onclick = continueAsGuest;

    tryAutoLogin();
  }

  return { init, logout, continueAsGuest, setCurrentUser, renderUserBadge };
})();

window.Auth = Auth;
document.addEventListener("DOMContentLoaded", Auth.init);
