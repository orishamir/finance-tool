// Founder, 2026-10-31: an issue waiting on them needs a description they can understand. Each entry
// here becomes the top of that issue; the text it replaces stays below it in a fold. Safe to run again.
// `MINE` lists issues that are not the founder's call (technical, or a site setting Claude sets), so
// they lose the `you decide` label. Run with --publish; with no arguments it only checks.
import { execSync } from "node:child_process";

const SITE = "https://orishamir.github.io/finance-tool";
const FOLD = "<details><summary>Where this came from</summary>";
const DRAW = "If yes, I draw it first with the site's real numbers, and you approve it before it is built.";

const decide = (question, today, choices, recommend) =>
  [`**The question.** ${question}`, `**Today.** ${today}`, `**What each answer does.** ${choices}`, `**My recommendation.** ${recommend}`].join("\n\n");
const task = (what, how, after) => [`**What this is.** ${what}`, `**What to do.** ${how}`, `**What happens next.** ${after}`].join("\n\n");

const MINE = [52, 70, 73, 74];

const TEXT = {
  17: decide(
    `Should "general track" (מסלול כללי) stay among the things you can choose to invest in, next to the S&P 500 or TA-125?`,
    `It sits on the guides page and in the comparison as if it were an investment like an index. But it names no contents: each manager's investment committee sets the mix, with no committed share of stocks, so two general tracks can hold different things. It exists only inside a study fund or a provident fund for investing. The comparison asks you for a return on a mix nobody defined.`,
    `**Remove it from that list:** it appears only as a track inside the study fund and provident fund lists. Simple, and the comparison stops asking for that return. **Rebuild tracks as their own layer:** tracks inside those funds get ranked by the asset mix each manager publishes. More useful, and a much bigger job.`,
    `Remove it now. The rebuild can come later as part of the company-and-track page goal.`,
  ),
  48: decide(
    `What should the "what makes it different" picture answer on the bank deposit guide and on the renewable money-market fund guide?`,
    `Both pictures have been hidden since 26 October, because it wasn't clear what they were for. You can still see them: [bank deposit](${SITE}/guide/bank-deposit?review) and [renewable money-market fund](${SITE}/guide/money-market-fund-renewable?review).`,
    `You name one question per picture, and I draw it to answer only that. If you name none, the two guides keep the plain timeline they show now, as a guide with no picture does.`,
    `Bank deposit: "what do I give up if I need the money before the term ends?" Renewable fund: "when can I get my money out, and what happens if I leave in between?" I'd draw these two first.`,
  ),
  50: decide(
    `What should someone moving their money to another company get from the site, and where should it sit?`,
    `The switching pages were removed on 28 October, to be built again. Still there: the calculation of what a move costs, the rules about moving, and one line on each guide. Gone: the steps, the card for writing down an offer and the checklist after a move.`,
    `**One page per product,** as before: complete, but you have to go and find it. **A block where you decide,** on the guide or the company-and-track page: the steps and the cost of the move, beside the choice that made you want to move. Either way, you also decide whether the checklist ticks saved on people's devices stay.`,
    `A block where you decide, and drop the saved ticks. ${DRAW}`,
  ),
  51: decide(
    `Can someone enter a bank deposit on the holdings page?`,
    `No. A person with a deposit can't list it, so it never gets checked. The holdings page itself is hidden until you review it.`,
    `**Yes:** a holding type "פיקדון" where you type the term and rate, judged against the options for idle cash. **No:** deposits stay outside the page, and it says so.`,
    `Yes, and settle it during your walk-through of the holdings page ([#46](https://github.com/orishamir/finance-tool/issues/46)). ${DRAW}`,
  ),
  52: `**Not your call: I took your label off.** Four things are saved on the device outside the main saved file: entered offers, changed assumptions, checklist ticks and entered rates. The export already carries them, so nobody loses anything, and merging them changes nothing you would see. It is tidying that I will do when the holdings page work needs it.`,
  53: decide(
    `What do we call the account at a bank or investment house where you hold funds, makam and bonds, and what exactly does the site mean by it?`,
    `The site uses two names: "חשבון ניירות ערך" in 28 places, including the index page, and "חשבון השקעות" in 5, on the company pages. No written definition says how the account relates to what it holds, so it has no guide page or rules of its own.`,
    `Your answer sets the one name used everywhere, and the definition. Its guide page, its rules and its place on the company pages follow from that, and [#54](https://github.com/orishamir/finance-tool/issues/54) waits on it.`,
    `"חשבון ניירות ערך": the law's own text uses it and the site mostly does already. Definition: the account at a bank or investment house in which you hold securities; the securities are what you choose, and the account is where they sit and what charges you for holding them.`,
  ),
  54: decide(
    `When the comparison prices makam, a government bond and an index fund, does it assume one account for all of them, or the cheapest company for each?`,
    `Each takes its own cheapest company. And if you choose a company for your securities account, makam and the bond ignore that choice. So the comparison can quietly assume you opened several accounts.`,
    `**One account:** one pick covers the account and everything in it. Closer to what people do, though a holding may look a little dearer. **A pick per option:** each looks its cheapest, but the total may rest on accounts you'll never open.`,
    `One account. ${DRAW}`,
  ),
  57: decide(
    `When your money is already somewhere, such as a liquid study fund, should the comparison rank "leave it there" beside moving it?`,
    `It ranks only the places you could move to. Staying isn't one of the options, even though it's often the real alternative.`,
    `**Yes:** staying gets its own row, with the fees you already pay and the fund's exit rule, ranked like the rest. **No:** you keep working out the comparison with where you are yourself.`,
    `Yes. ${DRAW}`,
  ),
  58: decide(
    `Can one sum be split between two products, for example when part is for soon and part for later, or when a product's ceiling is reached?`,
    `Each sum goes to one product. If a ceiling bites, or part of the money is for a nearer date, you'd have to run two comparisons yourself.`,
    `**A split you set by hand, on the result:** you say how much goes where, and the site runs both parts. **An engine that picks the split:** ruled out by the earlier decision that the site never allocates your money for you. **No split:** as today.`,
    `The split by hand. ${DRAW}`,
  ),
  59: decide(
    `May the site show how an index did in the past, beside your horizon, to answer "are seven years enough for stocks?"`,
    `The site's rule is that it never shows an expected return. I added a line of published past figures from a J.P. Morgan guide as a provisional exception, and it needs your yes or no. It is labelled as the past and never enters a ranking or a calculation.`,
    `**Keep single published figures:** what's there now, with no terms problem. **Use a series:** Damodaran's yearly S&P 500 returns from 1928 to 2025, so the site can show the worst, the best and the share of losing periods for your exact horizon. His statement on using the data is permissive but isn't a licence. Nothing republishable exists for TA-125 either way. **Remove the line:** the site stays silent on that question.`,
    `Use the series, with his statement quoted, because it answers the horizon you actually typed.`,
  ),
  60: decide(
    `Should the track lists show past returns and fund size beside the fees?`,
    `They show fees alone, and readers in the audit took a fee-only table for a broken one.`,
    `**Yes:** two more columns from the regulator's data that the fees already come from, labelled as the past. It first needs that data's terms confirmed. On 24 October you said not to ask the regulator for now. **No:** fees only, and the list says why.`,
    `Yes. I read the published terms first, and it comes back to you only if they don't settle it. ${DRAW}`,
  ),
  61: decide(
    `Should you be able to tick two to four funds and see them side by side?`,
    `No such thing exists. The audit asked for it, after past returns ([#60](https://github.com/orishamir/finance-tool/issues/60)) are in the lists.`,
    `**Yes:** a tick on every row and a comparison view. **No:** the list stays one table of everything, and analysis stays in its own section.`,
    `No. Your rule of 28 October says analysis compares everything at once, not two things at a time. If you agree, I close this.`,
  ),
  62: decide(
    `Should the comparison's "first because..." sentence be able to say that the return was the reason?`,
    `The sentence names the largest gap among four costs: the tax relief on deposits, fees, tax along the way and tax at exit. Where options run on different returns, the return gap is often what really decides, and the sentence can't name it.`,
    `**Yes:** the return becomes a fifth possible reason, with checked test cases. **No:** the sentence can point at a cost when the return made the difference.`,
    `Yes. It is a small change to the calculation, and the sentence becomes true in more cases.`,
  ),
  63: decide(
    `When does the fee page say a fee is "שווה להימנע" (worth avoiding)?`,
    `Whenever some other option doesn't charge that fee, even if that option costs more overall. The label is softened when the product is ranked first, but the rule underneath hasn't changed.`,
    `**Judge against the other option's total cost:** the label appears only where leaving actually saves you money. **Keep today's rule:** simpler, but it can push you away from a cheaper product.`,
    `Judge against the total cost.`,
  ),
  64: decide(
    `Should the comparison show what you'd be left with if the market falls just before you need the money?`,
    `You enter the fall you can accept, and it only filters out options. You never see what that fall would do at your goal date.`,
    `**Yes:** one more figure per option, the value at the goal date if your entered fall comes in the last year. Example with made-up numbers: 100,000 ₪ and a 30% fall leaves 70,000 ₪. **No:** the filter stays the only use of that number.`,
    `Yes. It is one formula and rests only on the fall you typed. ${DRAW}`,
  ),
  65: decide(
    `How should the site ask for the insurance cost inside a pension fund?`,
    `It asks for a percent of deposits, and you must enter it to run a pension fund. The audit suggested asking instead for the premium, which is the figure in your annual report.`,
    `**Ask for the premium:** you copy it from the report and the site converts it. **Keep the percent:** no change, and you work that percent out yourself.`,
    `Ask for the premium. It is a small change.`,
  ),
  66: decide(
    `Should each guide get practical lines: how to open this product, and what to check before you do? And paragraphs for the self-employed in the pension guide?`,
    `Guides explain what a product is and how it is taxed. They don't say how to get one or what to check first, and the pension guide doesn't speak to the self-employed.`,
    `**Yes:** one "how to open" line and four to six "what to check" points per product, each citing a rule. It waits for the guide structure to be settled. **No:** guides stay explanations.`,
    `Yes.`,
  ),
  67: decide(
    `Should the comparison have a "pay off the loan" row?`,
    `Loans aren't covered, and the site says so. A person with a loan can't see paying it off beside investing.`,
    `**Yes:** a row with a simple formula, using the loan's rate that you type. **No:** it stays on the "not covered yet" page.`,
    `Not now, unless one of your friends actually has this question; then it's cheap to add.`,
  ),
  68: decide(
    `Should the word "חשיפה" (what the money follows, such as the S&P 500) be changed?`,
    `Readers in the audit didn't know the word. An explainer has since been added beside it.`,
    `**Keep it:** the word people will meet elsewhere, with the explainer. **Rename it:** possibly clearer at first sight, but a word only this site uses, and every page with it changes.`,
    `Keep it. If you agree, I close this.`,
  ),
  69: decide(
    `Should the child-savings guide say where to find your child's account?`,
    `It doesn't. Parents who don't know which company holds the account have nowhere to look from the site.`,
    `**Yes:** one line linking to the official lookup, once that source is recorded. **No:** nothing changes.`,
    `Yes. It is small.`,
  ),
  70: `**Not your call: I took your label off.** The site marks tracks as unfit for a short horizon using a table of its own, and that table has no row for general pension funds, because the regulator's record gives that track no classification. So a general pension fund is never marked unfit, whatever fall you say you can accept. I'll set a provisional row, marked as the site's own judgement; you can change it when you look over the settings ([#76](https://github.com/orishamir/finance-tool/issues/76)).`,
  71: decide(
    `Should the comparison ask how many tax credit points (נקודות זיכוי) you have?`,
    `It doesn't use them, and each run says so. Credit points lower all the tax computed for a year, so they change the result only when they are larger than the tax on your other income that year, for example in a year with no salary. The rule base doesn't say who gets how many, so you'd have to type the number.`,
    `**Yes:** one more field, which matters mainly in low-income years. **No:** the note stays and nothing else changes.`,
    `No. Your rule is that a field has to change something visibly, and for someone on a salary this one usually won't.`,
  ),
  72: decide(
    `What minimum purchase should the site assume, so that makam and government bonds can be ranked instead of only listed?`,
    `They are listed with a reason and not ranked, because the minimum order was an open question. The stock exchange's trading guide now gives one: 10,000 ₪ for government bonds and 10,000 in face value for makam in continuous trading, with smaller orders possible in some trading phases. A bank or broker may set its own minimum too. Bonds have one more gap (interest accrued between payments), so they may stay listed for that reason.`,
    `**Use the exchange's minimum:** ranked when your sum reaches it, and listed with the reason when it doesn't. **Keep them unranked:** no risk from a minimum that a particular bank sets differently, but they never compete with anything.`,
    `Use the exchange's minimum, and show it beside them.`,
  ),
  73: `**Not your call: I took your label off.** From age 60, part of the gains in a provident fund for investing may be taxed at less than the fund withheld, and you get the difference back only by claiming it. For someone who doesn't claim, the calculation assumes a flat 25%, but the withholding is 20%, so that figure is too high on any part of the gains taxed below 20%. This is a correction to the calculation, not a choice. I'll have it checked against the rule base, then fix it along with its test case.`,
  74: `**Not your call: I took your label off.** Kit round 2 moves look-alike pieces from separate pages into the shared kit: links, page headers, sections and fields. It gets written once and looks the same everywhere, but its purpose isn't a new screen. If it looks big enough to take over 5% of the week, you'll get a one-line estimate and a question first.`,
  75: decide(
    `Do funds that don't pay out (צוברות, such as Irish funds) keep their caution about tax, and stay unranked?`,
    `The site assumes tax falls only when you sell. No Tax Authority statement says so outright. No Israeli rule was found that taxes such a holder on undistributed income, a 2019 Authority letter on foreign funds registered at the exchange supports it by implication, one secondary source agrees, and an older circular from 2003 pointed the other way. So they are calculated, tagged "מקור משני" and shown, but not ranked.`,
    `**Keep it:** honest, but these funds never compete on the index page's ranking. **Accept the reading:** they are ranked, still with the tag; if the reading turns out wrong, they will have been shown too favourably. **Ask the Tax Authority:** a letter or a ruling would settle it, but takes time and it's yours to send.`,
    `Keep it, until there's a written answer.`,
  ),
  77: decide(
    `Do you want to write to the Bank of Israel, the stock exchange and the Securities Authority for permission to show their data?`,
    `Their terms forbid copying without consent. So the site has no full list of funds, shows Bank of Israel interest rates as links rather than numbers, and shows the Authority's averages only as a link.`,
    `**Send them:** I draft the three letters in Hebrew and you send them from your own address. A yes unlocks a full fund list and the rates on the page; a no leaves everything as it is. **Don't send:** nothing changes, and those gaps stay.`,
    `Send them. It costs one short email each.`,
  ),
  78: decide(
    `Should every rule say in Hebrew when it does not apply ("מתי זה לא חל")?`,
    `The rule records state the rule and its source. The exceptions exist in the English research but not on the page, so someone can read a rule that doesn't apply to them without knowing it.`,
    `**Yes:** start with the 214 rules that carry a figure. It's a sizeable Hebrew-writing job, so you'd get an estimate first. **No:** rules stay as they are.`,
    `Yes, starting with those 214.`,
  ),
  79: decide(
    `Should the questions the site can't yet answer appear as records of their own?`,
    `Where a rule is unknown, a number shows a lock and a short chip. You can't see the whole list, or what waits on each. About 31 of them block a number.`,
    `**Yes:** each of the 31 gets a record: what's unknown and what's waiting on it. **No:** the locks stay as they are.`,
    `Yes. It tells a reader why a number is missing, and the site already holds each question's status.`,
  ),
  80: decide(
    `Should the site get Hebrew records for the 360 rules that exist only in the English research?`,
    `The site has about 600 rule records. Another 360 are in the research with no page, about 190 of them on the main products. The calculations already use what they need.`,
    `**Write them all:** the rules page becomes complete, at a large writing cost. **Write them as needed:** each product's goal adds its own. **Leave them:** the research keeps them.`,
    `Write them as needed.`,
  ),
  81: decide(
    `Should a surprising sentence in a guide carry a small mark that opens its rule?`,
    `Guides have a "שווה לדעת" block with sourced facts. Sentences in the running text carry no marks.`,
    `**Yes:** you can check a sentence on the spot, but the text gets busier. **No:** the block stays the place for sources.`,
    `No. If you agree, I close this.`,
  ),
  82: decide(
    `Should a rule be tagged "פירוש של האתר" when the law doesn't state the conclusion in one sentence?`,
    `Where the site reads a conclusion out of the law, the rule says so only inside its text, so a reader can't easily tell the law from the site's reading.`,
    `**Yes:** a visible tag on those rules. **No:** it stays inside the text.`,
    `Yes. It is the same honesty as the rest of the site's number labels.`,
  ),
  83: decide(
    `May the site build a table of all fee lines across companies, and quote six rules from the Securities Authority's directives?`,
    `Neither is built. The site's rule is that a single published figure may be quoted but a dataset needs confirmed terms, and the Authority's site forbids copying. Whether a table made of each company's own public tariff counts as such a dataset is your reading to make.`,
    `**Build the table:** every fee line for every company in one place, each with its source. **Don't:** fees stay inside each company's page and the calculations. **The six rules:** either quote them, or say what they mean in our words with a link.`,
    `Build the table, since each line is that company's own public tariff with its source shown; write the six rules in our words with a link. This is a judgement call, not legal advice.`,
  ),
  35: task(
    `The real test of the idle-cash page: you use the site to decide where your own idle cash goes, then move it yourself. The site never moves money.`,
    `After the page comes back ([#45](https://github.com/orishamir/finance-tool/issues/45)), follow it to a choice, act on it, and note what the site considered, including at least one thing you hadn't thought of.`,
    `Tell me what you chose it on and what was missing. Close this when your money has moved.`,
  ),
  36: task(
    `The real test of the fee page: one real fee you pay, decided on the shekel figure the site gives you.`,
    `Open [the fee page](${SITE}/fees), take one fee you pay now, and either ask the company to lower it or decide on purpose to leave it.`,
    `Tell me whether the figure was enough to decide on. Close this when you've done it.`,
  ),
  37: task(
    `The real test of the comparison: someone who isn't you uses it without help.`,
    `Give one friend the site on their phone and a real goal of theirs. Don't help. Note where they stopped or asked you something.`,
    `Tell me where they got stuck, and each spot becomes a fix. Close this when they reach a concrete choice alone.`,
  ),
  38: task(
    `A check that every product and track your own banks and managers offer is on the site, explained in plain Hebrew, and either considered by the comparison or marked as not evaluated, with the reason. You raised this test yourself: what's in the Meitav app has to be on the site.`,
    `Send me the list of banks and managers you actually use. If you can, also open their apps and note anything you don't find on [the companies page](${SITE}/companies).`,
    `I check the list against the catalogue and open a task for each gap.`,
  ),
  45: task(
    `[The idle-cash page](${SITE}/idle-cash) has been hidden since 26 October because you found it "a bit weird". It stays hidden until you say what it should do.`,
    `Walk through it as a friend with money in a current account. Tell me what the page should answer and in what order, and where the "emergency cushion" option on the home page should lead.`,
    `I redraw the page to that, and you approve the drawing. Its calculation and its rule that you type the rates yourself stay.`,
  ),
  46: task(
    `[The holdings page](${SITE}/holdings) has been hidden since 26 October, until you've tried it with real numbers.`,
    `Enter your own holdings from your annual statements. Notice adding a holding, the mark saying whether it fits, consolidation, child savings and the step to the fee page.`,
    `Tell me what to change. I draw it, you approve it, and then the page comes back. The deposit question ([#51](https://github.com/orishamir/finance-tool/issues/51)) is settled here too.`,
  ),
  49: task(
    `Three pages are built and linked but not final, and you haven't yet said what they should do: [tracks across companies](${SITE}/workbench/tracks/keren-hishtalmut), [banks and investment houses for a fund](${SITE}/workbench/providers/keren-hishtalmut), and [funds for an index](${SITE}/workbench/funds/index-sp500).`,
    `Walk through them. For each, tell me what it should answer and in what order, and whether the saved-goal strip and the fit mark on each track stay.`,
    `That sets the page's name and shape, and the tasks of its goal follow.`,
  ),
  76: task(
    `On 23 October you told me to choose the site's judgement settings ("do whatever you think fits") and signed them off without having used the pages they drive: the ranges in the sensitivity panel, the thresholds for "worth negotiating" and "worth avoiding", which track suits which horizon, the example scenario on the guides, and the goal presets. They are all on [the settings page](${SITE}/parameters).`,
    `Nothing yet. After you've used those pages for real, ask yourself whether any label felt wrong: for example a fee called "not worth the trouble" that you would have fought.`,
    `Tell me which ones felt wrong and I'll change them. Close this if none did.`,
  ),
  98: task(
    `A link check of the site's sources couldn't open 27 fund pages on Maya, the exchange's filing site, because Maya refuses automated browsing. They may be fine; nobody has looked.`,
    `Open the Maya links listed in \`research/audit/2026-10-25-link-check.md\` in your browser and tell me any that don't open or show the wrong fund. Twenty minutes at most, and this can wait.`,
    `I fix or replace the ones you name, then this closes.`,
  ),
};

const publish = process.argv.includes("--publish");
for (const [n, text] of Object.entries(TEXT)) {
  const issue = JSON.parse(execSync(`gh issue view ${n} --json body,labels,state`).toString());
  if (issue.state !== "OPEN") throw new Error(`#${n} is not open`);
  const old = issue.body.includes(FOLD) ? issue.body.slice(issue.body.indexOf(FOLD) + FOLD.length).replace(/\n*<\/details>\s*$/, "").trim() : issue.body.trim();
  const body = `${text}\n\n${FOLD}\n\n${old}\n\n</details>`;
  const mine = MINE.includes(Number(n));
  const labels = issue.labels.map((l) => l.name);
  const yours = labels.includes("you decide") || labels.includes("you do");
  if (!yours && !mine) throw new Error(`#${n} does not wait on the founder`);
  if (!publish) continue;
  if (body !== issue.body) {
    execSync(`gh api -X PATCH repos/orishamir/finance-tool/issues/${n} --input - --silent`, { input: JSON.stringify({ body }) });
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (mine && labels.includes("you decide")) {
    execSync(`gh issue edit ${n} --remove-label "you decide"`);
    await new Promise((r) => setTimeout(r, 1000));
  }
}
const open = JSON.parse(execSync(`gh issue list --state open --limit 200 --json number,labels`).toString());
const waiting = open.filter((i) => i.labels.some((l) => l.name === "you decide" || l.name === "you do")).map((i) => i.number);
console.log("waiting on the founder with no plain description:", waiting.filter((n) => !TEXT[n]));
console.log(`${Object.keys(TEXT).length} descriptions${publish ? " written" : " checked"}`);
