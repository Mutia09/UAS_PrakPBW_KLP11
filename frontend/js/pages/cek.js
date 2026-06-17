function nextStep(step) {
  if (step === 2 && !validateStep1()) return;
  if (step === 3) {
    if (!validateStep2()) return;
    computeResult();
  }
  ["formStep1", "formStep2", "formStep3"].forEach(
    (id, i) =>
      (document.getElementById(id).style.display =
        i + 1 === step ? "block" : "none"),
  );
  [1, 2, 3].forEach((i) => {
    const el = document.getElementById("step" + i);
    el.classList.remove("active", "done");
    if (i < step) el.classList.add("done");
    if (i === step) el.classList.add("active");
    const ln = document.getElementById("line" + i);
    if (ln) ln.classList.toggle("done", i < step);
  });
}
function validateStep1() {
  const name = document.getElementById("childName").value.trim();
  const age = parseFloat(document.getElementById("childAge").value);
  const h = parseFloat(document.getElementById("childHeight").value);
  const w = parseFloat(document.getElementById("childWeight").value);
  if (!name) {
    showToast("Nama anak wajib diisi");
    return false;
  }
  if (isNaN(age) || age < 0 || age > 60) {
    showToast("Isi tanggal lahir untuk otomatis menghitung usia (0–60 bulan)");
    document.getElementById("childDOB").focus();
    return false;
  }
  if (isNaN(h) || h < 30 || h > 150) {
    showToast("Tinggi tidak valid (30–150 cm)");
    return false;
  }
  if (isNaN(w) || w < 1 || w > 50) {
    showToast("Berat tidak valid (1–50 kg)");
    return false;
  }
  return true;
}
function validateStep2() {
  const fH = parseFloat(document.getElementById("fatherHeight").value);
  const mH = parseFloat(document.getElementById("motherHeight").value);
  if (isNaN(fH) || fH < 100 || fH > 220) {
    showToast("Tinggi ayah tidak valid");
    return false;
  }
  if (isNaN(mH) || mH < 100 || mH > 220) {
    showToast("Tinggi ibu tidak valid");
    return false;
  }
  return true;
}
function calcAgeFromDOB() {
  const dob = document.getElementById("childDOB").value;
  const measureDateVal = document.getElementById("measureDate").value;
  if (!dob) return;
  const dobDate = new Date(dob);
  const refDate = measureDateVal ? new Date(measureDateVal) : new Date();
  let months = (refDate.getFullYear() - dobDate.getFullYear()) * 12;
  months += refDate.getMonth() - dobDate.getMonth();
  if (refDate.getDate() < dobDate.getDate()) months--;
  months = Math.max(0, Math.min(60, months));
  document.getElementById("childAge").value = months;
}

function initCekPage() {
  document.getElementById("measureDate").value = new Date()
    .toISOString()
    .split("T")[0];
  document.getElementById("measureDate").addEventListener("change", calcAgeFromDOB);
  ["fatherHeight", "fatherWeight", "motherHeight", "motherWeight"].forEach(
    (id) => {
      document.getElementById(id).addEventListener("input", () => {
        updateMPHPreview();
        updateParentBMI(id.startsWith("f") ? "f" : "m");
      });
    },
  );
  ["childHeight", "childWeight"].forEach((id) =>
    document.getElementById(id).addEventListener("input", updateChildBMI),
  );
}
function updateChildBMI() {
  showBmiLive(
    "bmiLiveChild",
    parseFloat(document.getElementById("childHeight").value),
    parseFloat(document.getElementById("childWeight").value),
    "Anak",
    true,
  );
}
function updateParentBMI(who) {
  const isFather = who === "f";
  showBmiLive(
    isFather ? "bmiLiveFather" : "bmiLiveMother",
    parseFloat(document.getElementById(isFather ? "fatherHeight" : "motherHeight").value),
    parseFloat(document.getElementById(isFather ? "fatherWeight" : "motherWeight").value),
    isFather ? "Ayah" : "Ibu",
    false,
  );
}
function updateMPHPreview() {
  const fH = parseFloat(document.getElementById("fatherHeight").value);
  const mH = parseFloat(document.getElementById("motherHeight").value);
  const g = document.getElementById("childGender").value;
  if (!isNaN(fH) && !isNaN(mH) && fH > 0 && mH > 0) {
    const mph = calcMPH(fH, mH, g);
    document.getElementById("mphPreview").innerHTML =
      `<b>Target tinggi genetik (MPH):</b> <span style="font-size:16px;font-weight:700;color:var(--g700)">${mph.toFixed(1)} cm</span><br>Rentang normal: <b>${(mph - 8.5).toFixed(1)} – ${(mph + 8.5).toFixed(1)} cm</b><br><span style="font-size:11px;color:var(--gr400)">Rumus: (Tinggi Ayah ${g === "L" ? "+" : "-"} Tinggi Ibu ${g === "L" ? "+13" : "-13"}) ÷ 2</span>`;
  }
}
function startFreshCheck() {
  const fields = [
    "childName", "childDOB", "childAge",
    "childHeight", "childWeight",
    "fatherHeight", "fatherWeight",
    "motherHeight", "motherWeight",
  ];
  fields.forEach((id) => { document.getElementById(id).value = ""; });
  document.getElementById("childGender").value = "L";
  document.getElementById("measureDate").value = new Date().toISOString().split("T")[0];
  document.getElementById("mphPreview").innerHTML = "Isi tinggi ayah dan ibu untuk melihat perkiraan MPH.";
  ["bmiLiveChild", "bmiLiveFather", "bmiLiveMother"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  state.currentChildName = null;
  nav("cek");
  nextStep(1);
}

function startNewCheckForCurrentChild() {
  if (state.currentChildName) {
    document.getElementById("childName").value = state.currentChildName;
    const recs = state.history.filter(
      (r) => r.name === state.currentChildName,
    );
    if (recs.length > 0) {
      const last = recs[0];
      document.getElementById("fatherHeight").value = last.fH;
      document.getElementById("motherHeight").value = last.mH;
      document.getElementById("childGender").value = last.gender;
      if (last.fW)
        document.getElementById("fatherWeight").value = last.fW;
      if (last.mW)
        document.getElementById("motherWeight").value = last.mW;
      if (last.dob) {
        document.getElementById("childDOB").value = last.dob;
        calcAgeFromDOB();
      }
      updateMPHPreview();
    }
  }
  nav("cek");
  nextStep(1);
}


async function computeResult() {
  const name   = document.getElementById("childName").value.trim();
  const g      = document.getElementById("childGender").value;
  const age    = parseFloat(document.getElementById("childAge").value);
  const height = parseFloat(document.getElementById("childHeight").value);
  const weight = parseFloat(document.getElementById("childWeight").value);
  const fH     = parseFloat(document.getElementById("fatherHeight").value);
  const mH     = parseFloat(document.getElementById("motherHeight").value);
  const fW     = parseFloat(document.getElementById("fatherWeight").value) || 0;
  const mW     = parseFloat(document.getElementById("motherWeight").value) || 0;
  const date   = document.getElementById("measureDate").value || new Date().toISOString().split("T")[0];
  const dob    = document.getElementById("childDOB").value;

  const mph            = calcMPH(fH, mH, g);
  const haz            = calcHAZ(height, age, g);
  const classification = classifyStunting(haz, height, mph);
  const bmi            = calcBMI(weight, height);
  const fBmi           = fW && fH ? calcBMI(fW, fH) : null;
  const mBmi           = mW && mH ? calcBMI(mW, mH) : null;

  const r = {
    id: Date.now(), name, gender: g, age, height, weight, dob,
    fH, mH, fW, mW, mph, haz, classification,
    recs: RECS[classification.status],
    date, median: whoMedian(age, g), minus2sd: whoMinus2(age, g),
    bmi, fBmi, mBmi,
  };

  // Update state lokal dulu agar UI langsung responsif
  const ex = state.history.findIndex((h) => h.name === name && h.date === date);
  if (ex >= 0) state.history[ex] = r;
  else state.history.unshift(r);
  state.currentChildName = name;
  updateChildNav();
  renderResultHTML(r, "resultArea");

  // Simpan ke backend (async, tidak blok UI)
  try {
    // Step 1: upsert data anak
    const childRes = await apiFetch("/children", {
      method: "POST",
      body: JSON.stringify({
        name, gender: g, dob: dob || null,
        father_height: fH, father_weight: fW || null,
        mother_height: mH, mother_weight: mW || null,
      }),
    });
    if (!childRes.ok) { console.warn("Gagal simpan anak:", childRes.data.message); return; }
    const childId = childRes.data.data.id;

    // Update childId di state
    r.childId = childId;
    if (ex >= 0) state.history[ex].childId = childId;
    else if (state.history[0]) state.history[0].childId = childId;

    // Step 2: simpan pengukuran
    await apiFetch("/measurements", {
      method: "POST",
      body: JSON.stringify({
        child_id:    childId,
        measure_date: date,
        age_months:  age,
        height_cm:   height,
        weight_kg:   weight,
        bmi, haz, mph,
        who_median:   whoMedian(age, g),
        who_minus2sd: whoMinus2(age, g),
        status:       classification.status,
        status_label: classification.label,
        father_height: fH, father_weight: fW || null,
        mother_height: mH, mother_weight: mW || null,
        father_bmi: fBmi, mother_bmi: mBmi,
      }),
    });
  } catch (e) {
    console.warn("Gagal simpan ke server:", e.message);
    showToast("⚠️ Data tersimpan lokal, gagal sinkron ke server");
  }
}


function bmiWidget(bmi, w, h, label, isChild) {
  const cat = bmiCat(bmi, isChild);
  return `<div style="background:${cat.bg};border-radius:var(--rmd);padding:11px 13px;border:1px solid ${cat.color}22">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px"><span style="font-size:12px;font-weight:600;color:var(--gr600)">${label}</span><span style="font-size:18px;font-weight:700;color:${cat.color}">${bmi.toFixed(1)}</span></div>
    <div style="font-size:12px;font-weight:600;color:${cat.color};margin-bottom:4px">${cat.label}</div>
    <div style="font-size:11px;color:var(--gr600)">${w} kg ÷ (${(h / 100).toFixed(2)} m)² = <b>${bmi.toFixed(2)}</b></div>
  </div>`;
}
function renderResultHTML(r, containerId) {
  const color = S_COLOR[r.classification.status];
  const hc = hazColor(r.haz);
  document.getElementById(containerId).innerHTML = `
  <div class="result-hero ${r.classification.color}">
    <div class="result-label result-${r.classification.color}">${S_EMOJI[r.classification.status]} Status Pertumbuhan</div>
    <div class="result-status result-${r.classification.color}">${r.classification.label}</div>
    <div class="result-desc" style="color:${color}">${r.classification.desc}</div>
    <div style="margin-top:12px;font-size:12px;color:${color};opacity:.7">${r.name} · ${r.age} bulan · ${genderLabel(r.gender)} · ${formatDateWIB(r.date)}</div>
  </div>
  <div style="margin-bottom:14px">
    <div style="font-size:11px;font-weight:600;color:var(--gr400);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em">Angka-Angka Penting</div>
    <div class="score-grid">
<div class="score-card"><div class="score-val" style="color:${hc}">${r.haz.toFixed(2)}</div><div class="score-lbl">HAZ Score</div><div class="score-range">≥-1 normal | ≤-2 stunting</div></div>
<div class="score-card"><div class="score-val" style="color:var(--g600)">${r.mph.toFixed(1)} cm</div><div class="score-lbl">Target Genetik</div><div class="score-range">±8.5 cm rentang normal</div></div>
<div class="score-card"><div class="score-val">${r.height} cm</div><div class="score-lbl">Tinggi Anak</div><div class="score-range">Median: ${r.median.toFixed(1)} cm</div></div>
<div class="score-card"><div class="score-val">${r.weight} kg</div><div class="score-lbl">Berat Badan</div><div class="score-range">BMI: ${r.bmi.toFixed(1)}</div></div>
    </div>
  </div>
  <div class="card" style="margin-bottom:14px">
    <div class="card-title" style="margin-bottom:10px">📐 Indeks Massa Tubuh (BMI)</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px">
${bmiWidget(r.bmi, r.weight, r.height, "🧒 BMI Anak", true)}
${r.fBmi ? bmiWidget(r.fBmi, r.fW, r.fH, "👨 BMI Ayah", false) : ""}
${r.mBmi ? bmiWidget(r.mBmi, r.mW, r.mH, "👩 BMI Ibu", false) : ""}
    </div>
  </div>
  <div class="card" style="margin-bottom:14px">
    <div class="card-title" style="margin-bottom:12px">🧬 Posisi vs Target Genetik</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px;margin-bottom:12px">
<div><div style="color:var(--gr400);font-size:10px;margin-bottom:2px">TINGGI ANAK</div><div style="font-size:20px;font-weight:700">${r.height} cm</div></div>
<div><div style="color:var(--gr400);font-size:10px;margin-bottom:2px">TARGET GENETIK</div><div style="font-size:20px;font-weight:700;color:var(--g600)">${r.mph.toFixed(1)} cm</div></div>
<div><div style="color:var(--gr400);font-size:10px;margin-bottom:2px">RENTANG GENETIK</div><div style="font-weight:600">${(r.mph - 8.5).toFixed(1)} – ${(r.mph + 8.5).toFixed(1)} cm</div></div>
<div><div style="color:var(--gr400);font-size:10px;margin-bottom:2px">POSISI ANAK</div><div style="font-weight:600;color:${r.height >= r.mph - 8.5 ? "var(--g600)" : "var(--r600)"}">${r.height >= r.mph - 8.5 ? "✅ Dalam rentang" : "❌ Di bawah potensi"}</div></div>
    </div>
    <div style="font-size:11px;color:var(--gr400);margin-bottom:5px">Realisasi potensi genetik</div>
    <div style="display:flex;align-items:center;gap:10px">
<div style="flex:1;height:8px;background:var(--gr50);border-radius:4px;overflow:hidden"><div style="height:100%;width:${Math.min(100, Math.max(0, (r.height / (r.mph + 8.5)) * 100)).toFixed(0)}%;background:${color};border-radius:4px"></div></div>
<span style="font-size:13px;font-weight:700;color:${color};min-width:36px">${Math.min(100, Math.max(0, (r.height / (r.mph + 8.5)) * 100)).toFixed(0)}%</span>
    </div>
  </div>
  <div class="card">
    <div class="card-title" style="margin-bottom:12px">💡 Langkah yang Perlu Dilakukan</div>
    <div class="rec-list">${renderRecList(r.recs)}</div>
  </div>`;
}

