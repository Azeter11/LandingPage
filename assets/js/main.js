(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var header = document.querySelector(".site-header");
  var progressBar = document.querySelector(".scroll-progress span");
  var heroImage = document.querySelector(".hero__media img");
  var toTop = document.querySelector(".to-top");
  var toast = document.querySelector("#toast");
  var year = document.querySelector("#year");
  var nav = document.querySelector("#navMenu");
  var menuToggle = document.querySelector(".menu-toggle");
  var backdrop = document.querySelector(".nav-backdrop");
  var form = document.querySelector("#contactForm");

  var state = {
    menuOpen: false,
    lastFocus: null,
    toastTimer: null
  };

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 5000);
  }

  var ticking = false;

  function updateScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (header) {
      header.classList.toggle("is-scrolled", y > 24);
    }

    if (toTop) {
      toTop.classList.toggle("is-visible", y > 620);
    }

    if (progressBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }

    if (heroImage && !reduceMotion.matches) {
      var shift = Math.min(y, window.innerHeight) * 0.12;
      heroImage.style.transform = "translate3d(0, " + shift + "px, 0) scale(1.04)";
    }

    ticking = false;
  }

  function requestScrollUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
  updateScroll();

  var revealElements = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach(function (element) {
      element.classList.add("is-visible");
    });
  }

  var numberFormatter = new Intl.NumberFormat("id-ID");
  var counters = document.querySelectorAll("[data-count]");

  function runCounter(element) {
    var target = Number(element.getAttribute("data-count"));
    var suffix = element.getAttribute("data-suffix") || "";

    if (reduceMotion.matches) {
      element.textContent = numberFormatter.format(target) + suffix;
      return;
    }

    var duration = 1600;
    var start = 0;

    function step(now) {
      if (!start) start = now;
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = numberFormatter.format(Math.round(target * eased)) + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.55 });

      counters.forEach(function (counter) {
        counterObserver.observe(counter);
      });
    } else {
      counters.forEach(runCounter);
    }
  }

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));

  if ("IntersectionObserver" in window && navLinks.length) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (link) {
          var isActive = link.getAttribute("href") === id;
          link.classList.toggle("is-active", isActive);
          if (isActive) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-42% 0px -52% 0px", threshold: 0 });

    sections.forEach(function (section) {
      spyObserver.observe(section);
    });
  }

  function openMenu() {
    if (!nav || !menuToggle) return;
    state.menuOpen = true;
    state.lastFocus = document.activeElement;
    nav.classList.add("is-open");
    menuToggle.classList.add("is-active");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Tutup menu navigasi");
    document.body.classList.add("menu-open");
    if (backdrop) backdrop.classList.add("is-open");
    window.setTimeout(function () {
      var firstLink = nav.querySelector("a");
      if (firstLink) firstLink.focus();
    }, 260);
  }

  function closeMenu(restoreFocus) {
    if (!nav || !menuToggle) return;
    state.menuOpen = false;
    nav.classList.remove("is-open");
    menuToggle.classList.remove("is-active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Buka menu navigasi");
    document.body.classList.remove("menu-open");
    if (backdrop) backdrop.classList.remove("is-open");
    if (restoreFocus !== false && state.lastFocus && typeof state.lastFocus.focus === "function") {
      state.lastFocus.focus();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      if (state.menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", function () {
      closeMenu();
    });
  }

  if (nav) {
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu(false);
      });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (!state.menuOpen) return;

    if (event.key === "Escape") {
      closeMenu();
      return;
    }

    if (event.key !== "Tab" || !nav || !menuToggle) return;

    var focusable = [menuToggle].concat(
      Array.prototype.slice.call(nav.querySelectorAll("a"))
    ).filter(function (element) {
      return element.offsetParent !== null;
    });

    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  var desktopQuery = window.matchMedia("(max-width: 980px)");

  function handleBreakpoint(event) {
    if (!event.matches && state.menuOpen) {
      closeMenu(false);
    }
  }

  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", handleBreakpoint);
  } else if (typeof desktopQuery.addListener === "function") {
    desktopQuery.addListener(handleBreakpoint);
  }

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var products = Array.prototype.slice.call(document.querySelectorAll("[data-category]"));

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");

      filterButtons.forEach(function (other) {
        var isActive = other === button;
        other.classList.toggle("is-active", isActive);
        other.setAttribute("aria-pressed", String(isActive));
      });

      products.forEach(function (product) {
        var shouldShow = filter === "all" || product.getAttribute("data-category") === filter;
        window.clearTimeout(product.hideTimer);

        if (shouldShow) {
          product.hidden = false;
          window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
              product.classList.remove("is-hidden");
            });
          });
        } else {
          product.classList.add("is-hidden");
          product.hideTimer = window.setTimeout(function () {
            if (product.classList.contains("is-hidden")) {
              product.hidden = true;
            }
          }, 320);
        }
      });
    });
  });

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function isPhone(value) {
    var digits = value.replace(/[^\d]/g, "");
    return digits.length >= 9 && digits.length <= 15;
  }

  function getFieldError(input) {
    var value = input.value.trim();

    if (input.id === "name") {
      if (value.length < 2) return "Mohon isi nama lengkap Anda.";
    }

    if (input.id === "contact") {
      if (!value) return "Mohon isi email atau nomor WhatsApp.";
      if (!isEmail(value) && !isPhone(value)) {
        return "Format email atau nomor WhatsApp belum tepat.";
      }
    }

    if (input.id === "message") {
      if (value.length < 10) return "Tuliskan pesan minimal 10 karakter.";
    }

    return "";
  }

  function setFieldError(input, message) {
    var error = document.getElementById(input.id + "-error");
    var field = input.closest(".field");

    if (error) error.textContent = message;
    if (field) field.classList.toggle("has-error", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  if (form) {
    var formInputs = Array.prototype.slice.call(form.querySelectorAll("input, textarea"));

    formInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true" && !getFieldError(input)) {
          setFieldError(input, "");
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalid = null;

      formInputs.forEach(function (input) {
        var message = getFieldError(input);
        setFieldError(input, message);
        if (message && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        showToast("Mohon lengkapi data yang ditandai.");
        return;
      }

      var name = form.querySelector("#name").value.trim();
      var contact = form.querySelector("#contact").value.trim();
      var message = form.querySelector("#message").value.trim();
      var text = "Halo Desa Sumber Asri,\n\nNama: " + name + "\nKontak: " + contact + "\n\nPesan:\n" + message;
      var url = "https://wa.me/6281234567890?text=" + encodeURIComponent(text);
      var opened = window.open(url, "_blank", "noopener");

      if (!opened) {
        window.location.href = url;
      }

      form.reset();
      formInputs.forEach(function (input) {
        setFieldError(input, "");
      });
      showToast("Pesan siap dikirim. Silakan lanjutkan di WhatsApp.");
    });
  }

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion.matches ? "auto" : "smooth"
      });
    });
  }

  var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function handleMotionChange(event) {
    if (event.matches && heroImage) {
      heroImage.style.transform = "";
    }
  }

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", handleMotionChange);
  } else if (typeof reducedMotionQuery.addListener === "function") {
    reducedMotionQuery.addListener(handleMotionChange);
  }
})();
