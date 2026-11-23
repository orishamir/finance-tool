// The transfer page's content (design-system 7.8, flow 26): export the saved state as a file, and load a file from
// another device, at /transfer. Nothing leaves the device unless the person sends the file; the import changes nothing until "לטעון".
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { r3transfer as copy } from "../../copy";

import { todayLocal } from "../../lib/today";
import {
  applyImport,
  applySideImport,
  buildStateFile,
  currentSideStores,
  deleteImported,
  ensureLoaded,
  exportCounts,
  importedCount,
  importedSideCount,
  isEmptyState,
  isoToday,
  nextExportName,
  peekExportName,
  readImport,
  replaceState,
  stateFileText,
  useStateStore,
  type ImportAdded,
  type ImportPreviewData,
  type Refusal,
} from "../../lib/state";
import { emptySide, type SideCounts, type SideStores } from "../../lib/side-stores";
import type { Rejected } from "../../lib/import-check";
import type { PlanBounds } from "../../lib/plan-bounds";
import { fmt } from "../../lib/format";
import { entered } from "../../lib/value";
import { IconAlert, IconCopy, IconDownload, IconFileUp, IconShare } from "../icons";
import { Num } from "../provenance";
import { askToKeepStorage } from "../../lib/keep-storage";
import { Button, Callout, Card, cx, PageHead, Section, SegmentedControl, Sentence, Tpl, When } from "../kit";
import { assertNever } from "@finance-tool/schema";

type Site = { version: string; data: string };

// a count of what the person saved (holdings, names, duplicates in a file): their own entries, not a calculation of the site
const count = (n: number, about: string) => entered(n, "count", isoToday(), about);

type Forms = { readonly one: string; readonly two: string; readonly many: string };

/** One count in its Hebrew form: "מטרה אחת", "שתי מטרות", "{n} מטרות"; the digit goes through `Num`. */
function CountForm({ n, forms }: { n: number; forms: Forms }) {
  if (n === 1) return <>{forms.one}</>;
  if (n === 2) return <>{forms.two}</>;
  return (
    <>
      <Num value={count(n, forms.many)} /> {forms.many}
    </>
  );
}

/** A line's parts between middle dots (or the given separator): a separator only ever stands between two parts. */
function Joined({ parts, sep = "·" }: { parts: { key: string; node: ReactNode }[]; sep?: string }) {
  return (
    <>
      {parts.map((p, k) => (
        <Fragment key={p.key}>
          {k > 0 && <span aria-hidden="true">{sep}</span>}
          <span>{p.node}</span>
        </Fragment>
      ))}
    </>
  );
}

/** The non-zero counts, each in its form, as a line's parts. */
const countParts = (items: { n: number; forms: Forms }[]) => items.filter((i) => i.n > 0).map((i) => ({ key: i.forms.many, node: <CountForm n={i.n} forms={i.forms} /> }));

/** A rejection: the plain alert icon, not the red lock of an open rule. */
function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex gap-2.5 text-sm rounded-md px-3.5 py-3 bg-blocked-subtle text-blocked-foreground">
      <IconAlert size={18} className="shrink-0 mt-0.5" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** What a file or the device holds, kind by kind; the plan numbers are counted where a load added them (`ImportAdded`), else only said to be there. */
type Counts = { holdings: number; names: number; indices: number; funds: number; accounts: number } & SideCounts;

const countItems = (c: Counts) => [
  { n: c.holdings, forms: copy.forms.holdings },
  { n: c.names, forms: copy.forms.names },
  { n: c.indices, forms: copy.forms.indices },
  { n: c.funds, forms: copy.forms.funds },
  { n: c.accounts, forms: copy.forms.accounts },
  { n: c.offers, forms: copy.forms.offers },
  { n: c.variants, forms: copy.forms.variants },
  { n: c.ticks, forms: copy.forms.ticks },
  { n: c.ownRates, forms: copy.forms.ownRates },
  { n: c.deals, forms: copy.forms.deals },
];

/** The kinds a file or the device holds as a line's parts, the plan numbers among them where there are any. */
const contentParts = (c: Counts & { inputs: boolean }) => [...countParts(countItems(c)), ...(c.inputs ? [{ key: "inputs", node: copy.contents.inputs }] : [])];

export function TransferPanel({ site, bounds, crumb }: { site: Site; /** The plan numbers' bounds an import checks against (P-05's). */ bounds: PlanBounds; crumb: ReactNode }) {
  const snap = useStateStore();
  useEffect(() => {
    ensureLoaded();
  }, []);
  return (
    <div className="flex flex-col gap-6">
      <PageHead crumb={crumb} title={copy.title} lede={copy.lede}>
        <p className="text-sm text-muted-foreground max-w-measure">
          {copy.onePerDevice} {copy.erasedNote}
        </p>
        {!snap.saved && snap.ready && <Callout tone="caution">{copy.unavailable}</Callout>}
      </PageHead>
      {/* from a computer up, the two halves stand side by side and use the frame's room */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
        <ExportHalf site={site} />
        <hr className="border-border lg:hidden" />
        <ImportHalf bounds={bounds} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- export

function ExportHalf({ site }: { site: Site }) {
  const snap = useStateStore();
  const state = snap.state;
  // the three side stores live in their own device keys; read after hydration and whenever one changes
  const [side, setSide] = useState<SideStores>(emptySide);
  useEffect(() => {
    const read = () => setSide(currentSideStores());
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, [snap.external]);
  const empty = !snap.ready || isEmptyState(state, side);
  const counts = exportCounts(state, side);
  const [name, setName] = useState("mekor-state-0000-00-00.json");
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [blockedText, setBlockedText] = useState<string | null>(null);
  const [shareFailed, setShareFailed] = useState(false);
  useEffect(() => setName(peekExportName()), []);
  useEffect(() => {
    try {
      setCanShare(typeof navigator.canShare === "function" && typeof navigator.share === "function" && navigator.canShare({ files: [new File(["{}"], "x.json", { type: "application/json" })] }));
    } catch {
      setCanShare(false);
    }
  }, []);
  /** `makesFile`: a file (download, share) uses the next name; a copy to the clipboard does not. */
  const build = (makesFile: boolean) => {
    const fileName = nextExportName(isoToday(), makesFile);
    const text = stateFileText(buildStateFile(state, site, new Date(), currentSideStores()));
    if (makesFile) setName(peekExportName());
    // an export is something of the person's worth keeping: the browser is asked once to keep the storage (lib/keep-storage.ts)
    askToKeepStorage();
    return { fileName, text };
  };
  const share = async () => {
    const { fileName, text } = build(true);
    setShareFailed(false);
    try {
      await navigator.share({ files: [new File([text], fileName, { type: "application/json" })], title: fileName });
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setShareFailed(true);
    }
  };
  const download = () => {
    const { fileName, text } = build(true);
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  const copyText = async () => {
    const { text } = build(false);
    try {
      await navigator.clipboard.writeText(text);
      setBlockedText(null);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setBlockedText(text);
    }
  };
  const c = copy.contents;
  return (
    <Section level="card" heading="h3" title={copy.exportHeading}>
      <div className="flex flex-col gap-3">
        {empty ? (
          <p className="text-muted-foreground">{copy.nothing}</p>
        ) : (
          <p className="text-sm flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <Joined parts={[...contentParts(counts), { key: "versions", node: c.versions }]} />
          </p>
        )}
        <Callout tone="caution">{copy.caution}</Callout>
        <div className="flex flex-wrap items-center gap-2">
          {canShare && (
            <Button variant="primary" disabled={empty} onClick={share} className="disabled:opacity-40 disabled:text-muted-foreground disabled:cursor-not-allowed disabled:hover:brightness-100">
              <IconShare size={18} /> {copy.buttons.share}
            </Button>
          )}
          <Button variant={canShare ? "secondary" : "primary"} disabled={empty} onClick={download} className="disabled:opacity-40 disabled:text-muted-foreground disabled:cursor-not-allowed disabled:hover:brightness-100">
            <IconDownload size={18} /> {copy.buttons.download}
          </Button>
          <Button variant="secondary" disabled={empty} onClick={copyText} className="disabled:opacity-40 disabled:text-muted-foreground disabled:cursor-not-allowed disabled:hover:brightness-100">
            <IconCopy size={18} /> {copied ? copy.buttons.copied : copy.buttons.copy}
          </Button>
        </div>
        {shareFailed && <p className="text-sm text-muted-foreground">{copy.errors.shareFailed}</p>}
        {blockedText !== null && (
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-muted-foreground">{copy.copyBlocked}</p>
            <textarea readOnly dir="ltr" rows={5} value={blockedText} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-md border border-input bg-card p-3 font-mono text-base select-all" />
          </div>
        )}
        {!empty && (
          <p className="text-sm text-muted-foreground">
            {copy.fileName} <bdi dir="ltr" className="num-id">{name}</bdi>
          </p>
        )}
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------- import

const refusalField = (path: string): string => {
  const seg = path.split(".")[0]!;
  return (copy.refusalFields as Record<string, string>)[seg] ?? seg;
};

function refusalText(r: Refusal): { text: string; tone: "blocked" | "caution" } {
  const e = copy.errors;
  switch (r.kind) {
    case "newer":
      return { text: e.newer, tone: "caution" };
    case "format":
      return { text: e.format, tone: "blocked" };
    case "damaged":
      return { text: e.damaged, tone: "blocked" };
    case "unreadable":
      return { text: e.unreadable, tone: "blocked" };
    case "invalid":
      return { text: `${e.invalidBefore} ${refusalField(r.field)}${e.invalidAfter}`, tone: "blocked" };
    default:
      return assertNever(r);
  }
}

function ImportHalf({ bounds }: { bounds: PlanBounds }) {
  const snap = useStateStore();
  const [pasted, setPasted] = useState("");
  const [fileText, setFileText] = useState<{ text: string; name: string } | null>(null);
  const [unreadable, setUnreadable] = useState(false);
  const [mode, setMode] = useState<"add" | "replace">("add");
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState<{ mode: "add" | "replace"; added: ImportAdded & SideCounts; skipped: number; date: string; sideFailed: boolean } | null>(null);
  const [drag, setDrag] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const source = fileText?.text ?? pasted;
  const read = useMemo(() => (source.trim() === "" ? null : readImport(source, bounds)), [source, bounds]);
  // new text asks again before it replaces anything, and puts away the line about the last import
  const [readSource, setReadSource] = useState(source);
  if (source !== readSource) {
    setReadSource(source);
    setConfirm(false);
    if (source.trim() !== "") setDone(null);
  }

  const takeFile = async (f: File | undefined | null) => {
    if (!f) return;
    setUnreadable(false);
    try {
      setFileText({ text: await f.text(), name: f.name });
      setPasted("");
    } catch {
      setFileText(null);
      setUnreadable(true);
    }
  };
  const load = () => {
    if (!read || !read.ok) return;
    const date = isoToday();
    const r = applyImport(snap.state, read.preview.state, mode, date);
    replaceState(r.state);
    const side = applySideImport(read.preview.side, mode);
    setDone({ mode, added: { ...r.added, ...side.added }, skipped: r.skipped + side.skipped, date, sideFailed: !side.written });
    setPasted("");
    setFileText(null);
    setConfirm(false);
  };
  const imported = importedCount(snap.state);
  // side-store items an "add" import brought (read after hydration; they live in their own device keys)
  const [importedSide, setImportedSide] = useState(0);
  useEffect(() => setImportedSide(importedSideCount()), [snap.external, snap.state, done, deleted]);
  const importedAny = imported.total + importedSide;
  return (
    <Section level="card" heading="h3" title={copy.importHeading}>
      <div className="flex flex-col gap-3">
        <div
          className={cx("flex flex-col gap-3 rounded-lg lg:border lg:border-dashed lg:p-4", drag ? "lg:border-primary lg:bg-accent/40" : "lg:border-border")}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            void takeFile(e.dataTransfer.files[0]);
          }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <input ref={input} type="file" accept=".json,application/json,text/plain" className="sr-only" tabIndex={-1} onChange={(e) => void takeFile(e.target.files?.[0])} />
            <Button variant="secondary" onClick={() => input.current?.click()}>
              <IconFileUp size={18} /> {copy.chooseFile}
            </Button>
            <span className="hidden lg:inline text-sm text-muted-foreground">{copy.dropZone}</span>
            {fileText && (
              <span className="text-sm text-muted-foreground">
                <bdi dir="ltr" className="num-id">{fileText.name}</bdi>
              </span>
            )}
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="field-label">{copy.paste}</span>
            <textarea
              dir="ltr"
              rows={3}
              value={pasted}
              onChange={(e) => {
                setPasted(e.target.value);
                setFileText(null);
                setDone(null);
              }}
              spellCheck={false}
              className="w-full rounded-md border border-input bg-card p-3 font-mono text-base"
            />
          </label>
        </div>

        {unreadable && <ErrorNote>{copy.errors.unreadable}</ErrorNote>}
        {read && !read.ok && (() => {
          const t = refusalText(read.refusal);
          return t.tone === "blocked" ? <ErrorNote>{t.text}</ErrorNote> : <Callout tone={t.tone}>{t.text}</Callout>;
        })()}
        {read && read.ok && <Preview p={read.preview} mode={mode} onMode={(m) => { setMode(m); setConfirm(false); }} confirm={confirm} onConfirm={setConfirm} onLoad={load} />}

        {done && (
          <Card className="flex flex-col gap-2" aria-live="polite">
            {Object.values(done.added).every((n) => n === 0) ? (
              <p>{copy.nothingNew}</p>
            ) : (
              // a sentence, not a row of parts: its full stops and quotes sit on the words they close
              <p>
                {copy.afterImport.before} <Joined parts={[...countParts(countItems(done.added)), ...countParts([{ n: done.added.inputs, forms: copy.forms.inputs }])]} sep=", " />.
                {done.mode === "add" && (
                  <>
                    {" "}
                    <When iso={done.date} lead={copy.afterImport.tag} />
                    ״.
                  </>
                )}
              </p>
            )}
            {done.skipped > 0 && (
              <Sentence size="sm" tone="muted">
                {done.skipped === 1 ? copy.duplicatesForms.one : done.skipped === 2 ? copy.duplicatesForms.two : (
                  <>
                    <Num value={count(done.skipped, copy.duplicates)} /> {copy.duplicates}
                  </>
                )}
              </Sentence>
            )}
            {done.sideFailed && <p className="text-sm text-caution-foreground">{copy.sideFailed}</p>}
          </Card>
        )}

        {importedAny > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {confirmDelete ? (
              <>
                <span className="text-sm">{copy.deleteImportedConfirm.text}</span>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteImported();
                    setConfirmDelete(false);
                    setDone(null);
                    setDeleted(true);
                  }}
                >
                  {copy.deleteImportedConfirm.yes}
                </Button>
                <Button variant="quiet" onClick={() => setConfirmDelete(false)}>
                  {copy.deleteImportedConfirm.no}
                </Button>
              </>
            ) : (
              <Button variant="quiet" onClick={() => setConfirmDelete(true)}>
                {copy.deleteImported}
              </Button>
            )}
          </div>
        )}
        {deleted && importedAny === 0 && <p className="text-sm text-muted-foreground">{copy.deleted}</p>}
      </div>
    </Section>
  );
}

/** What is wrong with a plan number left out: a problem's words, or the bound it is outside ("לא בין 1 ל־40"). */
function inputProblemWords(r: Extract<Rejected, { kind: "input" }>): ReactNode {
  if (r.problem !== "out-of-bound") return copy.rejectedProblems[r.problem];
  const b = r.bound;
  const ob = copy.outOfBound;
  return b.max === null ? (
    <>
      {ob.below}
      <bdi>{fmt.number(b.min)}</bdi>
    </>
  ) : (
    <>
      {ob.between[0]} <bdi>{fmt.number(b.min)}</bdi> {ob.between[1]}
      <bdi>{fmt.number(b.max)}</bdi>
    </>
  );
}

function RejectedLine({ r }: { r: Rejected }) {
  if (r.kind === "input") {
    const name = (copy.rejectedInputs as Record<string, string>)[r.key];
    return <Tpl t={copy.rejectedInput} vars={{ kind: copy.rejectedKinds.input, name: name ?? <bdi dir="ltr" className="num-id">{r.key}</bdi>, problem: inputProblemWords(r) }} />;
  }
  const field = (copy.rejectedFields as Record<string, string>)[r.field];
  return (
    <Tpl
      t={copy.rejectedItem}
      vars={{
        kind: copy.rejectedKinds[r.kind],
        at: <bdi dir="ltr">{r.at}</bdi>,
        field: field ?? <bdi dir="ltr" className="num-id">{r.field}</bdi>,
        problem: copy.rejectedProblems[r.problem],
      }}
    />
  );
}

function Preview({ p, mode, onMode, confirm, onConfirm, onLoad }: { p: ImportPreviewData; mode: "add" | "replace"; onMode: (m: "add" | "replace") => void; confirm: boolean; onConfirm: (v: boolean) => void; onLoad: () => void }) {
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-sm">
        <When iso={Number.isNaN(Date.parse(p.file.exported)) ? p.file.exported.slice(0, 10) : todayLocal(new Date(p.file.exported))} lead={copy.previewCreated.before} />{" "}
        · {copy.previewCreated.mid} <bdi dir="ltr" className="num-id">{p.file.site.version}</bdi>
      </p>
      <p className="text-sm flex flex-wrap items-center gap-x-1.5">
        <Joined parts={contentParts(p.counts)} />
      </p>
      {(p.rejected.length > 0 || p.sideProblems.length > 0) && (
        <Callout tone="caution">
          <p className="font-medium">{copy.rejectedHeading}</p>
          <ul className="list-disc ps-5 flex flex-col gap-0.5">
            {p.rejected.map((r, i) => (
              <li key={`r${i}`}>
                <RejectedLine r={r} />
              </li>
            ))}
            {p.sideProblems.map((q, i) => (
              <li key={`s${i}`}>
                {copy.rejectedKinds[q.store]} {q.item && <bdi dir="ltr" className="num-id">{q.item}</bdi>}: {copy.rejectedProblems[q.reason]}.
              </li>
            ))}
          </ul>
        </Callout>
      )}
      {p.migrated && <p className="text-sm text-caution-foreground">{copy.previewOld}</p>}
      <SegmentedControl
        label={copy.modeLabel}
        value={mode}
        onChange={onMode}
        options={[
          { value: "add", label: copy.mode.add },
          { value: "replace", label: copy.mode.replace },
        ]}
      />
      {mode === "replace" && confirm ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-sm">{copy.replaceConfirm.text}</span>
          <Button variant="destructive" onClick={onLoad}>
            {copy.replaceConfirm.yes}
          </Button>
          <Button variant="quiet" onClick={() => onConfirm(false)}>
            {copy.replaceConfirm.no}
          </Button>
        </div>
      ) : (
        <Button variant="primary" onClick={() => (mode === "replace" ? onConfirm(true) : onLoad())} className="self-start">
          {copy.load}
        </Button>
      )}
    </Card>
  );
}
