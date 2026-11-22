// A question before something is taken away for good (design-system 11): on a computer a card where it stands, its question, one line on
// what follows, and its two buttons, the one that takes it away filled in the danger colour first and "ביטול" outlined beside it; on a
// phone a sheet from the foot of the screen, its buttons the screen's width and 44 px tall. Its host keeps whether it is open.
import { useId } from "react";
import { MQ, useMedia } from "../../lib/hooks";
import { Sheet } from "../Sheet";
import { Button } from "./button";
import { Card } from "./card";

export function ConfirmAsk({ open, question, body, yes, no, onYes, onNo }: { open: boolean; question: string; /** What follows, one sentence. */ body: string; yes: string; no: string; onYes: () => void; onNo: () => void }) {
  const wide = useMedia(MQ.md);
  const id = useId();
  return (
    <>
      {open && wide && (
        <Card pad="tight" role="alertdialog" aria-labelledby={id} className="flex flex-col gap-2">
          <p id={id} className="font-medium">
            {question}
          </p>
          <p className="text-sm text-muted-foreground">{body}</p>
          <div className="flex gap-2">
            <Button variant="danger" onClick={onYes}>
              {yes}
            </Button>
            <Button variant="outline" onClick={onNo}>
              {no}
            </Button>
          </div>
        </Card>
      )}
      <Sheet open={open && !wide} onClose={onNo} labelledBy={id}>
        <div className="flex flex-col gap-3">
          <h3 id={id} className="text-lg font-semibold">
            {question}
          </h3>
          <p className="text-muted-foreground">{body}</p>
          <Button variant="danger" className="w-full" onClick={onYes}>
            {yes}
          </Button>
          {/* the focus opens on the cancel: Enter on a question about taking something away for good never takes it away */}
          <Button variant="outline" className="w-full" onClick={onNo} data-autofocus="">
            {no}
          </Button>
        </div>
      </Sheet>
    </>
  );
}
