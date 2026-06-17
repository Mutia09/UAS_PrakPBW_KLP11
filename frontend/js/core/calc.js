const WHO_BOYS = {
  0: [44.2, 46.1, 47.9, 49.9, 51.8, 53.5, 55.0],
  3: [55.3, 57.3, 59.4, 61.4, 63.5, 65.3, 67.2],
  6: [63.3, 65.5, 67.6, 69.8, 72.0, 74.0, 75.9],
  9: [68.0, 70.1, 72.3, 74.5, 76.7, 78.7, 80.5],
  12: [71.7, 74.0, 76.1, 78.4, 80.7, 82.7, 84.5],
  15: [75.0, 77.3, 79.6, 81.9, 84.3, 86.3, 88.3],
  18: [77.8, 80.2, 82.5, 84.9, 87.3, 89.4, 91.5],
  21: [80.4, 82.8, 85.3, 87.8, 90.3, 92.5, 94.6],
  24: [82.5, 85.1, 87.6, 90.3, 92.9, 95.2, 97.4],
  27: [84.5, 87.2, 89.9, 92.6, 95.3, 97.7, 100.0],
  30: [86.5, 89.2, 91.9, 94.7, 97.5, 99.9, 102.3],
  33: [88.2, 91.1, 93.9, 96.7, 99.6, 102.1, 104.5],
  36: [89.9, 92.8, 95.7, 98.6, 101.6, 104.1, 106.6],
  42: [93.0, 96.1, 99.2, 102.3, 105.5, 108.2, 110.8],
  48: [96.1, 99.4, 102.5, 105.8, 109.1, 112.0, 114.7],
  54: [99.0, 102.3, 105.7, 109.1, 112.6, 115.5, 118.3],
  60: [101.7, 105.3, 108.7, 112.2, 115.7, 118.8, 121.7],
};
const WHO_GIRLS = {
  0: [43.6, 45.4, 47.3, 49.1, 51.0, 52.7, 54.3],
  3: [53.5, 55.6, 57.7, 59.8, 62.0, 63.9, 65.8],
  6: [61.2, 63.5, 65.7, 67.8, 70.0, 72.0, 73.9],
  9: [66.1, 68.3, 70.4, 72.6, 74.8, 76.7, 78.6],
  12: [69.9, 72.0, 74.2, 76.5, 78.7, 80.7, 82.6],
  15: [73.0, 75.3, 77.5, 79.9, 82.2, 84.3, 86.3],
  18: [75.8, 78.1, 80.5, 82.9, 85.3, 87.5, 89.6],
  21: [78.3, 80.8, 83.3, 85.8, 88.3, 90.5, 92.7],
  24: [80.0, 82.5, 85.2, 87.8, 90.4, 92.7, 95.0],
  27: [81.9, 84.6, 87.3, 90.0, 92.8, 95.2, 97.5],
  30: [83.6, 86.4, 89.3, 92.1, 95.0, 97.5, 99.9],
  33: [85.3, 88.2, 91.2, 94.1, 97.0, 99.6, 102.1],
  36: [86.8, 89.9, 92.9, 95.9, 98.9, 101.6, 104.2],
  42: [90.0, 93.3, 96.4, 99.6, 102.8, 105.7, 108.4],
  48: [93.2, 96.6, 99.9, 103.3, 106.7, 109.7, 112.5],
  54: [96.4, 99.8, 103.3, 106.8, 110.3, 113.4, 116.4],
  60: [99.5, 103.0, 106.5, 110.1, 113.7, 116.9, 120.0],
};
function whoLookup(a, g, idx) {
  const ref = g === "L" ? WHO_BOYS : WHO_GIRLS;
  const keys = Object.keys(ref)
    .map(Number)
    .sort((a, b) => a - b);
  let lo = keys[0],
    hi = keys[keys.length - 1];
  for (let k of keys) {
    if (k <= a) lo = k;
    if (k >= a && k < hi) {
      hi = k;
      break;
    }
  }
  if (lo === hi) return ref[lo][idx];
  const t = (a - lo) / (hi - lo);
  return ref[lo][idx] + t * (ref[hi][idx] - ref[lo][idx]);
}
const whoMedian = (a, g) => whoLookup(a, g, 3);
const whoMinus2 = (a, g) => whoLookup(a, g, 0);
const whoSD = (a, g) => (whoMedian(a, g) - whoMinus2(a, g)) / 2;

const calcBMI = (w, h) => w / (h / 100) ** 2;
const calcMPH = (fH, mH, g) =>
  g === "L" ? (fH + mH + 13) / 2 : (fH + mH - 13) / 2;
const calcHAZ = (h, a, g) => {
  const s = whoSD(a, g);
  return s === 0 ? 0 : (h - whoMedian(a, g)) / s;
};
function classifyStunting(haz, childH, mph) {
  const inGenetic = childH >= mph - 8.5;
  if (haz >= -1)
    return {
      status: "normal",
      label: "Normal",
      color: "normal",
      desc: "Tinggi badan anak sesuai standar WHO dan potensi genetik. Pertumbuhan berjalan dengan baik!",
    };
  if (haz >= -2)
    return {
      status: "risk",
      label: "Risiko Stunting",
      color: "risk",
      desc: "Tinggi sedikit di bawah rata-rata WHO. Perlu pantauan gizi dan stimulasi tumbuh kembang lebih intensif.",
    };
  if (inGenetic)
    return {
      status: "genetic",
      label: "Stunting Genetik",
      color: "genetic",
      desc: "HAZ di bawah -2, namun masih sesuai potensi genetik orang tua. Kemungkinan faktor keturunan - tetap konfirmasi ke dokter.",
    };
  return {
    status: "stunting",
    label: "Stunting Patologis",
    color: "stunting",
    desc: "HAZ di bawah -2 dan tinggi di bawah potensi genetik. Kemungkinan kekurangan gizi atau kondisi medis - segera ke dokter.",
  };
}
function bmiCat(bmi, isChild = false) {
  if (isChild) {
    if (bmi < 14)
      return { label: "Sangat Kurus", color: "#a32d2d", bg: "#fcebeb" };
    if (bmi < 16) return { label: "Kurus", color: "#854f0b", bg: "#faeeda" };
    if (bmi < 22) return { label: "Normal", color: "#3b6d11", bg: "#eaf3de" };
    return { label: "Kelebihan", color: "#185fa5", bg: "#e6f1fb" };
  }
  if (bmi < 18.5) return { label: "Kurang", color: "#854f0b", bg: "#faeeda" };
  if (bmi < 25) return { label: "Normal", color: "#3b6d11", bg: "#eaf3de" };
  if (bmi < 30) return { label: "Lebih", color: "#185fa5", bg: "#e6f1fb" };
  return { label: "Obesitas", color: "#a32d2d", bg: "#fcebeb" };
}
const RECS = {
  normal: [
    {
      icon: "🥦",
      bg: "var(--g50)",
      title: "Pertahankan gizi seimbang",
      desc: "Lanjutkan pola makan dengan protein, sayuran, buah, dan karbohidrat setiap hari.",
    },
    {
      icon: "📅",
      bg: "var(--b50)",
      title: "Pantau rutin tiap bulan",
      desc: "Bawa anak ke posyandu setiap bulan untuk memantau perkembangan.",
    },
  ],
  risk: [
    {
      icon: "🥩",
      bg: "var(--a50)",
      title: "Tingkatkan asupan protein",
      desc: "Berikan telur, ikan, tempe, tahu, daging, dan kacang-kacangan setiap hari.",
    },
    {
      icon: "🩺",
      bg: "var(--b50)",
      title: "Konsultasi ke bidan atau dokter",
      desc: "Konsultasikan ke tenaga kesehatan untuk evaluasi gizi dan pertumbuhan lebih lanjut.",
    },
    {
      icon: "📊",
      bg: "var(--g50)",
      title: "Pantau ketat setiap 2 minggu",
      desc: "Lakukan pengukuran lebih sering agar tren pertumbuhan dapat dipantau akurat.",
    },
  ],
  genetic: [
    {
      icon: "🧬",
      bg: "var(--a50)",
      title: "Pantau - tidak perlu panik",
      desc: "Kondisi ini kemungkinan faktor genetik. Konsultasi ke dokter untuk konfirmasi.",
    },
    {
      icon: "🥛",
      bg: "var(--g50)",
      title: "Optimalkan kalsium & zinc",
      desc: "Berikan susu, produk olahan susu, dan makanan kaya zinc untuk pertumbuhan tulang.",
    },
    {
      icon: "🏃",
      bg: "var(--b50)",
      title: "Aktivitas fisik & sinar matahari",
      desc: "Ajak anak bermain aktif di luar, terpapar sinar matahari pagi untuk vitamin D.",
    },
  ],
  stunting: [
    {
      icon: "🚨",
      bg: "var(--r50)",
      title: "Segera ke fasilitas kesehatan",
      desc: "Bawa anak ke puskesmas atau rumah sakit untuk pemeriksaan dan penanganan segera.",
    },
    {
      icon: "🍼",
      bg: "var(--a50)",
      title: "Ikuti program gizi intensif (PMT)",
      desc: "Daftarkan anak di program Pemberian Makanan Tambahan di posyandu atau puskesmas.",
    },
    {
      icon: "💉",
      bg: "var(--b50)",
      title: "Periksa kesehatan lengkap",
      desc: "Dokter akan memeriksa kemungkinan infeksi, anemia, atau kondisi yang menghambat pertumbuhan.",
    },
  ],
};
const S_COLOR = {
  normal: "var(--g600)",
  risk: "var(--b600)",
  genetic: "var(--a600)",
  stunting: "var(--r600)",
};
const S_BG = {
  normal: "var(--g50)",
  risk: "var(--b50)",
  genetic: "var(--a50)",
  stunting: "var(--r50)",
};
const S_DOT = {
  normal: "#3b6d11",
  risk: "#185fa5",
  genetic: "#854f0b",
  stunting: "#a32d2d",
};
const S_EMOJI = {
  normal: "✅",
  risk: "⚠️",
  genetic: "🧬",
  stunting: "🚨",
};
const CHILD_EMOJI = ["🧒", "👦", "👧", "🐣", "🌱", "⭐", "🌙", "🎈"];
