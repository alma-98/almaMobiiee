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
   USED CAR FEE SIMULATION 2.5% - NO PAYMENT POPUP
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
    ).format(Number(value) || 0);

  }

  function findPriceInput(){

    const fields = Array.from(
      document.querySelectorAll(
        'input[type="number"], input[type="text"]'
      )
    );

    return fields.find(field => {

      const text = [
        field.name,
        field.id,
        field.placeholder,
        field.getAttribute("aria-label")
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        text.includes("price") ||
        text.includes("harga mobil") ||
        text.includes("harga kendaraan")
      );

    });

  }

  document.addEventListener(
    "DOMContentLoaded",
    function(){

      const priceInput = findPriceInput();

      if(!priceInput){
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
            Dihitung otomatis dari harga kendaraan.
          </span>
        `;

        priceInput
          .parentElement
          .insertAdjacentElement(
            "afterend",
            feeBox
          );

      }

      const output =
        document.getElementById(
          "almaUsedCarFee"
        );

      function calculate(){

        const price =
          Number(
            String(priceInput.value || "")
              .replace(/[^\d]/g,"")
          ) || 0;

        const fee =
          Math.round(
            price * FEE_RATE
          );

        if(output){
          output.textContent =
            rupiah(fee);
        }

      }

      priceInput.addEventListener(
        "input",
        calculate
      );

      calculate();

    }
  );

})();

