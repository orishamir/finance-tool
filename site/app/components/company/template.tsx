// One template for every company page (/companies/*): a header (where the page is, the company's name, one line, a thin rule), then a list
// of the company's products at the start side and one product beside it (kit SidePage, SideNav). The first item is "סקירה", the overview;
// the product shown is the address (`?product=`), so a link to a product and the back button work. A company with a single product has no
// list and no overview: it opens on that product, with what the overview would hold after it. An address's `#id` (a document entry, a
// deposit, a part of the securities account) opens the part that holds it, then lands on it.
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { companyPath } from "../../lib/site-paths";
import { useLocation, useNavigate } from "react-router";
import { companies as companiesCopy, companyPage as w } from "../../copy";
import { useAddressParams } from "../../lib/hooks";
import { currentAddress, partOf } from "../../lib/company-page";
import { Breadcrumb } from "../shell";
import { MixedName, PageHead, Section, SideNav, SidePage, gershayim, type SideNavGroup } from "../kit";

export interface CompanyPart {
  /** The product's id in the address; "" is the overview. */
  id: string;
  /** Its name, in the list and as its heading. */
  label: string;
  /** How many (tracks, deposits), beside its name in the list. */
  count?: number;
  /** The list's group it stands under (`groups`). */
  group?: string;
  /** Its own parts, shown under it in the list while it is chosen, as links that jump to them. */
  parts?: { id: string; label: string }[];
  /** The element ids inside it that an address may name. */
  anchors?: string[];
  /** Its content, under its heading. */
  body: ReactNode;
}

export function CompanyTemplate({ pageId, name, line, header, parts, groups, listLabel, overview, single }: {
  /** The id in the page's address (`companyPath`). */
  pageId: string;
  name: string;
  /** The one line under the name (the legal companies; "בנק" and the legal name). */
  line?: ReactNode;
  /** What else stands in the header, under the line (the legend of the figures, a stale-data note). */
  header?: ReactNode;
  /** The products, in the list's order. */
  parts: CompanyPart[];
  /** The list's group labels, in order; a part with no group stands first. */
  groups?: { key: string; label: string }[];
  /** A small label over the whole list ("בעמוד של הבנק"). */
  listLabel?: string;
  /** The overview, with the ids an address may name in it. */
  overview: { body: ReactNode; anchors: string[] };
  /** What follows a single product's part where the page has no overview (the documents and names the overview would list). */
  single?: ReactNode;
}) {
  const { params, hydrated } = useAddressParams();
  const location = useLocation();
  const navigate = useNavigate();
  const lone = parts.length === 1;
  const asked = params.get("product") ?? "";
  const current = lone ? parts[0]! : (parts.find((p) => p.id === asked) ?? null);
  // an older address (a Hebrew product id) opens the same product under its address now
  const renamed = !lone && !current && asked ? parts.find((p) => p.id === currentAddress(asked)) : undefined;
  useEffect(() => {
    if (renamed) navigate(companyPath(pageId, { product: renamed.id, hash: location.hash.slice(1) }), { replace: true, preventScrollReset: true });
  }, [renamed?.id]);
  const shownId = current?.id ?? "";
  const path = companyPath(pageId);
  const hrefOf = (id: string) => companyPath(pageId, { product: id });

  // an address's #id opens the part that holds it; once that part is shown, the page lands on the element
  const hash = hydrated ? decodeURIComponent(location.hash.slice(1)) : "";
  const owner = lone ? null : partOf(hash, [{ id: "", anchors: overview.anchors }, ...parts.map((p) => ({ id: p.id, anchors: p.anchors ?? [] }))]);
  useEffect(() => {
    if (owner !== null && owner !== shownId) navigate(companyPath(pageId, { product: owner, hash: encodeURIComponent(hash) }), { replace: true, preventScrollReset: true });
  }, [owner, shownId, hash]);
  useEffect(() => {
    if (!hash || (owner !== null && owner !== shownId)) return;
    const frame = requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [hash, owner, shownId]);

  // another product: when the reader had scrolled past the top of the content, the new product opens at its top (the page keeps its place
  // on a change of the query, so a short product would otherwise open scrolled out of sight)
  const top = useRef<HTMLDivElement>(null);
  const last = useRef(shownId);
  useLayoutEffect(() => {
    if (last.current === shownId) return;
    last.current = shownId;
    if (location.hash) return;
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start", behavior: "instant" });
  }, [shownId]);

  const title = current ? current.label : w.overview;
  const content = current ? (
    <Section title={current.label}>
      <div className="flex flex-col gap-6">
        {current.body}
        {lone && single}
      </div>
    </Section>
  ) : (
    overview.body
  );

  const navGroups: SideNavGroup[] = [
    { key: "", items: [{ id: "", label: w.overview, to: path }, ...parts.filter((p) => !p.group).map((p) => item(p))] },
    ...(groups ?? []).flatMap((g) => {
      const items = parts.filter((p) => p.group === g.key).map((p) => item(p));
      return items.length ? [{ key: g.key, label: g.label, items }] : [];
    }),
  ];
  function item(p: CompanyPart) {
    return { id: p.id, label: p.label, ...(p.count !== undefined ? { count: p.count } : {}), to: hrefOf(p.id), ...(p.parts ? { parts: p.parts } : {}) };
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <PageHead
        rule
        crumb={<Breadcrumb parent={{ href: "/companies", label: companiesCopy.back }} {...(current && !lone ? { middle: { href: path, label: name } } : {})} current={current && !lone ? title : gershayim(name)} />}
        title={<MixedName>{name}</MixedName>}
        lede={line}
      >
        {header}
      </PageHead>
      <div ref={top} className="anchor-target">
        {lone ? (
          <div className="flex flex-col gap-8 min-w-0">{content}</div>
        ) : (
          <SidePage
            chosen={shownId}
            summary={
              <span className="flex items-baseline gap-2 min-w-0">
                <span className="text-muted-foreground">{w.fold.shown}</span>
                <span className="font-medium truncate">{title}</span>
              </span>
            }
            more={w.fold.more}
            less={w.fold.less}
            nav={(close) => <SideNav groups={navGroups} current={shownId} ariaLabel={w.navLabel} heading={listLabel} onPick={close} />}
          >
            {content}
          </SidePage>
        )}
      </div>
    </div>
  );
}
