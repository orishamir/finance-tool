// p15-jump-keren-phone: the part of this planted problem the change types cannot make. Runs in the page (see lib/variant.mjs, patch.js).
variant.onPass(() => {
  const h = [...document.querySelectorAll("h3")].find((x) => variant.norm(x.textContent).startsWith("מושכים את הכסף אחרי"));
  const slot = h && h.querySelector(".input-slot-value");
  if (!slot) return;
  const years = Number(variant.norm(slot.textContent).replace(/[^0-9]/g, ""));
  let note = h.parentElement.querySelector(':scope > [data-pl="jump"]');
  if (!note) {
    note = document.createElement("p");
    note.dataset.pl = "jump";
    note.className = "text-sm text-muted-foreground";
    note.textContent = "משיכה לפני 6 שנים: משלמים מס.";
    h.insertAdjacentElement("afterend", note);
  }
  const want = years && years < 6 ? "" : "none";
  if (note.style.display !== want) note.style.display = want;
});
