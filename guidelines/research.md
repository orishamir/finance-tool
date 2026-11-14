# How to research a rule or collect data

The aim: every number on the site traces to one of three things.
- A file under `data/` that records its source and a date.
- A calculation defined in `docs/method.md` over such figures.
- What the person entered.

The page shows which of the three it is.

## Researching a rule (tax, law, regulation)

1. **Look in what we have.** Search the rule base
   (`.claude/skills/il-finance/references/`) and the document library
   (`node tools/library.mjs find <words>`). Most answers are
   already there.
2. **Never answer from memory.** If the rule isn't in the rule base and you
   can't find it, say it is missing and stop. Don't guess or approximate.
3. **Use leads to find where to look.** Finance blogs, forums, the press and
   search results often name the section, circular or ruling. Note each lead
   as a lead, with what it pointed to. Never cite it.
4. **Read the official text.** The law, regulation or regulator, from its
   official publication: Reshumot, the Knesset, gov.il, or the regulator's or
   exchange's own site. Never a copy such as Nevo, Wikisource or a mirror; a
   copy only helps you find the official text. Note the page and the exact
   words you rely on.
5. **Record it.** Add or update the rule in the matching
   `references/*.md` file, with its link, page, quote, checked date and
   strength. Only the file's owner (the tax-specialist for the tax files, the
   domain-specialist for the rest) or the lead edits the rule base; others
   put rule findings in their report. File every new document in the library
   (`library.mjs add`).
6. **If the official text doesn't settle it,** write it down as an open
   question with what is known, and take the cautious reading on the site.

## Collecting prices and terms

1. **Read the binding documents:** the price list, the account agreement and
   its fee annex, promotion terms. Never the advertising.
2. **Read every line.** The same cost can sit under another name. Check each
   document's date.
3. **Price what an ordinary customer pays.**
   - Silence is not zero.
   - "עד X" is priced at X.
   - A conditional, new-joiner or withdrawable discount is shown beside the
     row, not in the ranked price.
4. **Show a company for a kind of holding only where its own documents name
   it.** If in doubt, the row is grey and unranked. The data check fails
   otherwise.
5. **Cite a company's document only for that company's own terms,** never as
   a fact about the whole product. A statement about the whole market comes
   from law, or from a count over every collected institution.
6. **Record it** in `data/` following `docs/data-schema.md` (the
   `data-update` skill does this), each value with its source and date, and
   run `npm run validate`.
7. **Before a new company or a new top pick goes live,** give a fresh
   reviewer only the documents and ask them to disprove it. If a real
   customer of that company is at hand, ask them too. What the founder
   reports first-hand is treated as true, then checked.
8. **A ranking change is its own commit,** with its evidence.

## Which institutions

- Start with the most popular, about 50, and every bank.
- Never collect or research the 43 managing companies closed to one
  profession, employer or city (`EXCLUDED_COMPANIES` in
  `packages/pipeline/src/adapters/cma.ts`), or any track closed to joiners.

## Privacy

- The repository and the site are public. Nothing private goes into them:
  nothing about the founder's own money or his mail beyond what the next
  line allows, nothing about the people who use the site.
- A company's written answer or document sent to the founder may be cited as
  the company's own, with its name and date, never with the founder's name,
  address or anything about his own money.
