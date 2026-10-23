(function () {
  "use strict";

  const root = document.documentElement;
  const experience = document.getElementById("experience");
  const cardWrap = document.getElementById("cardWrap");
  const card = document.getElementById("card");
  const cover = document.getElementById("cover");
  const seal = document.getElementById("seal");
  const letter = document.getElementById("letterInside");
  const letterScroll = document.getElementById("letterScroll");
  const letterTitle = document.getElementById("letterTitle");
  const replay = document.getElementById("replay");
  const burst = document.getElementById("burst");
  const live = document.getElementById("live");
  const sparkleLayer = document.getElementById("sparkles");

  const gsap = window.gsap;
  const hasGsap = Boolean(gsap);
  const hasParticles = Boolean(window.tsParticles);
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduceMotion = motionQuery.matches;

  const state = {
    open: false,
    animating: false,
    petalsStarted: false,
    petalData: "",
    timeline: null,
    idleTween: null,
    swayTweens: []
  };

  letter.setAttribute("aria-hidden", "true");
  replay.tabIndex = -1;

  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (items) => items[Math.floor(Math.random() * items.length)];

  /* ------------------------------------------------------------
     Ambient details
     ------------------------------------------------------------ */

  function createSparkles() {
    if (!sparkleLayer) return;

    const amount = window.innerWidth < 640 ? 14 : 26;
    const fragment = document.createDocumentFragment();
    const colors = ["#fff6f2", "#f4cbd1", "#ffffff", "#f0b6c0"];

    for (let i = 0; i < amount; i += 1) {
      const sparkle = document.createElement("span");
      sparkle.className = "sparkle";
      sparkle.style.left = `${rand(2, 98)}%`;
      sparkle.style.top = `${rand(3, 97)}%`;
      sparkle.style.setProperty("--size", `${rand(2, 5.2).toFixed(1)}px`);
      sparkle.style.setProperty("--duration", `${rand(3.8, 8).toFixed(2)}s`);
      sparkle.style.setProperty("--delay", `${(-rand(0, 8)).toFixed(2)}s`);
      sparkle.style.setProperty("--sparkle-color", pick(colors));
      fragment.appendChild(sparkle);
    }

    sparkleLayer.replaceChildren(fragment);
  }

  function initializeEntrance() {
    if (!hasGsap) return;

    if (reduceMotion) {
      gsap.set(cardWrap, { autoAlpha: 1 });
      return;
    }

    gsap.fromTo(
      cardWrap,
      { autoAlpha: 0, y: 58, scale: 0.935, rotationX: 4.5 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        duration: 1.35,
        ease: "power3.out",
        onComplete: startIdleFloat
      }
    );

    gsap.from(".cover__rose svg", {
      scale: 0.7,
      rotation: -5,
      opacity: 0,
      transformOrigin: "50% 62%",
      duration: 1.7,
      delay: 0.55,
      stagger: 0.16,
      ease: "power3.out"
    });

    gsap.from(".seal", {
      scale: 0.82,
      opacity: 0,
      duration: 1,
      delay: 0.78,
      ease: "back.out(1.4)"
    });
  }

  function startIdleFloat() {
    if (!hasGsap || reduceMotion || state.idleTween) return;

    state.idleTween = gsap.to(cardWrap, {
      y: -7,
      duration: 3.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });
  }

  function stopIdleFloat() {
    if (!hasGsap) return;

    if (state.idleTween) {
      state.idleTween.kill();
      state.idleTween = null;
    }
    gsap.killTweensOf(cardWrap, "y");
    gsap.set(cardWrap, { y: 0 });
  }

  /* ------------------------------------------------------------
     Text, roses and particles
     ------------------------------------------------------------ */

  function setInsideContentHidden() {
    if (!hasGsap) return;

    gsap.set([".letter__kicker", ".letter__title", ".letter__divider"], {
      opacity: 0,
      y: 15
    });
    gsap.set(".letter__body p", { opacity: 0, y: 18 });
    gsap.set(".letter__end", { opacity: 0 });
    gsap.set(".letter__rose svg", {
      scale: 0.78,
      rotation: -3,
      transformOrigin: "50% 62%"
    });
  }

  function createPetalBurst() {
    if (!hasGsap || reduceMotion) return;

    const rect = card.getBoundingClientRect();
    const amount = window.innerWidth < 640 ? 14 : 24;
    const gradients = [
      "linear-gradient(145deg, #fff2f1 0%, #d98292 40%, #a71b31 100%)",
      "linear-gradient(145deg, #ffe4e7 0%, #c33c52 48%, #7d1020 100%)",
      "linear-gradient(145deg, #fffaf8 0%, #e7a6b2 55%, #b62940 100%)",
      "linear-gradient(145deg, #f7c2cb 0%, #b51f38 62%, #720e1d 100%)"
    ];

    for (let i = 0; i < amount; i += 1) {
      const petal = document.createElement("span");
      petal.className = "petal-burst";
      petal.style.setProperty("--petal-w", `${rand(7, 14).toFixed(1)}px`);
      petal.style.setProperty("--petal-h", `${rand(11, 21).toFixed(1)}px`);
      petal.style.setProperty("--petal-bg", pick(gradients));
      burst.appendChild(petal);

      gsap.set(petal, {
        x: rand(-8, 8),
        y: rand(-8, 8),
        scale: rand(0.7, 1.2),
        rotation: rand(-35, 35)
      });

      gsap.to(petal, {
        x: rand(-rect.width * 0.56, rect.width * 0.56),
        y: rand(-rect.height * 0.55, rect.height * 0.22),
        rotation: rand(-280, 280),
        scale: rand(0.45, 1.4),
        opacity: 0,
        duration: rand(1.15, 2.05),
        delay: rand(0, 0.17),
        ease: "power2.out",
        onComplete: () => petal.remove()
      });
    }
  }

  function buildPetalOptions(count, front) {
    return {
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      interactivity: {
        events: {
          onHover: { enable: false },
          resize: true
        }
      },
      particles: {
        number: {
          value: count,
          density: { enable: true, area: 1100 }
        },
        shape: {
          type: "image",
          options: {
            image: {
              src: state.petalData,
              width: 64,
              height: 64
            }
          }
        },
        opacity: {
          value: front ? { min: 0.1, max: 0.36 } : { min: 0.16, max: 0.62 },
          animation: {
            enable: true,
            speed: 0.45,
            minimumValue: 0.06,
            sync: false
          }
        },
        size: {
          value: front
            ? { min: 3.5, max: 9.5 }
            : { min: window.innerWidth < 640 ? 4 : 5, max: window.innerWidth < 640 ? 11 : 16 }
        },
        move: {
          enable: true,
          speed: front ? { min: 0.28, max: 0.9 } : { min: 0.24, max: 0.82 },
          direction: "bottom",
          random: true,
          straight: false,
          outModes: {
            default: "out",
            bottom: "out"
          }
        },
        rotate: {
          value: { min: 0, max: 360 },
          direction: "random",
          animation: {
            enable: true,
            speed: { min: -9, max: 9 },
            sync: false
          }
        },
        wobble: {
          enable: true,
          distance: front ? 8 : 10,
          speed: { min: -2.5, max: 2.5 }
        },
        tilt: {
          enable: true
        }
      }
    };
  }

  function startPetalParticles() {
    if (reduceMotion || !hasParticles || state.petalsStarted) return;

    state.petalsStarted = true;
    const isSmall = window.innerWidth < 640;
    const petalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f6d4d8"/><stop offset=".44" stop-color="#c53d53"/><stop offset="1" stop-color="#7a1020"/></linearGradient></defs><path d="M31 3C45 10 59 25 55 41 51 55 40 61 29 60 17 58 7 48 8 34 9 19 19 8 31 3Z" fill="url(#p)"/><path d="M31 8C24 22 22 40 31 55" fill="none" stroke="#ffe4e7" stroke-opacity=".42" stroke-width="1.4" stroke-linecap="round"/></svg>`;
    state.petalData = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(petalSvg)}`;

    const loads = [
      window.tsParticles.load("petals", buildPetalOptions(isSmall ? 13 : 27, false)),
      window.tsParticles.load("petalsFront", buildPetalOptions(isSmall ? 6 : 11, true))
    ];

    Promise.allSettled(loads).then((results) => {
      if (results.every((result) => result.status === "rejected")) {
        state.petalsStarted = false;
      }
    });
  }

  function startRoseSway() {
    if (!hasGsap || reduceMotion) return;

    stopRoseSway();
    const roses = gsap.utils.toArray(".letter__rose svg");

    state.swayTweens = roses.map((rose, index) =>
      gsap.to(rose, {
        rotation: index % 2 === 0 ? 1.4 : -1.4,
        y: -3,
        transformOrigin: "50% 62%",
        duration: 3.6 + index * 0.5,
        delay: index * 0.25,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      })
    );
  }

  function stopRoseSway() {
    if (!hasGsap) return;

    state.swayTweens.forEach((tween) => tween.kill());
    state.swayTweens = [];
  }

  /* ------------------------------------------------------------
     Scroll indicator
     ------------------------------------------------------------ */

  function updateScrollState() {
    if (!state.open) return;

    const hasOverflow = letterScroll.scrollHeight > letterScroll.clientHeight + 12;
    experience.classList.toggle("is-scrollable", hasOverflow);

    if (letterScroll.scrollTop > 24) {
      experience.classList.add("has-scrolled");
    }
  }

  /* ------------------------------------------------------------
     Open and close
     ------------------------------------------------------------ */

  function markAsOpened() {
    experience.classList.add("is-revealed");
    replay.tabIndex = 0;
    state.animating = false;
    state.open = true;

    if (hasGsap) {
      gsap.set(cardWrap, { autoAlpha: 1, scale: 1, rotationX: 0, y: 0 });
    }

    cover.style.pointerEvents = "none";
    cover.setAttribute("aria-hidden", "true");
    letter.removeAttribute("aria-hidden");

    updateScrollState();
    startRoseSway();

    window.setTimeout(() => {
      updateScrollState();
      letterTitle.focus({ preventScroll: true });
    }, 80);
  }

  function openLetter() {
    if (state.open || state.animating) return;

    state.open = true;
    state.animating = true;
    experience.classList.add("is-open");

    seal.setAttribute("aria-expanded", "true");
    seal.tabIndex = -1;
    letter.removeAttribute("inert");
    letter.setAttribute("aria-hidden", "false");
    cover.setAttribute("aria-hidden", "true");

    createPetalBurst();
    startPetalParticles();

    if (!hasGsap || reduceMotion) {
      if (hasGsap) {
        gsap.set([".letter__kicker", ".letter__title", ".letter__divider", ".letter__end"], {
          opacity: 1,
          y: 0
        });
        gsap.set(".letter__body p", { opacity: 1, y: 0 });
        gsap.set(".letter__rose svg", { scale: 1, rotation: 0 });
        gsap.set(cardWrap, { autoAlpha: 1, y: 0, scale: 1 });
      }

      cover.style.display = "none";
      markAsOpened();
      live.textContent = "Carta abierta. Puedes leer el mensaje y deslizarte para continuar.";
      return;
    }

    stopIdleFloat();
    gsap.killTweensOf(seal);
    gsap.killTweensOf(cardWrap);

    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        cover.style.visibility = "hidden";
        state.animating = false;
        markAsOpened();
        live.textContent = "Carta abierta. Puedes leer el mensaje y deslizarte para continuar.";
      }
    });

    state.timeline = timeline;

    timeline
      .to(seal, { scale: 1.14, duration: 0.3, ease: "power2.out" })
      .to(seal, { rotation: 7, duration: 0.09, repeat: 1, yoyo: true, ease: "sine.inOut" })
      .to(seal, { scale: 0.28, autoAlpha: 0, duration: 0.42, ease: "back.in(1.8)" }, "+=0.01")
      .addLabel("opening", "-=0.08")
      .to(cover, { rotationY: -166, duration: 1.55, ease: "power3.inOut" }, "opening")
      .call(createPetalBurst, null, "opening+=0.26")
      .call(startPetalParticles, null, "opening+=0.2")
      .to(cover, { autoAlpha: 0, duration: 0.32, ease: "power1.out" }, "opening+=1.23")
      .fromTo(
        ".letter__header > *",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.62, stagger: 0.07 },
        "opening+=0.58"
      )
      .fromTo(
        ".letter__body p",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.72, stagger: 0.16 },
        "opening+=0.82"
      )
      .fromTo(
        ".letter__end",
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        "opening+=1.5"
      )
      .fromTo(
        ".letter__rose svg",
        { scale: 0.78, rotation: -3 },
        {
          scale: 1,
          rotation: 0,
          transformOrigin: "50% 62%",
          duration: 1.25,
          stagger: 0.16,
          ease: "power3.out"
        },
        "opening+=0.45"
      );
  }

  function closeLetter() {
    if (!state.open || state.animating) return;

    state.open = false;
    state.animating = true;

    if (state.timeline) {
      state.timeline.kill();
      state.timeline = null;
    }

    stopRoseSway();
    experience.classList.remove("is-revealed", "has-scrolled", "is-scrollable");
    letter.setAttribute("inert", "");
    letter.setAttribute("aria-hidden", "true");
    cover.setAttribute("aria-hidden", "false");
    cover.style.display = "block";
    cover.style.pointerEvents = "none";
    seal.setAttribute("aria-expanded", "false");
    seal.tabIndex = 0;
    replay.tabIndex = -1;
    letterScroll.scrollTop = 0;

    const finishClose = () => {
      state.animating = false;
      experience.classList.remove("is-open");
      cover.style.pointerEvents = "";
      cover.style.visibility = "visible";

      if (hasGsap) {
        gsap.set(cover, { autoAlpha: 1, rotationY: 0 });
        gsap.set(seal, { autoAlpha: 1, scale: 1, rotation: 0 });
      } else {
        cover.style.opacity = "";
        cover.style.transform = "";
        seal.style.opacity = "";
        seal.style.transform = "";
      }

      startIdleFloat();
      seal.focus({ preventScroll: true });
      live.textContent = "La carta se ha cerrado. Toca el sello para abrirla de nuevo.";
    };

    if (!hasGsap || reduceMotion) {
      cover.style.display = "";
      cover.style.opacity = "";
      cover.style.transform = "";
      finishClose();
      return;
    }

    stopIdleFloat();
    setInsideContentHidden();
    gsap.killTweensOf([cover, seal]);
    gsap.set(cover, { autoAlpha: 0, rotationY: -148 });
    gsap.set(seal, { autoAlpha: 1, scale: 1, rotation: 0 });

    gsap
      .timeline({ onComplete: finishClose })
      .to(cover, { autoAlpha: 1, duration: 0.25, ease: "power1.out" })
      .to(cover, { rotationY: 0, duration: 1.05, ease: "power3.inOut" }, "-=0.12");
  }

  /* ------------------------------------------------------------
     Events and boot
     ------------------------------------------------------------ */

  seal.addEventListener("click", openLetter);
  replay.addEventListener("click", closeLetter);

  letterScroll.addEventListener(
    "scroll",
    () => {
      if (letterScroll.scrollTop > 24) {
        experience.classList.add("has-scrolled");
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", updateScrollState, { passive: true });

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(letterScroll);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateScrollState).catch(() => {});
  }

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", (event) => {
      reduceMotion = event.matches;
    });
  }

  root.classList.add("js-ready");
  createSparkles();
  setInsideContentHidden();
  initializeEntrance();

  const params = new URLSearchParams(window.location.search);
  if (params.get("abrir") === "1") {
    window.setTimeout(openLetter, reduceMotion ? 120 : 1750);
  }
})();
