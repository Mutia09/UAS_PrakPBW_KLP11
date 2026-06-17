function switchAuth(tab) {
  document
    .querySelectorAll(".auth-tab")
    .forEach((t, i) =>
      t.classList.toggle("active", i === (tab === "login" ? 0 : 1)),
    );
  document.getElementById("loginForm").style.display =
    tab === "login" ? "block" : "none";
  document.getElementById("registerForm").style.display =
    tab === "register" ? "block" : "none";
}
async function doLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPass").value;
  if (!email || !password) {
    showToast("Email dan kata sandi wajib diisi");
    return;
  }

  const btn = document.querySelector("#loginForm .btn-primary");
  btn.disabled = true;
  btn.textContent = "Memproses...";
  try {
    const { ok, data } = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!ok) {
      showToast(data.message || "Login gagal");
      return;
    }

    clearToken();
    state.user = null;
    state.history = [];
    state.currentChildName = null;

    if (!data.token || !data.user) {
      showToast("Respons server tidak valid");
      return;
    }

    saveToken(data.token);
    state.user = data.user;
    cacheUser(data.user);
    await loadUserData();
    enterApp();
  } catch (e) {
    console.error("Login error:", e);
    if (e.message === "network") {
      showToast(
        "Tidak dapat terhubung ke server. Pastikan backend jalan & CORS sesuai URL frontend.",
      );
    } else {
      showToast("Login gagal. Coba lagi.");
    }
  } finally {
    btn.disabled = false;
    btn.textContent = "Masuk";
  }
}

async function doRegister() {
  const first = document.getElementById("regFirst").value.trim();
  const last = document.getElementById("regLast").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPass").value;
  if (!first || !email || !pass) {
    showToast("Lengkapi data pendaftaran");
    return;
  }
  if (pass.length < 8) {
    showToast("Kata sandi minimal 8 karakter");
    return;
  }

  const btn = document.querySelector("#registerForm .btn-primary");
  btn.disabled = true;
  btn.textContent = "Memproses...";
  try {
    const { ok, data } = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        first_name: first,
        last_name: last,
        email,
        password: pass,
      }),
    });
    if (!ok) {
      showToast(data.message || "Pendaftaran gagal");
      return;
    }

    document.getElementById("regFirst").value = "";
    document.getElementById("regLast").value = "";
    document.getElementById("regEmail").value = "";
    document.getElementById("regPass").value = "";
    document.getElementById("loginEmail").value = email;
    switchAuth("login");
    showToast("Akun berhasil dibuat! Silakan login.");
  } catch (e) {
    showToast("Tidak dapat terhubung ke server");
  } finally {
    btn.disabled = false;
    btn.textContent = "Buat akun";
  }
}

function doLogout() {
  state.user = null;
  state.history = [];
  state.currentChildName = null;
  clearToken();
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPass").value = "";
  switchAuth("login");
  document.getElementById("authWrap").style.display = "flex";
  document.getElementById("appWrap").style.display = "none";
}
function enterApp() {
  document.getElementById("authWrap").style.display = "none";
  document.getElementById("appWrap").style.display = "flex";
  updateUserUI();
  updateChildNav();
  nav("dashboard");
}
function updateUserUI() {
  if (!state.user) return;
  const init = state.user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  ["sidebarAvatar", "profileAvatar"].forEach(
    (id) => (document.getElementById(id).textContent = init),
  );
  document.getElementById("sidebarName").textContent = state.user.name;
  document.getElementById("sidebarEmail").textContent = state.user.email;
  document.getElementById("profileName").textContent = state.user.name;
  document.getElementById("profileEmail").textContent = state.user.email;
  document.getElementById("editName").value = state.user.name;
  document.getElementById("editEmail").value = state.user.email;
}
