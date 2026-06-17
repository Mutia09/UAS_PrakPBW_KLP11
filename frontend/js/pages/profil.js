async function saveProfile() {
  const name  = document.getElementById("editName").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  if (!name || !email) { showToast("Nama dan email wajib diisi"); return; }

  const parts = name.split(" ");
  const first = parts[0];
  const last  = parts.slice(1).join(" ");

  try {
    const { ok, data } = await apiFetch("/user/profile", {
      method: "PUT",
      body: JSON.stringify({ first_name: first, last_name: last, email }),
    });
    if (!ok) { showToast(data.message || "Gagal menyimpan"); return; }

    state.user.name  = data.data.name;
    state.user.email = data.data.email;
    cacheUser(state.user);
    updateUserUI();
    showToast("Profil berhasil disimpan");
  } catch (e) {
    showToast("Tidak dapat terhubung ke server");
  }
}

async function clearHistory() {
  if (!confirm("Hapus semua data? Tidak dapat dibatalkan.")) return;
  try {
    // Hapus semua anak (cascade ke measurements via FK)
    const { ok, data: childData } = await apiFetch("/children");
    if (ok) {
      for (const child of childData.data) {
        await apiFetch("/children/" + child.id, { method: "DELETE" });
      }
    }
  } catch (e) {
    console.warn("Gagal hapus di server:", e.message);
  }
  state.history = [];
  updateDashboard();
  updateChildNav();
  showToast("Data dihapus");
  nav("dashboard");
}
