/* =================================================================
   NOTHING EAR — interações
   Nav (+ scrollspy) · entradas animadas (Emil Kowalski) · âncoras suaves
   Reveal por posição (robusto): nunca prende conteúdo escondido.
   ================================================================= */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Nav: sólida ao rolar ---- */
  var nav = document.getElementById("nav");
  function onNav() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onNav, { passive: true });
  onNav();

  /* ---- Menu mobile (takeover) ---- */
  var docEl = document.documentElement;
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("menu");
  if (toggle && menu) {
    var menuLinks = [].slice.call(menu.querySelectorAll("a"));
    var bg = [].slice.call(document.querySelectorAll("main, footer")); // travados p/ o foco não vazar
    function setMenu(open, returnFocus) {
      docEl.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      bg.forEach(function (el) { if (open) el.setAttribute("inert", ""); else el.removeAttribute("inert"); });
      if (open && menuLinks[0]) menuLinks[0].focus();
      else if (!open && returnFocus) toggle.focus();
    }
    toggle.addEventListener("click", function () {
      setMenu(!docEl.classList.contains("menu-open"), true);
    });
    // escolher uma seção fecha o menu (o scroll suave fica com o handler de âncoras)
    menuLinks.forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false, false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && docEl.classList.contains("menu-open")) setMenu(false, true);
    });
    // voltou pro desktop com o menu aberto? fecha p/ não travar o scroll
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860 && docEl.classList.contains("menu-open")) setMenu(false, false);
    }, { passive: true });
  }

  /* ---- Entradas animadas ---- */
  if (!prefersReduced) {
    document.documentElement.classList.add("anim");
    var els = [].slice.call(
      document.querySelectorAll("[data-reveal], .editorial")
    );
    var check = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      els = els.filter(function (el) {
        // revela quando o topo cruza a linha de gatilho (cobre scroll, âncoras e pulos);
        // data-trigger permite gatilho mais fundo p/ seções com muito padding-top
        // (statement/editorial), senão a coreografia roda antes do conteúdo aparecer
        if (el.getBoundingClientRect().top < vh * (parseFloat(el.dataset.trigger) || 0.85)) {
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
  // só avisa o failsafe do <head> DEPOIS do sistema de reveal estar armado —
  // se algo acima quebrar, o failsafe ainda devolve o conteúdo
  window.__animRan = true;

  /* ---- Scrollspy: marca o link da seção atual (mesmo estado visual do hover) ----
     Funciona com ou sem reduced-motion: é orientação, não enfeite. Só lê o rect
     e alterna uma classe — nenhuma outra animação depende disso. */
  var spy = [
    { link: document.querySelector('.nav__links a[href="#design"]'), sec: document.getElementById("design") },
    { link: document.querySelector('.nav__links a[href="#som"]'),    sec: document.getElementById("som") },
    { link: document.querySelector('.nav__links a[href="#especificacoes"]'), sec: document.getElementById("especificacoes") }
  ].filter(function (p) { return p.link && p.sec; });
  function spyCheck() {
    var line = (nav ? nav.offsetHeight : 0) + 8; // zona de leitura logo abaixo da nav fixa
    var current = null;
    spy.forEach(function (p) {
      var r = p.sec.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) current = p.link; // seção que cruza a zona
    });
    spy.forEach(function (p) {
      var on = p.link === current;
      p.link.classList.toggle("is-current", on);
      if (on) p.link.setAttribute("aria-current", "location");
      else p.link.removeAttribute("aria-current");
    });
  }
  window.addEventListener("scroll", spyCheck, { passive: true });
  window.addEventListener("resize", spyCheck, { passive: true });
  spyCheck();

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
