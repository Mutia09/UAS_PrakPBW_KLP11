// ===== PAGE LOADER =====
async function loadPages() {
   const map = [
    ["authWrap", "html/auth.html"],
    ["page-dashboard", "html/dashboard.html"],
    ["page-cek", "html/cek.html"],
    ["page-child", "html/child.html"],
    ["page-profil", "html/profil.html"],
    ["modalsMount", "html/modals.html"],
  ];
  await Promise.all(
    map.map(async ([id, url]) => {
      const el = document.getElementById(id);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal memuat " + url);
      el.innerHTML = await res.text();
    }),
  );
}

function nav(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-item,.nav-child-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("active");
  const ne = document.getElementById("nav-" + page);
  if (ne) ne.classList.add("active");
  closeSidebar();
  if (page === "dashboard") updateDashboard();
}
function navChild(name) {
  state.currentChildName = name;
  document
    .querySelectorAll(".nav-child-item")
    .forEach((el) => el.classList.toggle("active", el.dataset.child === name));
  nav("child");
  renderChildPage(name);
}
function goToChildAfterResult() {
  if (state.currentChildName) navChild(state.currentChildName);
  else nav("dashboard");
}

function closeModal() {
  document.getElementById("detailModal").classList.remove("open");
}
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("mobOverlay").classList.toggle("open");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("mobOverlay").classList.remove("open");
}

// ===== INIT =====
(async function init() {
  try {
    await loadPages();
    initCekPage();
    document
      .getElementById("detailModal")
      .addEventListener("click", function (e) {
        if (e.target === this) closeModal();
      });
  } catch (e) {
    console.error(e);
    document.body.innerHTML =
      '<p style="padding:24px;font-family:sans-serif">Gagal memuat halaman. Jalankan lewat local server (Live Server), bukan file://</p>';
    return;
  }

  const token = localStorage.getItem("sc_token");
  const cached = getCachedUser();
  if (token && cached) {
    try {
      const { ok, data } = await apiFetch("/user/me");
      if (ok) {
        state.user = { ...cached, ...data.data };
        cacheUser(state.user);
        await loadUserData();
        enterApp();
        return;
      }
    } catch (e) {
      /* token tidak valid */
    }
    clearToken();
  }
})();
