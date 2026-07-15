(function(){
  const ALMA_SMS_NUMBER = "085283397198";

  function encodeSMSMessage(message){
    return encodeURIComponent(message);
  }

  window.openAlmaSMSPopup = function(message){
    const overlay = document.getElementById("almaSMSOverlay");
    const link = document.getElementById("almaSMSLink");

    const finalMessage =
      message ||
      "Halo Alma, saya tertarik dengan informasi kendaraan, promo, atau aksesori di almaMobiiee.";

    if(link){
      link.href =
        "sms:" +
        ALMA_SMS_NUMBER +
        "?body=" +
        encodeSMSMessage(finalMessage);
    }

    if(overlay){
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  };

  window.closeAlmaSMSPopup = function(){
    const overlay = document.getElementById("almaSMSOverlay");

    if(overlay){
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  };

  document.addEventListener("DOMContentLoaded", function(){
    const overlay = document.getElementById("almaSMSOverlay");

    if(overlay){
      overlay.addEventListener("click", function(event){
        if(event.target === overlay){
          closeAlmaSMSPopup();
        }
      });
    }

    document.addEventListener("keydown", function(event){
      if(event.key === "Escape"){
        closeAlmaSMSPopup();
      }
    });

    document.querySelectorAll(
      'a[href*="wa.me"], a[href*="whatsapp.com"], a[href^="https://api.whatsapp.com"], a[href^="sms:"]'
    ).forEach(function(link){
      const originalText = link.textContent.trim();

      link.removeAttribute("target");

      link.href =
        "sms:" +
        ALMA_SMS_NUMBER +
        "?body=" +
        encodeSMSMessage(
          "Halo Alma, saya menghubungi dari website almaMobiiee dan ingin mendapatkan informasi lebih lanjut."
        );

      if(/whatsapp|wa/i.test(originalText)){
        link.textContent = originalText
          .replace(/whatsapp/gi, "SMS")
          .replace(/\bwa\b/gi, "SMS");
      }
    });
  });
})();
