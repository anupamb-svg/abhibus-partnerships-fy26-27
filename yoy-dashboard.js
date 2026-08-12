(function () {
  const data = window.ABHIBUS_YOY_DATA;
  const nav = document.querySelector(".tabs");
  const main = document.querySelector("main");
  if (!data || !nav || !main || document.querySelector('[data-tab="yoy"]')) return;

  const keys = ["fy2425", "fy2526", "fy2627"];
  const shortLabels = { fy2425: "FY24–25", fy2526: "FY25–26", fy2627: "FY26–27" };
  const indian = new Intl.NumberFormat("en-IN");
  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const compact = (v) => v >= 10000000 ? `₹${(v / 10000000).toFixed(2)} Cr` : `₹${(v / 100000).toFixed(1)} L`;
  const pct = (v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
  const safe = (v) => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const growth = (a, b) => a ? (b / a - 1) * 100 : null;
  const growthCell = (v) => v === null ? '<span class="yoy-tag new">New</span>' : `<span class="${v >= 20 ? "up" : v <= -20 ? "down" : "flat"}">${pct(v)}</span>`;
  const totals = (key) => data.comparable[key].totals;
  const partnerMap = (key) => Object.fromEntries(data.comparable[key].partners.map((p) => [p.partner, p]));
  const maps = Object.fromEntries(keys.map((key) => [key, partnerMap(key)]));

  function transition(previousKey, currentKey) {
    const previous = maps[previousKey];
    const current = maps[currentKey];
    const previousNames = new Set(Object.keys(previous));
    const currentNames = new Set(Object.keys(current));
    const retained = [...currentNames].filter((name) => previousNames.has(name));
    const added = [...currentNames].filter((name) => !previousNames.has(name));
    const lost = [...previousNames].filter((name) => !currentNames.has(name));
    const existingRevenue = retained.reduce((sum, name) => sum + current[name].gmv, 0);
    const newRevenue = added.reduce((sum, name) => sum + current[name].gmv, 0);
    const growthExisting = retained.reduce((sum, name) => sum + Math.max(0, current[name].gmv - previous[name].gmv), 0);
    const decliningExisting = retained.reduce((sum, name) => sum + Math.min(0, current[name].gmv - previous[name].gmv), 0);
    const lostRevenue = lost.reduce((sum, name) => sum + previous[name].gmv, 0);
    return { previousKey, currentKey, retained, added, lost, existingRevenue, newRevenue, growthExisting, decliningExisting, lostRevenue };
  }
  const transitions = [transition("fy2425", "fy2526"), transition("fy2526", "fy2627")];

  function concentration(key) {
    const rows = data.comparable[key].partners;
    const total = totals(key).gmv;
    const top5 = rows.slice(0, 5).reduce((sum, row) => sum + row.gmv, 0) / total * 100;
    const top10 = rows.slice(0, 10).reduce((sum, row) => sum + row.gmv, 0) / total * 100;
    return { top5, top10, remaining: 100 - top10 };
  }

  const allNames = [...new Set(keys.flatMap((key) => Object.keys(maps[key])))];
  const masterRows = allNames.map((partner) => {
    const a = maps.fy2425[partner] || { gmv: 0, bookings: 0, seats: 0, discount: 0 };
    const b = maps.fy2526[partner] || { gmv: 0, bookings: 0, seats: 0, discount: 0 };
    const c = maps.fy2627[partner] || { gmv: 0, bookings: 0, seats: 0, discount: 0 };
    return { partner, fy2425: a, fy2526: b, fy2627: c };
  });

  const tabSpecs = [
    ["yoy", "00", "YoY Overview"],
    ["fy2425", "01", "FY 24–25"],
    ["fy2526", "02", "FY 25–26"],
  ];
  const fragment = document.createDocumentFragment();
  tabSpecs.forEach(([key, index, label]) => {
    const button = document.createElement("button");
    button.setAttribute("role", "tab"); button.setAttribute("aria-selected", "false");
    button.setAttribute("aria-controls", `panel-${key}`); button.id = `tab-${key}`;
    button.dataset.tab = key; button.tabIndex = -1; button.innerHTML = `<span>${index}</span>${label}`;
    fragment.append(button);
  });
  nav.prepend(fragment);

  function metricValue(row, metric) {
    if (metric === "abv") return row.bookings ? row.gmv / row.bookings : 0;
    if (metric === "burn") return row.gmv ? row.discount / row.gmv * 100 : 0;
    return row[metric] || 0;
  }
  function metricFormat(value, metric) {
    if (["gmv", "discount", "abv"].includes(metric)) return money.format(value);
    if (metric === "burn") return `${value.toFixed(1)}%`;
    return indian.format(value);
  }

  const yoyPanel = document.createElement("section");
  yoyPanel.className = "tab-panel yoy-panel"; yoyPanel.id = "panel-yoy";
  yoyPanel.setAttribute("role", "tabpanel"); yoyPanel.setAttribute("aria-labelledby", "tab-yoy");
  yoyPanel.dataset.panel = "yoy"; yoyPanel.hidden = true;
  yoyPanel.innerHTML = `
    <header class="month-intro yoy-intro"><div><p class="eyebrow">Management revenue view · equivalent Apr–Jul periods</p><h2>Which partners are<br>driving YoY growth?</h2></div><p>This executive comparison standardizes partner names and uses the same four-month window across all years. Annual source-period totals remain available in each FY tab.</p></header>
    <div class="comparison-scope"><strong>Comparison basis</strong><span>FY24–25 Apr–Jul</span><i></i><span>FY25–26 Apr–Jul</span><i></i><span>FY26–27 Apr–Jul YTD</span></div>
    <div class="yoy-kpi-grid">
      ${keys.map((key, index) => { const t = totals(key); const prior = index ? totals(keys[index - 1]) : null; return `<article><span>${shortLabels[key]} comparable GMV</span><strong>${compact(t.gmv)}</strong><div><b class="${prior && t.gmv < prior.gmv ? "down" : "up"}">${prior ? pct(growth(prior.gmv, t.gmv)) : "Base year"}</b><small>${indian.format(t.bookings)} bookings · ${indian.format(t.seats)} seats</small></div></article>`; }).join("")}
      <article class="focus"><span>Current YTD position</span><strong>${pct(growth(totals("fy2526").gmv, totals("fy2627").gmv))}</strong><div><b>vs FY25–26 Apr–Jul</b><small>${data.comparable.fy2627.totals.partners} standardized revenue partners</small></div></article>
    </div>

    <section class="yoy-section"><div class="section-heading"><p>Executive scorecard</p><h3>Equivalent-period performance</h3></div><div class="yoy-table-wrap"><table class="yoy-table"><thead><tr><th>Metric</th>${keys.map((key) => `<th>${shortLabels[key]}</th>`).join("")}<th>FY25 vs FY24</th><th>FY26 YTD vs FY25</th></tr></thead><tbody>
      ${[["Revenue / GMV","gmv"],["Bookings / redemptions","bookings"],["Seats","seats"],["Discount","discount"],["Revenue partners","partners"]].map(([label, metric]) => { const vals = keys.map((key) => totals(key)[metric]); return `<tr><td>${label}</td>${vals.map((v) => `<td>${metric === "gmv" || metric === "discount" ? money.format(v) : indian.format(v)}</td>`).join("")}<td>${growthCell(growth(vals[0], vals[1]))}</td><td>${growthCell(growth(vals[1], vals[2]))}</td></tr>`; }).join("")}
      ${[["Average revenue / partner",(key)=>totals(key).gmv/totals(key).partners],["Average revenue / booking",(key)=>totals(key).gmv/totals(key).bookings]].map(([label,fn])=>{const vals=keys.map(fn);return `<tr><td>${label}</td>${vals.map(v=>`<td>${money.format(v)}</td>`).join("")}<td>${growthCell(growth(vals[0],vals[1]))}</td><td>${growthCell(growth(vals[1],vals[2]))}</td></tr>`}).join("")}
    </tbody></table></div></section>

    <section class="yoy-section"><div class="section-heading"><p>Monthly revenue comparison</p><h3>April–July GMV across financial years</h3></div><div class="month-compare-grid">${["Apr","May","Jun","Jul"].map((month) => { const vals=keys.map(k=>data.years[k].monthly[month].gmv); const max=Math.max(...vals); return `<article><header><span>${month}</span><b>${pct(growth(vals[1],vals[2]))} current YoY</b></header>${keys.map((key,i)=>`<div><small>${shortLabels[key]}</small><i><span style="width:${vals[i]/max*100}%"></span></i><strong>${compact(vals[i])}</strong></div>`).join("")}</article>`; }).join("")}</div></section>

    <section class="yoy-section"><div class="section-heading"><p>Partner comparison</p><h3>Top 10 partners by three-year comparable GMV</h3></div><div class="top-partner-compare" id="top-partner-compare"></div></section>

    <section class="yoy-section split-section"><div><div class="section-heading"><p>Revenue bridge</p><h3>What changed YoY</h3></div><div class="bridge-grid">${transitions.map((tr) => { const start=totals(tr.previousKey).gmv; const end=totals(tr.currentKey).gmv; return `<article><header><span>${shortLabels[tr.previousKey]} → ${shortLabels[tr.currentKey]}</span><b>${pct(growth(start,end))}</b></header><ul><li><span>Opening revenue</span><strong>${compact(start)}</strong></li><li class="gain"><span>Newly active partners</span><strong>+${compact(tr.newRevenue)}</strong></li><li class="gain"><span>Growth from retained</span><strong>+${compact(tr.growthExisting)}</strong></li><li class="loss"><span>Decline from retained</span><strong>−${compact(Math.abs(tr.decliningExisting))}</strong></li><li class="loss"><span>Inactive partner revenue</span><strong>−${compact(tr.lostRevenue)}</strong></li><li><span>Closing revenue</span><strong>${compact(end)}</strong></li></ul></article>`; }).join("")}</div></div>
      <div><div class="section-heading"><p>Revenue concentration</p><h3>Top-partner dependency</h3></div><div class="concentration-card">${keys.map((key)=>{const c=concentration(key);return `<article><header><span>${shortLabels[key]}</span><b>${c.top5.toFixed(1)}% Top 5</b></header><div class="stack"><i style="width:${c.top5}%"></i><i style="width:${c.top10-c.top5}%"></i><i style="width:${c.remaining}%"></i></div><p><span>Top 10 ${c.top10.toFixed(1)}%</span><span>Remaining ${c.remaining.toFixed(1)}%</span></p></article>`}).join("")}<small>FY26–27 YTD is more concentrated: SBI Bank, Visa and AU Bank together account for most comparable revenue.</small></div></div></section>

    <section class="yoy-section"><div class="section-heading"><p>Partner retention</p><h3>Retained, newly active and inactive partners</h3></div><div class="retention-grid">${transitions.map((tr)=>{const retention=tr.retained.length/Object.keys(maps[tr.previousKey]).length*100;return `<article><header><span>${shortLabels[tr.previousKey]} → ${shortLabels[tr.currentKey]}</span><strong>${retention.toFixed(1)}% retained</strong></header><div><b>${tr.retained.length}</b><small>Retained</small></div><div><b>${tr.added.length}</b><small>Newly active</small></div><div><b>${tr.lost.length}</b><small>Inactive</small></div><details><summary>Partner lists</summary><p><strong>Newly active:</strong> ${tr.added.sort().map(safe).join(", ")}</p><p><strong>Inactive:</strong> ${tr.lost.sort().map(safe).join(", ")}</p></details></article>`}).join("")}</div></section>

    <section class="yoy-section"><div class="master-heading"><div class="section-heading"><p>Partner-level YoY</p><h3>Detailed comparison</h3></div><label><span>Metric</span><select id="yoy-metric"><option value="gmv">Revenue / GMV</option><option value="bookings">Bookings</option><option value="seats">Seats</option><option value="discount">Discount</option><option value="burn">Burn %</option><option value="abv">Average booking value</option></select></label></div><div class="legend"><span class="up">Growing &gt;20%</span><span class="down">Declining &gt;20%</span><span class="yoy-tag new">New</span></div><div class="yoy-table-wrap"><table class="yoy-table master-table" id="master-yoy-table"></table></div></section>

    <section class="yoy-section action-section"><div class="section-heading"><p>Management actions</p><h3>Revenue priorities</h3></div><div class="action-grid"><article><span>Scale</span><strong>Visa and AU Bank</strong><p>Protect the two largest non-SBI engines and use differentiated card-led campaigns to broaden growth.</p></article><article><span>Retain</span><strong>HDFC Bank and Google Pay</strong><p>Both contribute across comparable years; prioritize continuity and stronger visibility.</p></article><article><span>Reactivate</span><strong>RBL, BHIM UPI and Tata Neu</strong><p>These were large FY25–26 contributors with no comparable FY26–27 revenue.</p></article><article><span>Diversify</span><strong>Reduce Top 5 dependence</strong><p>Top 5 concentration reached ${concentration("fy2627").top5.toFixed(1)}%; scale the long tail beyond the three largest partners.</p></article><article><span>Build</span><strong>CRED, Tide and MobiKwik</strong><p>These newer FY26–27 contributors are the strongest candidates for the next scaled revenue tier.</p></article></div></section>`;

  function annualPanel(key) {
    const year = data.years[key]; const t = year.totals; const rows = year.partners;
    const months = Object.entries(year.monthly); const max = Math.max(...months.map(([,m])=>m.gmv));
    return `<header class="month-intro annual-intro"><div><p class="eyebrow">${year.label} · ${year.period}</p><h2>Annual partnership<br>revenue detail.</h2></div><p>All available source months and standardized revenue-generating partners. The annual total is not used against FY26–27 YTD without an equivalent-period label.</p></header>
      <div class="metric-grid annual-metrics"><article><span>Source-period GMV</span><strong>${compact(t.gmv)}</strong><small>${year.period}</small></article><article><span>Bookings</span><strong>${indian.format(t.bookings)}</strong><small>${money.format(t.gmv/t.bookings)} revenue / booking</small></article><article><span>Seats</span><strong>${indian.format(t.seats)}</strong><small>${money.format(t.gmv/t.seats)} GMV / seat</small></article><article><span>Revenue partners</span><strong>${t.partners}</strong><small>${compact(t.gmv/t.partners)} revenue / partner</small></article></div>
      <section class="yoy-section"><div class="section-heading"><p>Monthly revenue trend</p><h3>${year.label} source-period GMV</h3></div><div class="annual-month-bars">${months.map(([label,m])=>`<article><strong>${label}</strong><i><span style="height:${Math.max(3,m.gmv/max*100)}%"></span></i><small>${compact(m.gmv)}</small></article>`).join("")}</div></section>
      <section class="yoy-section"><div class="section-heading"><p>Top partner performance</p><h3>Top 10 by revenue</h3></div><div class="annual-top-grid"><article>${rows.slice(0,10).map((row,i)=>`<div><span>${i+1}. ${safe(row.partner)}</span><i><b style="width:${row.gmv/rows[0].gmv*100}%"></b></i><strong>${compact(row.gmv)}</strong></div>`).join("")}</article><article class="annual-note"><span>Revenue concentration</span><strong>${(rows.slice(0,5).reduce((s,r)=>s+r.gmv,0)/t.gmv*100).toFixed(1)}%</strong><p>of source-period GMV came from the Top 5 partners.</p><span>Blended burn</span><strong>${(t.discount/t.gmv*100).toFixed(1)}%</strong><p>${compact(t.discount)} total discount across the available period.</p></article></div></section>
      <section class="yoy-section"><div class="section-heading"><p>Complete annual ledger</p><h3>Partner revenue detail</h3></div><div class="yoy-table-wrap"><table class="yoy-table annual-table"><thead><tr><th>Partner</th><th>Coupon code(s)</th><th>Bookings</th><th>Seats</th><th>Revenue / GMV</th><th>Discount</th><th>Burn</th><th>Revenue / booking</th><th>Contribution</th></tr></thead><tbody>${rows.map(row=>`<tr><td>${safe(row.partner)}</td><td>${safe(row.codes)}</td><td>${indian.format(row.bookings)}</td><td>${indian.format(row.seats)}</td><td><b>${money.format(row.gmv)}</b></td><td>${money.format(row.discount)}</td><td>${(row.discount/row.gmv*100).toFixed(1)}%</td><td>${money.format(row.gmv/row.bookings)}</td><td>${(row.gmv/t.gmv*100).toFixed(1)}%</td></tr>`).join("")}</tbody><tfoot><tr><td>Total</td><td>—</td><td>${indian.format(t.bookings)}</td><td>${indian.format(t.seats)}</td><td>${money.format(t.gmv)}</td><td>${money.format(t.discount)}</td><td>${(t.discount/t.gmv*100).toFixed(1)}%</td><td>${money.format(t.gmv/t.bookings)}</td><td>100.0%</td></tr></tfoot></table></div></section>`;
  }

  const firstPanel = main.querySelector('[data-panel="fy"]');
  main.insertBefore(yoyPanel, firstPanel);
  ["fy2425","fy2526"].forEach((key) => { const panel=document.createElement("section"); panel.className="tab-panel annual-panel"; panel.id=`panel-${key}`; panel.setAttribute("role","tabpanel"); panel.setAttribute("aria-labelledby",`tab-${key}`); panel.dataset.panel=key; panel.hidden=true; panel.innerHTML=annualPanel(key); main.insertBefore(panel, firstPanel); });

  const currentAnnual = document.createElement("section"); currentAnnual.className="yoy-section current-annual-detail"; currentAnnual.innerHTML=`<div class="section-heading"><p>Standardized YTD ledger</p><h3>FY 2026–27 partner totals</h3></div><div class="yoy-table-wrap"><table class="yoy-table annual-table"><thead><tr><th>Partner</th><th>Coupon code(s)</th><th>Bookings</th><th>Seats</th><th>Revenue / GMV</th><th>Discount</th><th>Burn</th><th>Revenue / booking</th><th>Contribution</th></tr></thead><tbody>${data.years.fy2627.partners.map(row=>`<tr><td>${safe(row.partner)}</td><td>${safe(row.codes)}</td><td>${indian.format(row.bookings)}</td><td>${indian.format(row.seats)}</td><td><b>${money.format(row.gmv)}</b></td><td>${money.format(row.discount)}</td><td>${(row.discount/row.gmv*100).toFixed(1)}%</td><td>${money.format(row.gmv/row.bookings)}</td><td>${(row.gmv/data.years.fy2627.totals.gmv*100).toFixed(1)}%</td></tr>`).join("")}</tbody></table></div>`; firstPanel.append(currentAnnual);

  const combinedTop = masterRows.map((row)=>({partner:row.partner,total:keys.reduce((s,k)=>s+row[k].gmv,0),...row})).sort((a,b)=>b.total-a.total).slice(0,10); const topMax=Math.max(...combinedTop.flatMap(r=>keys.map(k=>r[k].gmv)));
  document.querySelector("#top-partner-compare").innerHTML=combinedTop.map((row)=>`<article><strong>${safe(row.partner)}</strong><div>${keys.map(k=>`<span><small>${shortLabels[k]}</small><i><b style="width:${row[k].gmv/topMax*100}%"></b></i><em>${compact(row[k].gmv)}</em></span>`).join("")}</div></article>`).join("");

  function renderMaster(metric="gmv") {
    const totalAll=masterRows.reduce((s,row)=>s+keys.reduce((x,k)=>x+metricValue(row[k],metric),0),0);
    const rows=[...masterRows].sort((a,b)=>metricValue(b.fy2627,metric)-metricValue(a.fy2627,metric));
    document.querySelector("#master-yoy-table").innerHTML=`<thead><tr><th>Partner</th>${keys.map(k=>`<th>${shortLabels[k]}</th>`).join("")}<th>FY25 vs FY24</th><th>FY26 vs FY25</th><th>3-year total</th><th>Share</th><th>Trend</th></tr></thead><tbody>${rows.map(row=>{const vals=keys.map(k=>metricValue(row[k],metric));const g1=vals[0]?growth(vals[0],vals[1]):vals[1]?null:0;const g2=vals[1]?growth(vals[1],vals[2]):vals[2]?null:0;const total=vals.reduce((s,v)=>s+v,0);const trend=vals[2]>vals[1]&&vals[1]>vals[0]?"Continuous growth":vals[2]===0&&vals[1]>0?"Inactive current":vals[2]>0&&vals[1]===0?"Newly active":"Mixed";return `<tr><td>${safe(row.partner)}</td>${vals.map(v=>`<td>${metricFormat(v,metric)}</td>`).join("")}<td>${growthCell(g1)}</td><td>${growthCell(g2)}</td><td><b>${metricFormat(total,metric)}</b></td><td>${totalAll?`${(total/totalAll*100).toFixed(1)}%`:"—"}</td><td><span class="trend-label">${trend}</span></td></tr>`}).join("")}</tbody>`;
  }
  const metricSelect=document.querySelector("#yoy-metric"); metricSelect.addEventListener("change",()=>renderMaster(metricSelect.value)); renderMaster();

  const style=document.createElement("style"); style.textContent=`
    .tabs{display:flex;grid-template-columns:none;overflow-x:auto}.tabs button{flex:1 0 112px;min-width:112px}.yoy-intro .eyebrow,.annual-intro .eyebrow{color:#2f6fc1}.yoy-section{max-width:1450px;margin:0 auto 78px}.comparison-scope{max-width:1450px;margin:-18px auto 30px;display:flex;align-items:center;gap:14px;color:var(--muted);font-size:11px}.comparison-scope strong{color:var(--ink)}.comparison-scope i{width:28px;height:1px;background:#aab4bf}.yoy-kpi-grid{max-width:1450px;margin:0 auto 70px;display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.yoy-kpi-grid article{padding:24px;background:#fff;border:1px solid var(--line);border-top:4px solid #2f6fc1;border-radius:14px}.yoy-kpi-grid article.focus{background:#0a1d33;color:#fff;border-color:#0a1d33}.yoy-kpi-grid span,.yoy-kpi-grid strong,.yoy-kpi-grid small{display:block}.yoy-kpi-grid>article>span{color:var(--muted);font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.1em}.yoy-kpi-grid strong{margin:16px 0;font-size:31px}.yoy-kpi-grid div b{display:block;font-size:12px}.yoy-kpi-grid div small{margin-top:6px;color:var(--muted);font-size:10px}.yoy-table-wrap{overflow:auto;background:#fff;border:1px solid var(--line);border-radius:15px;box-shadow:var(--shadow)}.yoy-table{width:100%;border-collapse:collapse;white-space:nowrap;font-size:11px}.yoy-table th,.yoy-table td{padding:14px 15px;border-bottom:1px solid var(--line);text-align:right}.yoy-table th{color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.08em}.yoy-table th:first-child,.yoy-table td:first-child{text-align:left;position:sticky;left:0;background:#fff;z-index:1}.yoy-table td:first-child{font-weight:800}.yoy-table tfoot td{background:#0a1d33;color:#fff;border:0;font-weight:850}.yoy-table tfoot td:first-child{background:#0a1d33}.up{color:var(--green);font-weight:850}.down{color:#c63e45;font-weight:850}.flat{color:#8a6972;font-weight:850}.yoy-tag{display:inline-flex;padding:4px 7px;border-radius:999px;font-size:8px;font-weight:900;text-transform:uppercase}.yoy-tag.new{background:#e9ddfa;color:#69409d}.month-compare-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.month-compare-grid article{padding:20px;background:#fff;border:1px solid var(--line);border-radius:14px}.month-compare-grid header{display:flex;justify-content:space-between;margin-bottom:18px}.month-compare-grid header span{font-weight:900}.month-compare-grid header b{font-size:10px;color:#2f6fc1}.month-compare-grid article>div{display:grid;grid-template-columns:55px 1fr 70px;align-items:center;gap:8px;margin:10px 0}.month-compare-grid small{font-size:9px}.month-compare-grid i{height:7px;background:#edf0f3;border-radius:999px;overflow:hidden}.month-compare-grid i span{display:block;height:100%;background:#2f6fc1}.month-compare-grid strong{font-size:10px;text-align:right}.top-partner-compare{background:#fff;border:1px solid var(--line);border-radius:15px;padding:24px;box-shadow:var(--shadow)}.top-partner-compare>article{display:grid;grid-template-columns:190px 1fr;gap:18px;padding:12px 0;border-bottom:1px solid var(--line)}.top-partner-compare>article:last-child{border:0}.top-partner-compare>article>strong{font-size:11px}.top-partner-compare>article>div{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.top-partner-compare span{display:grid;grid-template-columns:52px 1fr 65px;align-items:center;gap:7px}.top-partner-compare small{font-size:8px;color:var(--muted)}.top-partner-compare i{height:7px;background:#edf0f3}.top-partner-compare i b{display:block;height:100%;background:linear-gradient(90deg,#2f6fc1,#72a1dc)}.top-partner-compare em{font-style:normal;font-size:9px;text-align:right}.split-section{display:grid;grid-template-columns:1fr 1fr;gap:20px}.bridge-grid{display:grid;gap:14px}.bridge-grid article,.concentration-card,.retention-grid article{background:#fff;border:1px solid var(--line);border-radius:14px;padding:22px}.bridge-grid header,.concentration-card header,.retention-grid header{display:flex;justify-content:space-between;gap:15px;margin-bottom:18px}.bridge-grid header span,.concentration-card header span,.retention-grid header span{font-weight:850}.bridge-grid header b{color:#2f6fc1}.bridge-grid ul{list-style:none;margin:0;padding:0}.bridge-grid li{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line);font-size:11px}.bridge-grid li.gain strong{color:var(--green)}.bridge-grid li.loss strong{color:#c63e45}.concentration-card{display:grid;gap:23px}.concentration-card article{padding:0}.concentration-card header{margin-bottom:9px}.concentration-card header b{font-size:11px}.stack{display:flex;height:14px;border-radius:999px;overflow:hidden}.stack i:nth-child(1){background:#173f72}.stack i:nth-child(2){background:#5d8fc9}.stack i:nth-child(3){background:#d9e4f0}.concentration-card article p{display:flex;justify-content:space-between;margin:8px 0 0;color:var(--muted);font-size:9px}.concentration-card>small{color:var(--muted);line-height:1.5}.retention-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.retention-grid article{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.retention-grid header,.retention-grid details{grid-column:1/-1}.retention-grid article>div{padding:13px;background:#f4f6f8;border-radius:10px}.retention-grid article>div b,.retention-grid article>div small{display:block}.retention-grid article>div b{font-size:22px}.retention-grid article>div small{color:var(--muted);font-size:9px}.retention-grid summary{cursor:pointer;color:#2f6fc1;font-size:10px;font-weight:850}.retention-grid details p{color:var(--muted);font-size:10px;line-height:1.55}.master-heading{display:flex;justify-content:space-between;align-items:end}.master-heading label span{display:block;margin-bottom:6px;color:var(--muted);font-size:9px;font-weight:900;text-transform:uppercase}.master-heading select{padding:10px 38px 10px 12px;border:1px solid var(--line);border-radius:9px;background:#fff}.legend{display:flex;gap:14px;margin:-14px 0 14px;font-size:9px}.master-table td:first-child{min-width:190px}.trend-label{font-size:9px;color:var(--muted)}.action-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:13px}.action-grid article{padding:21px;background:#0a1d33;color:#fff;border-radius:13px}.action-grid span{color:#8cb7e8;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.1em}.action-grid strong{display:block;margin:26px 0 9px}.action-grid p{margin:0;color:#b8c5d2;font-size:10px;line-height:1.55}.annual-metrics article{border-top:4px solid #2f6fc1}.annual-month-bars{height:300px;display:grid;grid-template-columns:repeat(12,1fr);gap:8px;align-items:end;background:#fff;border:1px solid var(--line);border-radius:15px;padding:22px}.annual-month-bars article{height:100%;display:grid;grid-template-rows:auto 1fr auto;gap:8px;text-align:center}.annual-month-bars strong{font-size:9px}.annual-month-bars i{display:flex;align-items:end;background:#eef2f6;border-radius:7px 7px 2px 2px;overflow:hidden}.annual-month-bars i span{width:100%;background:linear-gradient(#4d8bd7,#194f93)}.annual-month-bars small{font-size:7px;color:var(--muted)}.annual-top-grid{display:grid;grid-template-columns:1.3fr .7fr;gap:16px}.annual-top-grid>article{padding:23px;background:#fff;border:1px solid var(--line);border-radius:14px}.annual-top-grid>article:first-child>div{display:grid;grid-template-columns:180px 1fr 75px;gap:10px;align-items:center;padding:9px 0}.annual-top-grid>article:first-child span{font-size:10px;font-weight:750}.annual-top-grid>article:first-child i{height:7px;background:#edf0f3}.annual-top-grid>article:first-child i b{display:block;height:100%;background:#2f6fc1}.annual-top-grid>article:first-child strong{font-size:10px;text-align:right}.annual-note span,.annual-note strong{display:block}.annual-note span{color:var(--muted);font-size:9px;font-weight:900;text-transform:uppercase}.annual-note strong{margin:8px 0;font-size:32px}.annual-note p{margin:0 0 30px;color:var(--muted);font-size:11px}.annual-table th:first-child,.annual-table td:first-child{min-width:170px}.current-annual-detail{margin-top:0}
    @media(max-width:1000px){.yoy-kpi-grid,.month-compare-grid{grid-template-columns:1fr 1fr}.split-section,.annual-top-grid{grid-template-columns:1fr}.action-grid{grid-template-columns:1fr 1fr}.top-partner-compare>article{grid-template-columns:1fr}.annual-month-bars{overflow:auto;grid-template-columns:repeat(12,70px)}}
    @media(max-width:620px){.comparison-scope{overflow:auto;white-space:nowrap}.yoy-kpi-grid,.month-compare-grid,.retention-grid,.action-grid{grid-template-columns:1fr}.top-partner-compare>article>div{grid-template-columns:1fr}.master-heading{align-items:stretch;flex-direction:column}.split-section{display:block}.split-section>div{margin-bottom:55px}}
  `; document.head.append(style);

  document.addEventListener("DOMContentLoaded",()=>{const requested=location.hash.slice(1);if((!requested||requested==="yoy")&&typeof activate==="function")activate("yoy",false)});
})();
