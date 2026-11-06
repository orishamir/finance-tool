// p13-sort-tracks-phone: the part of this planted problem the change types cannot make. Runs in the page (see lib/variant.mjs, patch.js).
let done = false;
variant.onPass(() => {
  if (done) return;
  const s = [...document.querySelectorAll("select")].find((x) => [...x.options].some((o) => o.value === "name") && x.offsetParent);
  if (!s) return;
  done = true;
  s.dataset.pl = "sort";
  setTimeout(() => {
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(s, "name");
    s.dispatchEvent(new Event("change", { bubbles: true }));
  }, 50);
});
