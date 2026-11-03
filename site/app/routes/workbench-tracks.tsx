// The old address of a product's tracks (`/workbench/tracks/<product>`, before 2026-11-03): sent on to the track browser, so a saved link works.
import { redirect } from "react-router";
import type { Route } from "./+types/workbench-tracks";

export function loader({ params }: Route.LoaderArgs) {
  return redirect(`/tracks/${params.wrapper}`);
}

export default function WorkbenchTracks() {
  return null;
}
