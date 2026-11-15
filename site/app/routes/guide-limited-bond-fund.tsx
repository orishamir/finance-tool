// The guide page of a bond fund with a limited period: prose only for now, no product id and no comparison option.
import { useLoaderData } from "react-router";
import { limitedBondFund as copy } from "../copy";
import { pageMeta, type MetaPlace } from "../lib/page-meta";
import { End, Compare, Risks, Tax, What, Who, termIds } from "../content/guide/limited-bond-fund";
import { ProseGuide } from "../components/guide/prose-guide";


export async function loader() {
  const { proseGuideData } = await import("../lib/prose-guide.server");
  return proseGuideData({ content: "limited-bond-fund", termIds, product: "brokerage-account" });
}

export function meta({ location }: MetaPlace) {
  return pageMeta({ title: copy.title, description: copy.lede, location });
}

export default function GuideLimitedBondFund() {
  const data = useLoaderData<typeof loader>();
  return <ProseGuide copy={copy} data={data} body={(figure) => ({ what: <What />, compare: <Compare />, who: <Who figure={figure} />, end: <End figure={figure} />, tax: <Tax figure={figure} />, risks: <Risks figure={figure} /> })} />;
}
