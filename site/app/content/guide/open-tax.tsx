// Open tax questions several guides share (2026-11-02, issue 33): until the guides' checklist left, it alone told them.
import { IdRef } from "../../components/provenance";
import { Callout } from "../../components/kit";

/** A withdrawal below the deposits: whether the loss offsets anything (kupat gemel lehashkaa, personal management, child savings in a fund). */
export const OpenLossOffset = () => (
  <Callout tone="blocked" className="max-w-measure">
    <span className="font-medium">קיזוז הפסד.</span> לא נמצא מקור שאומר אם מי שמושך פחות ממה שהפקיד יכול לקזז את ההפסד מרווח אחר. שאלה פתוחה (<IdRef id="TXK OQ10" />).
  </Callout>
);

/** A move to another pension fund or provident fund for annuity: no source says it is exempt on the member's side. */
export const OpenSwitchTax = () => (
  <Callout tone="blocked" className="max-w-measure">
    <span className="font-medium">מעבר לקרן או לקופה אחרת.</span> לא נמצא מקור שאומר במפורש שמעבר לקרן פנסיה אחרת או לקופת גמל לקצבה אחרת פטור ממס. שאלה פתוחה (<IdRef id="SW OQ8" />).
  </Callout>
);
