// The prototype's page, drawn in the browser from DATA (written by gen.mjs). Plain script, no library.
(() => {
  const CO = DATA.companies;
  const FEE_YEAR = DATA.feeYear;
  const he = new Intl.Collator("he");
  const R = (a) => ({ id: a[0], co: CO[a[1]], name: a[2], sub: a[3], kind: a[4], fee: a[5], dep: a[6], stock: a[7], fx: a[8], assets: a[9], y3: a[10], y5: a[11], open: a[12] });
  const words = (s) => s.split(/\s+/).filter(Boolean);
  const norm = (s) => s.toLowerCase().replace(/[\s"״'׳\-–()]/g, "");
  /**
   * Each track's short name: its name without the words every track of its company in this product starts with (the
   * company and product, "הראל גמל להשקעה"), and without a leading dash or "מסלול". The cut stops before a word of a
   * kind's name, so "חוסכים המעדיפים סיכון מוגבר" keeps its words. A company with one track loses only its own name.
   */
  function shortNames(cos, kindWords) {
    for (const [c, s] of cos) {
      const ws = s.list.map((r) => words(r.name));
      let k = 0;
      if (ws.length > 1) {
        const min = Math.min(...ws.map((w) => w.length));
        while (k < min - 1 && ws.every((w) => w[k] === ws[0][k])) k++;
        while (k > 0 && kindWords.has(norm(ws[0][k - 1]))) k--;
      } else if (words(c).every((w, i) => ws[0][i] === w)) k = words(c).length;
      s.list.forEach((r, i) => (r.short = ws[i].slice(k).join(" ").replace(/^[-–:]\s*/, "").replace(/^מסלול\s+/, "") || r.name));
    }
  }
  const median = (xs) => { const s = xs.filter((x) => x != null).sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };

  const products = DATA.products.map((p) => {
    const rows = p.rows.map(R);
    const hasKinds = rows.some((r) => r.sub);
    const bySub = new Map();
    for (const r of rows) if (r.sub) (bySub.get(r.sub) ?? bySub.set(r.sub, []).get(r.sub)).push(r);
    // kinds from the highest stock share to the lowest (median over the kind's tracks), ties by size
    const kinds = [...bySub.entries()].map(([sub, list]) => ({ sub, kind: list[0].kind, count: list.length, stock: median(list.map((r) => r.stock)) })).sort((a, b) => b.stock - a.stock || b.count - a.count);
    const co = new Map();
    for (const r of rows) { const s = co.get(r.co) ?? { count: 0, assets: 0, list: [] }; s.count++; s.assets += r.assets ?? 0; s.list.push(r); co.set(r.co, s); }
    shortNames([...co.entries()], new Set(kinds.flatMap((k) => words(k.sub).map(norm)).filter(Boolean)));
    return { ...p, rows, hasKinds, kinds, co, coOrder: [...co.entries()].sort((a, b) => b[1].assets - a[1].assets).map(([c]) => c) };
  });

  const st = { p: products.findIndex((p) => p.id === "kupat-gemel-lehashkaa"), group: "company", kind: "", sort: "fee", dir: 1, q: "" };

  // ---- formatting, as the site draws numbers ----
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const n = (s, cls = "") => `<span class="n ${cls}">${s}</span>`;
  const pct2 = (v) => (v === 0 ? "0%" : `${v.toFixed(2)}%`);
  const signed = (v) => (v < 0 ? `−${Math.abs(v).toFixed(2)}%` : `${v.toFixed(2)}%`);
  const clock = `<svg class="clock" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.6V8l2.3 1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  const sourced = (s, stale = false) => `${stale ? clock : ""}${n(s, "s")}`;
  const computedNum = (s) => `<span class="fig">${clock}${n(s, "c")}</span>`;
  const bigNum = (m, cls) => (m >= 1000 ? `${n((m / 1000).toLocaleString("he-IL", { maximumFractionDigits: 1 }), cls)} מיליארד ₪` : `${n(Math.round(m).toLocaleString("he-IL"), cls)} מיליון ₪`);
  const money = (m) => (m == null ? `<span class="muted small">לא דווח</span>` : `<span class="fig">${clock}${bigNum(m, "s")}</span>`);
  const isNew = (r) => !!r.open && Number(r.open.slice(0, 4)) >= FEE_YEAR;
  const younger = (r, years) => !!r.open && r.open > `${Number(DATA.period.slice(0, 4)) - years}-${DATA.period.slice(5)}-31`;

  function rings(stock, fx, size = 30) {
    const c = size / 2;
    const ring = (rad, frac, cls) => {
      const len = 2 * Math.PI * rad;
      const f = Math.max(0, Math.min(1, (frac ?? 0) / 100));
      return `<circle cx="${c}" cy="${c}" r="${rad}" class="ring-bg"/><circle cx="${c}" cy="${c}" r="${rad}" class="${cls}" stroke-dasharray="${(f * len).toFixed(2)} ${len.toFixed(2)}" transform="rotate(-90 ${c} ${c})"/>`;
    };
    return `<svg class="rings" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">${ring(c - 3, stock, "ring-stock")}${ring(c - 8, fx, "ring-fx")}</svg>`;
  }
  const feeFigs = (r) =>
    r.fee == null
      ? `<span class="muted small">עוד לא דווח</span>`
      : `<span class="fig">${sourced(pct2(r.fee))}<span class="w">מהחיסכון</span></span><span class="fig">${sourced(pct2(r.dep ?? 0))}<span class="w">מההפקדות</span></span>`;
  const exposureCell = (r) =>
    r.stock == null
      ? `<span class="muted small">לא דווח</span>`
      : `<span class="expo">${rings(r.stock, r.fx)}<span class="expo-g"><span class="lbl"><i class="sw sw-stock"></i>מניות</span>${computedNum(`${Math.round(r.stock)}%`)}<span class="lbl"><i class="sw sw-fx"></i>מט״ח</span>${r.fx == null ? `<span class="muted small">לא דווח</span>` : computedNum(`${Math.round(r.fx)}%`)}</span></span>`;
  const yieldOne = (v, years, r) =>
    `<span class="fig">${v == null ? `<span class="muted small">${younger(r, years) ? `פחות מ־${years} שנים` : "לא דווח"}</span>` : `${sourced(signed(v), true)}<span class="w">${years} שנים</span>`}</span>`;
  const yieldCell = (r) => yieldOne(r.y3, 3, r) + yieldOne(r.y5, 5, r);
  const chev = `<span class="chev" aria-hidden="true"><svg viewBox="0 0 16 16" width="16" height="16"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
  const tags = (r, withKind) => {
    const t = [];
    if (isNew(r)) t.push(`<span class="tag">חדש</span>`);
    if (withKind && r.sub) t.push(`<span class="tag kind">${esc(r.sub)}</span>`);
    return t.length ? `<span class="tags">${t.join("")}</span>` : "";
  };
  const count = (k) => (k === 1 ? "מסלול אחד" : `${k} מסלולים`);
  const feeRange = (list) => {
    const fees = list.map((r) => r.fee).filter((v) => v != null);
    return fees.length ? `דמי ניהול מהחיסכון: מ־${n(pct2(Math.min(...fees)), "s")} עד ${n(pct2(Math.max(...fees)), "s")}` : "דמי ניהול עוד לא דווחו";
  };

  // ---- the controls, drawn once per product ----
  // what each column head sorts by; dir 1 is the order a first click gives (the lowest fee, the most stocks, the largest)
  const SORTS = [
    { id: "fee", label: "דמי ניהול מהחיסכון", what: "דמי הניהול מהחיסכון", dir: 1, up: "מהזול ליקר", down: "מהיקר לזול", key: (r) => r.fee },
    { id: "dep", label: "דמי ניהול מההפקדות", what: "דמי הניהול מההפקדות", dir: 1, up: "מהזול ליקר", down: "מהיקר לזול", key: (r) => r.dep },
    { id: "stock", label: "חשיפה למניות", what: "החשיפה למניות", dir: -1, up: "מהנמוכה לגבוהה", down: "מהגבוהה לנמוכה", key: (r) => r.stock },
    { id: "assets", label: "נכסים", what: "הנכסים", dir: -1, up: "מהקטן לגדול", down: "מהגדול לקטן", key: (r) => r.assets },
    { id: "name", label: "שם", what: "השם", dir: 1, up: "לפי הא״ב", down: "לפי הא״ב מהסוף", text: true },
  ];
  const site = document.getElementById("site");
  site.innerHTML = `
  <nav class="nav"><b>מקור</b><span>מדריכים</span><span>חוקים וכללים</span><span>שאלות</span><span class="on">חברות ומסלולים</span><span>השקעה במדד</span></nav>
  <div class="tabs"><span>לפי חברה</span><span class="on">לפי מוצר</span></div>
  <header class="ph-head">
    <h2 class="h1">כל המסלולים בכל החברות</h2>
    <p class="muted lead">בוחרים מוצר ורואים את המסלולים של כל החברות שמנהלות אותו. דמי הניהול הם הממוצע שנגבה בפועל ב־${n(String(FEE_YEAR))}; החשיפה, התשואה והנכסים נכונים לסוף ספטמבר ${n("2026")}. מנתוני רשות שוק ההון.</p>
  </header>
  <div class="ctl"><span class="ctl-l">מוצר</span><div class="chips" id="prod" role="group" aria-label="מוצר"></div></div>
  <p class="small muted" id="countline"></p>
  <div class="ctl-row">
    <div class="ctl"><span class="ctl-l">קיבוץ לפי</span><div class="segs" id="group" role="group" aria-label="קיבוץ לפי"></div></div>
    <label class="search-f pc-only"><span class="ctl-l">חיפוש</span><input id="q" type="search" placeholder="שם המסלול או החברה" autocomplete="off"></label>
  </div>
  <div class="ctl pc-only" id="kinds-pc"><span class="ctl-l">במה הכסף מושקע</span><div class="chips" id="kinds" role="group" aria-label="במה הכסף מושקע"></div></div>
  <div class="ph-ctl">
    <label class="field"><span class="ctl-l">חיפוש</span><input id="q2" type="search" placeholder="שם המסלול או החברה" autocomplete="off"></label>
    <label class="field" id="kinds-ph"><span class="ctl-l">במה הכסף מושקע</span><select id="kindSel"></select></label>
    <label class="field"><span class="ctl-l">מיון בתוך כל קבוצה</span><select id="sortSel">${SORTS.map((s) => `<option value="${s.id}">${s.label}</option>`).join("")}</select></label>
  </div>
  <p class="small muted" id="order"></p>
  <div id="list"></div>
  <p class="small muted past-note">התשואה היא תשואת עבר כמו שהרשות מפרסמת אותה: לפני דמי הניהול ולפני מס. היא לא אומרת מה יקרה בהמשך, ולכן אין מיון לפיה.</p>`;
  const $ = (id) => document.getElementById(id);

  function drawControls() {
    const p = products[st.p];
    $("prod").innerHTML = products.map((x, i) => `<button type="button" class="ix" data-p="${i}" aria-pressed="${i === st.p}">${x.name} <span class="cnt">${x.rows.length}</span></button>`).join("");
    if (!p.hasKinds && st.group === "kind") st.group = "company";
    $("group").innerHTML = [["company", "חברה"], ["kind", "במה הכסף מושקע"]].map(([id, label]) => `<button type="button" class="seg" data-group="${id}" aria-pressed="${st.group === id}"${id === "kind" && !p.hasKinds ? " disabled" : ""}>${label}</button>`).join("");
    $("kinds-pc").hidden = $("kinds-ph").hidden = !p.hasKinds;
    if (p.hasKinds) {
      $("kinds").innerHTML = [`<button type="button" class="ix" data-kind="" aria-pressed="${st.kind === ""}">הכול <span class="cnt">${p.rows.length}</span></button>`, ...p.kinds.map((k) => `<button type="button" class="ix" data-kind="${esc(k.sub)}" aria-pressed="${st.kind === k.sub}">${esc(k.sub)} <span class="cnt">${k.count}</span></button>`)].join("");
      $("kindSel").innerHTML = [`<option value="">הכול (${p.rows.length})</option>`, ...p.kinds.map((k) => `<option value="${esc(k.sub)}"${st.kind === k.sub ? " selected" : ""}>${esc(k.sub)} (${k.count})</option>`)].join("");
    }
    $("sortSel").value = st.sort;
  }

  // ---- the list ----
  // a missing figure goes last in either direction; ties fall back to the lower fee, then the company
  function sorter() {
    const s = SORTS.find((x) => x.id === st.sort);
    const d = st.dir * s.dir;
    const label = (r) => (st.group === "company" ? r.short : r.co);
    const tie = (a, b) => (a.fee ?? 99) - (b.fee ?? 99) || he.compare(a.co, b.co) || he.compare(a.short, b.short);
    if (s.text) return (a, b) => d * he.compare(label(a), label(b)) || tie(a, b);
    return (a, b) => {
      const x = s.key(a), y = s.key(b);
      if (x == null || y == null) return x == null && y == null ? tie(a, b) : x == null ? 1 : -1;
      return d * (x - y) || tie(a, b);
    };
  }
  const sortHead = (id, text) => {
    const on = st.sort === id;
    const arrow = on ? (st.dir * SORTS.find((x) => x.id === id).dir === 1 ? "▲" : "▼") : "⇅";
    return `<button type="button" class="sh${on ? " on" : ""}" data-sort="${id}">${text}<span class="arr" aria-hidden="true">${arrow}</span></button>`;
  };
  const ariaSort = (...ids) => (ids.includes(st.sort) ? ` aria-sort="${st.dir * SORTS.find((x) => x.id === st.sort).dir === 1 ? "ascending" : "descending"}"` : "");

  function drawList() {
    const p = products[st.p];
    const q = st.q.trim();
    const rows = p.rows.filter((r) => (!st.kind || r.sub === st.kind) && (!q || r.name.includes(q) || r.co.includes(q))).sort(sorter());
    const byCo = st.group === "company";
    let groups;
    if (byCo) {
      groups = p.coOrder.map((c) => {
        const list = rows.filter((r) => r.co === c);
        const s = p.co.get(c);
        return { title: c, line: `${count(list.length)}${list.length < s.count ? ` מתוך ${s.count}` : ""} · נכסים ${bigNum(s.assets, "c")} · ${feeRange(list)}`, list };
      });
    } else {
      groups = p.kinds.map((k) => {
        const list = rows.filter((r) => r.sub === k.sub);
        return { title: k.sub, line: `${esc(k.kind)} · ${count(list.length)} · ${feeRange(list)}`, list };
      });
    }
    groups = groups.filter((g) => g.list.length);
    const shownCos = new Set(rows.map((r) => r.co)).size;
    $("countline").innerHTML = `${n(String(rows.length))} מסלולים של ${n(String(shownCos))} חברות${rows.length < p.rows.length ? ` (מתוך ${n(String(p.rows.length))})` : ""}. <a class="link">מה זה ${p.name}</a>${p.hasKinds ? "" : ` · הרשות לא מסווגת את המסלולים של המוצר הזה לפי במה הכסף מושקע, ולכן אין קיבוץ כזה.`}`;
    const cur = SORTS.find((s) => s.id === st.sort);
    const sortWords = `${cur.id === "name" ? (byCo ? "שם המסלול" : "שם החברה") : cur.what}, ${st.dir * cur.dir === 1 ? cur.up : cur.down}`;
    $("order").textContent = byCo ? `החברות מסודרות מהגדולה לקטנה בנכסים ב${p.name}; בתוך כל חברה לפי ${sortWords}.` : `הקבוצות מסודרות מהחשיפה למניות הגבוהה לנמוכה; בתוך כל קבוצה לפי ${sortWords}.`;
    if (!rows.length) {
      $("list").innerHTML = `<div class="empty">אין מסלולים שמתאימים לחיפוש "${esc(q)}".</div>`;
      return;
    }
    const coLine = (c) => { const s = p.co.get(c); return `${count(s.count)} · ${bigNum(s.assets, "c")} ב${p.name}`; };
    // say only what the group's heading does not: by company the kind is shown only when the short name leaves it out;
    // by kind the short name is shown only when it says more than the kind
    const nameCell = (r) =>
      byCo
        ? `<span class="nm"><a class="tname" title="${esc(r.name)}">${esc(r.short)}</a>${tags(r, !norm(r.short).includes(norm(r.sub)))}</span>`
        : `<span class="nm"><span class="co"><a class="coname" title="${esc(r.name)}">${esc(r.co)}</a><span class="w">${coLine(r.co)}</span></span>${norm(r.short) === norm(r.sub) ? "" : `<span class="tsub">${esc(r.short)}</span>`}${tags(r, false)}</span>`;
    const head = `<thead><tr><th class="c-name"${ariaSort("name")}>${sortHead("name", byCo ? "המסלול" : "החברה")}</th><th class="c-id">קופה</th><th class="c-fee"${ariaSort("fee", "dep")}><span class="hd">דמי ניהול, ממוצע ${FEE_YEAR}</span><span class="sh-pair">${sortHead("fee", "מהחיסכון")}${sortHead("dep", "מההפקדות")}</span></th><th class="c-exp"${ariaSort("stock")}>${sortHead("stock", "חשיפה למניות ולמט״ח, סוף ספטמבר 2026")}</th><th class="c-y">תשואה שנתית ממוצעת, לפני דמי ניהול</th><th class="c-a"${ariaSort("assets")}>${sortHead("assets", "נכסים בסוף ספטמבר 2026")}</th><th class="c-open"><span class="sr">פתיחה</span></th></tr></thead>`;
    const tr = (r) => `<tr><td>${nameCell(r)}</td><td>${n(r.id, "id")}</td><td><span class="figs">${feeFigs(r)}</span></td><td>${exposureCell(r)}</td><td><span class="figs">${yieldCell(r)}</span></td><td>${money(r.assets)}</td><td>${chev}</td></tr>`;
    const table = `<div class="pc"><table class="fixed past">${head}${groups.map((g) => `<tbody><tr class="grp"><th colspan="7" scope="rowgroup"><span class="grp-t">${esc(g.title)}</span><span class="grp-l">${g.line}</span></th></tr>${g.list.map(tr).join("")}</tbody>`).join("")}</table></div>`;
    const prow = (r) => `<div class="prow"><div class="pmain">${nameCell(r)}<span class="pline">${feeFigs(r)}<span class="fig pid"><span class="w">קופה</span>${n(r.id, "id")}</span></span><span class="pline">${exposureCell(r)}</span><span class="pline">${yieldCell(r)}</span><span class="pline"><span class="w">נכסים</span>${money(r.assets)}</span></div>${chev}</div>`;
    const phone = `<div class="ph">${groups.map((g) => `<div class="pgrp"><span class="grp-t">${esc(g.title)}</span><span class="grp-l">${g.line}</span></div>${g.list.map(prow).join("")}`).join("")}</div>`;
    $("list").innerHTML = table + phone;
  }

  // ---- what each control does ----
  site.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    if (b.dataset.p != null) { st.p = Number(b.dataset.p); st.kind = ""; drawControls(); drawList(); }
    else if (b.dataset.group) { st.group = b.dataset.group; drawControls(); drawList(); }
    else if (b.dataset.kind != null) { st.kind = b.dataset.kind; drawControls(); drawList(); }
    else if (b.dataset.sort) { if (st.sort === b.dataset.sort) st.dir = -st.dir; else { st.sort = b.dataset.sort; st.dir = 1; } drawControls(); drawList(); }
  });
  $("kindSel").addEventListener("change", (e) => { st.kind = e.target.value; drawControls(); drawList(); });
  $("sortSel").addEventListener("change", (e) => { st.sort = e.target.value; st.dir = 1; drawControls(); drawList(); });
  for (const id of ["q", "q2"]) $(id).addEventListener("input", (e) => { st.q = e.target.value; $(id === "q" ? "q2" : "q").value = st.q; drawList(); });

  const stage = document.getElementById("stage");
  for (const b of document.querySelectorAll("[data-view]")) b.addEventListener("click", () => {
    for (const x of document.querySelectorAll("[data-view]")) x.setAttribute("aria-pressed", String(x === b));
    stage.classList.toggle("phone", b.dataset.view === "phone");
  });

  drawControls();
  drawList();
})();
