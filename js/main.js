/**
 * Portfolio interactivity — charity goals, Supabase Storage photos/scripts
 */
(function () {
  "use strict";

  const { profile, charity } = PORTFOLIO;
  const PHOTO_KEY = "portfolio_photos_v1";
  const SCRIPT_KEY = "portfolio_scripts_v1";

  let cloudPhotos = [];
  let cloudScripts = [];

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

  function useCloud() {
    return Boolean(window.PortfolioStorage?.isConfigured?.());
  }

  function setUploadStatus(kind, message, isError) {
    const node = document.getElementById(`${kind}-upload-status`);
    if (!node) return;
    node.hidden = !message;
    node.textContent = message || "";
    node.classList.toggle("is-error", Boolean(isError));
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
          className: "goal-card",
          style: `--delay: ${i * 0.06}s`,
        }, [
          el("span", { className: "goal-icon", text: goal.icon }),
          el("h3", { text: goal.title }),
          el("p", { text: goal.description }),
        ])
      );
    });
  }

  function isImageFile(file) {
    return file.type.startsWith("image/");
  }

  function isPdfFile(file) {
    return file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");
  }

  function isGalleryFile(file) {
    return isImageFile(file) || isPdfFile(file);
  }

  function isPdfPath(name) {
    return /\.pdf$/i.test(name || "");
  }

  /* ── Photos ── */
  function getPhotos() {
    const seeded = (PORTFOLIO.photos || []).map((p) => ({ ...p, permanent: true }));
    if (useCloud()) {
      return [
        ...seeded,
        ...cloudPhotos.map((p) => ({
          id: p.path,
          name: p.name,
          title: p.name.replace(/\.[^.]+$/, ""),
          src: p.src,
          path: p.path,
          cloud: true,
          isPdf: isPdfPath(p.name),
        })),
      ];
    }
    return [...seeded, ...loadStore(PHOTO_KEY)];
  }

  async function resolvePdfUrl(item, bucketName) {
    if (item.src?.startsWith("data:") || item.src?.startsWith("blob:")) return item.src;
    if (item.path && useCloud()) {
      const { data, error } = await PortfolioStorage.downloadBlobUrl(bucketName, item.path);
      if (!error && data) return data;
    }
    return item.src;
  }

  async function expandPdfAsImages(item, bucketName = "photos") {
    if (!(item.isPdf || isPdfPath(item.name) || item.src?.startsWith("data:application/pdf"))) {
      return [item];
    }
    try {
      const pdfUrl = await resolvePdfUrl(item, bucketName);
      const pages = await PortfolioPdf.renderAllPages(pdfUrl, 1000);
      if (!pages.length) return [item];
      return pages.map((page) => ({
        id: `${item.id || item.path || item.name}-page-${page.page}`,
        name: item.name,
        title: pages.length > 1
          ? `${item.title || item.name} · page ${page.page}`
          : (item.title || item.name.replace(/\.[^.]+$/, "")),
        src: page.src,
        path: item.path,
        pdfSource: pdfUrl,
        cloud: item.cloud,
        permanent: item.permanent,
        isPdfPage: true,
        pageNumber: page.page,
        pageCount: page.total,
      }));
    } catch (err) {
      console.error("PDF render failed", err);
      return [{ ...item, isPdf: true, renderFailed: true }];
    }
  }

  async function renderPhotos() {
    const grid = document.getElementById("photo-grid");
    const empty = document.getElementById("photo-empty");
    const photos = getPhotos();
    grid.innerHTML = "";

    if (!photos.length) {
      empty.hidden = false;
      empty.textContent = useCloud()
        ? "No photos or PDFs in Supabase yet — upload your first file above."
        : "No photos or PDFs yet — upload your first file above.";
      return;
    }
    empty.hidden = true;

    // Show loading cards for PDFs while pages render
    photos.forEach((photo, i) => {
      const isPdf = photo.isPdf || isPdfPath(photo.name) || photo.src?.includes("application/pdf");
      if (!isPdf) {
        grid.append(buildPhotoCard(photo, i));
        return;
      }
      const placeholder = el("figure", {
        className: "photo-card",
        style: `--delay: ${i * 0.04}s`,
        "data-pdf-id": photo.id || photo.path || photo.name,
      }, [
        el("div", { className: "photo-pdf-tile" }, [
          el("strong", { text: "PDF" }),
          el("span", { text: "Loading preview…" }),
        ]),
        el("figcaption", { className: "photo-caption" }, [
          el("span", { text: photo.title || photo.name || "Untitled" }),
        ]),
      ]);
      grid.append(placeholder);
    });
    observeReveals();

    const expanded = [];
    for (const photo of photos) {
      expanded.push(...(await expandPdfAsImages(photo)));
    }

    grid.innerHTML = "";
    expanded.forEach((photo, i) => grid.append(buildPhotoCard(photo, i)));
    observeReveals();
  }

  function buildPhotoCard(photo, index) {
    const failedPdf = photo.renderFailed;
    const card = el("figure", {
      className: `photo-card${failedPdf ? " is-pdf" : ""}`,
      style: `--delay: ${Math.min(index, 12) * 0.04}s`,
    });

    if (failedPdf) {
      card.append(
        el("div", {
          className: "photo-pdf-tile",
          onClick: () => openPdfViewer(photo.src || photo.pdfSource, photo.title || photo.name),
        }, [
          el("strong", { text: "PDF" }),
          el("span", { text: "Tap to view" }),
        ])
      );
    } else {
      const img = el("img", {
        src: photo.src,
        alt: photo.title || "Uploaded photo",
        loading: "lazy",
      });
      img.addEventListener("click", () => {
        if (photo.pdfSource) openPdfViewer(photo.pdfSource, photo.title || photo.name);
        else openLightbox(photo.src, photo.title || photo.name || "Photo");
      });
      card.append(img);
    }

    const caption = el("figcaption", { className: "photo-caption" }, [
      el("span", { text: photo.title || photo.name || "Untitled" }),
    ]);

    if (!photo.permanent) {
      caption.append(
        el("button", {
          className: "item-delete",
          type: "button",
          "aria-label": "Remove file",
          title: "Remove",
          onClick: (e) => {
            e.stopPropagation();
            removePhoto(photo);
          },
        }, "×")
      );
    }

    card.append(caption);
    return card;
  }

  async function removePhoto(photo) {
    const path = photo.path || photo.id;
    if (useCloud() && (photo.path || photo.isPdfPage)) {
      const removePath = photo.path;
      if (!removePath) return;
      setUploadStatus("photo", "Removing…");
      const { error } = await PortfolioStorage.removeFile("photos", removePath);
      if (error) {
        setUploadStatus("photo", error.message || "Could not remove photo.", true);
        return;
      }
      await refreshCloudPhotos();
      setUploadStatus("photo", "");
      return;
    }

    // Local: remove whole PDF if deleting one of its rendered pages
    const next = loadStore(PHOTO_KEY).filter((p) => {
      if (photo.pdfSource) return p.src !== photo.pdfSource && p.id !== path;
      return p.id !== photo.id;
    });
    saveStore(PHOTO_KEY, next);
    renderPhotos();
  }

  async function handlePhotoFiles(files) {
    const list = Array.from(files).filter(isGalleryFile);
    if (!list.length) {
      setUploadStatus("photo", "Please choose image or PDF files.", true);
      return;
    }

    if (useCloud()) {
      setUploadStatus("photo", `Uploading ${list.length} file${list.length > 1 ? "s" : ""} to Supabase…`);
      for (const file of list) {
        const { error } = await PortfolioStorage.uploadFile("photos", file);
        if (error) {
          setUploadStatus("photo", error.message || "Upload failed.", true);
          return;
        }
      }
      await refreshCloudPhotos();
      setUploadStatus("photo", "Uploaded to Supabase Storage.");
      return;
    }

    const stored = loadStore(PHOTO_KEY);
    for (const file of list) {
      const src = await readAsDataURL(file);
      stored.unshift({
        id: uid(),
        name: file.name,
        title: file.name.replace(/\.[^.]+$/, ""),
        src,
        isPdf: isPdfFile(file),
        uploadedAt: new Date().toISOString(),
      });
    }
    saveStore(PHOTO_KEY, stored);
    renderPhotos();
    setUploadStatus("photo", "Saved in this browser (add Supabase keys for cloud storage).");
  }

  async function refreshCloudPhotos() {
    const { data, error } = await PortfolioStorage.listFiles("photos");
    if (error) {
      console.error(error);
      setUploadStatus("photo", error.message || "Could not load photos from Supabase.", true);
      cloudPhotos = [];
    } else {
      cloudPhotos = data;
    }
    renderPhotos();
  }

  /* ── Scripts ── */
  function getScripts() {
    const seeded = (PORTFOLIO.scripts || []).map((s) => ({ ...s, permanent: !!s.permanent }));
    if (useCloud()) {
      return [
        ...seeded,
        ...cloudScripts.map((s) => ({
          id: s.path,
          name: s.name,
          title: s.name,
          language: s.isPdf ? "PDF" : extLanguage(s.name),
          description: s.isPdf ? "PDF script document" : "Stored in Supabase",
          preview: s.preview || "",
          content: s.content || "",
          src: s.src,
          path: s.path,
          cloud: true,
          isPdf: Boolean(s.isPdf || isPdfPath(s.name)),
          pageImages: s.pageImages || [],
        })),
      ];
    }
    return [...seeded, ...loadStore(SCRIPT_KEY)];
  }

  function renderScripts() {
    const list = document.getElementById("script-list");
    const empty = document.getElementById("script-empty");
    const scripts = getScripts();
    list.innerHTML = "";

    if (!scripts.length) {
      empty.hidden = false;
      empty.textContent = useCloud()
        ? "No scripts in Supabase yet — upload your first file above."
        : "No scripts yet — upload your first file above.";
      return;
    }
    empty.hidden = true;

    scripts.forEach((script, i) => {
      const isPdf = script.isPdf || isPdfPath(script.name);
      const card = el("article", {
        className: `script-card${isPdf ? " script-card-pdf" : ""}`,
        style: `--delay: ${i * 0.05}s`,
      });

      const header = el("div", { className: "script-card-head" }, [
        el("div", {}, [
          el("h3", { text: script.title || script.name }),
          el("span", {
            className: "script-lang",
            text: isPdf ? "PDF" : (script.language || extLanguage(script.name || "")),
          }),
        ]),
      ]);

      if (!script.permanent) {
        header.append(
          el("button", {
            className: "item-delete",
            type: "button",
            "aria-label": "Remove script",
            onClick: () => removeScript(script),
          }, "×")
        );
      }

      card.append(header);

      if (isPdf) {
        const viewer = el("div", { className: "script-pdf-pages" });
        viewer.append(el("p", { className: "pdf-loading", text: "Loading PDF pages…" }));
        card.append(viewer);
        list.append(card);

        // Render pages inline only — no zoom/lightbox overlay
        (async () => {
          try {
            const pdfUrl = await resolvePdfUrl(script, "scripts");
            script.src = pdfUrl;
            const pages = await PortfolioPdf.renderAllPages(pdfUrl, 720);
            viewer.innerHTML = "";
            if (!pages.length) {
              viewer.append(el("p", { text: "Could not preview this PDF." }));
              return;
            }
            pages.forEach((page) => {
              viewer.append(
                el("img", {
                  className: "script-pdf-page",
                  src: page.src,
                  alt: `${script.title || script.name} page ${page.page}`,
                  loading: "lazy",
                })
              );
            });
          } catch (err) {
            console.error(err);
            viewer.innerHTML = "";
            viewer.append(el("p", { text: "Could not load this PDF preview." }));
          }
        })();
      } else {
        card.append(
          el("pre", {
            className: "script-preview",
            text: (script.preview || script.content || "").slice(0, 400),
          }),
          el("div", { className: "showcase-actions" }, [
            el("button", {
              className: "showcase-btn primary",
              type: "button",
              onClick: () => openScriptModal(script),
            }, "Preview"),
          ])
        );
        list.append(card);
      }
    });

    observeReveals();
  }

  async function removeScript(script) {
    if (useCloud() && script.path) {
      setUploadStatus("script", "Removing…");
      const { error } = await PortfolioStorage.removeFile("scripts", script.path);
      if (error) {
        setUploadStatus("script", error.message || "Could not remove script.", true);
        return;
      }
      await refreshCloudScripts();
      setUploadStatus("script", "");
      return;
    }

    const next = loadStore(SCRIPT_KEY).filter((s) => s.id !== script.id);
    saveStore(SCRIPT_KEY, next);
    renderScripts();
  }

  async function handleScriptFiles(files) {
    const list = Array.from(files);
    if (!list.length) return;

    if (useCloud()) {
      setUploadStatus("script", `Uploading ${list.length} file${list.length > 1 ? "s" : ""} to Supabase…`);
      for (const file of list) {
        const { error } = await PortfolioStorage.uploadFile("scripts", file);
        if (error) {
          setUploadStatus("script", error.message || "Upload failed.", true);
          return;
        }
      }
      await refreshCloudScripts();
      setUploadStatus("script", "Uploaded to Supabase Storage.");
      return;
    }

    const stored = loadStore(SCRIPT_KEY);
    for (const file of list) {
      if (isPdfFile(file)) {
        const src = await readAsDataURL(file);
        stored.unshift({
          id: uid(),
          name: file.name,
          title: file.name,
          language: "PDF",
          description: `Uploaded ${new Date().toLocaleDateString()}`,
          preview: "PDF document — open to view.",
          content: "",
          src,
          isPdf: true,
          uploadedAt: new Date().toISOString(),
        });
        continue;
      }
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
    setUploadStatus("script", "Saved in this browser (add Supabase keys for cloud storage).");
  }

  async function refreshCloudScripts() {
    const { data, error } = await PortfolioStorage.listFiles("scripts");
    if (error) {
      console.error(error);
      setUploadStatus("script", error.message || "Could not load scripts from Supabase.", true);
      cloudScripts = [];
      renderScripts();
      return;
    }

    cloudScripts = [];
    for (const file of data) {
      if (isPdfPath(file.name)) {
        cloudScripts.push({
          ...file,
          isPdf: true,
          content: "",
          preview: "",
        });
        continue;
      }
      const { data: text } = await PortfolioStorage.downloadText("scripts", file.path);
      cloudScripts.push({
        ...file,
        isPdf: false,
        content: text || "",
        preview: (text || "").slice(0, 800),
      });
    }
    renderScripts();
  }

  async function openScriptModal(script) {
    if (script.isPdf || isPdfPath(script.name)) {
      // PDF scripts stay inline in the Scripts section — no overlay viewer
      return;
    }

    const modal = document.getElementById("detail-modal");
    const body = document.getElementById("modal-body");
    body.innerHTML = "";
    body.append(
      el("h2", { id: "modal-title", text: script.title || script.name }),
      el("p", { text: `${script.language || "Script"}${script.description ? " · " + script.description : ""}` }),
      el("pre", {
        className: "script-preview script-preview-full",
        text: "Loading…",
      })
    );
    showCleanModal(modal);

    let content = script.content || script.preview || "";
    if (useCloud() && script.path && !script.content) {
      const { data, error } = await PortfolioStorage.downloadText("scripts", script.path);
      if (!error) content = data;
    }

    const pre = body.querySelector("pre");
    if (pre) pre.textContent = content || "// Empty";
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

  function updateStorageHints() {
    const photoHint = document.getElementById("photo-storage-hint");
    const scriptHint = document.getElementById("script-storage-hint");
    const msg = useCloud()
      ? "Powered by Supabase Storage — files sync across devices and GitHub Pages."
      : "Add your Supabase URL + anon key in js/supabase-config.js to enable cloud storage.";
    if (photoHint) photoHint.textContent = msg;
    if (scriptHint) scriptHint.textContent = msg;
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
  /* ── Lightbox & PDF viewer ── */
  function showCleanModal(modal) {
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
    if (!modal.open) modal.showModal();
  }

  function closeCleanModal(modal) {
    if (modal.open) modal.close();
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
  }

  function openLightbox(src, caption) {
    const modal = document.getElementById("lightbox-modal");
    const img = document.getElementById("lightbox-img");
    const pdfFrame = document.getElementById("lightbox-pdf");
    const pages = document.getElementById("lightbox-pdf-pages");
    img.hidden = false;
    img.src = src;
    img.alt = caption;
    if (pdfFrame) {
      pdfFrame.hidden = true;
      pdfFrame.removeAttribute("src");
    }
    if (pages) {
      pages.hidden = true;
      pages.innerHTML = "";
    }
    document.getElementById("lightbox-caption").textContent = caption;
    showCleanModal(modal);
  }

  async function openPdfViewer(src, caption) {
    const modal = document.getElementById("lightbox-modal");
    const img = document.getElementById("lightbox-img");
    const pdfFrame = document.getElementById("lightbox-pdf");
    const pages = document.getElementById("lightbox-pdf-pages");
    img.hidden = true;
    img.removeAttribute("src");
    document.getElementById("lightbox-caption").textContent = caption || "PDF";

    if (pages) {
      pages.hidden = false;
      pages.innerHTML = "<p class='pdf-loading'>Loading PDF pages…</p>";
    }
    if (pdfFrame) {
      pdfFrame.hidden = true;
      pdfFrame.removeAttribute("src");
    }
    showCleanModal(modal);

    try {
      const rendered = await PortfolioPdf.renderAllPages(src, 1100);
      if (!pages) return;
      pages.innerHTML = "";
      if (!rendered.length) {
        pages.innerHTML = "<p>Could not display this PDF.</p>";
        return;
      }
      rendered.forEach((page) => {
        pages.append(
          el("img", {
            className: "lightbox-pdf-page",
            src: page.src,
            alt: `Page ${page.page}`,
          })
        );
      });
    } catch (err) {
      console.error(err);
      if (pages) {
        pages.innerHTML = "";
        pages.hidden = true;
      }
      if (pdfFrame) {
        pdfFrame.hidden = false;
        pdfFrame.src = src;
      }
    }
  }

  function setupModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.querySelector(".modal-close")?.addEventListener("click", () => closeCleanModal(modal));
      modal.addEventListener("click", (e) => {
        if (e.target === modal && !modal.classList.contains("lightbox")) {
          closeCleanModal(modal);
        }
      });
      modal.addEventListener("close", () => {
        document.documentElement.classList.remove("modal-open");
        document.body.classList.remove("modal-open");
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
  async function init() {
    document.getElementById("year").textContent = new Date().getFullYear();
    renderGoals();
    renderAbout();
    renderContact();
    setupUploadZone("photo-upload-zone", "photo-input", handlePhotoFiles);
    setupUploadZone("script-upload-zone", "script-input", handleScriptFiles);
    setupModals();
    setupNav();
    updateStorageHints();

    if (useCloud()) {
      await Promise.all([refreshCloudPhotos(), refreshCloudScripts()]);
    } else {
      renderPhotos();
      renderScripts();
    }

    observeReveals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
