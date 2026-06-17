function updateDashboard() {
  const h = state.history;
  const total = h.length,
    stunt = h.filter(
      (r) =>
        r.classification.status === "stunting" ||
        r.classification.status === "risk",
    ).length,
    genetic = h.filter((r) => r.classification.status === "genetic").length,
    normal = h.filter((r) => r.classification.status === "normal").length;
  document.getElementById("globalStatGrid").innerHTML = `
    <div class="stat-card stat-green"><div class="stat-label">Total pemeriksaan</div><div class="stat-value">${total}</div><div class="stat-desc">Semua anak</div></div>
    <div class="stat-card stat-red"><div class="stat-label">Stunting / Risiko</div><div class="stat-value">${stunt}</div><div class="stat-desc">Perlu perhatian</div></div>
    <div class="stat-card stat-amber"><div class="stat-label">Stunting Genetik</div><div class="stat-value">${genetic}</div><div class="stat-desc">Perlu pantauan</div></div>
    <div class="stat-card stat-blue"><div class="stat-label">Normal</div><div class="stat-value">${normal}</div><div class="stat-desc">Tumbuh baik</div></div>`;
  const children = getChildren();
  document.getElementById("childCountSub").textContent =
    children.length > 0
      ? `${children.length} anak terdaftar`
      : "Belum ada data";
  if (children.length === 0) {
    document.getElementById("childCardGrid").innerHTML =
      `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--gr400)" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div><div class="empty-title">Belum ada anak terdaftar</div><div class="empty-desc">Mulai dengan melakukan pemeriksaan pertama</div><button class="btn-primary" style="width:auto;padding:10px 24px" onclick="startFreshCheck()">Cek stunting pertama</button></div>`;
    return;
  }
  document.getElementById("childCardGrid").innerHTML = children
    .map((c, i) => buildChildCard(c, i))
    .join("");
}

function buildChildCard(child, idx) {
  const r = child.latest;
  const color = S_COLOR[r.classification.status],
    bg = S_BG[r.classification.status],
    dot = S_DOT[r.classification.status];
  const emoji = CHILD_EMOJI[idx % CHILD_EMOJI.length];
  const hc = hazColor(r.haz);
  const name_esc = escName(child.name);
  return `<div class="child-dash-card" onclick="navChild('${name_esc}')">
    <div class="child-card-header">
<div class="child-avatar" style="background:${bg}">${emoji}</div>
<div style="flex:1;min-width:0">
  <div class="child-card-name">${child.name}</div>
  <div class="child-card-sub">${genderLabel(r.gender)} · ${r.age} bln · ${child.records.length} pemeriksaan</div>
</div>
    </div>
    <div class="child-card-body">
<div class="child-stat-row"><span class="child-stat-lbl">HAZ Score</span><span class="child-stat-val" style="color:${hc}">${r.haz.toFixed(2)}</span></div>
<div class="child-stat-row"><span class="child-stat-lbl">Tinggi / Berat</span><span class="child-stat-val">${r.height} cm / ${r.weight} kg</span></div>
<div class="child-stat-row"><span class="child-stat-lbl">Target Genetik (MPH)</span><span class="child-stat-val" style="color:var(--g600)">${r.mph.toFixed(1)} cm</span></div>
    </div>
    <div class="child-card-footer">
<div class="child-status-pill"><span style="color:${color}">${S_EMOJI[r.classification.status]} ${r.classification.label}</span></div>
<div class="view-btn">Lihat detail <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><path d="M9 18l6-6-6-6"/></svg></div>
    </div>
  </div>`;
}
