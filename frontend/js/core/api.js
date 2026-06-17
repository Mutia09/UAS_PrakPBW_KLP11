// ===== CONFIG API =====
const API_BASE = "http://localhost:3000/api"; // Ganti sesuai URL server Anda

// ===== API HELPER =====
async function apiFetch(path, options = {}) {
  const { skipAuthRedirect = false, ...fetchOptions } = options;
  const token = localStorage.getItem("sc_token");

  let res;
  try {
    res = await fetch(API_BASE + path, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...fetchOptions,
    });
  } catch (err) {
    console.error("API network error:", path, err);
    throw new Error("network");
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("invalid_json");
  }

  if (res.status === 401 && !skipAuthRedirect && !path.startsWith("/auth/")) {
    doLogout();
    throw new Error("Sesi berakhir");
  }
  return { ok: res.ok, status: res.status, data };
}

// ===== STORAGE (token & user cache) =====
function saveToken(token) {
  localStorage.setItem("sc_token", token);
}
function clearToken() {
  localStorage.removeItem("sc_token");
  localStorage.removeItem("sc_user_cache");
}
function cacheUser(user) {
  localStorage.setItem("sc_user_cache", JSON.stringify(user));
}
function getCachedUser() {
  const u = localStorage.getItem("sc_user_cache");
  return u ? JSON.parse(u) : null;
}

// Konversi data API → format internal state.history
function apiRecordToState(m) {
  return {
    id: m.id,
    name: m.child_name,
    childId: m.child_id,
    gender: m.gender,
    age: parseFloat(m.age_months),
    height: parseFloat(m.height_cm),
    weight: parseFloat(m.weight_kg),
    bmi: parseFloat(m.bmi),
    haz: parseFloat(m.haz),
    mph: parseFloat(m.mph),
    median: parseFloat(m.who_median),
    minus2sd: parseFloat(m.who_minus2sd),
    fH: m.father_height ? parseFloat(m.father_height) : 0,
    fW: m.father_weight ? parseFloat(m.father_weight) : 0,
    mH: m.mother_height ? parseFloat(m.mother_height) : 0,
    mW: m.mother_weight ? parseFloat(m.mother_weight) : 0,
    fBmi: m.father_bmi ? parseFloat(m.father_bmi) : null,
    mBmi: m.mother_bmi ? parseFloat(m.mother_bmi) : null,
    date: m.measure_date,
    dob: m.dob ? (typeof m.dob === 'string' ? m.dob.split('T')[0] : m.dob) : '',
    notes: m.notes || "",
    classification: {
      status: m.status,
      label: m.status_label,
      color: m.status,
      desc: "",
    },
    recs: RECS[m.status] || [],
  };
}

async function loadUserData() {
  try {
    const { ok, data } = await apiFetch("/measurements", { skipAuthRedirect: true });
    if (ok && Array.isArray(data.data)) {
      state.history = data.data.map(apiRecordToState);
    }
  } catch (e) {
    console.warn("Gagal memuat data dari server:", e.message);
  }
}
