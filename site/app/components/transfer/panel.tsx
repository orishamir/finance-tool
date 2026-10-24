// The transfer sheet's content (design-system 7.8, flow 26): export the saved state as a file, and load a file from
// another device. The same panel is the sheet (from the holdings page, the strip and the footer) and the page at
// /transfer. Nothing leaves the device unless the person sends the file; the import changes nothing until "לטעון".
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { r3transfer as copy, r5 } from "../../copy";
import { Tpl } from "../exposure-mode/tpl";
import { loadHoldingsBundle } from "../../lib/holdings";
import { fmt } from "../../lib/format";
import { todayLocal } from "../../lib/today";
import {
  applyImport,
  buildStateFile,
  deleteImported,
  ensureLoaded,
  exportCounts,
  importedCount,
  isEmptyState,
  isoToday,
  nextExportName,
  peekExportName,
  readImport,
  replaceState,
  stateFileText,
  useStateStore,
  type ImportPreviewData,
  type Refusal,
} from "../../lib/state";
import { computed } from "../../lib/value";
import { IconCopy } from "../icons";
import { IconDownload, IconFileUp, IconShare } from "../holdings/icons";
import { Num } from "../provenance";
import { Button, Callout, Card, SegmentedControl, cx } from "../ui";

type Site = { version: string; data: string };

const count = (n: number, about: string) => computed(n, "count", "F-83", {}, { today: isoToday(), about });

export function TransferPanel({ site, headingId }: { site?: Site; headingId?: string }) {
  const snap = useStateStore();
  const [siteInfo, setSiteInfo] = useState<Site | null>(site ?? null);
  useEffect(() => {
    ensureLoaded();
    if (!site) loadHoldingsBundle().then((b) => setSiteInfo(b.site)).catch(() => setSiteInfo({ version: "r3", data: "unknown" }));
  }, [site]);
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 id={headingId} className="text-xl font-semibold">{copy.title}</h2>
        <p className="text-muted-foreground max-w-measure">{copy.lede}</p>
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
  const empty = !snap.ready || isEmptyState(state);
  const counts = exportCounts(state);
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
  const build = () => {
    const fileName = nextExportName();
    const text = stateFileText(buildStateFile(state, site ?? { version: "r3", data: "unknown" }));
    setName(peekExportName());
    return { fileName, text };
  };
  const share = async () => {
    const { fileName, text } = build();
    setShareFailed(false);
    try {
      await navigator.share({ files: [new File([text], fileName, { type: "application/json" })], title: fileName });
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setShareFailed(true);
    }
  };
  const download = () => {
    const { fileName, text } = build();
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
    const { text } = build();
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
          <Num value={count(counts.goals, c.goals)} /> {c.goals}
          <span aria-hidden="true">·</span>
          <Num value={count(counts.holdings, c.holdings)} /> {c.holdings}
          <span aria-hidden="true">·</span>
          <Num value={count(counts.names, c.names)} /> {c.names}
          {counts.comparisons > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <Tpl t={r5.additions.exportSaved} vars={{ n: <Num value={count(counts.comparisons, r5.additions.exportSaved)} /> }} />
            </>
          )}
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
          <Button variant="primary" disabled={empty} onClick={share} className="disabled:opacity-50">
            <IconShare size={18} /> {copy.buttons.share}
          </Button>
        )}
        <Button variant={canShare ? "secondary" : "primary"} disabled={empty} onClick={download} className="disabled:opacity-50">
          <IconDownload size={18} /> {copy.buttons.download}
        </Button>
        <Button variant="secondary" disabled={empty} onClick={copyText} className="disabled:opacity-50">
          <IconCopy size={18} /> {copied ? copy.buttons.copied : copy.buttons.copy}
        </Button>
      </div>
      {shareFailed && <p className="text-sm text-muted-foreground">{copy.errors.shareFailed}</p>}
      {blockedText !== null && (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-muted-foreground">{copy.copyBlocked}</p>
          <textarea readOnly dir="ltr" rows={5} value={blockedText} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-md border border-input bg-card p-3 font-mono text-xs select-all" />
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
      return { text: `${e.invalidBefore} ${r.field}${e.invalidAfter}`, tone: "blocked" };
  }
}

function ImportHalf() {
  const snap = useStateStore();
  const [pasted, setPasted] = useState("");
  const [fileText, setFileText] = useState<{ text: string; name: string } | null>(null);
  const [unreadable, setUnreadable] = useState(false);
  const [mode, setMode] = useState<"add" | "replace">("add");
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState<{ mode: "add" | "replace"; goals: number; holdings: number; skipped: number; date: string } | null>(null);
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
    setDone({ mode, goals: r.added.goals, holdings: r.added.holdings, skipped: r.skipped, date });
    setPasted("");
    setFileText(null);
    setConfirm(false);
  };
  const imported = importedCount(snap.state);
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
            className="w-full rounded-md border border-input bg-card p-3 font-mono text-xs"
          />
        </label>
      </div>

      {unreadable && <Callout tone="blocked">{copy.errors.unreadable}</Callout>}
      {read && !read.ok && (() => {
        const t = refusalText(read.refusal);
        return <Callout tone={t.tone}>{t.text}</Callout>;
      })()}
      {read && read.ok && <Preview p={read.preview} mode={mode} onMode={(m) => { setMode(m); setConfirm(false); }} confirm={confirm} onConfirm={setConfirm} onLoad={load} />}

      {done && (
        <Card className="flex flex-col gap-2" aria-live="polite">
          <p>
            {copy.afterImport.before} <Num value={count(done.goals, copy.afterImport.goals)} /> {copy.afterImport.goals}, <Num value={count(done.holdings, copy.afterImport.holdings)} /> {copy.afterImport.holdings}.
            {done.mode === "add" && (
              <>
                {" "}
                {copy.afterImport.tag}
                <bdi dir="ltr">{fmt.date(done.date)}</bdi>״.
              </>
            )}
          </p>
          {done.skipped > 0 && (
            <p className="text-sm text-muted-foreground">
              <Num value={count(done.skipped, copy.duplicates)} /> {copy.duplicates}
            </p>
          )}
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

      {imported.total > 0 && (
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
      {deleted && imported.total === 0 && <p className="text-sm text-muted-foreground">{copy.deleted}</p>}
    </section>
  );
}

function Preview({ p, mode, onMode, confirm, onConfirm, onLoad }: { p: ImportPreviewData; mode: "add" | "replace"; onMode: (m: "add" | "replace") => void; confirm: boolean; onConfirm: (v: boolean) => void; onLoad: () => void }) {
  const pc = copy.previewCounts;
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-sm">
        {copy.previewCreated.before}
        <bdi dir="ltr">{fmt.date(Number.isNaN(Date.parse(p.file.exported)) ? p.file.exported.slice(0, 10) : todayLocal(new Date(p.file.exported)))}</bdi> · {copy.previewCreated.mid} <bdi dir="ltr" className="num-id">{p.file.site.version}</bdi>
      </p>
      <p className="text-sm flex flex-wrap items-center gap-x-1.5">
        <Num value={count(p.counts.goals, pc.goals)} /> {pc.goals}
        <span aria-hidden="true">·</span>
        <Num value={count(p.counts.holdings, pc.holdings)} /> {pc.holdings}
        <span aria-hidden="true">·</span>
        <Num value={count(p.counts.names, pc.names)} /> {pc.names}
        {p.counts.comparisons > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <Tpl t={r5.additions.exportSaved} vars={{ n: <Num value={count(p.counts.comparisons, r5.additions.exportSaved)} /> }} />
          </>
        )}
      </p>
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
