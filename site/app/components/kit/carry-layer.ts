// Where a piece draws what follows the pointer or hangs over the page outside its own box (a carried thing's picture and its note, a
// knob's frame, a dragged chip's copy): in the open dialog that holds the piece, else the page's body. A sheet is a dialog shown modally:
// it stands in the top layer, over everything drawn on the body whatever its z-index, and the page outside it is inert, so what a piece
// inside a sheet drew on the body would be hidden under the sheet.

/** The element to draw over `el` in: the nearest open dialog around it, else the page's body. */
export function layerOf(el: Element | null): HTMLElement {
  return el?.closest<HTMLElement>("dialog[open]") ?? document.body;
}

/**
 * The point on the screen where a box fixed at 0,0 inside `layer` stands, measured with an empty box: on the body the screen's corner; in a
 * dialog moved by a transform (a sheet centred on a computer) the dialog's own corner, since a transform holds what is fixed inside it. A
 * box placed at a screen point is placed at that point less this.
 */
export function fixedOrigin(layer: HTMLElement): { x: number; y: number } {
  const probe = document.createElement("div");
  Object.assign(probe.style, { position: "fixed", left: "0", top: "0", width: "0", height: "0", margin: "0", visibility: "hidden", pointerEvents: "none" });
  layer.appendChild(probe);
  const r = probe.getBoundingClientRect();
  probe.remove();
  return { x: r.left, y: r.top };
}
