(function(){
  "use strict";

  window.almaToggleMainMenu = function(){
    const nav = document.getElementById("almaMainNav");
    const button = document.getElementById("almaMenuButton");

    if(!nav || !button) return;

    const open = nav.classList.toggle("open");

    button.textContent = open ? "×" : "☰";
    button.setAttribute("aria-expanded", String(open));
  };

  document.addEventListener("DOMContentLoaded", function(){
    const nav = document.getElementById("almaMainNav");
    const button = document.getElementById("almaMenuButton");

    if(!nav || !button) return;

    nav.querySelectorAll("a").forEach(function(link){
      link.addEventListener("click", function(){
        nav.classList.remove("open");
        button.textContent = "☰";
        button.setAttribute("aria-expanded", "false");
      });
    });

    window.addEventListener("resize", function(){
      if(window.innerWidth > 1200){
        nav.classList.remove("open");
        button.textContent = "☰";
        button.setAttribute("aria-expanded", "false");
      }
    });
  });
})();
