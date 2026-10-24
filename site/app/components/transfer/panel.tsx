// The transfer sheet's content (design-system 7.8, flow 26): export the saved state as a file, and load a file from
// another device. The same panel is the sheet (from the holdings page, the strip and the footer) and the page at
// /transfer. Nothing leaves the device unless the person sends the file; the import changes nothing until "לטעון".
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { r3transfer as copy, r5 } from "../../copy";
import { Tpl } from "../exposure-mode/tpl";
import { loadHoldingsBundle } from "../../lib/holdings";
import { fmt } from "../../lib/format";
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
  switchToGoal,
  useStateStore,
  type ImportPreviewData,
  type Refusal,
} from "../../lib/state";
import { emptySide, type SideStores } from "../../lib/side-stores";
import type { Rejected } from "../../lib/import-check";
import { computed } from "../../lib/value";
import { IconAlert, IconCopy } from "../icons";
import { IconDownload, IconFileUp, IconShare } from "../holdings/icons";
import { LeadTail, Num } from "../provenance";
import { Button, Callout, Card, SegmentedControl, cx } from "../ui";

type Site = { version: string; data: string };

const count = (n: number, about: string) => computed(n, "count", "F-83", {}, { today: isoToday(), about });

type Forms = { readonly one: string; readonly two: string; readonly many: string };

/** One count in its Hebrew form (audit 2026-10-24, A91): "מטרה אחת", "שתי מטרות", "{n} מטרות"; the digit goes through `Num`. */
function CountForm({ n, forms }: { n: number; forms: Forms }) {
  if (n === 1) return <>{forms.one}</>;
  if (n === 2) return <>{forms.two}</>;
  return (
    <>
      <Num value={count(n, forms.many)} /> {forms.many}
    </>
  );
}

/** The non-zero counts, each in its form, between middle dots (or the given separator). */
function CountList({ items, sep = "·" }: { items: { n: number; forms: Forms }[]; sep?: string }) {
  const shown = items.filter((i) => i.n > 0);
  return (
    <>
      {shown.map((i, k) => (
        <Fragment key={i.forms.many}>
          {k > 0 && <span aria-hidden="true">{sep}</span>}
          <span><CountForm n={i.n} forms={i.forms} /></span>
        </Fragment>
      ))}
    </>
  );
}

/** A rejection: the plain alert icon, not the red lock of an open rule (audit 2026-10-24, A72). */
function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex gap-2.5 text-sm rounded-md px-3.5 py-3 bg-blocked-subtle text-blocked-foreground">
      <IconAlert size={18} className="shrink-0 mt-0.5" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

const countItems = (c: { goals: number; holdings: number; names: number; comparisons: number; offers: number; variants: number; ticks: number; ownRates: number }) => [
  { n: c.goals, forms: copy.forms.goals },
  { n: c.holdings, forms: copy.forms.holdings },
  { n: c.names, forms: copy.forms.names },
  { n: c.comparisons, forms: copy.forms.comparisons },
  { n: c.offers, forms: copy.forms.offers },
  { n: c.variants, forms: copy.forms.variants },
  { n: c.ticks, forms: copy.forms.ticks },
  { n: c.ownRates, forms: copy.forms.ownRates },
];

export function TransferPanel({ site, headingId, page }: { site?: Site; headingId?: string; /** The page at /transfer: the title is the page's h1. */ page?: boolean }) {
  const snap = useStateStore();
  const [siteInfo, setSiteInfo] = useState<Site | null>(site ?? null);
  useEffect(() => {
    ensureLoaded();
    if (!site) loadHoldingsBundle().then((b) => setSiteInfo(b.site)).catch(() => setSiteInfo({ version: "r3", data: "unknown" }));
  }, [site]);
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        {page ? (
          <h1 id={headingId} className="text-2xl font-semibold">{copy.title}</h1>
        ) : (
          <h2 id={headingId} className="text-xl font-semibold">{copy.title}</h2>
        )}
        <p className="text-muted-foreground max-w-measure">{copy.lede}</p>
        <p className="text-sm text-muted-foreground max-w-measure">
          {copy.onePerDevice} {copy.erasedNote}
        </p>
        {!snap.saved && snap.ready && <Callout tone="caution">{copy.unavailable}</Callout>}
      </header>
      <ExportHalf site={siteInfo} />
      <hr className="border-border" />
      <ImportHalf />
    </div>
  );
}

// ---------------------------------------------------------------- export

function ExportHalf({ site }: { site: Site | null }) {
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
  /** `makesFile`: a file (download, share) uses the next name; a copy to the clipboard does not (audit 2026-10-24, A72). */
  const build = (makesFile: boolean) => {
    const fileName = nextExportName(isoToday(), makesFile);
    const text = stateFileText(buildStateFile(state, site ?? { version: "r3", data: "unknown" }, new Date(), currentSideStores()));
    if (makesFile) setName(peekExportName());
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
    <section className="flex flex-col gap-3" aria-labelledby="tx-export">
      <h3 id="tx-export" className="text-lg font-semibold">
        {copy.exportHeading}
      </h3>
      {empty ? (
        <p className="text-muted-foreground">{copy.nothing}</p>
      ) : (
        <p className="text-sm flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <CountList items={countItems(counts)} />
          {counts.inputs && (
            <>
              <span aria-hidden="true">·</span>
              {c.inputs}
            </>
          )}
          <span aria-hidden="true">·</span>
          {c.versions}
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
    </section>
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
    case "unreadable":
      return { text: e.unreadable, tone: "blocked" };
    case "invalid":
      return { text: `${e.invalidBefore} ${refusalField(r.field)}${e.invalidAfter}`, tone: "blocked" };
  }
}

function ImportHalf() {
  const snap = useStateStore();
  const [pasted, setPasted] = useState("");
  const [fileText, setFileText] = useState<{ text: string; name: string } | null>(null);
  const [unreadable, setUnreadable] = useState(false);
  const [mode, setMode] = useState<"add" | "replace">("add");
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState<{ mode: "add" | "replace"; added: { goals: number; holdings: number; names: number; comparisons: number; offers: number; variants: number; ticks: number; ownRates: number }; skipped: number; date: string; goalId?: string; sideFailed: boolean } | null>(null);
  const [switched, setSwitched] = useState(false);
  const [drag, setDrag] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const source = fileText?.text ?? pasted;
  const read = useMemo(() => (source.trim() === "" ? null : readImport(source)), [source]);
  useEffect(() => {
    setConfirm(false);
    if (source.trim() !== "") setDone(null);
  }, [source]);

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
    setSwitched(false);
    setDone({ mode, added: { ...r.added, ...side.added }, skipped: r.skipped + side.skipped, date, ...(r.firstAddedGoalId ? { goalId: r.firstAddedGoalId } : {}), sideFailed: !side.written });
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
    <section className="flex flex-col gap-3" aria-labelledby="tx-import">
      <h3 id="tx-import" className="text-lg font-semibold">
        {copy.importHeading}
      </h3>
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
            <p className="flex flex-wrap items-center gap-x-1.5">
              <span>{copy.afterImport.before}</span>
              <CountList items={countItems(done.added)} sep="," />.
              {done.mode === "add" && done.added.goals + done.added.holdings + done.added.names > 0 && (
                <>
                  {" "}
                  <LeadTail lead={copy.afterImport.tag}>
                    <bdi dir="ltr">{fmt.date(done.date)}</bdi>
                  </LeadTail>
                  ״.
                </>
              )}
            </p>
          )}
          {done.skipped > 0 && (
            <p className="text-sm text-muted-foreground">
              {done.skipped === 1 ? copy.duplicatesForms.one : done.skipped === 2 ? copy.duplicatesForms.two : (
                <>
                  <Num value={count(done.skipped, copy.duplicates)} /> {copy.duplicates}
                </>
              )}
            </p>
          )}
          {done.sideFailed && <p className="text-sm text-caution-foreground">{copy.sideFailed}</p>}
          {done.goalId && snap.state.currentId !== done.goalId && !switched && (
            <Button
              variant="secondary"
              className="self-start"
              onClick={() => {
                switchToGoal(done.goalId!);
                setSwitched(true);
              }}
            >
              {copy.switchGoal}
            </Button>
          )}
          {switched && <p className="text-sm text-muted-foreground">{copy.switched}</p>}
          <p className="flex flex-wrap gap-x-4">
            <Link to="/holdings" className="text-link min-h-target inline-flex items-center hover:underline">
              {copy.afterLinks.holdings}
            </Link>
            <Link to="/goal/compare" className="text-link min-h-target inline-flex items-center hover:underline">
              {copy.afterLinks.result}
            </Link>
          </p>
        </Card>
      )}

      {importedAny > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {confirmDelete ? (
            <>
              <span className="text-sm">{copy.deleteImportedConfirm.text}</span>
              <Button
                variant="quiet"
                className="text-destructive"
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
    </section>
  );
}

function RejectedLine({ r }: { r: Rejected }) {
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
        <LeadTail lead={copy.previewCreated.before}>
          <bdi dir="ltr">{fmt.date(Number.isNaN(Date.parse(p.file.exported)) ? p.file.exported.slice(0, 10) : todayLocal(new Date(p.file.exported)))}</bdi>
        </LeadTail>{" "}
        · {copy.previewCreated.mid} <bdi dir="ltr" className="num-id">{p.file.site.version}</bdi>
      </p>
      <p className="text-sm flex flex-wrap items-center gap-x-1.5">
        <CountList items={countItems(p.counts)} />
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
          <Button variant="quiet" className="text-destructive" onClick={onLoad}>
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
