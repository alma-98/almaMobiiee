(function () {
  "use strict";

  const STORAGE_KEY = "almaUsedCarSubmissionsV1";

  function getItems() {
    try {
      const data = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      return Array.isArray(data) ? data : [];

    } catch (error) {
      console.error(error);
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    );
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function statusText(status) {
    if (status === "approved") {
      return "Disetujui";
    }

    if (status === "rejected") {
      return "Ditolak";
    }

    return "Menunggu Review";
  }

  function render() {
    const list =
      document.getElementById("usedCarAdminList");

    const empty =
      document.getElementById("usedCarAdminEmpty");

    if (!list || !empty) return;

    const items = getItems();

    const pending =
      items.filter(function (item) {
        return item.status === "pending";
      }).length;

    const approved =
      items.filter(function (item) {
        return item.status === "approved";
      }).length;

    const pendingCount =
      document.getElementById(
        "usedCarPendingCount"
      );

    const approvedCount =
      document.getElementById(
        "usedCarApprovedCount"
      );

    if (pendingCount) {
      pendingCount.textContent = pending;
    }

    if (approvedCount) {
      approvedCount.textContent = approved;
    }

    if (!items.length) {
      list.innerHTML = "";
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    list.innerHTML = items.map(function (car) {

      const image = car.photo
        ? `
          <img
            src="${car.photo}"
            alt="${escapeHTML(
              car.brand + " " + car.model
            )}"
          >
        `
        : `
          <div class="alma-usedcar-admin-no-image">
            🚘
          </div>
        `;

      return `
        <article class="alma-usedcar-admin-card">

          <div class="alma-usedcar-admin-image">
            ${image}
          </div>

          <div class="alma-usedcar-admin-content">

            <div class="alma-usedcar-admin-title">

              <div>
                <small>
                  ${escapeHTML(car.id)}
                </small>

                <h3>
                  ${escapeHTML(car.brand)}
                  ${escapeHTML(car.model)}
                </h3>
              </div>

              <span class="
                alma-usedcar-status
                alma-usedcar-status-${escapeHTML(
                  car.status || "pending"
                )}
              ">
                ${statusText(car.status)}
              </span>

            </div>

            <div class="alma-usedcar-admin-data">

              <p>
                <strong>Penjual:</strong>
                ${escapeHTML(car.sellerName)}
              </p>

              <p>
                <strong>Nomor HP:</strong>
                ${escapeHTML(car.sellerPhone)}
              </p>

              <p>
                <strong>Tahun:</strong>
                ${escapeHTML(car.year)}
              </p>

              <p>
                <strong>Transmisi:</strong>
                ${escapeHTML(car.transmission)}
              </p>

              <p>
                <strong>Kilometer:</strong>
                ${Number(
                  car.mileage || 0
                ).toLocaleString("id-ID")}
              </p>

              <p>
                <strong>Lokasi:</strong>
                ${escapeHTML(car.location)}
              </p>

            </div>

            <div class="alma-usedcar-admin-description">
              ${escapeHTML(car.description)}
            </div>

            <div class="alma-usedcar-admin-actions">

              ${
                car.status !== "approved"
                  ? `
                    <button
                      type="button"
                      data-usedcar-action="approve"
                      data-usedcar-id="${escapeHTML(car.id)}"
                      class="alma-usedcar-action-approve"
                    >
                      Setujui & Publikasikan
                    </button>
                  `
                  : ""
              }

              ${
                car.status !== "rejected"
                  ? `
                    <button
                      type="button"
                      data-usedcar-action="reject"
                      data-usedcar-id="${escapeHTML(car.id)}"
                      class="alma-usedcar-action-reject"
                    >
                      Tolak
                    </button>
                  `
                  : ""
              }

              <button
                type="button"
                data-usedcar-action="delete"
                data-usedcar-id="${escapeHTML(car.id)}"
                class="alma-usedcar-action-delete"
              >
                Hapus
              </button>

            </div>

          </div>

        </article>
      `;
    }).join("");
  }

  function setStatus(id, status) {
    const items = getItems();

    const car = items.find(function (item) {
      return item.id === id;
    });

    if (!car) return;

    car.status = status;

    if (status === "approved") {
      car.approvedAt = Date.now();
    }

    saveItems(items);
    render();
  }

  function removeItem(id) {
    if (
      !confirm(
        "Hapus pengajuan mobil ini?"
      )
    ) {
      return;
    }

    const items =
      getItems().filter(function (item) {
        return item.id !== id;
      });

    saveItems(items);
    render();
  }

  document.addEventListener(
    "click",
    function (event) {
      const button =
        event.target.closest(
          "[data-usedcar-action]"
        );

      if (!button) return;

      const action =
        button.dataset.usedcarAction;

      const id =
        button.dataset.usedcarId;

      if (action === "approve") {
        setStatus(id, "approved");
      }

      if (action === "reject") {
        setStatus(id, "rejected");
      }

      if (action === "delete") {
        removeItem(id);
      }
    }
  );

  document.addEventListener(
    "DOMContentLoaded",
    render
  );

  window.addEventListener(
    "storage",
    function (event) {
      if (event.key === STORAGE_KEY) {
        render();
      }
    }
  );

})();
