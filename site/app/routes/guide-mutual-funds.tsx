// The guide page on funds of every kind (D55): prose only, no product id and no comparison option. It explains what a fund is
// under the law and the kinds the money-market guides and the indices page build on.
import { useLoaderData } from "react-router";
import { invest, limitedBondFund, mutualFunds as copy } from "../copy";
import { pageMeta, type MetaPlace } from "../lib/page-meta";
import { Cost, Kinds, Safety, Tax, Trade, What, termIds } from "../content/guide/mutual-funds";
import { RelatedProducts } from "../components/guide/sections";
import { ProseGuide } from "../components/guide/prose-guide";
import { INDICES_PATH } from "../lib/invest";

const ruleIds = [
  "MF-01", "MF-02", "MF-03", "MF-04", "MF-05", "MF-07", "MF-09", "MF-10", "MF-11", "MF-13", "MF-15", "MF-16", "MF-17", "MF-20", "MF-21", "MF-27",
  "ETF-01", "ETF-04", "ETF-05", "ETF-06", "ETF-13", "ETF-14", "ETF-18", "ETF-61", "ETF-67",
  "REG-07", "REG-10", "REG-11", "BANK-18", "BRK-17",
  "TXS-07", "TXS-09", "TXS-11", "TXS-13", "TXS-21", "TXS-22", "TXS-24", "TXG-04",
];
/** The guides this page leads on to: the money-market funds, the limited-period bond fund and the account the units are held in. */
const relatedIds = ["money-market-fund-daily", "money-market-fund-renewable", "brokerage-account"];

export async function loader() {
  const [{ proseGuideData }, { loadProducts }] = await Promise.all([import("../lib/prose-guide.server"), import("../lib/data.server")]);
  const products = loadProducts();
  // the daily money-market fund's first name is the kind's ("קרן כספית"); its second says which of the two it is
  const nameOf = (id: string) => {
    const names = products.find((p) => p.id === id)?.names.he ?? [id];
    return (id === "money-market-fund-daily" ? names[1] : names[0]) ?? id;
  };
  const related = relatedIds.map((id) => ({ href: `/guide/${id}`, label: nameOf(id) }));
  return { ...proseGuideData({ ruleIds, termIds, product: "brokerage-account" }), related };
}

export function meta({ location }: MetaPlace) {
  return pageMeta({ title: copy.title, description: copy.lede, location });
}

export default function GuideMutualFunds() {
  const data = useLoaderData<typeof loader>();
  const related = [...data.related.slice(0, 2), { href: "/guide/limited-bond-fund", label: limitedBondFund.title }, ...data.related.slice(2), { href: INDICES_PATH, label: invest.nav }];
  return (
    <ProseGuide copy={copy} data={data} body={(figure) => ({ what: <What />, kinds: <Kinds figure={figure} />, trade: <Trade figure={figure} />, cost: <Cost figure={figure} />, safety: <Safety figure={figure} />, tax: <Tax figure={figure} /> })}>
      <RelatedProducts items={related} />
    </ProseGuide>
  );
}
