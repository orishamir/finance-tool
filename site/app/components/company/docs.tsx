// A company page's document entries (D30): what the site found in the company's own documents, each entry a line whose title is the link
// that opens the entry's card (`RuleTitleRow`); the code stays in the card. At the end of each product's part, "מה כתוב במסמכים על {product}"; in the overview, the groups
// about none of the page's products, under their group names, as "עוד במסמכים של {company}". The rows stand between hairlines, with no box (the designer's mocks). Each entry's line carries the entry's id as its
// element id, so an address `#KH-09` lands on it.
import { companyPage as w } from "../../copy";
import type { DocGroup } from "../../lib/company-page";
import { RuleTitleRow, useProvenanceData } from "../provenance";
import { GroupHead, RowList, Section } from "../kit";

function Entries({ ids }: { ids: readonly string[] }) {
  const data = useProvenanceData();
  const shown = ids.filter((id) => data?.rules[id]);
  if (shown.length === 0) return null;
  return (
    <RowList plain>
      {shown.map((id) => (
        <li key={id} id={id} className="px-1 target:bg-accent anchor-target">
          {/* the page is the company's: its own name under each term would only repeat the page's */}
          <RuleTitleRow id={id} scope={false} className="text-base py-2.5" />
        </li>
      ))}
    </RowList>
  );
}

/** How many entries the groups hold that the page knows, each once. */
export const docCount = (groups: readonly DocGroup[], known: (id: string) => boolean) => new Set(groups.flatMap((g) => g.ids.filter(known))).size;

/** "מה כתוב במסמכים על פיקדונות · 5": the entries about one product; a product's several groups each under its name. */
export function ProductDocs({ product, groups, id }: { product: string; groups: readonly DocGroup[]; /** What the side list's link to it lands on. */ id?: string }) {
  const data = useProvenanceData();
  const n = docCount(groups, (x) => !!data?.rules[x]);
  if (n === 0) return null;
  return (
    <Section id={id} level="card" title={<>{w.docs.about(product)} <span className="font-normal">· <bdi dir="ltr">{n}</bdi></span></>}>
      <div className="flex flex-col gap-5">
        {groups.length === 1 ? (
          <Entries ids={groups[0]!.ids} />
        ) : (
          groups.map((g) => (
            <div key={g.key} className="flex flex-col gap-2">
              <GroupHead plain>{g.title}</GroupHead>
              <Entries ids={g.ids} />
            </div>
          ))
        )}
      </div>
    </Section>
  );
}

/** The overview's "עוד במסמכים של {company}": the groups about none of the page's products, each under its name. `id` is what `#company-terms` lands on. */
export function MoreDocs({ company, whose, groups, id }: { company: string; /** Whose documents, in the lead ("הבנק", "מיטב"). */ whose: string; groups: readonly DocGroup[]; id: string }) {
  const data = useProvenanceData();
  if (docCount(groups, (x) => !!data?.rules[x]) === 0) return null;
  return (
    <Section id={id} title={w.docs.more(company)} lead={w.docs.moreLine(whose)}>
      <div className="flex flex-col gap-5">
        {groups.map((g) => (
          <div key={g.key} className="flex flex-col gap-2">
            <GroupHead plain>{g.title}</GroupHead>
            <Entries ids={g.ids} />
          </div>
        ))}
      </div>
    </Section>
  );
}
