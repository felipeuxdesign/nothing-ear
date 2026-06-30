/* =================================================================
   NOTHING EAR — interações
   Intro/boot gate · reveals (coordenados com o intro) · tilt 3D do fone
   · nav · âncoras. Robusto: sem JS = site visível; reduced-motion respeitado.
   ================================================================= */
(function () {
  "use strict";

  window.__animRan = true; // avisa o failsafe do <head> que o script rodou
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var doc = document.documentElement;

  /* ---------- Nav ---------- */
  var nav = document.getElementById("nav");
  function onNav() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onNav, { passive: true });
  onNav();

  /* ---------- Reveals (só disparam depois de "entrar") ---------- */
  var entered = false;
  var revealEls = [];
  function check() {
    if (!entered) return;
    var vh = window.innerHeight || doc.clientHeight;
    revealEls = revealEls.filter(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.85) { el.classList.add("is-in"); return false; }
      return true;
    });
  }
  if (!prefersReduced) {
    doc.classList.add("anim");
    revealEls = [].slice.call(document.querySelectorAll("[data-reveal], .editorial, .statement"));
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    window.addEventListener("load", check);
  }
  function startReveals() { entered = true; check(); }

  /* ---------- Intro / boot gate ---------- */
  var intro = document.getElementById("intro");
  var seen = false;
  try { seen = !!sessionStorage.getItem("nothingIntroSeen"); } catch (e) {}

  if (intro && !prefersReduced && !seen) {
    runIntro(intro);
  } else {
    if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
    startReveals();
  }

  function runIntro(el) {
    el.classList.add("is-active");
    el.setAttribute("aria-hidden", "false");
    doc.classList.add("intro-open");

    var fill = document.getElementById("introFill");
    var count = document.getElementById("introCount");
    var status = document.getElementById("introStatus");
    var enterBtn = document.getElementById("introEnter");
    var leaving = false;
    var pct = 0;

    var timer = setInterval(function () {
      pct += Math.max(2, Math.round((100 - pct) * 0.14)); // acelera e desacelera até 100
      if (pct >= 100) { pct = 100; clearInterval(timer); ready(); }
      if (count) count.textContent = pct;
      if (fill) fill.style.width = pct + "%";
    }, 85);

    function ready() {
      if (status) status.textContent = "Pronto";
      el.classList.add("is-ready");
    }
    function enter() {
      if (leaving) return;
      leaving = true;
      try { sessionStorage.setItem("nothingIntroSeen", "1"); } catch (e) {}
      el.classList.add("is-leaving");
      doc.classList.remove("intro-open");
      startReveals();
      setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 1000);
    }

    if (enterBtn) enterBtn.addEventListener("click", enter);
    document.addEventListener("keydown", function (e) {
      if (el.classList.contains("is-ready") && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); enter(); }
    });
    // failsafe: nunca prende o usuário
    setTimeout(function () { if (!leaving) enter(); }, 7000);
  }

  /* ---------- Fone: tilt 3D seguindo o cursor ---------- */
  var tilt = document.querySelector("[data-tilt]");
  var foneSection = document.getElementById("design");
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (tilt && foneSection && canHover && !prefersReduced) {
    var MAX = 7; // graus
    foneSection.addEventListener("mouseenter", function () {
      tilt.style.transition = "transform .12s ease-out";
    });
    foneSection.addEventListener("mousemove", function (e) {
      var r = foneSection.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = "rotateX(" + (-ny * MAX * 2).toFixed(2) + "deg) rotateY(" + (nx * MAX * 2).toFixed(2) + "deg)";
    });
    foneSection.addEventListener("mouseleave", function () {
      tilt.style.transition = "transform .6s cubic-bezier(0.23,1,0.32,1)";
      tilt.style.transform = "";
    });
  }

  /* ---------- Âncoras suaves ---------- */
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
