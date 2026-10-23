import type { GuideContent } from "./types";
import { content as bankDeposit } from "./bank-deposit";
import { content as brokerageAccount } from "./brokerage-account";
import { content as childSavingsBank } from "./child-savings-bank";
import { content as childSavingsProvident } from "./child-savings-provident";
import { content as currentAccount } from "./current-account";
import { content as governmentBond } from "./government-bond";
import { content as iraHishtalmut } from "./ira-hishtalmut";
import { content as iraProvident } from "./ira-provident";
import { content as kerenHishtalmut } from "./keren-hishtalmut";
import { content as kupatGemelLehashkaa } from "./kupat-gemel-lehashkaa";
import { content as makam } from "./makam";
import { content as moneyMarketFundDaily } from "./money-market-fund-daily";
import { content as moneyMarketFundRenewable } from "./money-market-fund-renewable";
import { content as pensionComprehensive } from "./pension-comprehensive";
import { content as pensionGeneral } from "./pension-general";
import { content as providentForAnnuity } from "./provident-for-annuity";
import { content as savingsPlan } from "./savings-plan";

/** One prose module per wrapper record under data/instruments/wrappers/. A record without prose still renders its data. */
export const guideContent: Record<string, GuideContent | undefined> = {
  "bank-deposit": bankDeposit,
  "brokerage-account": brokerageAccount,
  "child-savings-bank": childSavingsBank,
  "child-savings-provident": childSavingsProvident,
  "current-account": currentAccount,
  "government-bond": governmentBond,
  "ira-hishtalmut": iraHishtalmut,
  "ira-provident": iraProvident,
  "keren-hishtalmut": kerenHishtalmut,
  "kupat-gemel-lehashkaa": kupatGemelLehashkaa,
  "makam": makam,
  "money-market-fund-daily": moneyMarketFundDaily,
  "money-market-fund-renewable": moneyMarketFundRenewable,
  "pension-comprehensive": pensionComprehensive,
  "pension-general": pensionGeneral,
  "provident-for-annuity": providentForAnnuity,
  "savings-plan": savingsPlan,
};
