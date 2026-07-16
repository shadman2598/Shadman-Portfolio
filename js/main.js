/**
 * Portfolio interactivity — charity goals, photo/script uploads, gallery
 */
(function () {
  "use strict";

  const { profile, charity } = PORTFOLIO;
  const PHOTO_KEY = "portfolio_photos_v1";
  const SCRIPT_KEY = "portfolio_scripts_v1";

  /* ── Helpers ── */
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "className") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (v !== undefined && v !== null) {
        node.setAttribute(k, v);
      }
    });
    (Array.isArray(children) ? children : [children])
      .filter(Boolean)
      .forEach((c) => node.append(typeof c === "string" ? document.createTextNode(c) : c));
    return node;
  }

  function uid() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function loadStore(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  }

  function saveStore(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      alert("Storage is full. Try uploading smaller files, or remove some items first.");
      console.error(err);
    }
  }

  function extLanguage(filename) {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const map = {
      js: "JavaScript", ts: "TypeScript", py: "Python", sh: "Bash", bash: "Bash",
      rb: "Ruby", go: "Go", rs: "Rust", java: "Java", c: "C", cpp: "C++",
      h: "C/C++", css: "CSS", html: "HTML", json: "JSON", md: "Markdown",
      sql: "SQL", yml: "YAML", yaml: "YAML", txt: "Text",
    };
    return map[ext] || ext.toUpperCase() || "Script";
  }

  /* ── Charity goals ── */
  function renderGoals() {
    const grid = document.getElementById("goals-grid");
    if (!grid || !charity?.goals) return;
    grid.innerHTML = "";
    charity.goals.forEach((goal, i) => {
      grid.append(
        el("article", {
          className: "goal-card reveal",
          style: `--delay: ${i * 0.06}s`,
        }, [
          el("span", { className: "goal-icon", text: goal.icon }),
          el("h3", { text: goal.title }),
          el("p", { text: goal.description }),
        ])
      );
    });
  }

  /* ── Photos ── */
  function getPhotos() {
    const seeded = (PORTFOLIO.photos || []).map((p) => ({ ...p, permanent: true }));
    return [...seeded, ...loadStore(PHOTO_KEY)];
  }

  function renderPhotos() {
    const grid = document.getElementById("photo-grid");
    const empty = document.getElementById("photo-empty");
    const photos = getPhotos();
    grid.innerHTML = "";

    if (!photos.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    photos.forEach((photo, i) => {
      const card = el("figure", {
        className: "photo-card reveal",
        style: `--delay: ${i * 0.04}s`,
      });

      const img = el("img", {
        src: photo.src,
        alt: photo.title || "Uploaded photo",
        loading: "lazy",
      });
      img.addEventListener("click", () => openLightbox(photo.src, photo.title || photo.name || "Photo"));

      const caption = el("figcaption", { className: "photo-caption" }, [
        el("span", { text: photo.title || photo.name || "Untitled" }),
      ]);

      if (!photo.permanent) {
        caption.append(
          el("button", {
            className: "item-delete",
            type: "button",
            "aria-label": "Remove photo",
            title: "Remove",
            onClick: (e) => {
              e.stopPropagation();
              removePhoto(photo.id);
            },
          }, "×")
        );
      }

      card.append(img, caption);
      grid.append(card);
    });

    observeReveals();
  }

  function removePhoto(id) {
    const next = loadStore(PHOTO_KEY).filter((p) => p.id !== id);
    saveStore(PHOTO_KEY, next);
    renderPhotos();
  }

  async function handlePhotoFiles(files) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;

    const stored = loadStore(PHOTO_KEY);
    for (const file of list) {
      const src = await readAsDataURL(file);
      stored.unshift({
        id: uid(),
        name: file.name,
        title: file.name.replace(/\.[^.]+$/, ""),
        src,
        uploadedAt: new Date().toISOString(),
      });
    }
    saveStore(PHOTO_KEY, stored);
    renderPhotos();
  }

  /* ── Scripts ── */
  function getScripts() {
    const seeded = (PORTFOLIO.scripts || []).map((s) => ({ ...s, permanent: !!s.permanent }));
    return [...seeded, ...loadStore(SCRIPT_KEY)];
  }

  function renderScripts() {
    const list = document.getElementById("script-list");
    const empty = document.getElementById("script-empty");
    const scripts = getScripts();
    list.innerHTML = "";

    if (!scripts.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    scripts.forEach((script, i) => {
      const card = el("article", {
        className: "script-card reveal",
        style: `--delay: ${i * 0.05}s`,
      });

      const header = el("div", { className: "script-card-head" }, [
        el("div", {}, [
          el("h3", { text: script.title || script.name }),
          el("span", {
            className: "script-lang",
            text: script.language || extLanguage(script.name || ""),
          }),
        ]),
      ]);

      if (!script.permanent) {
        header.append(
          el("button", {
            className: "item-delete",
            type: "button",
            "aria-label": "Remove script",
            onClick: () => removeScript(script.id),
          }, "×")
        );
      }

      const preview = el("pre", {
        className: "script-preview",
        text: (script.preview || script.content || "").slice(0, 400),
      });

      const actions = el("div", { className: "showcase-actions" }, [
        el("button", {
          className: "showcase-btn primary",
          type: "button",
          onClick: () => openScriptModal(script),
        }, "Preview"),
      ]);

      card.append(header, preview, actions);
      list.append(card);
    });

    observeReveals();
  }

  function removeScript(id) {
    const next = loadStore(SCRIPT_KEY).filter((s) => s.id !== id);
    saveStore(SCRIPT_KEY, next);
    renderScripts();
  }

  async function handleScriptFiles(files) {
    const list = Array.from(files);
    if (!list.length) return;

    const stored = loadStore(SCRIPT_KEY);
    for (const file of list) {
      const content = await readAsText(file);
      stored.unshift({
        id: uid(),
        name: file.name,
        title: file.name,
        language: extLanguage(file.name),
        description: `Uploaded ${new Date().toLocaleDateString()}`,
        preview: content.slice(0, 800),
        content,
        uploadedAt: new Date().toISOString(),
      });
    }
    saveStore(SCRIPT_KEY, stored);
    renderScripts();
  }

  function openScriptModal(script) {
    const modal = document.getElementById("detail-modal");
    const body = document.getElementById("modal-body");
    body.innerHTML = "";
    body.append(
      el("h2", { id: "modal-title", text: script.title || script.name }),
      el("p", { text: `${script.language || "Script"}${script.description ? " · " + script.description : ""}` }),
      el("pre", {
        className: "script-preview script-preview-full",
        text: script.content || script.preview || "// Empty",
      })
    );
    modal.showModal();
  }

  /* ── File readers ── */
  function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /* ── Upload zones ── */
  function setupUploadZone(zoneId, inputId, handler) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if (!zone || !input) return;

    const openPicker = () => input.click();

    zone.addEventListener("click", openPicker);
    zone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPicker();
      }
    });

    input.addEventListener("change", () => {
      if (input.files?.length) handler(input.files);
      input.value = "";
    });

    ["dragenter", "dragover"].forEach((evt) => {
      zone.addEventListener(evt, (e) => {
        e.preventDefault();
        zone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach((evt) => {
      zone.addEventListener(evt, (e) => {
        e.preventDefault();
        zone.classList.remove("dragover");
      });
    });

    zone.addEventListener("drop", (e) => {
      if (e.dataTransfer?.files?.length) handler(e.dataTransfer.files);
    });
  }

  /* ── About & Contact ── */
  function renderAbout() {
    document.getElementById("about-name").textContent = profile.name;
    document.getElementById("about-bio").textContent = profile.bio;
    document.getElementById("about-seeking").textContent = profile.seeking;

    const highlights = document.getElementById("about-highlights");
    highlights.innerHTML = "";
    profile.highlights.forEach((h) => highlights.append(el("li", { text: h })));

    const focus = document.getElementById("focus-tags");
    focus.innerHTML = "";
    profile.focus.forEach((f) => focus.append(el("span", { className: "focus-tag" }, f)));
  }

  function renderContact() {
    const container = document.getElementById("contact-links");
    container.innerHTML = "";
    profile.contact.forEach((c) => {
      container.append(
        el("a", { href: c.href, className: "contact-link", target: "_blank", rel: "noopener" }, [
          el("span", { className: "contact-icon", text: c.icon }),
          el("span", { text: c.value }),
        ])
      );
    });
  }

  /* ── Lightbox & modals ── */
  function openLightbox(src, caption) {
    const modal = document.getElementById("lightbox-modal");
    document.getElementById("lightbox-img").src = src;
    document.getElementById("lightbox-img").alt = caption;
    document.getElementById("lightbox-caption").textContent = caption;
    modal.showModal();
  }

  function setupModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.querySelector(".modal-close")?.addEventListener("click", () => modal.close());
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.close();
      });
    });
  }

  function setupNav() {
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");
    toggle?.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    links?.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => links.classList.remove("open"));
    });
  }

  /* ── Scroll reveal ── */
  let revealObserver;

  function observeReveals() {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("visible");
              revealObserver.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
    }
    document.querySelectorAll(".reveal:not(.visible)").forEach((node) => {
      revealObserver.observe(node);
    });
  }

  /* ── Init ── */
  function init() {
    document.getElementById("year").textContent = new Date().getFullYear();
    renderGoals();
    renderPhotos();
    renderScripts();
    renderAbout();
    renderContact();
    setupUploadZone("photo-upload-zone", "photo-input", handlePhotoFiles);
    setupUploadZone("script-upload-zone", "script-input", handleScriptFiles);
    setupModals();
    setupNav();
    observeReveals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
