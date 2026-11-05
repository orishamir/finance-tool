// What a simulated user is told. Kept neutral: a person, a goal, a screen. It never names the site's makers, our terms,
// what we hope they find, or that anyone is testing the site.

export function systemPrompt(card) {
  return `${card.trim()}

You are this person, at your own screen, doing something for yourself; no one is watching or testing you. Act the way
this person really would: read what they would read, skim what they would skim, skip what they would skip, and stop or
give up when they would. Know only what this person knows and what the screen shows: do not fill a gap with outside
knowledge they would not have, and do not guess what the page's makers meant. You cannot ask anyone anything.

As you go, think aloud in short lines, in English, the way this person would talk to themselves (quote the words on the
screen that you rely on, in the screen's language).`;
}

const BROWSER_HELP = `You see and use the website only through a browser you control with one shell command, run from your
folder: node act.mjs <command>
  open <url>                    open a page
  click "<words on the screen>"  click (or tap) what shows these words; or: click <x> <y> (pixels of the last screenshot)
  fill "<field label>" "<text>"  empty a field and type into it;  type "<text>" types where the cursor is
  slider "<label>" <value>      move a slider
  scroll down | scroll up [px]  scroll;  press <key>  (Enter, Escape, ...);  back;  look;  zoom <x> <y> (a close-up)
Each command prints the path of a new screenshot: read that file before you decide your next step, because it is your
screen. The list printed under it only helps you aim a click. One command per shell call.`;

export function browserPrompt(task, { url, device, minutes, actions }) {
  return `${task.trim()}

${BROWSER_HELP}

Start with: node act.mjs open ${url}
You are on a ${device === "phone" ? "phone" : "computer"}. You have about ${minutes} minutes and ${actions} actions; you do
not have to use them all.

When you are done, or when you would give up, say your answer the way this person would, then a short account of how
it went: what you looked at, what you skipped, where you hesitated or got lost, what you were not sure you read right,
and what you would cut or change. Then fill in the report form.`;
}

export function shotsPrompt(task, names) {
  return `${task.trim()}

The screenshots of the page are in your folder, in order, top of the page first: ${names.join(", ")}.
Read them in that order, as you would scroll; you may stop reading when this person would stop.

When you are done, say your answer the way this person would, then a short account: what you looked at, what you
skipped, where you hesitated, what you were not sure you read right, and what you would cut or change. Then fill in the
report form.`;
}

// a calibration case: a question about the screenshots, with a fixed set of options
export function casePrompt(c, names) {
  const options = c.options || [];
  return `${c.question.trim()}
${options.length ? `\nThe options: ${options.map((o, i) => `(${i + 1}) ${o}`).join("; ")}.\n` : ""}
The screenshots are in your folder: ${names.join(", ")}. Read every one before you answer.

${
  options.length
    ? `Say which option you choose and why, in this person's words, then fill in the report form; its "choice" is the
option's text exactly as written above, or "none of them".`
    : `Say what you make of it, in this person's words, then fill in the report form.`
}`;
}

// the report form every session fills in (via --json-schema); answer_fields are added per task
export function reportSchema({ answerFields = null, options = null, findings = false } = {}) {
  const list = { type: "array", items: { type: "string" } };
  const props = {
    answer: { type: "string", description: "Your answer to the task, in one or two sentences, as you would say it" },
    confidence: { type: "string", enum: ["sure", "fairly sure", "unsure", "guessing"] },
    gave_up: { type: "boolean", description: "true if you stopped without an answer you would act on" },
    stuck: { type: "array", items: { type: "object", properties: { where: { type: "string" }, why: { type: "string" } }, required: ["where", "why"] }, description: "Where you hesitated, got lost or went the wrong way" },
    used: { ...list, description: "The parts of the page you actually used for your answer" },
    skimmed: { ...list, description: "Parts you glanced at without really reading" },
    skipped: { ...list, description: "Parts you saw and skipped" },
    unsure_meaning: { ...list, description: "Words, numbers, colours or marks you were not sure you understood" },
    not_found: { ...list, description: "Things you looked for and did not find" },
    would_change: { ...list, description: "What you would cut, move or change" },
  };
  const required = ["answer", "confidence", "gave_up", "stuck", "used", "skimmed", "skipped", "unsure_meaning", "not_found", "would_change"];
  if (answerFields) {
    props.answer_fields = { type: "object", properties: answerFields, required: Object.keys(answerFields), description: "The parts of your answer, one by one" };
    required.push("answer_fields");
  }
  if (findings) {
    props.findings = {
      type: "array",
      maxItems: 10,
      description: "What would bother you on these screens, most bothersome first, at most ten",
      items: { type: "object", properties: { what: { type: "string" }, where: { type: "string" } }, required: ["what", "where"] },
    };
    required.push("findings");
  }
  if (options) {
    props.choice = { type: "string", enum: options };
    required.push("choice");
  }
  return { type: "object", properties: props, required };
}
