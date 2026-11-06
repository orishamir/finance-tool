// p14-dead-sp500-pc: the part of this planted problem the change types cannot make. Runs in the page (see lib/variant.mjs, patch.js).
const hit = (t) => { const b = t && t.closest && t.closest("button"); return b && variant.norm(b.textContent) === "אינפלציה" ? b : null; };
addEventListener("click", (e) => { if (hit(e.target)) { e.stopImmediatePropagation(); e.stopPropagation(); } }, true);
variant.onPass(() => { for (const b of document.querySelectorAll("button")) if (hit(b)) b.dataset.pl = "dead"; });
