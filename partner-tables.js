(function () {
  const data = window.ABHIBUS_PARTNER_DATA;
  if (!data) return;

  const monthLabels = { apr: "April", may: "May", jun: "June", jul: "July" };
  const indianNumber = new Intl.NumberFormat("en-IN");
  const rupees = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  function makeShell({ id, kicker, title, description, placeholder }) {
    const section = document.createElement("section");
    section.className = "partner-ledger";
    section.setAttribute("aria-labelledby", `${id}-title`);
    section.innerHTML = `
      <div class="ledger-heading">
        <div>
          <p>${kicker}</p>
          <h3 id="${id}-title">${title}</h3>
          <span>${description}</span>
        </div>
        <label class="partner-search">
          <span>Search partner</span>
          <input type="search" placeholder="${placeholder}" aria-controls="${id}-table">
        </label>
      </div>
      <div class="ledger-meta" aria-live="polite"></div>
      <div class="table-scroll"><table class="partner-table" id="${id}-table"></table></div>`;
    return section;
  }

  function sortButton(label, key, activeKey, direction) {
    const arrow = key === activeKey ? (direction === "asc" ? " ↑" : " ↓") : "";
    return `<button type="button" data-sort="${key}">${label}<span aria-hidden="true">${arrow}</span></button>`;
  }

  function mountMonthlyLedger(month) {
    const rows = data.monthly[month];
    const totalGmv = rows.reduce((sum, row) => sum + row.gmv, 0);
    const totalSeats = rows.reduce((sum, row) => sum + row.seats, 0);
    const totalCoupons = rows.reduce((sum, row) => sum + row.coupons, 0);
    const shell = makeShell({
      id: `${month}-partners`,
      kicker: "Complete partner performance",
      title: `${monthLabels[month]} partner ledger`,
      description: "Every partner with recorded activity in the source workbook. Exact duplicate partner names are consolidated.",
      placeholder: `Search ${monthLabels[month]} partners`,
    });
    const table = shell.querySelector("table");
    const input = shell.querySelector("input");
    const meta = shell.querySelector(".ledger-meta");
    let sortKey = "gmv";
    let direction = "desc";

    function render() {
      const query = input.value.trim().toLocaleLowerCase();
      const filtered = rows.filter((row) => row.partner.toLocaleLowerCase().includes(query));
      filtered.sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const result = typeof av === "string" ? av.localeCompare(bv) : av - bv;
        return direction === "asc" ? result : -result;
      });
      meta.innerHTML = `<span><b>${filtered.length}</b> of ${rows.length} partners shown</span><span class="reconciled">✓ Reconciled to ${indianNumber.format(totalSeats)} seats and ${rupees.format(totalGmv)}</span>`;
      table.innerHTML = `
        <thead><tr>
          <th>${sortButton("Partner", "partner", sortKey, direction)}</th>
          <th>${sortButton("Coupon uses", "coupons", sortKey, direction)}</th>
          <th>${sortButton("Seats", "seats", sortKey, direction)}</th>
          <th>${sortButton("GMV", "gmv", sortKey, direction)}</th>
          <th>${sortButton("GMV share", "share", sortKey, direction)}</th>
          <th>${sortButton("GMV / seat", "average", sortKey, direction)}</th>
        </tr></thead>
        <tbody>${filtered.map((row) => {
          const share = totalGmv ? row.gmv / totalGmv : 0;
          const average = row.seats ? row.gmv / row.seats : 0;
          row.share = share;
          row.average = average;
          return `<tr><td>${escapeHtml(row.partner)}</td><td>${indianNumber.format(row.coupons)}</td><td>${indianNumber.format(row.seats)}</td><td><b>${rupees.format(row.gmv)}</b></td><td>${(share * 100).toFixed(1)}%</td><td>${rupees.format(average)}</td></tr>`;
        }).join("") || `<tr><td colspan="6" class="empty-row">No matching partner</td></tr>`}</tbody>
        <tfoot><tr><td>Month total</td><td>${indianNumber.format(totalCoupons)}</td><td>${indianNumber.format(totalSeats)}</td><td>${rupees.format(totalGmv)}</td><td>100.0%</td><td>${rupees.format(totalGmv / totalSeats)}</td></tr></tfoot>`;
      table.querySelectorAll("[data-sort]").forEach((button) => {
        button.addEventListener("click", () => {
          const nextKey = button.dataset.sort;
          direction = sortKey === nextKey && direction === "desc" ? "asc" : "desc";
          sortKey = nextKey;
          render();
        });
      });
    }

    input.addEventListener("input", render);
    render();
    document.querySelector(`#panel-${month} .dashboard-grid`).after(shell);
  }

  function mountB2BLedger() {
    const rows = data.b2b;
    const shell = makeShell({
      id: "b2b-partners",
      kicker: "Full B2B partner matrix",
      title: "All B2B partners, month by month",
      description: "All 16 partners in the B2B worksheet are retained, including partners with no activity in April–July.",
      placeholder: "Search B2B partners",
    });
    shell.classList.add("b2b-ledger");
    const table = shell.querySelector("table");
    const input = shell.querySelector("input");
    const meta = shell.querySelector(".ledger-meta");
    let sortKey = "total";
    let direction = "desc";

    const totals = ["apr", "may", "jun", "jul"].reduce((out, month) => {
      out[month] = rows.reduce((sum, row) => ({
        seats: sum.seats + row[month].seats,
        gmv: sum.gmv + row[month].gmv,
      }), { seats: 0, gmv: 0 });
      return out;
    }, {});
    const totalSeats = rows.reduce((sum, row) => sum + row.totalSeats, 0);
    const totalGmv = rows.reduce((sum, row) => sum + row.totalGmv, 0);

    const monthCell = (item) => item.seats || item.gmv
      ? `<b>${indianNumber.format(item.seats)} seats</b><small>${rupees.format(item.gmv)}</small>`
      : `<span class="no-activity">No activity</span>`;

    function render() {
      const query = input.value.trim().toLocaleLowerCase();
      const filtered = rows.filter((row) => row.partner.toLocaleLowerCase().includes(query));
      filtered.sort((a, b) => {
        const av = sortKey === "partner" ? a.partner : sortKey === "total" ? a.totalGmv : a[sortKey].gmv;
        const bv = sortKey === "partner" ? b.partner : sortKey === "total" ? b.totalGmv : b[sortKey].gmv;
        const result = typeof av === "string" ? av.localeCompare(bv) : av - bv;
        return direction === "asc" ? result : -result;
      });
      const activeCount = rows.filter((row) => row.totalSeats || row.totalGmv).length;
      meta.innerHTML = `<span><b>${filtered.length}</b> of ${rows.length} partners shown · ${activeCount} active</span><span class="quality-flag">Source check: July Grand Total omits Akbar Travels (3 seats · ₹739); matrix totals include it.</span>`;
      table.innerHTML = `
        <thead><tr>
          <th>${sortButton("Partner", "partner", sortKey, direction)}</th>
          ${["apr", "may", "jun", "jul"].map((month) => `<th>${sortButton(monthLabels[month], month, sortKey, direction)}</th>`).join("")}
          <th>${sortButton("Apr–Jul total", "total", sortKey, direction)}</th>
        </tr></thead>
        <tbody>${filtered.map((row) => `<tr>
          <td>${escapeHtml(row.partner)}</td>
          ${["apr", "may", "jun", "jul"].map((month) => `<td class="stacked-number">${monthCell(row[month])}</td>`).join("")}
          <td class="stacked-number total-cell"><b>${indianNumber.format(row.totalSeats)} seats</b><small>${rupees.format(row.totalGmv)}</small></td>
        </tr>`).join("") || `<tr><td colspan="6" class="empty-row">No matching partner</td></tr>`}</tbody>
        <tfoot><tr><td>All partners</td>${["apr", "may", "jun", "jul"].map((month) => `<td class="stacked-number"><b>${indianNumber.format(totals[month].seats)} seats</b><small>${rupees.format(totals[month].gmv)}</small></td>`).join("")}<td class="stacked-number"><b>${indianNumber.format(totalSeats)} seats</b><small>${rupees.format(totalGmv)}</small></td></tr></tfoot>`;
      table.querySelectorAll("[data-sort]").forEach((button) => {
        button.addEventListener("click", () => {
          const nextKey = button.dataset.sort;
          direction = sortKey === nextKey && direction === "desc" ? "asc" : "desc";
          sortKey = nextKey;
          render();
        });
      });
    }

    input.addEventListener("input", render);
    render();
    document.querySelector("#panel-b2b .trend-card").after(shell);
  }

  ["apr", "may", "jun", "jul"].forEach(mountMonthlyLedger);
  mountB2BLedger();
})();
