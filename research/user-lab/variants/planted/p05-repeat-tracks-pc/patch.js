// p05-repeat-tracks-pc: the part of this planted problem the change types cannot make. Runs in the page (see lib/variant.mjs, patch.js).
variant.onPass(() => {
  let company = null;
  for (const tr of document.querySelectorAll("table tr")) {
    const g = tr.querySelector('th[scope="rowgroup"] .grp-title');
    if (g) { company = variant.norm(g.textContent); continue; }
    const cell = tr.querySelector("td:first-child > span.flex-col");
    if (!cell || !company) continue;
    let tag = cell.querySelector(':scope > [data-pl="repeat"]');
    if (!tag) {
      tag = document.createElement("span");
      tag.dataset.pl = "repeat";
      tag.className = "text-xs text-muted-foreground";
      cell.insertBefore(tag, cell.children[1] || null);
    }
    if (tag.textContent !== company) tag.textContent = company;
  }
});
