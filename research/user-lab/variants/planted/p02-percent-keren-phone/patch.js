// p02-percent-keren-phone: the part of this planted problem the change types cannot make. Runs in the page (see lib/variant.mjs, patch.js).
variant.onPass(() => {
  for (const p of document.querySelectorAll("p")) {
    if (p.closest('[aria-hidden="true"]') || p.dataset.pl) continue;
    const t = variant.norm(p.textContent);
    if (!t.includes("ההבדל בדמי הניהול") || !t.includes("שווה עד")) continue;
    let cut = false;
    for (const n of [...p.childNodes]) {
      if (cut) { if (n.nodeType === 3) n.nodeValue = ""; else if (n.nodeType === 1) n.style.setProperty("display", "none", "important"); continue; }
      if (n.nodeType !== 3) continue;
      if (n.nodeValue.includes("ההבדל בדמי הניהול (")) n.nodeValue = n.nodeValue.replace("ההבדל בדמי הניהול (", "דמי הניהול הם בין ");
      if (n.nodeValue.includes("שווה עד")) { n.nodeValue = n.nodeValue.replace(/\)\s*שווה עד.*$/s, " בשנה."); cut = true; }
    }
    if (cut) p.dataset.pl = "pct";
  }
});
