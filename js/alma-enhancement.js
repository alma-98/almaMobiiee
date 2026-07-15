(function(){
  "use strict";

  const SMS_NUMBER = "085283397198";

  window.almaOpenSMS = function(message){
    const modal = document.getElementById("almaSmsModal");
    const action = document.getElementById("almaSmsAction");

    const text = message ||
      "Halo Alma, saya tertarik dengan kendaraan, mobil second, accessories, atau promo di almaMobiiee. Mohon informasinya.";

    if(action){
      action.href =
        "sms:" +
        SMS_NUMBER +
        "?body=" +
        encodeURIComponent(text);
    }

    if(modal){
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  };

  window.almaCloseSMS = function(){
    const modal = document.getElementById("almaSmsModal");

    if(modal){
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  };

  document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll(
      'a[href*="wa.me"],' +
      'a[href*="whatsapp.com"],' +
      'a[href*="api.whatsapp.com"]'
    ).forEach(function(element){
      element.remove();
    });

    const modal = document.getElementById("almaSmsModal");

    if(modal){
      modal.addEventListener("click", function(event){
        if(event.target === modal){
          almaCloseSMS();
        }
      });
    }

    document.addEventListener("keydown", function(event){
      if(event.key === "Escape"){
        almaCloseSMS();
      }
    });
  });
})();

/* ==========================================================
   USED CAR 2.5% PAYMENT SIMULATION
========================================================== */

(function(){

  "use strict";

  const FEE_RATE = 0.025;

  function rupiah(value){

    return new Intl.NumberFormat(
      "id-ID",
      {
        style:"currency",
        currency:"IDR",
        maximumFractionDigits:0
      }
    ).format(
      Number(value) || 0
    );

  }


  function findField(words){

    const fields =
      Array.from(
        document.querySelectorAll(
          'input, textarea, select'
        )
      );

    return fields.find(field => {

      const haystack = [
        field.name,
        field.id,
        field.placeholder,
        field.getAttribute("aria-label")
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return words.some(
        word =>
          haystack.includes(
            word.toLowerCase()
          )
      );

    });

  }


  document.addEventListener(
    "DOMContentLoaded",
    function(){

      const ownerInput =
        findField([
          "ownerName",
          "nama pemilik",
          "pemilik"
        ]);

      const phoneInput =
        findField([
          "phone",
          "nomor hp",
          "telepon"
        ]);

      const carInput =
        findField([
          "car",
          "merek",
          "tipe mobil",
          "kendaraan"
        ]);

      const yearInput =
        findField([
          "year",
          "tahun"
        ]);

      const priceInput =
        findField([
          "price",
          "harga mobil",
          "harga kendaraan"
        ]);


      if(!priceInput){
        console.warn(
          "Input harga mobil tidak ditemukan."
        );

        return;
      }


      let feeBox =
        document.getElementById(
          "almaUsedCarFeeResult"
        );


      if(!feeBox){

        feeBox =
          document.createElement("div");

        feeBox.id =
          "almaUsedCarFeeResult";

        feeBox.className =
          "alma-fee-result";

        feeBox.innerHTML = `
          <small>
            Estimasi biaya layanan 2,5%
          </small>

          <strong id="almaUsedCarFee">
            Rp0
          </strong>

          <span>
            Nominal ini akan menjadi total pembayaran QRIS.
          </span>
        `;

        priceInput
          .parentElement
          .insertAdjacentElement(
            "afterend",
            feeBox
          );

      }


      const feeOutput =
        document.getElementById(
          "almaUsedCarFee"
        );


      function calculate(){

        const price =
          Number(
            String(
              priceInput.value || ""
            )
              .replace(/[^\d]/g,"")
          ) || 0;

        const fee =
          Math.round(
            price * FEE_RATE
          );

        if(feeOutput){
          feeOutput.textContent =
            rupiah(fee);
        }

        return {
          price,
          fee
        };

      }


      priceInput.addEventListener(
        "input",
        calculate
      );


      calculate();


      const modal =
        document.getElementById(
          "almaUsedCarPaymentModal"
        );

      const closeButton =
        document.getElementById(
          "almaUsedCarPaymentClose"
        );

      const confirmButton =
        document.getElementById(
          "almaConfirmUsedCarPayment"
        );


      if(!modal){
        return;
      }


      let pendingSubmitButton = null;


      const possibleButtons =
        Array.from(
          document.querySelectorAll(
            'button, input[type="submit"]'
          )
        );


      const submitButton =
        possibleButtons.find(
          button => {

            const text =
              (
                button.textContent ||
                button.value ||
                ""
              )
                .trim()
                .toLowerCase();

            return (
              text.includes(
                "lanjutkan pendaftaran"
              )
              ||
              text.includes(
                "daftarkan kendaraan"
              )
            );

          }
        );


      function openPaymentModal(){

        const result =
          calculate();


        if(result.price <= 0){

          alert(
            "Masukkan harga mobil terlebih dahulu."
          );

          priceInput.focus();

          return false;
        }


        const owner =
          ownerInput?.value?.trim()
          || "-";

        const car =
          carInput?.value?.trim()
          || "-";


        document
          .getElementById(
            "almaSummaryOwner"
          )
          .textContent =
          owner;


        document
          .getElementById(
            "almaSummaryCar"
          )
          .textContent =
          car;


        document
          .getElementById(
            "almaSummaryPrice"
          )
          .textContent =
          rupiah(
            result.price
          );


        document
          .getElementById(
            "almaSummaryFee"
          )
          .textContent =
          rupiah(
            result.fee
          );


        document
          .getElementById(
            "almaQrisAmount"
          )
          .textContent =
          rupiah(
            result.fee
          );


        modal
          .classList
          .add("active");


        document.body.style.overflow =
          "hidden";


        return true;

      }


      function closePaymentModal(){

        modal
          .classList
          .remove("active");

        document.body.style.overflow =
          "";

      }


      if(submitButton){

        submitButton.addEventListener(
          "click",
          function(event){

            if(
              submitButton.dataset
                .almaPaymentConfirmed
              ===
              "true"
            ){

              submitButton.dataset
                .almaPaymentConfirmed =
                "false";

              return;

            }


            event.preventDefault();

            event.stopImmediatePropagation();


            pendingSubmitButton =
              submitButton;


            openPaymentModal();

          },
          true
        );

      }


      closeButton?.addEventListener(
        "click",
        closePaymentModal
      );


      modal.addEventListener(
        "click",
        function(event){

          if(event.target === modal){
            closePaymentModal();
          }

        }
      );


      confirmButton?.addEventListener(
        "click",
        function(){

          if(!pendingSubmitButton){
            return;
          }


          const result =
            calculate();


          if(result.fee <= 0){
            return;
          }


          pendingSubmitButton.dataset
            .almaPaymentConfirmed =
            "true";


          closePaymentModal();


          pendingSubmitButton.click();

        }
      );


      document.addEventListener(
        "keydown",
        function(event){

          if(event.key === "Escape"){
            closePaymentModal();
          }

        }
      );

    }
  );

})();

