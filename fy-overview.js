(function () {
  const source = window.ABHIBUS_PARTNER_DATA;
  const nav = document.querySelector(".tabs");
  const main = document.querySelector("main");
  if (!source || !nav || !main || document.querySelector('[data-tab="fy"]')) return;

  const monthKeys = ["apr", "may", "jun", "jul"];
  const labels = { apr: "April", may: "May", jun: "June", jul: "July" };
  const discounts = { apr: 1316642, may: 2137080, jun: 3127751, jul: 2898156 };
  const indian = new Intl.NumberFormat("en-IN");
  const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const compactMoney = (value) => value >= 10000000 ? `₹${(value / 10000000).toFixed(2)} Cr` : `₹${(value / 100000).toFixed(1)} L`;
  const growth = (value, previous) => previous ? ((value / previous) - 1) * 100 : null;
  const growthText = (value) => value === null ? "Base month" : `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  const growthClass = (value) => value === null ? "neutral" : value >= 0 ? "positive" : "negative";

  const months = monthKeys.map((key) => {
    const rows = source.monthly[key];
    return {
      key,
      label: labels[key],
      coupons: rows.reduce((sum, row) => sum + row.coupons, 0),
      seats: rows.reduce((sum, row) => sum + row.seats, 0),
      gmv: rows.reduce((sum, row) => sum + row.gmv, 0),
      discount: discounts[key],
      partners: rows.length,
      leader: rows[0],
    };
  });
  months.forEach((month, index) => {
    const previous = months[index - 1];
    month.gmvMom = previous ? growth(month.gmv, previous.gmv) : null;
    month.seatsMom = previous ? growth(month.seats, previous.seats) : null;
    month.couponsMom = previous ? growth(month.coupons, previous.coupons) : null;
  });

  const ytd = months.reduce((out, month) => ({
    coupons: out.coupons + month.coupons,
    seats: out.seats + month.seats,
    gmv: out.gmv + month.gmv,
    discount: out.discount + month.discount,
  }), { coupons: 0, seats: 0, gmv: 0, discount: 0 });
  const uniquePartners = new Set(monthKeys.flatMap((key) => source.monthly[key].map((row) => row.partner.toLocaleLowerCase()))).size;
  const maxGmv = Math.max(...months.map((month) => month.gmv));

  const tab = document.createElement("button");
  tab.setAttribute("role", "tab");
  tab.setAttribute("aria-selected", "false");
  tab.setAttribute("aria-controls", "panel-fy");
  tab.id = "tab-fy";
  tab.dataset.tab = "fy";
  tab.tabIndex = -1;
  tab.innerHTML = "<span>00</span>FY 26–27";
  nav.prepend(tab);

  const panel = document.createElement("section");
  panel.className = "tab-panel fy-panel";
  panel.id = "panel-fy";
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", "tab-fy");
  panel.dataset.panel = "fy";
  panel.hidden = true;
  panel.innerHTML = `
    <header class="month-intro fy-intro">
      <div><p class="eyebrow">FY 2026–27 · April–July YTD</p><h2>The current year,<br>month by month.</h2></div>
      <p>Compare monthly partnership performance on a consistent workbook-ledger basis. August execution is reported separately because August revenue, seats and coupon data are not yet available in the source.</p>
    </header>

    <nav class="month-shortcuts" aria-label="Open FY 2026–27 monthly detail">
      ${months.map((month, index) => `<button type="button" data-open-month="${month.key}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${month.label}</strong><small>${compactMoney(month.gmv)} GMV</small></button>`).join("")}
    </nav>

    <div class="metric-grid fy-metrics">
      <article><span>YTD GMV</span><strong>${compactMoney(ytd.gmv)}</strong><small>April–July partner ledger</small></article>
      <article><span>YTD coupon uses</span><strong>${indian.format(ytd.coupons)}</strong><small>Revenue-linked redemptions</small></article>
      <article><span>YTD seats</span><strong>${indian.format(ytd.seats)}</strong><small>${currency.format(ytd.gmv / ytd.seats)} GMV per seat</small></article>
      <article><span>YTD discount</span><strong>${compactMoney(ytd.discount)}</strong><small>${(ytd.discount / ytd.gmv * 100).toFixed(1)}% blended burn</small></article>
    </div>

    <section class="fy-section trend-overview">
      <div class="section-heading"><p>Performance trajectory</p><h3>Monthly GMV and MoM growth</h3></div>
      <div class="fy-trend-card">
        <div class="fy-bars">
          ${months.map((month) => `<article>
            <div class="bar-summary"><span>${month.label}</span><strong>${compactMoney(month.gmv)}</strong><small class="${growthClass(month.gmvMom)}">${growthText(month.gmvMom)} MoM</small></div>
            <div class="bar-track"><i style="height:${Math.max(12, month.gmv / maxGmv * 100)}%"></i></div>
          </article>`).join("")}
        </div>
        <aside><span>Peak month</span><strong>June</strong><p>${compactMoney(months[2].gmv)} GMV and ${indian.format(months[2].seats)} seats.</p><span>July movement</span><strong class="negative">−33.3% GMV</strong><p>GMV declined faster than coupon usage (−10.8%), with seats down 21.9%.</p></aside>
      </div>
    </section>

    <section class="fy-section">
      <div class="section-heading"><p>Comparable monthly scorecard</p><h3>Current-year MoM table</h3></div>
      <div class="fy-table-wrap"><table class="fy-table">
        <thead><tr><th>Month</th><th>Coupon uses</th><th>MoM</th><th>Seats</th><th>MoM</th><th>GMV</th><th>MoM</th><th>Discount</th><th>Partners</th><th>GMV leader</th></tr></thead>
        <tbody>${months.map((month) => `<tr>
          <td><button type="button" data-open-month="${month.key}">${month.label}</button></td>
          <td>${indian.format(month.coupons)}</td><td class="${growthClass(month.couponsMom)}">${growthText(month.couponsMom)}</td>
          <td>${indian.format(month.seats)}</td><td class="${growthClass(month.seatsMom)}">${growthText(month.seatsMom)}</td>
          <td><b>${currency.format(month.gmv)}</b></td><td class="${growthClass(month.gmvMom)}">${growthText(month.gmvMom)}</td>
          <td>${currency.format(month.discount)}</td><td>${month.partners}</td><td>${month.leader.partner}</td>
        </tr>`).join("")}</tbody>
        <tfoot><tr><td>YTD total</td><td>${indian.format(ytd.coupons)}</td><td>—</td><td>${indian.format(ytd.seats)}</td><td>—</td><td>${currency.format(ytd.gmv)}</td><td>—</td><td>${currency.format(ytd.discount)}</td><td>${uniquePartners} unique</td><td>—</td></tr></tfoot>
      </table></div>
    </section>

    <section class="fy-section management-readout">
      <div class="section-heading"><p>Management readout</p><h3>What changed during FY 2026–27 YTD</h3></div>
      <div class="readout-grid">
        <article><span>01</span><strong>May nearly doubled GMV</strong><p>GMV rose 95.2% MoM as seats increased 84.7%, establishing the first major scale-up of the year.</p></article>
        <article><span>02</span><strong>June was the YTD peak</strong><p>Partner GMV reached ₹4.36 Cr, with 31,952 seats and 16,477 coupon uses.</p></article>
        <article><span>03</span><strong>July volume softened</strong><p>GMV fell 33.3% from June. The decline was deeper than coupon usage, indicating lower throughput per redemption.</p></article>
        <article><span>04</span><strong>48 partners generated YTD value</strong><p>The monthly active set ranged from 30 to 37 partners; detailed partner tables remain available inside each month.</p></article>
      </div>
    </section>`;
  main.insertBefore(panel, main.querySelector('[data-panel="apr"]'));

  const style = document.createElement("style");
  style.textContent = `
    .tabs{grid-template-columns:repeat(7,1fr)}
    .fy-intro .eyebrow{color:#2f6fc1}
    .month-shortcuts{max-width:1450px;margin:0 auto 24px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
    .month-shortcuts button{border:1px solid var(--line);border-radius:13px;background:#fff;padding:18px;text-align:left;cursor:pointer;box-shadow:0 8px 25px rgba(10,29,51,.04)}
    .month-shortcuts button:hover{border-color:#80a9d8;background:#f5f9fe}
    .month-shortcuts span,.month-shortcuts strong,.month-shortcuts small{display:block}
    .month-shortcuts span{color:#8a98aa;font-size:9px;font-weight:900;letter-spacing:.1em}.month-shortcuts strong{margin:8px 0 5px;font-size:17px}.month-shortcuts small{color:#2f6fc1;font-size:10px;font-weight:750}
    .fy-metrics article{border-top:4px solid #2f6fc1}
    .fy-section{max-width:1450px;margin:0 auto 78px}
    .fy-trend-card{display:grid;grid-template-columns:1.35fr .65fr;gap:28px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:28px;box-shadow:var(--shadow)}
    .fy-bars{height:360px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px;align-items:end}
    .fy-bars article{height:100%;display:grid;grid-template-rows:auto 1fr;gap:14px}.bar-summary span,.bar-summary strong,.bar-summary small{display:block}.bar-summary span{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)}.bar-summary strong{margin:7px 0;font-size:20px}.bar-summary small{font-size:10px;font-weight:850}.bar-track{height:100%;display:flex;align-items:end;background:#edf2f7;border-radius:11px 11px 3px 3px;overflow:hidden}.bar-track i{display:block;width:100%;background:linear-gradient(#4d8bd7,#194f93);border-radius:11px 11px 0 0}
    .fy-trend-card aside{padding:24px;background:#0a1d33;color:#fff;border-radius:13px}.fy-trend-card aside span{display:block;color:#9cb4cb;font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.fy-trend-card aside strong{display:block;margin:8px 0;font-size:27px}.fy-trend-card aside p{margin:0 0 30px;color:#bdc8d4;font-size:12px;line-height:1.55}
    .positive{color:var(--green)!important}.negative{color:#c63e45!important}.neutral{color:var(--muted)!important}
    .fy-table-wrap{overflow:auto;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow)}.fy-table{width:100%;border-collapse:collapse;white-space:nowrap;font-size:12px}.fy-table th,.fy-table td{padding:15px 16px;border-bottom:1px solid var(--line);text-align:right}.fy-table th{color:var(--muted);font-size:9px;letter-spacing:.08em;text-transform:uppercase}.fy-table th:first-child,.fy-table td:first-child{text-align:left;position:sticky;left:0;background:#fff}.fy-table td:first-child button{appearance:none;border:0;background:transparent;padding:0;color:#2f6fc1;font:inherit;font-weight:850;cursor:pointer}.fy-table tfoot td{background:#0a1d33;color:#fff;border:0;font-weight:850}.fy-table tfoot td:first-child{background:#0a1d33}
    .readout-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.readout-grid article{min-height:210px;padding:24px;background:#fff;border:1px solid var(--line);border-radius:14px}.readout-grid span{color:#2f6fc1;font-size:10px;font-weight:900}.readout-grid strong{display:block;margin:32px 0 10px;font-size:18px;line-height:1.25}.readout-grid p{margin:0;color:var(--muted);font-size:12px;line-height:1.55}
    @media(max-width:900px){.fy-trend-card{grid-template-columns:1fr}.readout-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:620px){.month-shortcuts{grid-template-columns:1fr 1fr}.fy-bars{height:300px;gap:8px}.bar-summary strong{font-size:15px}.bar-summary small{font-size:9px}.fy-trend-card{padding:18px}.readout-grid{grid-template-columns:1fr}}
  `;
  document.head.append(style);

  document.querySelectorAll("[data-open-month]").forEach((button) => button.addEventListener("click", () => {
    if (typeof activate === "function") activate(button.dataset.openMonth);
  }));
  document.addEventListener("DOMContentLoaded", () => {
    const requested = location.hash.slice(1);
    if ((!requested || requested === "fy") && typeof activate === "function") activate("fy", false);
  });
})();
