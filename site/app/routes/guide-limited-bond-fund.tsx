// The guide page of a bond fund with a limited period: prose only for now, no product id and no comparison option.
import { useLoaderData } from "react-router";
import { limitedBondFund as copy, site } from "../copy";
import { End, Compare, Risks, Tax, What, Who, termIds } from "../content/guide/limited-bond-fund";
import { ProseGuide } from "../components/guide/prose-guide";

const ruleIds = ["MF-05", "MF-10", "MF-11", "MF-16", "MF-20", "MF-27", "MF-59", "MF-60", "MF-61", "MF-62", "MF-63", "MF-64", "MF-65", "MF-66", "ETF-79", "ETF-80", "ETF-81", "CORP-01", "CORP-23", "CORP-26", "TX2-06", "TXS-09", "TXS-33", "TXS-34", "TXS-35", "TXS-36", "TXS-37"];

export async function loader() {
  const { proseGuideData } = await import("../lib/prose-guide.server");
  return proseGuideData({ ruleIds, termIds, product: "brokerage-account" });
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

export default function GuideLimitedBondFund() {
  const data = useLoaderData<typeof loader>();
  return <ProseGuide copy={copy} data={data} body={(figure) => ({ what: <What />, compare: <Compare />, who: <Who figure={figure} />, end: <End figure={figure} />, tax: <Tax figure={figure} />, risks: <Risks figure={figure} /> })} />;
}
