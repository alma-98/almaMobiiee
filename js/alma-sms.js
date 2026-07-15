(function(){
  "use strict";

  const phone = "085283397198";

  window.almaOpenSMS = function(message){
    const modal = document.getElementById("almaSmsModal");
    const link = document.getElementById("almaSmsAction");

    if(!modal || !link) return;

    const text = message ||
      "Halo Alma, saya tertarik dengan kendaraan, promo, atau aksesori di almaMobiiee. Mohon informasinya.";

    link.href = "sms:" + phone + "?body=" + encodeURIComponent(text);

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  window.almaCloseSMS = function(){
    const modal = document.getElementById("almaSmsModal");

    if(!modal) return;

    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  document.addEventListener("DOMContentLoaded", function(){
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
