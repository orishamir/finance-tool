"""Resolve the rebase conflicts of the chip-data commit: keep main's publishersHe and the branch's openQuestions together."""
import re, pathlib
W = pathlib.Path('/home/ori/dev/finance-tool/.claude/worktrees/wt-oqsite/site/app')
PAT = re.compile(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n', re.S)
def resolve(rel, fn):
    p = W / rel; s = p.read_text()
    s = PAT.sub(lambda m: fn(m.group(1), m.group(2)), s)
    assert '<<<<<<<' not in s; p.write_text(s); print(rel)

# provenance.tsx: branch's openQuestions type, then main's publishersHe
resolve('components/provenance.tsx', lambda h, b: b + h[h.index('  /** Per source host'):])

# shell.tsx
def shell(h, b):
    return ('''  // every page's sheets know the method: the formulas with their parameters, the parameter cards, the source hosts' Hebrew names and the open questions (root loader)
  const method = useRouteLoaderData("root") as { formulaParameters: Record<string, string[]>; parameterAnchors: Record<string, string>; publishersHe: Record<string, string>; openQuestions: NonNullable<ProvenanceData["openQuestions"]> } | undefined;
  const data = useMemo<ProvenanceData>(() => {
    if (!method) return pageData;
    const formulas = pageData.formulas ?? Object.fromEntries([...new Set([...Object.keys(formulaNames), ...Object.keys(method.formulaParameters)])].filter((f) => f !== "_other").map((f) => [f, { name: formulaNames[f] ?? "", parameters: method.formulaParameters[f] ?? [] }]));
    return { ...pageData, formulas, parameters: pageData.parameters ?? method.parameterAnchors, publishersHe: pageData.publishersHe ?? method.publishersHe, openQuestions: pageData.openQuestions ?? method.openQuestions };
''')
resolve('components/shell.tsx', shell)

# data.server.ts: main's loadPublishersHe (closed with its brace), then the branch's open questions
def data(h, b):
    return h + "}\n\n" + b
resolve('lib/data.server.ts', data)

# root.tsx
def root(h, b):
    return ('''/**
 * What every page's provenance sheet needs to know: which parameters each formula uses, which parameter card each id belongs to,
 * the Hebrew name of each source host, and the open questions' status and Hebrew lines from data/open-questions.json (2026-10-26).
 * PageShell reads it.
 */
export async function loader() {
  const { loadFormulaParameters, loadOpenQuestions, loadParameterAnchors, loadPublishersHe } = await import("./lib/data.server");
  return { formulaParameters: loadFormulaParameters(), parameterAnchors: loadParameterAnchors(), publishersHe: loadPublishersHe(), openQuestions: loadOpenQuestions() };
''')
resolve('root.tsx', root)
