// p06-method-sp500-pc: the part of this planted problem the change types cannot make. Runs in the page (see lib/variant.mjs, patch.js).
const parse = (s) => Number(String(s).replace(/[^0-9.\-−]/g, "").replace("−", "-"));
const fmt = (n) => (n < 0 ? "\u200e−" : "") + Math.abs(n).toLocaleString("en-US") + " ₪";
variant.onPass(() => {
  const rows = [...document.querySelectorAll("div[role=radio][data-pick-key]")].filter((r) => r.querySelector("span.min-h-5"));
  if (!rows.length) return;
  const head = rows[0].parentElement && rows[0].parentElement.parentElement;
  for (const h of document.querySelectorAll("div.grid.items-end > span")) {
    if (variant.norm(h.textContent) === "נשאר" && h.parentElement.textContent.includes("חשבון")) { h.textContent = "פער מהמיטבי"; h.dataset.pl = "method"; }
  }
  const cells = rows.map((r) => r.querySelector('span.text-end.font-semibold button.num bdi')).filter(Boolean);
  for (const b of cells) if (b.dataset.shown !== b.textContent) b.dataset.orig = b.textContent;
  const vals = cells.map((b) => parse(b.dataset.orig)).filter((v) => !Number.isNaN(v));
  if (!vals.length) return;
  const best = Math.max(...vals);
  for (const b of cells) {
    const v = parse(b.dataset.orig);
    if (Number.isNaN(v)) continue;
    const s = fmt(v - best);
    if (b.textContent !== s) b.textContent = s;
    b.dataset.shown = s;
    b.dataset.pl = "method";
  }
});
