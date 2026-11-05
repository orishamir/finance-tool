// Option A ("fewest changes"): the steps every coloured piece of the indices page uses, in one place.
// Every other script in this folder reads it.
export const A = {
  fee: [ // the account fee bar, its legend, the own-price sheet's bars and the no-fund section
    { token: "--chart-cost-trade", he: "עמלות קנייה ומכירה", step: "orange-500", today: "orange-500" },
    { token: "--chart-cost-custody", he: "דמי משמרת", step: "gold-200", today: "gold-200" },
    { token: "--chart-cost-fixed", he: "דמי ניהול חשבון", step: "rose-200", today: "red-500" },
    { token: "--chart-cost-fx", he: "המרת מטבע", step: "magenta-400", today: "magenta-400" },
    { token: "--chart-cost-other", he: "העמלות זו על זו", step: "neutral-500", today: "neutral-500" },
  ],
  chipPlain: "neutral-400", // the six label families: no hue of their own (--label-* -> neutral-400)
  chipCaution: "amber-200", // unchanged: --caution-foreground
  chipOpen: "red-400", // open-rule chip words: --blocked (red-400) instead of --blocked-foreground (red-200)
  period: [ // new page tokens for the own-price sheet's period strip (PeriodStrip is used only here and in the gallery)
    { token: "--chart-period-first", he: "מחירי הקבוצה", step: "neutral-0", today: "teal-500 (--chart-value)" },
    { token: "--chart-period-middle", he: "קנייה בלבד במחיר הקבוצה", step: "neutral-300", today: "teal-200 (--chart-net)" },
    { token: "--chart-period-after", he: "התעריפון", step: "neutral-500", today: "gold-200 (--chart-alt)" },
  ],
  ink: "neutral-400", // dots, ticks, plain chips: ink with no meaning of its own
  mark: "neutral-100", // --foreground: the pick ring, the best outline and star, the dashed path, unhedged bars
};
