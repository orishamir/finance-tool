// When a typed field shows its error (guidelines/design.md, "Fields"): once the hand rests, on leaving the field or after a pause in the
// typing, and never on every keystroke. Once shown it stays while the text is still wrong, so a further wrong keystroke does not make it
// blink; the keystroke that makes the text right clears it, and a later wrong one waits for the next rest.
import { useEffect, useRef, useState } from "react";

/** How long the typing pauses before a field's error shows, in ms. */
const ERROR_REST_MS = 600;

export interface ErrorRest {
  /** Whether the field's error, if its text has one, is shown. */
  shows: boolean;
  /** A keystroke: whether the text it leaves is right. */
  typed: (right: boolean) => void;
  /** The hand rests now (the field is left, Enter is pressed): a wrong text's error shows at once. */
  rest: () => void;
  /** The text the error was shown for is gone (a value from outside replaced it): the next wrong text waits for its own rest. */
  clear: () => void;
}

export function useErrorRest(): ErrorRest {
  const [shows, setShows] = useState(false);
  const timer = useRef<number | null>(null);
  const stop = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);
  return {
    shows,
    typed: (right) => {
      stop();
      if (right) setShows(false);
      else if (!shows)
        timer.current = window.setTimeout(() => {
          timer.current = null;
          setShows(true);
        }, ERROR_REST_MS);
    },
    rest: () => {
      stop();
      setShows(true);
    },
    clear: () => {
      stop();
      setShows(false);
    },
  };
}
