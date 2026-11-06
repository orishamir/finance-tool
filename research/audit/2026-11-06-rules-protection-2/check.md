# Independent check: branch rules-protection-2 (19b01980..1404c2af)

2026-11-06. The checker did none of the work. It read the diff, opened every cited page in `research/library/store/`
(custody report fad7fdf7e3b98ee1 pp.11, 13-17; Supervisor's Q&A 100f80928d0b2117 pp.1-3; TASE rules 79b044f3666211de
pp.46-47; TASE guidelines e11b273c45f15a3c p.96; Securities Law, ISA copy 5b5d6552e5f5129e pp.112, 113, 115; Book of Laws
3510 c63e0d3988cf61f3 file p.49; Banking Ordinance 78ad661d56a7339f p.7; Banking (Licensing) Law 66b8e1b142bf13cf p.6;
First International 30db20eaa1f2c615 p.6; Massad a8b21c4609bac97c p.6; Hapoalim 7f80485c391113cb p.7; Mizrahi Tefahot
97e568f32eb2e075 p.2), fetched origin/main (97c990e2), ran a trial merge (`git merge-tree`, clean), and ran
`npm run validate` (valid; warning counts equal to main's) and `npx vitest run packages/pipeline` (171 passed).

**Verdict: fail**, on three small must-fixes. Every Hebrew quote checked matches its page word for word, and every section
number checked is right. REG-37 and BRK-63 are free on current main and on every local branch.

**General source.** The committee was inter-ministerial (the ISA, the Ministry of Finance, the Bank of Israel and the Tax
Authority) and its report is on the ISA's own site. The Supervisor's Q&A is on boi.org.il, signed by the Deputy Supervisor, and
calls itself "עמדתו ופרשנותו המחייבת של המפקח על הבנקים" on the recommendations. The adoption itself is the 16.1.2013 press
release that BRK-10 cites. That makes this a regulator's text, so it may carry a general rule for banks. REG-37 says plainly that
these are duties of means set by a regulator and not by statute. That is right, apart from item 4 below.

**Inference labels.** REG-37's "If the bank fails" paragraph and REG OQ23 label the reading that the securities stay out of the
bank's estate as derived ("read from these texts and not stated in any of them", "derived only"). That is fine. BRK-63 says
plainly that its four terms are each bank's own and points to REG-37 for the general rule. That is fine too.

## Must fix

1. **The Q&A's question 5 is on p.3, not p.2.** REG-37 Source cites `201305.pdf#page=2` for "the intermediary chapter,
   questions 1, 2 and 5". Question 5, the presumption of "הסדרה ראויה" in the US, the MiFID EU countries and similar OECD
   countries, is on p.3. Questions 1 and 2 and the client-cash question are on p.2. Cite p.2 for those three and p.3 for
   question 5.
2. **"The account abroad is governed by the custodian's own country's law" has no source.** It appears in REG-37 Conditions,
   in REG OQ23 and in the topic summary line ("the account abroad follows the custodian's own country's law (not read)"). No text
   read says this: it is a conflict-of-laws statement from memory. Recommendation 33ב says only that "החוק החל בתחום השיפוט הזר
   עשוי להיות שונה מההסדרה המקומית ועלול שלא לספק את אותה רמת הגנה על זכויות בעלות". Quote that, or label the stronger
   statement as an inference.
3. **Recommendation 33 is stated wider than its text.** It opens "ביחס ללקוח שאיננו לקוח כשיר, הרי בנוסף להודעה כאמור
   בסעיף 32 לעיל". So it applies in the cases of recommendation 32: a jurisdiction where custody is not under appropriate
   regulation, or a custodian that cannot keep the client's assets apart. REG-37's bullet comes close, because it follows the
   "or the client gets a risk warning (26)" clause. REG OQ23 says without condition that the bank "must warn a client that is
   not qualified that foreign law may protect ownership less". Tie it to recommendation 32's cases in both places.

## Should fix

4. **Recommendation 25 is not a duty of means.** REG-37 lists it under "An intermediary must take every reasonable measure to
   ensure that", and its Conditions call all of these "duties of means". Recommendation 25 is absolute: "מתווך לא יאפשר
   שקסטודיאן צד ג' ... ייצור זכות עכבון...". Recommendations 20, 22 and 26 are the reasonable-measures ones. Move 25 out of
   that list, or say that it is absolute.
5. **The TASE guidelines s.26ג(4)(א) quote leaves out its own exception.** REG OQ23 says a non-bank member may create no
   charge on client assets except for custody fees and a trade's consideration. The same subsection goes on: "על אף האמור
   לעיל, חש"ב רשאי לשעבד לטובתו את תיק ניירות הערך של לקוח, כאשר החש"ב ערב ללקוח ו/או מעמיד אשראי לטובת הלקוח, כקבוע
   בתקנון". Add it.
6. **BRK-63, First International and Massad s.28, leaves out the main liability term and moves the assignment.** The clause
   first exempts the bank from any loss caused by a broker's or custodian's act or omission, provided it chose them with
   reasonable care. The assignment of the bank's claim ("ימחה לבעלי החשבון את זכות התביעה") belongs to that sentence. The
   insolvency sentence carries only the bank's best efforts to recover the clients' assets. The title promises "who carries
   that custodian's failure", so add the reasonable-care exemption (it matches Leumi's BRK-47) and put the assignment with it.
7. **s.50א4(ב)(2) is broader in the paraphrase than in the law.** The law lets the clearing house act on a pledge, a set-off or
   a lien after the determining date in a clearing operation "הקשורה במישרין או בעקיפין להוראת סליקה" received before that
   date. The note says only "lets it act under its rules ... after the determining date". Add the link to the clearing
   instruction.
8. **The rule count in `SKILL.md` is stale.** It still says 1052 rules. The branch adds two, and the files now hold 1054.
   Update it as the earlier count commits did.
