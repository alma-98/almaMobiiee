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

  function formatRupiah(value) {
    const number = String(value || "")
      .replace(/[^\d]/g, "");

    if (!number) return "-";

    return "Rp " +
      Number(number).toLocaleString("id-ID");
  }

  function createId() {
    return "CAR-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase();
  }

  function readPhoto(file) {
    return new Promise(function (resolve, reject) {
      if (!file) {
        resolve("");
        return;
      }

      const reader = new FileReader();

      reader.onload = function () {
        resolve(reader.result || "");
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderCatalog() {
    const grid =
      document.getElementById("usedCarCatalogGrid");

    const empty =
      document.getElementById("usedCarCatalogEmpty");

    if (!grid || !empty) return;

    const cars = getItems()
      .filter(function (car) {
        return car.status === "approved";
      })
      .sort(function (a, b) {
        return (
          Number(b.approvedAt || b.createdAt || 0) -
          Number(a.approvedAt || a.createdAt || 0)
        );
      });

    if (!cars.length) {
      grid.innerHTML = "";
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    grid.innerHTML = cars.map(function (car) {
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
          <div class="alma-usedcar-no-image">
            🚘
          </div>
        `;

      return `
        <article class="alma-usedcar-card">

          <div class="alma-usedcar-card-image">
            ${image}

            <span class="alma-usedcar-approved-badge">
              Disetujui Admin
            </span>
          </div>

          <div class="alma-usedcar-card-body">

            <span class="alma-usedcar-meta">
              ${escapeHTML(car.year)}
              •
              ${escapeHTML(car.transmission)}
            </span>

            <h3>
              ${escapeHTML(car.brand)}
              ${escapeHTML(car.model)}
            </h3>

            <div class="alma-usedcar-specs">

              <span>
                <strong>Kilometer</strong>
                ${Number(
                  car.mileage || 0
                ).toLocaleString("id-ID")} KM
              </span>

              <span>
                <strong>Warna</strong>
                ${escapeHTML(car.color)}
              </span>

              <span>
                <strong>Lokasi</strong>
                ${escapeHTML(car.location)}
              </span>

            </div>

            <div class="alma-usedcar-card-footer">

              <div>
                <small>Harga Penawaran</small>

                <strong>
                  ${formatRupiah(car.price)}
                </strong>
              </div>

            </div>

          </div>

        </article>
      `;
    }).join("");
  }

  async function submitForm(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const button =
      form.querySelector('button[type="submit"]');

    const originalText =
      button ? button.textContent : "";

    try {
      if (button) {
        button.disabled = true;
        button.textContent = "Mengirim...";
      }

      const photoInput =
        document.getElementById("sellerCarPhoto");

      const file =
        photoInput &&
        photoInput.files &&
        photoInput.files[0]
          ? photoInput.files[0]
          : null;

      if (file && file.size > 1500000) {
        alert(
          "Ukuran foto maksimal 1,5 MB."
        );
        return;
      }

      const photo = await readPhoto(file);

      const car = {
        id: createId(),

        sellerName:
          document.getElementById("sellerName")
            ?.value.trim() || "",

        sellerPhone:
          document.getElementById("sellerPhone")
            ?.value.trim() || "",

        brand:
          document.getElementById("sellerCarBrand")
            ?.value.trim() || "",

        model:
          document.getElementById("sellerCarModel")
            ?.value.trim() || "",

        year:
          document.getElementById("sellerCarYear")
            ?.value || "",

        transmission:
          document.getElementById(
            "sellerCarTransmission"
          )?.value || "",

        mileage:
          document.getElementById(
            "sellerCarMileage"
          )?.value || "",

        color:
          document.getElementById("sellerCarColor")
            ?.value.trim() || "",

        location:
          document.getElementById(
            "sellerCarLocation"
          )?.value.trim() || "",

        price:
          document.getElementById("sellerCarPrice")
            ?.value.trim() || "",

        description:
          document.getElementById(
            "sellerCarDescription"
          )?.value.trim() || "",

        photo: photo,
        status: "pending",
        createdAt: Date.now()
      };

      const items = getItems();

      items.unshift(car);

      saveItems(items);

      form.reset();

      alert(
        "Pendaftaran berhasil dikirim. Mobil akan tampil di katalog setelah disetujui Admin."
      );

      renderCatalog();

    } catch (error) {
      console.error(error);

      alert(
        "Gagal menyimpan pendaftaran. Silakan coba lagi."
      );

    } finally {
      if (button) {
        button.disabled = false;
        button.textContent =
          originalText || "Kirim Pendaftaran";
      }
    }
  }

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      const form =
        document.getElementById(
          "usedCarSellerForm"
        );

      if (form) {
        form.addEventListener(
          "submit",
          submitForm
        );
      }

      renderCatalog();
    }
  );

  window.addEventListener(
    "storage",
    function (event) {
      if (event.key === STORAGE_KEY) {
        renderCatalog();
      }
    }
  );

})();
