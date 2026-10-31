// Prices for groups such as young customers, students and released soldiers (D43): stated house by house in the documents' words,
// beside the ranking and never in it. Every bank and broker is accounted for: its groups, or that it prints none on securities.
import type { FeesSnapshot } from "@finance-tool/schema";
import { invest as c } from "../../copy";
import { Disclosure, FoldGroup, ProductPhoneRow, ProductTable, Tag } from "../kit";
import { IconExternal } from "../icons";

type Groups = NonNullable<FeesSnapshot["groups"]>;
type Entry = Groups["entries"][number];
type Source = Entry["who_source"];

/** Where an entry's words stand, one link per place: a PDF's pages each, a sheet's rows as one (its rows have no address of their own). Two documents are told apart in words, not on hover. */
function Sources({ e }: { e: Entry }) {
  const all = [e.who_source, e.ends_source, ...e.prices.map((x) => x.source)].filter((s): s is Source => !!s);
  const urls = [...new Set(all.map((s) => s.url))];
  const links = urls.flatMap((url) => {
    const here = all.filter((s) => s.url === url);
    const title = here[0]!.title;
    const named = (word: string) => (urls.length > 1 ? `${title}, ${word}` : word);
    const rows = [...new Set(here.flatMap((s) => (s.row ? [s.row] : [])))].sort((x, y) => x - y);
    if (rows.length) return [{ href: url, title, word: named(c.groups.atRows(rows)) }];
    const pages = [...new Set(here.flatMap((s) => (s.page ? [s.page] : [])))].sort((x, y) => x - y);
    return pages.map((n) => ({ href: /\.pdf/i.test(url) ? `${url}#page=${n}` : url, title, word: named(/\.pdf/i.test(url) ? c.groups.atPage(n) : c.groups.onPage) }));
  });
  return (
    <span className="flex flex-wrap items-center gap-x-3 text-xs">
      {links.map((l) => (
        <a key={`${l.href}-${l.word}`} href={l.href} target="_blank" rel="noopener noreferrer" title={l.title} className="text-link hover:underline inline-flex items-center gap-1 min-h-target md:min-h-0">
          {l.word} <IconExternal size={14} />
        </a>
      ))}
    </span>
  );
}

const Prices = ({ e }: { e: Entry }) => (
  <span className="flex flex-col gap-1.5">
    {e.prices.map((x) => (
      <span key={x.fee} className="flex flex-col leading-snug">
        <span>
          <span className="text-muted-foreground">{c.groups.fee[x.fee]}: </span>
          <bdi className="font-medium">{x.price_he}</bdi>
        </span>
        <span className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <bdi>{x.holdings_he}</bdi>
          {x.names_fund && <Tag>{c.groups.namesFund}</Tag>}
        </span>
      </span>
    ))}
  </span>
);

const Who = ({ e }: { e: Entry }) => (
  <span className="flex flex-col gap-0.5 leading-snug">
    <span className="font-semibold">{e.name_he}</span>
    <bdi className="text-xs text-muted-foreground">{e.who_he}</bdi>
  </span>
);

const Ends = ({ e }: { e: Entry }) => (
  <span className="flex flex-col gap-1 leading-snug">
    <span className={e.ends_printed ? undefined : "text-muted-foreground"}>{e.ends_he}</span>
    <Sources e={e} />
  </span>
);

export function GroupPrices({ snapshots, nameOf }: { snapshots: FeesSnapshot[]; nameOf: (id: string) => string }) {
  const of = (state: Groups["state"]) => snapshots.filter((s) => s.groups?.state === state);
  const listed = of("prices").sort((a, b) => nameOf(a.id).localeCompare(nameOf(b.id), "he"));
  const names = (state: Groups["state"]) => of(state).map((s) => nameOf(s.id)).sort((a, b) => a.localeCompare(b, "he")).join(", ");
  const unread = names("not_read");
  return (
    <Disclosure label={c.groups.open(listed.length)} openLabel={c.groups.close}>
      <div className="flex flex-col gap-3 pt-3">
        <p className="text-sm text-muted-foreground max-w-measure">{c.groups.lead}</p>
        {/* a fold per house: all of them open at once would run to many screens */}
        <div className="flex flex-col">
          {listed.map((s) => (
            <FoldGroup key={s.id} title={nameOf(s.id)} count={s.groups!.entries.length} level={4}>
              <ProductTable
                columns={[
                  { id: "who", head: c.groups.colWho },
                  { id: "prices", head: c.groups.colPrices },
                  { id: "ends", head: c.groups.colEnds },
                ]}
                groups={[
                  {
                    key: s.id,
                    rows: s.groups!.entries.map((e) => ({
                      key: e.name_he,
                      cells: [<Who e={e} />, <Prices e={e} />, <Ends e={e} />],
                      phone: (
                        <ProductPhoneRow stacked>
                          <Who e={e} />
                          <Prices e={e} />
                          <span className="text-sm">
                            <span className="text-muted-foreground">{c.groups.colEnds}: </span>
                            {e.ends_he}
                          </span>
                          <Sources e={e} />
                        </ProductPhoneRow>
                      ),
                    })),
                  },
                ]}
              />
            </FoldGroup>
          ))}
        </div>
        <p className="text-sm text-muted-foreground max-w-measure">{c.groups.noneOnSecurities(names("none_on_securities"))}</p>
        <p className="text-sm text-muted-foreground max-w-measure">{c.groups.noMention(names("no_mention"))}</p>
        {unread && <p className="text-sm text-muted-foreground max-w-measure">{c.groups.notRead(unread)}</p>}
      </div>
    </Disclosure>
  );
}
