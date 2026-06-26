/* =================================================================
   NOTHING EAR — interações
   Nav · entradas animadas (Emil Kowalski) · âncoras suaves
   Reveal por posição (robusto): nunca prende conteúdo escondido.
   ================================================================= */
(function () {
  "use strict";

  window.__animRan = true; // avisa o failsafe do <head> que o script rodou
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Nav: sólida ao rolar ---- */
  var nav = document.getElementById("nav");
  function onNav() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onNav, { passive: true });
  onNav();

  /* ---- Entradas animadas ---- */
  if (!prefersReduced) {
    document.documentElement.classList.add("anim");
    var els = [].slice.call(
      document.querySelectorAll("[data-reveal], .editorial, .statement")
    );
    var check = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      els = els.filter(function (el) {
        // revela quando o topo cruza a linha de gatilho (cobre scroll, âncoras e pulos)
        if (el.getBoundingClientRect().top < vh * 0.85) {
          el.classList.add("is-in");
          return false;
        }
        return true;
      });
    };
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    window.addEventListener("load", check);
    // 1ª passada logo após a pintura do estado inicial. Uso setTimeout (não rAF):
    // rAF é pausado em aba inativa/headless e o reveal nunca dispararia.
    setTimeout(check, 60);
  }

  /* ---- Âncoras suaves respeitando a altura da nav ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id === "#" || id === "#top") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navH = nav ? nav.offsetHeight : 0;
      var y = target.getBoundingClientRect().top + window.scrollY - navH + 1;
      window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });
})();
