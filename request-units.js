/* Requisition quantity units for the requester form and request details. */
(() => {
  window.renderNew = function () {
    $("#new-request").innerHTML = `<div class="section-heading"><div><p class="eyebrow">NEW REQUISITION</p><h2>Requisition slip</h2><p>Complete the digital version of the current requisition form. It will be sent to the Coordinator when submitted.</p></div></div><form class="request-form" id="requestForm"><section class="card form-section requisition-slip"><h3>Requisition details</h3><div class="form-grid"><label>Requested by<input value="${people.requester.name}" readonly /></label><label>Department<select required name="department"><option value="">Select department</option><option>Academic Affairs</option><option>Facilities &amp; Maintenance</option><option>Student Services</option><option>Technology</option><option>Administration</option></select></label><label>Request title<input required name="title" placeholder="e.g., Grade 6 science materials" /></label><label>Type of request<select required name="requestType"><option value="">Select type</option><option>Riso graphing</option><option>Food</option><option>Cash</option><option>Materials / Supplies</option></select></label><label>Item<input required name="item" placeholder="e.g., Bond paper" /></label><label>Description of item<textarea required name="description" rows="2" placeholder="Specifications, purpose, size, brand, or other important details."></textarea></label><label>Quantity<input required name="qty" min="1" type="number" value="1" /></label><label>Unit<select required name="unit"><option value="pcs">Pieces (pcs)</option><option value="boxes">Boxes</option><option value="packs">Packs</option><option value="bundles">Bundles</option><option value="sets">Sets</option><option value="reams">Reams</option><option value="rolls">Rolls</option><option value="bottles">Bottles</option><option value="cans">Cans</option><option value="pairs">Pairs</option><option value="kilograms">Kilograms</option><option value="liters">Liters</option><option value="meters">Meters</option></select></label><label>Date needed<input required name="neededBy" type="date" /></label><label>Charge account<input name="account" placeholder="e.g., 2026-EDU-014" /></label></div><div class="riso-options" id="risoOptions"><h3>For Riso graphing requests only</h3><div class="form-grid"><label>Print side<select name="printSide"><option>Single-sided</option><option>Double-sided</option></select></label><label>Paper size<input name="paperSize" placeholder="e.g., A4" /></label></div></div></section><div class="form-actions"><button class="primary-button" type="submit">Submit to Coordinator →</button></div></form>`;
    const type = $("#requestForm select[name='requestType']");
    type.addEventListener("change", event => $("#risoOptions").classList.toggle("show", event.target.value === "Riso graphing"));
    $("#requestForm").addEventListener("submit", submitRequest);
  };

  window.submitRequest = function (event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const qty = Number(data.get("qty"));
    const request = {
      id: `REQ-2026-${1050 + requests.length}`,
      title: data.get("title"), department: data.get("department"), date: "Today",
      neededBy: data.get("neededBy"), account: data.get("account"), requestType: data.get("requestType"),
      printSide: data.get("printSide"), paperSize: data.get("paperSize"), total: 0,
      status: "Coordinator Review", requester: people.requester.name, purpose: data.get("description"),
      items: [{ name: data.get("item"), description: data.get("description"), qty, unit: data.get("unit"), price: 0, onHand: 0 }],
      history: [{ by: people.requester.name, event: `Submitted ${data.get("requestType")} request`, at: "Just now" }]
    };
    requests.unshift(request);
    save();
    changeView("requests");
    toast("Requisition slip submitted to the Coordinator.");
  };

  window.detail = function (id) {
    const request = requests.find(r => r.id === id);
    if (!request) return;
    const partial = request.status === "Partial Release Decision" && role === "requester" ? `<div class="decision-box"><strong>Partial release available</strong><p>Some items are in stock. Choose whether to receive them now or hold the request until all items arrive.</p><button class="primary-button" data-action="partial-accept" data-id="${request.id}">Accept partial release</button><button class="secondary-button" data-action="partial-hold" data-id="${request.id}">Hold for all items</button></div>` : "";
    $("#modalTitle").textContent = request.title;
    $("#modalContent").innerHTML = `<div class="detail-grid"><div><span>Request ID</span><strong>${request.id}</strong></div><div><span>Request type</span><strong>${request.requestType || "Materials / Supplies"}</strong></div><div><span>Current stage</span><strong>${stageLabel(request.status)}</strong></div><div><span>Requester</span><strong>${request.requester}</strong></div><div><span>Date needed</span><strong>${request.neededBy || "Not specified"}</strong></div><div><span>Charge account</span><strong>${request.account || "Not specified"}</strong></div><div><span>Estimated total</span><strong>${money(request.total)}</strong></div><div><span>Purpose</span><strong>${request.purpose}</strong></div></div><h3>Items and availability</h3><div class="table-wrap"><table><thead><tr><th>Item</th><th>Description</th><th>Requested</th><th>On hand</th></tr></thead><tbody>${request.items.map(item => `<tr><td>${item.name}</td><td>${item.description || "—"}</td><td>${item.qty} ${item.unit || "pcs"}</td><td>${item.onHand}</td></tr>`).join("")}</tbody></table></div>${request.requestType === "Riso graphing" ? `<p class="riso-summary"><strong>Riso graphing:</strong> ${request.printSide || "Single-sided"} · ${request.paperSize || "Paper size not specified"}</p>` : ""}${partial}<h3>Activity</h3><ol class="timeline">${request.history.map(entry => `<li><strong>${entry.event}</strong><span>${entry.by} · ${entry.at}</span></li>`).join("")}</ol>`;
    $("#modalBackdrop").classList.add("open");
  };

  render();
})();
