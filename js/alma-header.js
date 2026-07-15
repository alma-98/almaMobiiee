(function(){
  "use strict";

  window.almaToggleMenu = function(){
    const nav =
      document.getElementById(
        "almaHeaderNav"
      );

    const button =
      document.getElementById(
        "almaMenuToggle"
      );

    if(!nav || !button){
      return;
    }

    const isOpen =
      nav.classList.toggle(
        "is-open"
      );

    button.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    button.textContent =
      isOpen
        ? "×"
        : "☰";
  };

  document.addEventListener(
    "DOMContentLoaded",
    function(){

      const nav =
        document.getElementById(
          "almaHeaderNav"
        );

      const button =
        document.getElementById(
          "almaMenuToggle"
        );

      if(!nav || !button){
        return;
      }

      nav
        .querySelectorAll("a")
        .forEach(
          function(link){

            link.addEventListener(
              "click",
              function(){

                nav.classList.remove(
                  "is-open"
                );

                button.textContent =
                  "☰";

                button.setAttribute(
                  "aria-expanded",
                  "false"
                );
              }
            );
          }
        );

      window.addEventListener(
        "resize",
        function(){

          if(
            window.innerWidth >
            1180
          ){
            nav.classList.remove(
              "is-open"
            );

            button.textContent =
              "☰";

            button.setAttribute(
              "aria-expanded",
              "false"
            );
          }
        }
      );
    }
  );
})();
