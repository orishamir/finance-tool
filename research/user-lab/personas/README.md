# Persona library

Written 2026-11-05. Eight simulated people who together span the site's audience as `docs/product.md` section 2 and
`../behaviour-guide.md` describe it. Each card is handed **as is** to a fresh `claude -p` session (it becomes the head
of the system prompt in `../tools/lib/prompts.mjs`), so a card holds nothing but the person: no project terms, no
decisions, no hint of what we think is wrong with a page, no word about testing. Everything the lab needs to know
about a card lives here, not in the card.

Nothing on any card is the founder's: no persona is 22, a reservist, or holds his bank, funds or brokers. The names,
towns, jobs and amounts are invented and illustrative; incomes are bands, not sourced figures.

## The panel

| id | Who | Device, time | Literacy (Bank of Israel three questions: inflation, risk and return, diversification) | Hebrew on a screen | Holds | Arrives with (product.md "the job") |
|---|---|---|---|---|---|---|
| `first-job-phone` | Yarden, 26, logistics coordinator, single, ~9,500 ₪ | Phone, 3 to 5 min, interrupted | 2 of 3, diversification by hearsay; borderline | Native, fast skimmer | 30,000 ₪ idle in current account; employer pension and קרן השתלמות, tracks unknown | Idle money; an instrument already chosen ("the S&P") |
| `self-directed-investor` | Eyal, 34, developer, married, ~24,000 ₪ | Laptop evenings, phone by day; patient with tables | 3 of 3; above threshold | Native, reads finance in English | Own trading account 5 years, US ETFs and stocks; equity tracks chosen himself | An instrument chosen; "is my setup fine" |
| `parent-pension-phone` | Shira, 39, office manager, two children, ~22,000 ₪ household | Phone, 10 min evenings, tired | 3 of 3, but fees only as percent on a statement; near threshold | Native | Pension, קרן השתלמות after 7 years, two child-savings plans in the default track, emergency cash | Holdings never chosen; a track name she does not understand |
| `careful-retiree-pc` | Ilana, 67, retired administrator, married, ~11,000 ₪ pensions | Desktop, zoomed, glasses; tires after 5 or 6 screens | 2 of 3, rejects diversification; below threshold | Native, reads print well, cannot read pale small text, no English letters | ~400,000 ₪ in rolled-over bank deposits; an unnamed bank savings plan | Idle money; a product name from the bank she does not understand |
| `hebrew-second-language-phone` | Samir, 29, store shift manager, baby, ~12,000 ₪ household | Mid-range Android, 10 min | 2 of 3, rejects diversification; below threshold | Arabic native; Hebrew slow on formal words and ״ abbreviations | Employer pension (unknown), 18,000 ₪ in current account, baby's child-savings default | A goal (the baby, a flat); holdings never chosen |
| `immigrant-hebrew-reader` | Olga, 47, civil engineer, divorced, teenager, ~15,000 ₪ | PC at work and home, phone for a glance | 3 of 3, strong numeracy; above threshold | Fluent speaker, slow on dense and formal Hebrew; English terms easier | Pension, קרן השתלמות, 120,000 ₪ deposit, $10,000 dollar account | Idle money; "are my fees ordinary" |
| `student-small-amounts` | Maya, 24, student, café shifts, ~4,500 ₪ | iPhone, 2 to 3 min, many tabs | 3 of 3 by hearsay; near threshold | Native; finance learned in English from social media | 14,000 ₪ savings; nothing invested | A goal (300 to 500 ₪ a month); an instrument heard of |
| `self-employed-phone` | Moti, 46, self-employed technician, three children, irregular ~10,000 to 25,000 ₪ | Phone, one hand, in the sun, 2 min | 1 of 3 ("the market is a casino"), shekels strong, percent weak; below threshold | Native, rarely reads long text | Business account cash, almost no pension, car loan, children's child-savings plans untouched | A goal the accountant named; idle money |

**Spread.** Phone for five, computer for three (product.md: a phone at least as often as a computer). Four below the
literacy threshold or near it, against 55% of Israeli adults below it (behaviour guide 3.1). Two read Hebrew as a
second language, the group the Bank of Israel ties to lower literacy (3.1). Four women, four men; ages 24 to 67. One
expert only, by design: an expert is the wrong default reader for most pages.

## What each card believes, and where it comes from

The card states the belief plainly and never marks it as wrong; the reader should act on it.

| id | Belief on the card | Evidence it is realistic | Strength |
|---|---|---|---|
| `first-job-phone` | Higher past return means the better fund; growth is linear (7% for ten years is "about 70%") | Choi, Laibson, Madrian 2010; Stango and Zinman 2009 (guide section 2) | Strong |
| `self-directed-investor` | Commission per trade and a working app are what matter; never looked at the cost of holding the account or the conversion rate; can beat the index | ux-landscape 4.2 (guide 4.1); Barber and Odean 2001 | Moderate (the blind spot is inferred) |
| `parent-pension-phone` | The state stands behind pension and savings funds, so the money cannot really be lost | 23% think pension funds are government-owned, 61% want the state between them and the funds (Leiser et al. 2019, guide 3.2) | Moderate (a 2019 survey; the card's form is an extension) |
| `careful-retiree-pc` | The bank's adviser works for you and costs nothing; spreading over many shares means more can go wrong; a fund that fell will fall again; linear growth | 43% do not accept diversification (Bank of Israel 2024, guide 3.1); 70% would take free independent advice (3.2); the adviser belief is inferred | Strong for diversification, weak for the adviser |
| `hebrew-second-language-phone` | Many shares are riskier than a few; hidden fees everywhere; linear growth | Bank of Israel 2024 (3.1); Arab respondents score 54 against 67 (3.1) | Strong |
| `immigrant-hebrew-reader` | Fees are fixed by law and about the same everywhere; dollars are protected | 58% unaware of their pension fees (Leiser 2019, 3.2); the "fixed by law" form is inferred | Weak to moderate |
| `student-small-amounts` | "Zero commission" means no cost; pick the fund that rose most; with small amounts fees are tiny | Choi et al. 2010 on past returns; the rest inferred from the young self-directed group (3.3) | Moderate |
| `self-employed-phone` | 5% for twenty years is "about double"; money in anything called pension or fund is locked; the market is a casino | Stango and Zinman 2009; the rest inferred | Strong for growth, weak for the rest |

## Which personas to use for a page

Default to three. Every panel has at least one phone reader, at least one reader below the literacy threshold or
reading Hebrew as a second language, and at most one expert. Use the third slot for someone the page is **not**
obviously for, to see whether they can tell on the first screen.

| Page | Default three | Rotate in |
|---|---|---|
| Home (the question card, the twelve questions block) | `first-job-phone`, `careful-retiree-pc`, `hebrew-second-language-phone` | `self-employed-phone` |
| Investing in an index (where and in which fund) | `first-job-phone`, `parent-pension-phone`, `self-directed-investor` | `student-small-amounts`, `immigrant-hebrew-reader` |
| A product guide (what a product is, how it works) | `hebrew-second-language-phone`, `parent-pension-phone`, `careful-retiree-pc` | `self-employed-phone` for קרן השתלמות and gemel; `student-small-amounts` for an exchange-listed fund |
| Idle cash, deposits, money-market funds, makam, bonds | `careful-retiree-pc`, `immigrant-hebrew-reader`, `first-job-phone` | `self-employed-phone` |
| Holdings (pension, child savings, a track name) | `parent-pension-phone`, `hebrew-second-language-phone`, `self-employed-phone` | `careful-retiree-pc` |
| Comparison from a goal | `student-small-amounts`, `parent-pension-phone`, `immigrant-hebrew-reader` | `first-job-phone` |
| Rules and questions pages, documents, search | `parent-pension-phone`, `immigrant-hebrew-reader`, `self-directed-investor` | `hebrew-second-language-phone` |
| A chart or colour review (a design review, not a behaviour run) | `careful-retiree-pc`, `first-job-phone`, `immigrant-hebrew-reader` | `self-directed-investor` |

Run each persona on its own device (the "Device" column): a phone card on the phone viewport, a computer card on the
computer one. Running a phone person on a computer screen tests nobody.

## Rules of use

- **One version per reader.** A reader sees one version of a page, once. Comparing two versions is a design review,
  not a behaviour run, and its report says so in its title.
- **One screen at a time for a behaviour run.** Hand screenshots over in order and let the reader say whether it
  scrolls on, or let it drive the browser (`../tools/act.mjs`). A model cannot un-read what it was given, so a reader
  who is handed the whole page reads the whole page (behaviour guide section 6).
- **The task is separate from the card.** The run's brief gives the goal and amounts; every card says the task's
  amounts replace its own. Keep briefs neutral: a person and a goal, never what to look for.
- **Never edit a card to steer a result.** A card changes only when a calibration run shows the persona behaving
  unlike its people (below), and the change goes in the log with its reason.

## Calibration targets

Starting values from the behaviour guide, per persona. A run far outside them is behaving like a machine, not like the
person; the lab measures these from each run's report and actions log.

| id | Share of words quoted or used | Screens looked at before deciding | Folds opened | Arithmetic checks | Leaves on a page not for them |
|---|---|---|---|---|---|
| `first-job-phone` | about 15% | 2 to 4 | almost none | none | within the first screen |
| `self-directed-investor` | about 25%, mostly table cells | 3 to 6 | those about cost or method | none; "looks off" remarks allowed | within the first screen if it reads as for beginners |
| `parent-pension-phone` | about 20% | 2 to 4 | only one naming her question | none | within the first screen |
| `careful-retiree-pc` | about 30% of the first screens, then nothing | 4 to 6, then stops | almost none | none | within the first screen |
| `hebrew-second-language-phone` | about 12% | 2 to 3 | none | none | within the first screen |
| `immigrant-hebrew-reader` | about 25%, mostly tables | 3 to 5 | one naming her question | none; "out of proportion" remarks allowed | within the first screen |
| `student-small-amounts` | about 12% | 1 to 3 | none | none | within seconds, on looks |
| `self-employed-phone` | about 10% | 1 to 2 | none | none | within seconds |

The measured anchors: about 20% of words read on an average page, 57% of viewing time on the first screen and 74% on
the first two (guide 1.1). Arithmetic checks by people are near zero; in our earlier model runs they were common (4.3).

## Notes from runs

Fill in after each calibration or real run: date, page, persona, what it did that a person would not (or that matched
the targets), and any card change it led to.

| Date | Run | Persona | Observed | Card change |
|---|---|---|---|---|

## Card log

| Date | Card | Change | Reason |
|---|---|---|---|
| 2026-11-05 | all eight | Written | First library, from the behaviour guide and product.md section 2 |

## Adding or changing a card

1. Second person, English, the five sections: who you are; what you know and believe (with one realistic belief that
   is wrong, unmarked); how you use a page like this (the guide's section 5 tuned to the person); what you want (with
   the line that a given task replaces it); how you tell it afterwards (decision first, then what was looked at in
   order, skipped parts by heading only, unknown words as written, where they would leave).
2. Words known and not known are ordinary Israeli finance Hebrew, never a phrase the site coined.
3. Grep the card before use: no site name, no page names, no word of our own vocabulary, nothing about the founder,
   no "test", "audit", "reviewer" or "persona".
4. Add its row to the panel, beliefs and calibration tables here, and a line to the card log.
