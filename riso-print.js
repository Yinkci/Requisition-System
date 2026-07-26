/* Conditional Riso printing requirements and file attachment. */
(() => {
  const baseDetail = detail;

  window.renderNew = function () {
    $("#new-request").innerHTML = `<div class="section-heading"><div><p class="eyebrow">NEW REQUISITION</p><h2>Requisition slip</h2><p>Complete the digital version of the current requisition form. It will be sent to the Coordinator when submitted.</p></div></div><form class="request-form" id="requestForm"><section class="card form-section requisition-slip"><h3>Requisition details</h3><div class="form-grid"><label>Requested by<input value="${people.requester.name}" readonly /></label><label>Department<select required name="department"><option value="">Select department</option><option>Academic Affairs</option><option>Facilities &amp; Maintenance</option><option>Student Services</option><option>Technology</option><option>Administration</option></select></label><label>Request title<input required name="title" placeholder="e.g., Grade 6 science materials" /></label><label>Type of request<select required name="requestType"><option value="">Select type</option><option>Riso graphing</option><option>Food</option><option>Cash</option><option>Materials / Supplies</option></select></label><label>Item<input required name="item" placeholder="e.g., Bond paper" /></label><label>Description of item<textarea required name="description" rows="2" placeholder="Specifications, purpose, size, brand, or other important details."></textarea></label><label>Quantity<input required name="qty" min="1" type="number" value="1" /></label><label>Unit<select required name="unit"><option value="pcs">Pieces (pcs)</option><option value="boxes">Boxes</option><option value="packs">Packs</option><option value="bundles">Bundles</option><option value="sets">Sets</option><option value="reams">Reams</option><option value="rolls">Rolls</option><option value="bottles">Bottles</option><option value="cans">Cans</option><option value="pairs">Pairs</option><option value="kilograms">Kilograms</option><option value="liters">Liters</option><option value="meters">Meters</option></select></label><label>Date needed<input required name="neededBy" type="date" /></label><label>Charge account<input name="account" placeholder="e.g., 2026-EDU-014" /></label></div><div class="riso-options" id="risoOptions"><h3>For Riso graphing requests only</h3><p class="muted">Choose the required print side and attach the document or image to print.</p><div class="riso-choice"><label><input name="printSides" type="checkbox" value="Single-sided" /> Single-sided</label><label><input name="printSides" type="checkbox" value="Double-sided" /> Double-sided</label></div><div class="form-grid"><label>Paper size<input name="paperSize" placeholder="e.g., A4" /></label><label>File to print<input name="risoFile" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,image/png,image/jpeg,image/webp" /></label></div></div></section><div class="form-actions"><button class="primary-button" type="submit">Submit to Coordinator →</button></div></form>`;
    const type = $("#requestForm select[name='requestType']");
    type.addEventListener("change", event => $("#risoOptions").classList.toggle("show", event.target.value === "Riso graphing"));
    $("#requestForm").addEventListener("submit", submitRequest);
  };

  window.submitRequest = function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const isRiso = data.get("requestType") === "Riso graphing";
    const sides = data.getAll("printSides");
    const file = form.elements.risoFile.files[0];
    if (isRiso && !sides.length) return toast("Choose single-sided or double-sided printing.");
    if (isRiso && !file) return toast("Upload the file to print for this Riso request.");
    if (file && file.size > 3 * 1024 * 1024) return toast("Use a print file smaller than 3 MB for this demo.");
    const createRequest = attachment => ({
      id: `REQ-2026-${1050 + requests.length}`,
      title: data.get("title"), department: data.get("department"), date: "Today", neededBy: data.get("neededBy"),
      account: data.get("account"), requestType: data.get("requestType"), printSide: sides.join(" / "),
      paperSize: data.get("paperSize"), printAttachment: attachment, total: 0, status: "Coordinator Review",
      requester: people.requester.name, purpose: data.get("description"),
      items: [{ name: data.get("item"), description: data.get("description"), qty: Number(data.get("qty")), unit: data.get("unit"), price: 0, onHand: 0 }],
      history: [{ by: people.requester.name, event: `Submitted ${data.get("requestType")} request`, at: "Just now" }]
    });
    const finish = attachment => {
      requests.unshift(createRequest(attachment));
      save();
      changeView("requests");
      toast("Requisition slip submitted to the Coordinator.");
    };
    if (!file) return finish(null);
    const reader = new FileReader();
    reader.addEventListener("load", () => finish({ name: file.name, type: file.type, data: reader.result }));
    reader.readAsDataURL(file);
  };

  window.detail = function (id) {
    baseDetail(id);
    const attachment = requests.find(r => r.id === id)?.printAttachment;
    if (!attachment) return;
    const summary = $("#modalContent .riso-summary");
    if (summary) summary.insertAdjacentHTML("afterend", `<p class="riso-attachment"><strong>Print file:</strong> <a href="${attachment.data}" download="${attachment.name}">${attachment.name}</a></p>`);
  };

  const renderRisoForm = renderNew;
  window.renderNew = function () {
    renderRisoForm();
    $("#requestForm input[name='paperSize']")?.closest("label")?.remove();
  };

  const renderRisoDetail = detail;
  window.detail = function (id) {
    renderRisoDetail(id);
    const request = requests.find(r => r.id === id);
    const summary = $("#modalContent .riso-summary");
    if (request?.requestType === "Riso graphing" && summary) {
      summary.innerHTML = `<strong>Riso graphing:</strong> ${request.printSide || "Print side not specified"}`;
    }
  };

  render();
})();
