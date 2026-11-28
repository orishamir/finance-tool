// Who publishes a dataset on data.gov.il. The portal keeps the site and publishes nothing, so a source there names the authority that
// owns the dataset (CLAUDE.md: cite the source that owns the claim). The owner is read from the link, never guessed: a dataset's own
// address carries its organization (`/he/datasets/cma/gemelnet`), and an API address carries a dataset or resource id (or an SQL query that names one) that the table
// below ties to an organization. A link whose dataset is in neither stays on the portal's own name, which the "portal-publisher"
// check keeps listing until the dataset is added here with the rule-base block that names its owner.

export interface DatasetOwner {
  publisher: string;
  publisher_he: string;
  /** A dataset's kind comes from the portal's host (`dataset`), never from its owner. */
  kind?: undefined;
}

/** The organizations data.gov.il files datasets under (the slug in a dataset's address), as the rule-base blocks name them. */
const ORGANIZATIONS: Readonly<Record<string, DatasetOwner>> = {
  // tracks-catalogue-and-decoder.md CAT-01: organization `cma`, "רשות שוק ההון, ביטוח וחיסכון"
  cma: { publisher: "Capital Market Authority", publisher_he: "רשות שוק ההון, ביטוח וחיסכון" },
  // child-savings.md CS-22/CS-23 and government-bonds-and-makam.md: "Ministry of Finance via data.gov.il"
  mof: { publisher: "Ministry of Finance", publisher_he: "משרד האוצר" },
  // regulators-and-protection.md REG-03: "Bank of Israel via data.gov.il", dataset 375
  bank_israel: { publisher: "Bank of Israel", publisher_he: "בנק ישראל" },
};

/** Dataset and resource ids that an API address names, each with the organization its rule-base block gives. */
const OWNER_OF_ID: Readonly<Record<string, keyof typeof ORGANIZATIONS>> = {
  // CAT-01: the three CMA monthly datasets and each one's resources (Gemel-Net, Pension-Net, Bituach-Net)
  gemelnet: "cma",
  "pensia-net": "cma",
  insurance: "cma",
  "91c849ed-ddc4-472b-bd09-0f5486cea35c": "cma",
  "2016d770-f094-4a2e-983e-797c26479720": "cma",
  "a30dcbea-a1d2-482c-ae29-8f781f5025fb": "cma",
  "76ad9eed-d076-46d6-96e2-a4eb8e045444": "cma",
  "a66926f3-e396-4984-a4db-75486751c2f7": "cma",
  "4694d5a7-5284-4f3d-a2cb-5887f43fb55e": "cma",
  "6d47d6b5-cb08-488b-b333-f1e717b1e1bd": "cma",
  "b58b5a80-84b7-490d-ab02-bff12f1941b2": "cma",
  "584e6b69-174f-46c9-b8db-03925b4c68c6": "cma",
  "672090ba-7893-4496-a07c-dc7e822cbf18": "cma",
  "c6c62cc7-fe02-4b18-8f3e-813abfbb4647": "cma",
  "388992c7-0280-48d8-b147-13e636bd804d": "cma",
  // CAT-30: the `transfer_bank` dataset and its resource
  transfer_bank: "cma",
  "b5223cbc-e1b2-4503-a499-97cdcd7190d2": "cma",
  // the Ministry of Finance's domestic-debt dataset and its tradable-auction resource
  "goverment-domesticdebt": "mof",
  "c92fdda2-0939-4110-8ebc-edfcf35e8723": "mof",
  // REG-03: the Bank of Israel's list of banking corporations, dataset 375 and its Hebrew resource
  "375": "bank_israel",
  "ebb61778-e34c-4e67-8fcf-0e643d9cf8c2": "bank_israel",
};

/** The owner of the dataset a data.gov.il address opens, or undefined when the address names none the table knows (a portal page, an unlisted dataset). */
export function dataGovOwner(url: string): DatasetOwner | undefined {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return undefined;
  }
  if (u.host.replace(/^www\./, "") !== "data.gov.il") return undefined;
  const org = /^\/(?:he|en|ar)\/datasets\/([^/]+)\//.exec(u.pathname)?.[1];
  if (org && ORGANIZATIONS[org]) return ORGANIZATIONS[org];
  // an SQL query names its resource in the FROM clause (`FROM "a30dcbea-…"`)
  const id = u.searchParams.get("resource_id") ?? u.searchParams.get("id") ?? /\bFROM\s+"([^"]+)"/i.exec(u.searchParams.get("sql") ?? "")?.[1];
  const owner = id ? OWNER_OF_ID[id] : undefined;
  return owner ? ORGANIZATIONS[owner] : undefined;
}
