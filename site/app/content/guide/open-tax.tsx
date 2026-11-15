// Open tax questions several guides share: until the guides' checklist left, it alone told them.
import { IdRef, Ruled } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

/**
 * A provident fund for investing, and child savings held in one, whose balance is not above what was deposited in it. What is settled
 * comes first, as plain prose: no income tax and nothing withheld (TXK-30, the site's reading; a partial withdrawal is split pro rata,
 * TXK-13, which TXK-30 cites and which has no site record, so it carries no gain either). Its condition is the balance, never the amount taken out (checker). The open
 * question, whether the shortfall offsets other gains (TXK OQ10), follows in its own blocked callout. TXK-30 is the provident fund for
 * investing's rule, so no other guide shows this. Its words open TXK-30 (Ruled); every guide that imports this part ships the
 * rules it names (scanRuleIds follows a guide's imports).
 */
export const OpenLossOffset = () => (
  <>
    <Sentence measure>
      כשהיתרה בקופה לא עולה על מה שהופקד בה, <Ruled id="TXK-30">אין על המשיכה מס הכנסה</Ruled>, והחברה המנהלת לא מנכה ממנה דבר במקור. זו קריאה של האתר בפקודת מס הכנסה, לא משפט מפורש בה.
    </Sentence>
    <Callout tone="blocked" className="max-w-measure">
      <span className="font-medium">קיזוז הפסד.</span> לא נמצא מקור שאומר אם משיכה של פחות ממה שהופקד נותנת הפסד שאפשר לקזז מרווח אחר. שאלה פתוחה <IdRef id="TXK OQ10" end="." />
    </Callout>
  </>
);
