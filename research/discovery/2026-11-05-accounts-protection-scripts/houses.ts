import { buildWorkbenchBundle } from "/home/ori/dev/finance-tool/site/app/lib/providers.server";
const b = buildWorkbenchBundle() as any;
for (const s of b.snapshots) {
  const st = s.lines.filter((l: any) => l.band === "הוראת קבע" || l.band === "השקעה קבועה אוטומטית");
  console.log(s.id, "|", s.provider ?? s.provider_id ?? "", "|", s.checked ?? s.as_of ?? "", "| standing lines:", st.length);
  for (const l of st) console.log("   ", l.id, l.base, JSON.stringify(l.applies_to), "excl", JSON.stringify(l.excludes ?? []), "rate", JSON.stringify(l.rate?.value), l.rate?.unit, "min", JSON.stringify(l.min?.value), "max", JSON.stringify(l.max?.value), "fixed", JSON.stringify(l.fixed?.value), l.rate?.source?.url, l.rate?.source?.page ?? "", (l.notes_he??l.note??"").slice(0,200));
}
