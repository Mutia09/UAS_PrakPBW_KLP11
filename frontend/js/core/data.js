function getChildren() {
  const seen = {},
    out = [];
  for (const r of state.history) {
    if (!seen[r.name]) {
      seen[r.name] = true;
      const recs = state.history
        .filter((h) => h.name === r.name)
        .sort((a, b) => b.age - a.age);
      out.push({
        name: r.name,
        gender: r.gender,
        records: recs,
        latest: recs[0],
      });
    }
  }
  return out;
}

function updateChildNav() {
  const children = getChildren();
  const el = document.getElementById("childNavList");
  if (children.length === 0) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = children
    .map((c, i) => {
      const dot = S_DOT[c.latest.classification.status];
      const name_esc = escName(c.name);
      return `<div class="nav-child-item" data-child="${c.name}" onclick="navChild('${name_esc}')"><div class="nav-child-dot" style="background:${dot}"></div><span>${CHILD_EMOJI[i % CHILD_EMOJI.length]} ${c.name}</span></div>`;
    })
    .join("");
}
