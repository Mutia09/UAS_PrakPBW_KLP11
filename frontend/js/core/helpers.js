const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function formatDateWIB(dateStr) {
  if (!dateStr) return '';
  if (dateStr.includes('T') || dateStr.includes('Z')) {
    const d = new Date(dateStr);
    const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    const day = wib.getUTCDate();
    const month = MONTHS_ID[wib.getUTCMonth()];
    const year = wib.getUTCFullYear();
    const hh = String(wib.getUTCHours()).padStart(2, '0');
    const mm = String(wib.getUTCMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} ${hh}:${mm}`;
  } else {
    const parts = dateStr.split('-');
    return `${parseInt(parts[2])} ${MONTHS_ID[parseInt(parts[1]) - 1]} ${parts[0]}`;
  }
}

function hazColor(haz) {
  if (haz >= -1) return "var(--g600)";
  if (haz >= -2) return "var(--b600)";
  return "var(--r600)";
}
function genderLabel(g) {
  return g === "L" ? "Laki-laki" : "Perempuan";
}
function escName(name) {
  return name.replace(/'/g, "\\'");
}
const STATUS_BADGE = {
  normal: "badge-green",
  risk: "badge-blue",
  genetic: "badge-amber",
  stunting: "badge-red",
};
function statusBadge(status) {
  return STATUS_BADGE[status] || "badge-green";
}
function renderRecList(recs) {
  return recs
    .map(
      (rec) =>
        `<div class="rec-item"><div class="rec-icon" style="background:${rec.bg}">${rec.icon}</div><div><div class="rec-title">${rec.title}</div><div class="rec-desc">${rec.desc}</div></div></div>`,
    )
    .join("");
}
function showBmiLive(elId, h, w, label, isChild) {
  const el = document.getElementById(elId);
  const minH = isChild ? 30 : 100;
  if (!isNaN(h) && !isNaN(w) && h > minH && w > 0) {
    const bmi = calcBMI(w, h);
    const cat = bmiCat(bmi, isChild);
    const extra = isChild ? "" : " bmi-live-box--parent";
    el.style.display = "block";
    el.innerHTML = `<div class="bmi-live-box${extra}" style="background:${cat.bg};border:1px solid ${cat.color}22">BMI ${label}: <b style="color:${cat.color}">${bmi.toFixed(1)} - ${cat.label}</b></div>`;
  } else {
    el.style.display = "none";
  }
}
function showOverlay(id, open) {
  document.getElementById(id).classList.toggle("open", open);
}
const WHO_AGES = [
  0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 42, 48, 54, 60,
];
