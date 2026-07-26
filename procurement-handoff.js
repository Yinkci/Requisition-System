/* Custodian handoff for items received by Purchasing. */
(() => {
  const receivedByCustodian = () => requests.filter(r => r.status === "Custodian Receipt");
  const baseStageLabel = stageLabel;
  const baseAct = act;
  const baseRender = render;

  navByRole.custodian = [
    ["dashboard", "Dashboard"],
    ["inventory", "Availability queue"],
    ["stock", "Inventory"],
    ["from-purchasing", "For Purchasing"],
    ["queue", "Prepare & release"],
    ["requests", "Request history"]
  ];

  window.stageLabel = status => status === "Custodian Receipt" ? "From Purchasing" : baseStageLabel(status);

  window.renderNav = function () {
    const icons = { dashboard: "⌂", "new-request": "+", queue: "✓", inventory: "⌕", stock: "▣", "from-purchasing": "↙", requests: "▤", reports: "◫", users: "♙", settings: "⚙" };
    const links = navByRole[role] || [];
    $("#mainNav").innerHTML = links.map(([id, label]) => {
      const count = id === "queue" ? queueForRole().length
        : id === "inventory" ? requests.filter(r => r.status === "Custodian Check").length
        : id === "from-purchasing" ? receivedByCustodian().length : 0;
      return `<button class="nav-link ${id === view ? "active" : ""}" data-view="${id}"><span class="nav-icon">${icons[id] || "•"}</span>${label}${count ? `<b class="nav-count">${count}</b>` : ""}</button>`;
    }).join("");
  };

  window.renderFromPurchasing = function () {
    const arrivals = receivedByCustodian();
    $("#from-purchasing").innerHTML = `<div class="section-heading"><div><p class="eyebrow">CUSTODIAN</p><h2>For Purchasing</h2><p>Verify quantities received from Purchasing before moving the items to Prepare &amp; Release.</p></div></div><section class="card queue-card">${arrivals.map(r => `<article class="queue-item"><span class="status-pill info">Purchase received</span><h3>${r.title}</h3><div class="queue-meta"><span>${r.id}</span><span>•</span><span>${r.department}</span></div><p>Purchasing has recorded the following quantities for your confirmation.</p><div class="table-wrap"><table><thead><tr><th>Item</th><th>Requested</th><th>Received by Purchasing</th></tr></thead><tbody>${r.items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${i.onHand || 0}</td></tr>`).join("")}</tbody></table></div><div class="queue-actions"><button class="primary-button" data-action="receive-purchase" data-id="${r.id}">Confirm received &amp; prepare release</button><button class="text-button" data-detail="${r.id}">View details</button></div></article>`).join("") || "<p class=\"muted\">No items have been received from Purchasing.</p>"}</section>`;
  };

  window.act = function (action, id, value) {
    if (action === "procured") {
      const request = requests.find(r => r.id === id);
      if (!request) return;
      request.items.forEach((item, index) => {
        const input = document.querySelector(`[data-stock-request="${request.id}"][data-stock-index="${index}"]`);
        item.onHand = Math.max(0, Number(input?.value || 0));
      });
      const complete = request.items.every(item => item.onHand >= item.qty);
      request.status = complete ? "Custodian Receipt" : "Purchasing";
      history(request, complete
        ? "Purchasing recorded received quantities; Custodian notified to verify and prepare release"
        : "Purchasing recorded received quantities; remaining items are still being sourced");
      save();
      $("#modalBackdrop").classList.remove("open");
      render();
      toast(complete ? "Purchase recorded. The Custodian has been notified." : "Stock recorded. Remaining quantities are still in Purchasing.");
      return;
    }
    if (action === "receive-purchase") {
      const request = requests.find(r => r.id === id);
      if (!request) return;
      request.status = "Ready for Release";
      history(request, "Custodian confirmed quantities received from Purchasing; ready for release");
      save();
      view = "queue";
      render();
      toast("Items confirmed and moved to Prepare & Release.");
      return;
    }
    return baseAct(action, id, value);
  };

  window.render = function () {
    baseRender();
    renderFromPurchasing();
    if (view === "from-purchasing") $("#pageTitle").textContent = "For Purchasing";
  };

  render();
})();
