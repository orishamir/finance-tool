// p13-sort-harel-pc: the part of this planted problem the change types cannot make. Runs in the page (see lib/variant.mjs, patch.js).
let done = false;
variant.onPass(() => {
  if (done) return;
  const th = [...document.querySelectorAll("table thead th")].find((t) => variant.norm(t.textContent).startsWith("המסלול"));
  if (!th) return;
  done = true;
  th.dataset.pl = "sort";
  setTimeout(() => (th.querySelector("button") || th).click(), 50);
});
