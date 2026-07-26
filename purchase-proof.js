/* Purchasing proof-of-purchase upload for the browser demo. */
(() => {
  const baseCard = card;
  const baseAct = act;

  window.card = function (request) {
    if (role !== "purchasing") return baseCard(request);
    const itemSummary = request.items.map(item => `${item.name} (${item.qty} ${item.unit || "pcs"})`).join(", ");
    const proof = request.purchaseProof;
    const proofBlock = `<div class="purchase-proof"><div><strong>Proof of purchase <span class="required-mark">*</span></strong><p>Upload the supplier receipt, invoice, or a screenshot/photo of the purchase.</p></div><label class="proof-upload"><span>Choose image</span><input data-proof-file="${request.id}" type="file" accept="image/png,image/jpeg,image/webp" /></label>${proof ? `<div class="proof-file"><span>✓ ${proof.name}</span><button class="text-button" data-view-proof="${request.id}" type="button">View proof</button></div>` : "<small class=\"muted\">A proof image is required before the purchase can be recorded.</small>"}</div>`;
    const stockEntry = `<div class="procurement-stock"><strong>Received / available quantity</strong>${request.items.map((item, index) => `<label>${item.name}<span>Requested: ${item.qty} ${item.unit || "pcs"}</span><input data-stock-request="${request.id}" data-stock-index="${index}" type="number" min="0" value="${item.onHand || 0}" /></label>`).join("")}</div>`;
    return `<article class="queue-item"><span class="status-pill ${statusClass(request.status)}">${stageLabel(request.status)}</span><h3>${request.title}</h3><div class="queue-meta"><span>${request.id}</span><span>•</span><span>${request.department}</span><span>•</span><span>${money(request.total)}</span></div><p>${request.purpose}</p><small><strong>Items:</strong> ${itemSummary}</small>${stockEntry}${proofBlock}<div class="queue-actions"><button class="primary-button" data-action="procured" data-id="${request.id}">Save purchase &amp; notify Custodian</button><button class="text-button" data-detail="${request.id}">View details</button></div></article>`;
  };

  window.act = function (action, id, value) {
    if (action !== "procured") return baseAct(action, id, value);
    const request = requests.find(r => r.id === id);
    if (!request) return;
    const file = document.querySelector(`[data-proof-file="${id}"]`)?.files?.[0];
    if (!file && !request.purchaseProof) {
      toast("Upload a proof of purchase before saving this purchase.");
      return;
    }
    if (!file) return baseAct(action, id, value);
    if (file.size > 3 * 1024 * 1024) {
      toast("Use an image smaller than 3 MB for this demo.");
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      request.purchaseProof = { name: file.name, type: file.type, data: reader.result };
      history(request, `Uploaded proof of purchase: ${file.name}`);
      save();
      baseAct(action, id, value);
    });
    reader.readAsDataURL(file);
  };

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-view-proof]");
    if (!button) return;
    const proof = requests.find(r => r.id === button.dataset.viewProof)?.purchaseProof;
    if (!proof) return;
    const preview = window.open("", "RPMS proof", "width=900,height=700");
    if (preview) preview.document.write(`<title>Proof of purchase</title><img src="${proof.data}" alt="${proof.name}" style="display:block;max-width:100%;max-height:92vh;margin:auto" />`);
  });

  render();
})();
