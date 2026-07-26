/* Final requester receipt confirmation after Custodian release. */
(() => {
  const baseAct = act;
  const baseDetail = detail;
  const baseStageLabel = stageLabel;
  const baseStatusClass = statusClass;

  window.stageLabel = status => status === "Awaiting Requester Confirmation" ? "Awaiting requester confirmation" : baseStageLabel(status);
  window.statusClass = status => status === "Awaiting Requester Confirmation" ? "warning" : baseStatusClass(status);

  window.act = function (action, id, value) {
    const request = requests.find(r => r.id === id);
    if (!request) return;
    if (action === "release-item") {
      const item = request.items[Number(value)];
      if (!item) return;
      item.released = true;
      history(request, `Custodian released ${item.name} to the requester`);
      if (request.items.every(entry => entry.released)) {
        request.status = "Awaiting Requester Confirmation";
        history(request, "All items released; awaiting requester confirmation of receipt");
      }
      save();
      render();
      toast(request.status === "Awaiting Requester Confirmation" ? "All items released. The requester has been asked to confirm receipt." : "Item released.");
      return;
    }
    if (action === "confirm-receipt") {
      request.status = "Completed";
      request.receiptConfirmed = true;
      history(request, "Requester confirmed receipt of all released items");
      save();
      $("#modalBackdrop").classList.remove("open");
      render();
      toast("Receipt confirmed. This requisition is now completed.");
      return;
    }
    return baseAct(action, id, value);
  };

  window.detail = function (id) {
    baseDetail(id);
    const request = requests.find(r => r.id === id);
    if (role !== "requester" || request?.status !== "Awaiting Requester Confirmation") return;
    $("#modalContent").insertAdjacentHTML("beforeend", `<div class="decision-box receipt-confirmation"><strong>Items released by Custodian</strong><p>Please confirm that you have received all items listed in this requisition. This will complete the request.</p><button class="primary-button" data-action="confirm-receipt" data-id="${request.id}">Confirm receipt of items</button></div>`);
  };

  render();
})();
