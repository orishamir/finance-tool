# finance-tool

A personal website that helps me and a few friends and family decide how to
save and invest in Israel. It is in Hebrew and is not commercial.

**The site:** https://orishamir.github.io/finance-tool/

## What's on it

- **Guides** to each way of saving: pension, keren hishtalmut, provident
  funds, deposits, mutual funds and more. Each has a graph you can change.
- **Companies and tracks**: who offers what, and what each one charges and
  holds.
- **Tools** to compare fees, deposits and index funds, and to check a move
  between funds.
- **The rules**: the tax and legal rules behind every page, each linked to
  its official source.

What you type in stays in your browser. There are no accounts and no
server.

## Where every number comes from

Every number on the site is one of three things:

- a published figure, saved with its source and date in `data/`;
- a calculation, written out in `docs/method.md`;
- something you entered.

The site only cites official texts. If a rule or figure is missing, the site
says so instead of guessing.

This is a tool for thinking, not financial advice.

## Running it locally

You need Node 22.12 or newer.

```bash
npm install
```

```bash
npm run dev
```

Before anything goes live, everything has to pass:

```bash
npm run check
```

## How the repository is laid out

| Folder | What's in it |
|---|---|
| `site/` | The website |
| `packages/engine/` | The calculations, run in your browser |
| `packages/pipeline/` | Fetches and checks the data |
| `data/` | Every figure, with its source and date |
| `docs/` | What the site does and how |
| `guidelines/` | How to work on this project |
| `research/` | Background research |
