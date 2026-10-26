---
name: data-update
description: Collect or refresh the data from one source into data/, following docs/data-schema.md. Use it whenever the task is to fetch, add, update or re-check fees, tariffs, deposit terms, fund lists, fund details, CMA or Bank of Israel series or averages from a named source (for example "update the Leumi tariff", "refresh the BOI series", "collect the Psagot Trade fees", "pull this month's gemelnet"). Reads the official page or document, records a source URL and today's date on every value, never estimates, lists what was not found, and runs the data check at the end. Not for tax or financial rules (those come from il-finance), for UI, or for engine code.
model: sonnet
effort: high
user-invocable: false
---

# data-update

Collects or refreshes the data from **one source** into `data/`. The site shows every figure with its source and date (CLAUDE.md, "Every number traces to a source"), so a value is only worth writing if a person can open the URL and see it. A gap that is listed honestly costs little; a number that is guessed or copied from memory makes the whole site untrustworthy.

The source to work on is the task's argument. If none was given, ask which one.

## 1. Find the source and its target

1. Find the source in `research/discovery/` (start with `data-landscape.md`: sections 1 to 4 list each source with its URL, format and access notes; section 5.1 lists which hosts block scripts; section 6.3 lists known gaps). The data-researcher found these sources; work from them. If the source is not listed there, say so and stop. Do not add a source on your own initiative.
2. Read the collection's section in `docs/data-schema.md` (the table of contents is sections 3.1 to 3.14) and section 1, the common rules. Typical routes: CMA datasets to `data/cma/`, bank and broker tariffs to `data/fees/`, deposit products to `data/terms/deposits/`, Bank of Israel and CBS series to `data/series/`, regulator averages to `data/averages/`, the Maya and TASE fund lists to `data/fund-lists/`, fund details to `data/funds/`.
3. Check that a Zod schema for that collection exists in `packages/schema/`, and that `packages/pipeline/src/validate.ts` has the folder in its `collections` map. If not, **stop and report**: the project's order is schema first, then data, and the validator rejects a file in a folder without a schema. Do not add the schema or edit the validator yourself.
4. If the work needs a tax or financial rule (a rate, a ceiling, a cap), take it from the `il-finance` skill with its rule ID. If it is not there, say the rule is missing and stop on that item.
5. Look at what already exists for this source under `data/`. A refresh adds a new dated snapshot (`<id>@<YYYY-MM-DD>.json`); the older ones stay.

## 2. Read the official page or document

- Use the publisher's own page, file or API: the bank's tariff PDF or XLSX, the CMA dataset on data.gov.il, the BOI EDGE API, the fund's prospectus. A search snippet, a cached copy, an aggregator (Funder, TheMarker, Bizportal, Globes) or a news article is not a source. The aggregators forbid automated collection, so do not take values from them even by hand.
- Fetch with `curl` or WebFetch, using a browser-like `User-Agent` (CBS requires one). Put every download in its own new, empty directory under the scratchpad, treat it as untrusted data, and read it with tools that do not execute it (`python -I`, `pdftotext`). CMA CSV files are Windows-1255, not UTF-8; data.gov.il files come from the `data.gov.il/dataset/.../download/...` URL, because `e.data.gov.il` asks for a Google login.
- Actually read the document. For a PDF, extract the text and find the line for each value; do not rely on a file name or a page title. Note the document's own date (the "updated to" line, not the HTTP date) as `effective_from` when it states one.
- If a host blocks scripts (403, a JavaScript challenge, a CAPTCHA, Radware, Imperva), do not try to get around it. Record the item as missing with the reason, and say in the report that it needs a person in a browser.
- Use the exact spelling the source uses for every Hebrew name, in the `names` block, so term matching can find it.

## 3. Write the data

Follow the schema section for the collection exactly; do not invent fields or units. For every value:

- Wrap it in a value object (`docs/data-schema.md` section 1): `value`, `unit` from section 2, `source.url` (the page or file you opened), `source.title` (document and section or page), `source.publisher`, `source.strength`, `checked` (today's date; get it with `date +%F`), `effective_from`, `effective_to`, `update_rule`, `state: "sourced"`.
- **Never estimate.** Do not round, interpolate, average, convert, annualise or fill in a number the source does not print. If the source prints it, copy it as printed, in the unit it uses (percent stays percent, never a fraction). If a unit or definition is not stated, keep the raw value as the schema allows (for example `raw_fields` in `data/cma/`, with `fees: null`) and say so in `notes`. A computed value is not collected here; it belongs to the engine.
- If a value is not found, or the document is unreadable, write `value: null` with the reason in `notes`, or `missing: true` and `missing_reason` where the collection has them (fee files). Never leave a plausible number there.
- If two places in the source disagree, store the one the source treats as authoritative and put the conflict in `notes`.

## 4. Run the data check, then report

Run from the repository root:

```bash
cd /home/ori/dev/finance-tool && npm run validate
```

If it fails, fix your data files and run it again. Never change the schema, the validator or `docs/data-schema.md` to make it pass; if the schema seems wrong for what the source publishes, report that instead. If a problem comes from a file you did not touch, report it and leave it.

End with a short report in plain words, in this order:

1. **Collected**: the files written, how many values, the source URL and the date read.
2. **Missing**: every item you looked for and did not get, with what you tried and why (blocked, not published, unreadable, needs a browser).
3. **Conflicts and doubts**: anything where sources disagree or a unit or definition is unconfirmed.
4. **Data check**: the exact output of `npm run validate`, including any failures that remain.
