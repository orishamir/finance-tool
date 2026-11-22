// The site's switch (design-system 11): a 40 px track whose knob stands at its end when on, on the action colour's track, and at its start
// when off, on a muted one. `Switch` is a setting named by the words beside it ("זה המסלול שלי"); `OnOffSwitch` says its own state in a word.
import { useId, type ReactNode } from "react";
import { cx } from "./cx";

/** The track and its knob, drawn only: the control that holds it says what it is and takes the tap. */
function SwitchTrack({ on }: { on: boolean }) {
  return (
    <span aria-hidden className={cx("relative block h-6 w-10 shrink-0 rounded-full transition-colors duration-(--duration-fast)", on ? "bg-primary" : "bg-muted-foreground/40")}>
      <span className={cx("absolute top-0.5 size-5 rounded-full transition-[inset-inline-start] duration-(--duration-fast)", on ? "inset-s-[1.125rem] bg-primary-foreground" : "inset-s-0.5 bg-foreground")} />
    </span>
  );
}

/**
 * On or off, as a switch: the track and its knob, and the words beside it; the whole line is the target, the track's own area 44 px both
 * ways. The knob stands at the end when on, on the action colour's track.
 */
export function Switch({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (on: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex min-h-target w-fit items-center gap-3">
      <button type="button" role="switch" id={id} aria-checked={checked} onClick={() => onChange(!checked)} className="tap-wide relative shrink-0 rounded-full">
        <SwitchTrack on={checked} />
      </button>
      <label htmlFor={id} className="cursor-pointer font-medium">
        {label}
      </label>
    </div>
  );
}

/**
 * A thing switched on or off where it stands, its state said in a word after the track ("בחישוב", "לא בחישוב"), never by the colour alone:
 * a fee of a deal in its card's corner. One button (`aria-pressed`, on when pressed); its words hold the room of the longer of the two, so
 * switching it moves nothing beside it; 44 px tall.
 */
export function OnOffSwitch({ on, words, onChange }: { on: boolean; words: { on: string; off: string }; onChange: (on: boolean) => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={() => onChange(!on)} className="inline-flex min-h-target shrink-0 cursor-pointer items-center gap-2 rounded-md text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2">
      <SwitchTrack on={on} />
      {/* the state's word, and the other laid out in the same cell unseen: the button is as wide on or off */}
      <span className="inline-grid text-start *:[grid-area:1/1]">
        <span aria-hidden="true" className="invisible">
          {on ? words.off : words.on}
        </span>
        <span className={on ? "text-foreground" : undefined}>{on ? words.on : words.off}</span>
      </span>
    </button>
  );
}
