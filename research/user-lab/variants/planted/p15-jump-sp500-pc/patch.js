// p15-jump-sp500-pc: the part of this planted problem the change types cannot make. Runs in the page (see lib/variant.mjs, patch.js).
const parse = (s) => Number(String(s).replace(/[^0-9.\-−]/g, "").replace("−", "-"));
variant.onPass(() => {
  const paid = document.querySelector(".md\\:w-72.md\\:shrink-0");
  const grid = paid && paid.parentElement;
  const diff = [...document.querySelectorAll("span.flex-col.items-start bdi")].find((b) => /₪/.test(b.textContent));
  if (!grid || !diff) return;
  let note = grid.parentElement.querySelector(':scope > [data-pl="jump"]');
  if (!note) {
    note = document.createElement("p");
    note.dataset.pl = "jump";
    note.className = "text-sm text-muted-foreground";
    note.textContent = "שני הזוגות הראשונים כמעט שווים: ההפרש ביניהם קטן מ־50 ₪.";
    grid.parentElement.insertBefore(note, grid);
  }
  const show = Math.abs(parse(diff.textContent)) < 50;
  const want = show ? "" : "none";
  if (note.style.display !== want) note.style.display = want;
});
