// p10-fold-keren-phone: the part of this planted problem the change types cannot make. Runs in the page (see lib/variant.mjs, patch.js).
variant.onPass(() => {
  for (const p of document.querySelectorAll("div.bg-card > p.text-lg")) {
    if (variant.norm(p.textContent) === "כמה כסף נשאר לכם, ומתי?" && !p.parentElement.dataset.pl) p.parentElement.dataset.pl = "fold";
  }
});
