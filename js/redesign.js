(function(){
  "use strict";

  const SMS_NUMBER = "085283397198";

  const menuButton = document.getElementById("menuButton");
  const mainNav = document.getElementById("mainNav");
  const modal = document.getElementById("smsModal");
  const smsAction = document.getElementById("smsAction");

  if(menuButton && mainNav){
    menuButton.addEventListener("click", function(){
      mainNav.classList.toggle("active");
    });

    mainNav.querySelectorAll("a").forEach(function(link){
      link.addEventListener("click", function(){
        mainNav.classList.remove("active");
      });
    });
  }

  window.openSMS = function(message){
    const text =
      message ||
      "Halo Alma, saya menghubungi dari website almaMobiiee dan ingin konsultasi kendaraan.";

    if(smsAction){
      smsAction.href =
        "sms:" +
        SMS_NUMBER +
        "?body=" +
        encodeURIComponent(text);
    }

    if(modal){
      modal.classList.add("active");
      document.body.classList.add("modal-open");
    }
  };

  window.closeSMS = function(){
    if(modal){
      modal.classList.remove("active");
      document.body.classList.remove("modal-open");
    }
  };

  window.askCar = function(carName){
    openSMS(
      "Halo Alma, saya tertarik dengan " +
      carName +
      ". Mohon informasi dan penawarannya."
    );
  };

  if(modal){
    modal.addEventListener("click", function(event){
      if(event.target === modal){
        closeSMS();
      }
    });
  }

  document.addEventListener("keydown", function(event){
    if(event.key === "Escape"){
      closeSMS();
    }
  });

  const leadForm = document.getElementById("leadForm");

  if(leadForm){
    leadForm.addEventListener("submit", function(event){
      event.preventDefault();

      const name =
        document.getElementById("leadName").value.trim();

      const car =
        document.getElementById("leadCar").value;

      const message =
        document.getElementById("leadMessage").value.trim();

      const smsText =
        "Halo Alma, nama saya " +
        name +
        ". Saya tertarik dengan: " +
        car +
        "." +
        (message ? " Kebutuhan saya: " + message : "");

      openSMS(smsText);
    });
  }
})();
