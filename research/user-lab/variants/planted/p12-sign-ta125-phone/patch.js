// p12-sign-ta125-phone: the part of this planted problem the change types cannot make. Runs in the page (see lib/variant.mjs, patch.js).
variant.onPass(() => {
  for (const dd of document.querySelectorAll("dl dd")) {
    if (dd.closest('[aria-hidden="true"]')) continue;
    const bdi = dd.querySelector("button.num bdi");
    if (!bdi) continue;
    const word = [...dd.childNodes].find((n) => n.nodeType === 3 && /^\s*(יותר|פחות)\s*$/.test(n.nodeValue));
    if (word) { dd.dataset.dir = /יותר/.test(word.nodeValue) ? "+" : "−"; word.nodeValue = ""; dd.dataset.pl = "sign"; }
    if (!dd.dataset.dir) continue;
    const bare = bdi.textContent.replace(/^[\u200e+−-]+/, "");
    const want = "\u200e" + dd.dataset.dir + bare;
    if (bdi.textContent !== want) bdi.textContent = want;
  }
});
