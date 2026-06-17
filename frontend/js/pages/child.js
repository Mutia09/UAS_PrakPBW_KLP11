function renderChildPage(name) {
  const records = state.history
    .filter((r) => r.name === name)
    .sort((a, b) => b.age - a.age);
  if (!records.length) return;
  const latest = records[0];
  const color = S_COLOR[latest.classification.status],
    bg = S_BG[latest.classification.status];
  const idx = getChildren().findIndex((c) => c.name === name);
  const emoji = CHILD_EMOJI[Math.max(0, idx) % CHILD_EMOJI.length];
  document.getElementById("childDetailHeader").innerHTML = `
    <div class="child-detail-avatar" style="background:${bg}">${emoji}</div>
    <div style="flex:1">
<div class="child-detail-name">${name}</div>
<div style="font-size:13px;color:var(--gr400);margin-top:2px">${genderLabel(latest.gender)} · Terakhir cek: ${latest.age} bulan (${formatDateWIB(latest.date)}) · ${records.length} pemeriksaan</div>
<div style="margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
  <span class="badge ${statusBadge(latest.classification.status)}">${S_EMOJI[latest.classification.status]} ${latest.classification.label}</span>
  <span style="font-size:13px;color:${color};font-weight:600">HAZ: ${latest.haz.toFixed(2)}</span>
  <span style="font-size:13px;color:var(--gr600)">MPH: ${latest.mph.toFixed(1)} cm</span>
</div>
    </div>`;
  switchChildTab("ringkasan");
}
function switchChildTab(tab) {
  ["ringkasan", "riwayat", "grafik", "rekomendasi"].forEach((t) => {
    document.getElementById("tab-" + t).classList.toggle("active", t === tab);
    document
      .getElementById("tab-content-" + t)
      .classList.toggle("active", t === tab);
  });
  const name = state.currentChildName;
  if (!name) return;
  const records = state.history
    .filter((r) => r.name === name)
    .sort((a, b) => b.age - a.age);
  if (!records.length) return;
  if (tab === "ringkasan") tabRingkasan(name, records);
  else if (tab === "riwayat") tabRiwayat(name, records);
  else if (tab === "grafik") tabGrafik(name, records);
  else if (tab === "rekomendasi") tabRekomendasi(name, records);
}

function tabRingkasan(name, records) {
  const latest = records[0];
  const color = S_COLOR[latest.classification.status];
  const hc = hazColor(latest.haz);
  const sorted_asc = [...records].sort((a, b) => a.age - b.age);
  let trendHtml = "";
  if (records.length >= 2) {
    trendHtml = `<div class="card" style="margin-bottom:14px">
<div class="card-title" style="margin-bottom:14px">📈 Tren Pertumbuhan</div>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px">
  ${sorted_asc
    .map((r, i) => {
      const prev = sorted_asc[i - 1];
      const diff = prev ? r.height - prev.height : null;
      const hci = hazColor(r.haz);
      return `<div style="padding:11px;background:var(--gr50);border-radius:var(--rmd);text-align:center">
      <div style="font-size:10px;color:var(--gr400);margin-bottom:3px">${r.age} bulan</div>
      <div style="font-size:18px;font-weight:700">${r.height}</div>
      <div style="font-size:10px;color:var(--gr400)">cm</div>
      ${diff !== null ? `<div style="font-size:11px;margin-top:3px;font-weight:600;color:${diff > 0 ? "var(--g600)" : diff < 0 ? "var(--r600)" : "var(--gr400)"}">${diff > 0 ? "↑" : diff < 0 ? "↓" : "→"} ${Math.abs(diff).toFixed(1)} cm</div>` : ""}
      <div style="font-size:11px;margin-top:2px;color:${hci}">${r.haz.toFixed(2)}</div>
    </div>`;
    })
    .join("")}
</div>
    </div>`;
  }
  document.getElementById("tab-content-ringkasan").innerHTML = `
    <div class="result-hero ${latest.classification.color}" style="margin-bottom:14px">
<div class="result-label result-${latest.classification.color}">${S_EMOJI[latest.classification.status]} Status Terkini</div>
<div class="result-status result-${latest.classification.color}">${latest.classification.label}</div>
<div class="result-desc" style="color:${color};font-size:13px">${latest.classification.desc}</div>
<div style="margin-top:10px;font-size:12px;color:${color};opacity:.7">Pemeriksaan terakhir: ${formatDateWIB(latest.date)} · ${latest.age} bulan</div>
    </div>
    <div class="score-grid" style="margin-bottom:14px">
<div class="score-card"><div class="score-val" style="color:${hc}">${latest.haz.toFixed(2)}</div><div class="score-lbl">HAZ Score</div></div>
<div class="score-card"><div class="score-val" style="color:var(--g600)">${latest.mph.toFixed(1)} cm</div><div class="score-lbl">Target Genetik</div></div>
<div class="score-card"><div class="score-val">${latest.height} cm</div><div class="score-lbl">Tinggi Anak</div></div>
<div class="score-card"><div class="score-val">${latest.weight} kg</div><div class="score-lbl">Berat Badan</div></div>
<div class="score-card"><div class="score-val" style="color:${bmiCat(latest.bmi, true).color}">${latest.bmi.toFixed(1)}</div><div class="score-lbl">BMI Anak</div></div>
<div class="score-card"><div class="score-val">${latest.median.toFixed(1)} cm</div><div class="score-lbl">Median WHO</div></div>
    </div>
    ${trendHtml}
    <div class="card">
<div class="card-title" style="margin-bottom:12px">👨‍👩‍👦 Data Orang Tua</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px;margin-bottom:10px">
  <div style="padding:12px;background:var(--b50);border-radius:var(--rmd)"><div style="font-size:11px;font-weight:700;color:var(--b600);margin-bottom:5px">AYAH</div><div>Tinggi: <b>${latest.fH} cm</b></div>${latest.fBmi ? `<div>BMI: <b>${latest.fBmi.toFixed(1)}</b> - <span style="color:${bmiCat(latest.fBmi).color}">${bmiCat(latest.fBmi).label}</span></div>` : '<div style="color:var(--gr400);font-size:11px">BMI tidak diisi</div>'}</div>
  <div style="padding:12px;background:var(--t50);border-radius:var(--rmd)"><div style="font-size:11px;font-weight:700;color:var(--t600);margin-bottom:5px">IBU</div><div>Tinggi: <b>${latest.mH} cm</b></div>${latest.mBmi ? `<div>BMI: <b>${latest.mBmi.toFixed(1)}</b> - <span style="color:${bmiCat(latest.mBmi).color}">${bmiCat(latest.mBmi).label}</span></div>` : '<div style="color:var(--gr400);font-size:11px">BMI tidak diisi</div>'}</div>
</div>
<div style="padding:10px 12px;background:var(--g50);border-radius:var(--rmd);font-size:13px">
  <b style="color:var(--g600)">Rentang target genetik: ${(latest.mph - 8.5).toFixed(1)} – ${(latest.mph + 8.5).toFixed(1)} cm</b><br>
  <span style="font-size:12px;color:var(--g700)">Anak saat ini ${latest.height >= latest.mph - 8.5 ? "<b>berada dalam</b>" : "<b>di bawah</b>"} rentang target</span>
</div>
    </div>`;
}

function tabGrafik(name, records) {
  const sorted = [...records].sort((a, b) => a.age - b.age);
  const g = sorted[0].gender,
    mph = sorted[0].mph;
  const ages = WHO_AGES;
  document.getElementById("tab-content-grafik").innerHTML = `
    <div class="card" style="margin-bottom:14px">
<div class="card-title" style="margin-bottom:2px">Grafik Pertumbuhan - ${name}</div>
<div class="card-sub" style="margin-bottom:14px">Kurva WHO + posisi anak + target genetik (MPH)</div>
<div class="chart-wrap"><canvas id="childGrowthChart"></canvas></div>
    </div>
    <div class="card">
<div class="card-title" style="margin-bottom:10px">Keterangan grafik</div>
<div style="display:flex;flex-wrap:wrap;gap:12px;font-size:12px;color:var(--gr600)">
  <span style="display:flex;align-items:center;gap:6px"><span style="width:20px;height:3px;background:#3B6D11;display:inline-block;border-radius:2px"></span>Median WHO</span>
  <span style="display:flex;align-items:center;gap:6px"><span style="width:20px;height:2px;background:#C0DD97;display:inline-block;border:1px dashed #3b6d11"></span>Batas stunting (-2 SD)</span>
  <span style="display:flex;align-items:center;gap:6px"><span style="width:20px;height:3px;background:#EF9F27;display:inline-block;border-radius:2px"></span>Target genetik (MPH)</span>
  <span style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;background:#185FA5;border-radius:50%;display:inline-block"></span>Posisi anak</span>
</div>
    </div>`;
  if (state.charts["cg"]) state.charts["cg"].destroy();
  const ctx = document.getElementById("childGrowthChart").getContext("2d");
  state.charts["cg"] = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Median WHO",
          data: ages.map((a) => ({
            x: a,
            y: +whoMedian(a, g).toFixed(1),
          })),
          borderColor: "#3B6D11",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },
        {
          label: "Batas stunting (-2 SD)",
          data: ages.map((a) => ({
            x: a,
            y: +whoMinus2(a, g).toFixed(1),
          })),
          borderColor: "#C0DD97",
          borderWidth: 1.5,
          borderDash: [5, 4],
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },
        {
          label: "Target genetik (MPH)",
          data: ages.map((a) => ({ x: a, y: +mph.toFixed(1) })),
          borderColor: "#EF9F27",
          borderWidth: 2,
          borderDash: [8, 4],
          pointRadius: 0,
          fill: false,
        },
        {
          label: "Tinggi anak",
          data: sorted.map((r) => ({ x: r.age, y: r.height })),
          borderColor: "#185FA5",
          backgroundColor: "#185FA5",
          borderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3,
          fill: false,
          showLine: sorted.length > 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      parsing: { xAxisKey: "x", yAxisKey: "y" },
      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: "Usia (bulan)",
            font: { size: 12 },
          },
          min: 0,
          max: 60,
          ticks: { stepSize: 6 },
        },
        y: {
          title: {
            display: true,
            text: "Tinggi (cm)",
            font: { size: 12 },
          },
          min: 40,
          max: 130,
        },
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: { font: { size: 11 }, boxWidth: 14, padding: 10 },
        },
        tooltip: {
          callbacks: {
            label: (c) => `${c.dataset.label}: ${c.raw.y} cm`,
          },
        },
      },
    },
  });
}

function tabRiwayat(name, records) {
  const name_esc = escName(name);
  document.getElementById("tab-content-riwayat").innerHTML = `
    <div class="card">
<div class="section-header" style="margin-bottom:12px">
  <div><div class="card-title">Riwayat Pemeriksaan</div><div class="card-sub">${records.length} pemeriksaan tersimpan</div></div>
</div>
<div class="table-wrap">
  <table>
    <thead><tr><th>Tanggal</th><th>Usia</th><th>Tinggi</th><th>Berat</th><th>BMI</th><th>HAZ</th><th>Status</th><th>Aksi</th></tr></thead>
    <tbody>
      ${records
        .map(
          (r, i) => `<tr>
        <td>${formatDateWIB(r.date)}</td><td>${r.age} bln</td>
        <td style="font-weight:600">${r.height} cm</td>
        <td>${r.weight} kg</td>
        <td style="font-weight:600;color:${bmiCat(r.bmi, true).color}">${r.bmi.toFixed(1)}</td>
        <td style="font-weight:600;color:${hazColor(r.haz)}">${r.haz.toFixed(2)}</td>
        <td><span class="badge ${statusBadge(r.classification.status)}">${r.classification.label}</span></td>
        <td style="display:flex;gap:6px;align-items:center">
          <span class="td-action" onclick="showDetailModal('${name_esc}',${i})">Detail</span>
          <span class="td-action" style="color:var(--b600)" onclick="openEditMeasurement('${name_esc}',${i})">Edit</span>
          <span class="td-action" style="color:var(--r600)" onclick="deleteMeasurement('${name_esc}',${i})">Hapus</span>
        </td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>
</div>
    </div>`;
}

function showDetailModal(name, idx) {
  const records = state.history
    .filter((r) => r.name === name)
    .sort((a, b) => b.age - a.age);
  const r = records[idx];
  document.getElementById("modalTitle").textContent =
    r.name + " - Detail Pemeriksaan";
  document.getElementById("modalDate").textContent =
    formatDateWIB(r.date) + " · " + r.age + " bulan";
  document.getElementById("modalContent").innerHTML = "";
  renderResultHTML(r, "modalContent");
  document.getElementById("detailModal").classList.add("open");
}

function tabRekomendasi(name, records) {
  const latest = records[0];
  const color = S_COLOR[latest.classification.status];
  const jadwal =
    latest.classification.status === "stunting"
      ? '<b style="color:var(--r600)">Segera</b> - Dalam 1–2 minggu ke fasilitas kesehatan terdekat.'
      : latest.classification.status === "risk"
        ? "<b>Setiap 2 minggu</b> - Pantau ketat sampai status membaik."
        : latest.classification.status === "genetic"
          ? "<b>Setiap bulan</b> - Pantau di posyandu dan konfirmasi ke dokter."
          : "<b>Setiap bulan</b> - Kunjungan rutin ke posyandu sudah cukup.";
  document.getElementById("tab-content-rekomendasi").innerHTML = `
    <div class="result-hero ${latest.classification.color}" style="margin-bottom:14px">
<div class="result-label result-${latest.classification.color}">💡 Rekomendasi untuk ${name}</div>
<div class="result-status result-${latest.classification.color}" style="font-size:18px">${latest.classification.label}</div>
<div class="result-desc" style="color:${color};font-size:13px">Berdasarkan pemeriksaan terakhir: ${formatDateWIB(latest.date)}</div>
    </div>
    <div class="card" style="margin-bottom:14px">
<div class="card-title" style="margin-bottom:12px">Langkah yang Perlu Dilakukan</div>
<div class="rec-list">${renderRecList(RECS[latest.classification.status])}</div>
    </div>
    <div class="card">
<div class="card-title" style="margin-bottom:10px">🗓️ Jadwal Pantauan Berikutnya</div>
<div style="font-size:13px;color:var(--gr600);line-height:1.7">${jadwal}</div>
<div style="margin-top:12px;padding:12px;background:var(--g50);border-radius:var(--rmd);font-size:12px;color:var(--g700)">
  <b>💡 Catatan:</b> StuntCheck adalah alat bantu skrining, bukan pengganti pemeriksaan dokter. Selalu konfirmasi hasil ke tenaga kesehatan profesional.
</div>
    </div>`;
}

function openEditMeasurement(name, idx) {
  const records = state.history
    .filter((r) => r.name === name)
    .sort((a, b) => b.age - a.age);
  const r = records[idx];
  if (!r) return;

  document.getElementById("editMeasId").value = r.id || "";
  document.getElementById("editMeasName").value = name;
  document.getElementById("editMeasDate").value = r.date;
  document.getElementById("editMeasAge").value = r.age;
  document.getElementById("editMeasHeight").value = r.height;
  document.getElementById("editMeasWeight").value = r.weight;
  document.getElementById("editMeasNotes").value = r.notes || "";
  showOverlay("editMeasOverlay", true);
}

function closeEditMeas() {
  showOverlay("editMeasOverlay", false);
}

async function saveEditMeasurement() {
  const id = document.getElementById("editMeasId").value;
  const name = document.getElementById("editMeasName").value;
  const date = document.getElementById("editMeasDate").value;
  const age = parseFloat(document.getElementById("editMeasAge").value);
  const height = parseFloat(document.getElementById("editMeasHeight").value);
  const weight = parseFloat(document.getElementById("editMeasWeight").value);
  const notes = document.getElementById("editMeasNotes").value.trim();

  if (!date || isNaN(age) || isNaN(height) || isNaN(weight)) {
    showToast("Lengkapi semua field yang wajib diisi");
    return;
  }
  if (!id) {
    showToast("ID pemeriksaan tidak ditemukan");
    return;
  }

  // Hitung ulang BMI dan HAZ sederhana
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);

  // Ambil data asli untuk field yang tidak diubah
  const orig = state.history.find((r) => String(r.id) === String(id));
  const haz = orig ? orig.haz : 0;
  const mph = orig ? orig.mph : 0;
  const who_median = orig ? orig.who_median : 0;
  const who_minus2sd = orig ? orig.who_minus2sd : 0;
  const status = orig ? orig.classification.status : "normal";
  const status_label = orig ? orig.classification.label : "Normal";
  const child_id = orig ? orig.childId : null;

  const btn = document.getElementById("btnSaveEditMeas");
  btn.disabled = true;
  btn.textContent = "Menyimpan...";
  try {
    const { ok, data } = await apiFetch("/measurements/" + id, {
      method: "PUT",
      body: JSON.stringify({
        measure_date: date,
        age_months: age,
        height_cm: height,
        weight_kg: weight,
        bmi: parseFloat(bmi.toFixed(2)),
        haz,
        mph,
        who_median,
        who_minus2sd,
        status,
        status_label,
        notes: notes || null,
      }),
    });
    if (!ok) {
      showToast(data.message || "Gagal menyimpan");
      return;
    }

    showToast("Pemeriksaan berhasil diperbarui");
    closeEditMeas();
    await loadUserData();
    // Refresh tab riwayat
    const records = state.history
      .filter((r) => r.name === name)
      .sort((a, b) => b.age - a.age);
    switchChildTab("riwayat");
  } catch (e) {
    showToast("Tidak dapat terhubung ke server");
  } finally {
    btn.disabled = false;
    btn.textContent = "Simpan Perubahan";
  }
}

async function deleteMeasurement(name, idx) {
  const records = state.history
    .filter((r) => r.name === name)
    .sort((a, b) => b.age - a.age);
  const r = records[idx];
  if (!r || !r.id) {
    showToast("ID pemeriksaan tidak ditemukan");
    return;
  }

  if (!confirm(`Hapus data pemeriksaan ${name} tanggal ${formatDateWIB(r.date)}?`)) return;

  try {
    const { ok, data } = await apiFetch("/measurements/" + r.id, {
      method: "DELETE",
    });
    if (!ok) {
      showToast(data.message || "Gagal menghapus");
      return;
    }
    showToast("Pemeriksaan dihapus");
    await loadUserData();
    switchChildTab("riwayat");
  } catch (e) {
    showToast("Tidak dapat terhubung ke server");
  }
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
