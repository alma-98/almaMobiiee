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
