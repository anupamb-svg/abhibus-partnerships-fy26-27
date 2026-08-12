(function () {
  const nav = document.querySelector(".tabs");
  const main = document.querySelector("main");
  if (!nav || !main || document.querySelector('[data-tab="pipeline"]')) return;

  const tab = document.createElement("button");
  tab.setAttribute("role", "tab");
  tab.setAttribute("aria-selected", "false");
  tab.setAttribute("aria-controls", "panel-pipeline");
  tab.id = "tab-pipeline";
  tab.dataset.tab = "pipeline";
  tab.tabIndex = -1;
  tab.innerHTML = "<span>06</span>Aug–Sep";
  nav.append(tab);

  const panel = document.createElement("section");
  panel.className = "tab-panel pipeline-panel";
  panel.id = "panel-pipeline";
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", "tab-pipeline");
  panel.dataset.panel = "pipeline";
  panel.hidden = true;
  panel.innerHTML = `
    <header class="month-intro pipeline-intro">
      <div><p class="eyebrow">August execution · September runway</p><h2>Seven moves executed.<br>Thirty-one opportunities progressing.</h2></div>
      <p>A consolidated August–September view across media reach, payments, rewards, API distribution and college communities. Executed items are separated clearly from the active pipeline.</p>
    </header>

    <div class="metric-grid pipeline-metrics">
      <article><span>August executed</span><strong>7</strong><small>Recorded activations</small></article>
      <article><span>In pipeline</span><strong>31</strong><small>Active opportunity set</small></article>
      <article><span>Workstreams</span><strong>6</strong><small>Media · fintech · API · rewards · campus · community</small></article>
      <article><span>Planning window</span><strong>2 mo</strong><small>August and September</small></article>
    </div>

    <section class="pipeline-section executed-section">
      <div class="section-heading"><p>Delivered in August</p><h3>Executed partnerships</h3></div>
      <div class="executed-grid">
        <article class="execution-card feature">
          <div><span class="status-chip done">Executed</span><small>Sports & media</small></div>
          <strong>01</strong><h4>Assam Premier League</h4>
          <p>Partnership visibility telecast on Star Sports and JioHotstar.</p>
        </article>
        <article class="execution-card">
          <div><span class="status-chip done">Executed</span><small>Payments</small></div>
          <strong>02</strong><h4>BHIM UPI × RuPay Credit Card</h4>
          <p>Partner offer executed during August.</p>
        </article>
        <article class="execution-card">
          <div><span class="status-chip done">Executed</span><small>App alliance</small></div>
          <strong>03</strong><h4>Bachatt App</h4>
          <p>App partnership executed during August.</p>
        </article>
        <article class="execution-card">
          <div><span class="status-chip done">Executed</span><small>Event</small></div>
          <strong>04</strong><h4>EBN Connect 2026</h4>
          <p>Event partnership executed during August.</p>
        </article>
        <article class="execution-card">
          <div><span class="status-chip done">Executed</span><small>API · B2B</small></div>
          <strong>05</strong><h4>Jai Steel</h4>
          <p>API partnership executed with the Jai Steel B2B portal.</p>
        </article>
        <article class="execution-card">
          <div><span class="status-chip done">Executed</span><small>Gifting</small></div>
          <strong>06</strong><h4>IGP</h4>
          <p>Gifting partnership executed during August.</p>
        </article>
        <article class="execution-card feature">
          <div><span class="status-chip done">Live in August</span><small>UPI · Payments</small></div>
          <strong>07</strong><h4>Paytm UPI Offer</h4>
          <p>Paytm UPI offer went live in August.</p>
        </article>
      </div>
    </section>

    <section class="pipeline-section opportunity-section">
      <div class="section-heading"><p>August–September runway</p><h3>Partnership pipeline</h3></div>
      <div class="pipeline-board">
        <article><header><span>Media & reach</span><b>4</b></header><ul>
          <li><i></i><div><strong>Red FM</strong><small>RJ mentions · Karnataka</small></div></li>
          <li><i></i><div><strong>Sun TV</strong><small>Media partnership</small></div></li>
          <li><i></i><div><strong>Jio</strong><small>Digital ecosystem</small></div></li>
          <li><i></i><div><strong>HPCL</strong><small>Petrol-pump visibility · Uttar Pradesh</small></div></li>
        </ul></article>
        <article><header><span>Travel & API</span><b>6</b></header><ul>
          <li><i></i><div><strong>Thomas Cook</strong><small>Travel partnership</small></div></li>
          <li><i></i><div><strong>Rupenet</strong><small>Distribution integration</small></div></li>
          <li><i></i><div><strong>CSC</strong><small>API partnership</small></div></li>
          <li><i></i><div><strong>Biltrip</strong><small>Travel partnership</small></div></li>
          <li><i></i><div><strong>Customer Capital</strong><small>API partnership</small></div></li>
          <li><i></i><div><strong>Akbar Travels B2B</strong><small>API partnership</small></div></li>
        </ul></article>
        <article><header><span>Fintech & payments</span><b>7</b></header><ul>
          <li><i></i><div><strong>Cache</strong><small>Partner opportunity</small></div></li>
          <li><i></i><div><strong>BharatPe</strong><small>Payments ecosystem</small></div></li>
          <li><i></i><div><strong>CRED</strong><small>5 lakh codes for credit-card payment users</small></div></li>
          <li><i></i><div><strong>YES Bank</strong><small>Bank campaign</small></div></li>
          <li><i></i><div><strong>Canara Bank</strong><small>UPI offer</small></div></li>
          <li><i></i><div><strong>Slice</strong><small>Fintech partnership</small></div></li>
          <li><i></i><div><strong>Extraa</strong><small>Rewards / payments opportunity</small></div></li>
        </ul></article>
        <article><header><span>Rewards & enterprise</span><b>5</b></header><ul>
          <li><i></i><div><strong>Pluxee Pro 6.0</strong><small>Enterprise rewards opportunity</small></div></li>
          <li><i></i><div><strong>Xoxoday</strong><small>Rewards partnership</small></div></li>
          <li><i></i><div><strong>Pluxee Gifting Season</strong><small>Seasonal gifting campaign</small></div></li>
          <li><i></i><div><strong>Hero GoodLife</strong><small>Loyalty campaign</small></div></li>
          <li><i></i><div><strong>Fitpass</strong><small>Lifestyle rewards partnership</small></div></li>
        </ul></article>
        <article><header><span>Campus & festivals</span><b>8</b></header><ul>
          <li><i></i><div><strong>UNiDAYS</strong><small>College events</small></div></li>
          <li><i></i><div><strong>Poornima University</strong><small>College event</small></div></li>
          <li><i></i><div><strong>Festember</strong><small>Campus festival</small></div></li>
          <li><i></i><div><strong>IIT Madras</strong><small>College event</small></div></li>
          <li><i></i><div><strong>IIT Bombay · Thomso</strong><small>Campus festival opportunity</small></div></li>
          <li><i></i><div><strong>IIM Indore</strong><small>College event</small></div></li>
          <li><i></i><div><strong>LPU AI Summit</strong><small>Technology summit</small></div></li>
          <li><i></i><div><strong>Hack 4.0</strong><small>Innovation event</small></div></li>
        </ul></article>
        <article><header><span>Founder community</span><b>1</b></header><ul>
          <li><i></i><div><strong>ElevAra Founder Circle</strong><small>Founder-community event</small></div></li>
        </ul></article>
      </div>
    </section>

    <section class="pipeline-note">
      <div><span>NOW</span><strong>August execution</strong><p>Seven activations recorded across sports media, payments, apps, gifting, events and B2B API distribution—including the Paytm UPI offer going live in August.</p></div>
      <i aria-hidden="true"></i>
      <div><span>NEXT</span><strong>August–September pipeline</strong><p>Thirty-one opportunities remain active across six workstreams. Item-level owners and committed dates were not supplied, so the dashboard retains the shared August–September planning window.</p></div>
    </section>`;
  main.append(panel);

  const style = document.createElement("style");
  style.textContent = `
    .tabs{grid-template-columns:repeat(7,1fr)}
    .pipeline-intro .eyebrow{color:#7b4ac6}
    .pipeline-metrics article:nth-child(1){border-top:4px solid var(--green)}
    .pipeline-metrics article:nth-child(2){border-top:4px solid #7b4ac6}
    .pipeline-section{max-width:1450px;margin:0 auto 78px}
    .executed-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .execution-card{position:relative;min-height:240px;padding:25px;background:#fff;border:1px solid var(--line);border-radius:15px;box-shadow:var(--shadow);overflow:hidden}
    .execution-card.feature{grid-column:span 2;background:linear-gradient(135deg,#0a1d33 0%,#153c5b 100%);color:#fff}
    .execution-card>div{display:flex;align-items:center;justify-content:space-between;gap:12px}
    .execution-card>div small{color:var(--muted);font-size:9px;font-weight:850;letter-spacing:.08em;text-transform:uppercase}
    .execution-card.feature>div small{color:#b8c9d8}
    .status-chip{display:inline-flex;padding:6px 9px;border-radius:999px;font-size:8px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
    .status-chip.done{background:#dff3ec;color:var(--green)}
    .execution-card>strong{position:absolute;right:20px;bottom:-18px;color:#eef1f4;font-size:100px;line-height:1;letter-spacing:-.08em}
    .execution-card.feature>strong{color:rgba(255,255,255,.08)}
    .execution-card h4{position:relative;margin:42px 0 10px;max-width:80%;font-size:22px;line-height:1.15;letter-spacing:-.025em}
    .execution-card p{position:relative;max-width:75%;margin:0;color:var(--muted);font-size:12px;line-height:1.55}
    .execution-card.feature p{color:#c4d0dc}
    .pipeline-board{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .pipeline-board>article{background:#fff;border:1px solid var(--line);border-radius:15px;overflow:hidden;box-shadow:var(--shadow)}
    .pipeline-board header{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;background:#f3eefb;border-bottom:1px solid #e2d7f1}
    .pipeline-board header span{font-size:10px;font-weight:900;letter-spacing:.09em;text-transform:uppercase;color:#5a397e}
    .pipeline-board header b{display:grid;place-items:center;width:27px;height:27px;border-radius:50%;background:#7b4ac6;color:#fff;font-size:11px}
    .pipeline-board ul{list-style:none;margin:0;padding:6px 20px 12px}
    .pipeline-board li{display:flex;gap:11px;align-items:flex-start;padding:15px 0;border-bottom:1px solid var(--line)}
    .pipeline-board li:last-child{border-bottom:0}
    .pipeline-board li i{width:8px;height:8px;margin-top:4px;border-radius:50%;background:#f2a65d;box-shadow:0 0 0 4px #fff0df}
    .pipeline-board li div{min-width:0}
    .pipeline-board li strong,.pipeline-board li small{display:block}
    .pipeline-board li strong{font-size:13px}
    .pipeline-board li small{margin-top:4px;color:var(--muted);font-size:10px;line-height:1.4}
    .pipeline-note{max-width:1450px;margin:0 auto;display:grid;grid-template-columns:1fr 80px 1fr;align-items:center;padding:30px;background:#efe9f8;border-radius:16px}
    .pipeline-note div span,.pipeline-note div strong,.pipeline-note div p{display:block}
    .pipeline-note div span{color:#7b4ac6;font-size:9px;font-weight:900;letter-spacing:.13em}
    .pipeline-note div strong{margin:9px 0;font-size:18px}
    .pipeline-note div p{margin:0;color:#596678;font-size:12px;line-height:1.55}
    .pipeline-note>i{display:block;height:2px;margin:0 18px;background:#bca6da;position:relative}
    .pipeline-note>i:after{content:"";position:absolute;right:-1px;top:-4px;border-left:8px solid #7b4ac6;border-top:5px solid transparent;border-bottom:5px solid transparent}
    @media(max-width:1000px){.executed-grid{grid-template-columns:1fr 1fr}.pipeline-board{grid-template-columns:1fr 1fr}}
    @media(max-width:700px){.executed-grid,.pipeline-board{grid-template-columns:1fr}.execution-card.feature{grid-column:span 1}.pipeline-note{grid-template-columns:1fr;gap:20px}.pipeline-note>i{width:2px;height:36px;margin:0 0 0 8px}.pipeline-note>i:after{right:-4px;top:auto;bottom:-1px;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid #7b4ac6;border-bottom:0}}
  `;
  document.head.append(style);

  const heroEyebrow = document.querySelector(".hero .eyebrow");
  if (heroEyebrow) heroEyebrow.textContent = "Executive performance hub · August update + September pipeline";
  const heroCopy = document.querySelector(".hero-copy > p:last-child");
  if (heroCopy) heroCopy.textContent = "Explore each month independently, review B2B distribution performance, and track the August–September partnership runway in one place.";
  const footerSource = document.querySelector("footer small");
  if (footerSource) footerSource.textContent += " August–September execution and pipeline status uses the latest Alliance Status update and management inputs.";

  document.addEventListener("DOMContentLoaded", () => {
    if (location.hash.slice(1) === "pipeline" && typeof activate === "function") activate("pipeline", false);
  });
})();
