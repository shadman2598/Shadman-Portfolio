/**
 * Portfolio interactivity — renders content, filters, modals, players
 */
(function () {
  "use strict";

  const { profile, projects, showcase } = PORTFOLIO;

  const STATUS_LABELS = {
    "in-progress": "In Progress",
    prototype: "Prototype",
    complete: "Complete",
  };

  const TYPE_LABELS = {
    pdf: "PDF",
    photo: "Photo",
    script: "Script",
    website: "Website",
    song: "Song",
  };

  const TYPE_ICONS = {
    pdf: "📄",
    photo: "📷",
    script: "⌨",
    website: "🌐",
    song: "🎵",
  };

  /* ── Helpers ── */
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "className") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2).toLowerCase(), v);
      else node.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children])
      .filter(Boolean)
      .forEach((c) => node.append(typeof c === "string" ? document.createTextNode(c) : c));
    return node;
  }

  function placeholderThumb(label) {
    return el("div", { className: "project-thumb-placeholder" }, label.charAt(0));
  }

  /* ── Hero stats ── */
  function renderHeroStats() {
    const inProgress = projects.filter((p) => p.status === "in-progress").length;
    const total = projects.length;
    const showcaseCount = showcase.length;

    const stats = [
      { value: inProgress, label: "Active projects" },
      { value: total, label: "Total projects" },
      { value: showcaseCount, label: "Showcase items" },
    ];

    const container = document.getElementById("hero-stats");
    container.innerHTML = "";
    stats.forEach((s) => {
      container.append(
        el("div", { className: "stat-item" }, [
          el("strong", { text: String(s.value) }),
          el("span", { text: s.label }),
        ])
      );
    });
  }

  /* ── Featured project in hero card ── */
  function renderHeroFeatured() {
    const featured = projects.find((p) => p.featured) || projects[0];
    if (!featured) return;

    document.getElementById("hero-featured-title").textContent = featured.title;
    document.getElementById("hero-featured-desc").textContent = featured.description;

    const tagsEl = document.getElementById("hero-featured-tags");
    tagsEl.innerHTML = "";
    featured.tags.forEach((t) => tagsEl.append(el("span", { className: "tag" }, t)));
  }

  /* ── Project cards ── */
  let activeProjectFilter = "all";

  function renderProjectFilters() {
    const statuses = ["all", ...new Set(projects.map((p) => p.status))];
    const container = document.getElementById("project-filters");
    container.innerHTML = "";

    const labels = { all: "All" };
    statuses.forEach((s) => {
      if (s !== "all") labels[s] = STATUS_LABELS[s] || s;
    });

    statuses.forEach((status) => {
      const btn = el("button", {
        className: `filter-btn${status === activeProjectFilter ? " active" : ""}`,
        role: "tab",
        "aria-selected": status === activeProjectFilter,
        onClick: () => {
          activeProjectFilter = status;
          renderProjectFilters();
          renderProjects();
        },
      }, labels[status] || status);
      container.append(btn);
    });
  }

  function renderProjects() {
    const grid = document.getElementById("project-grid");
    grid.innerHTML = "";

    const filtered =
      activeProjectFilter === "all"
        ? projects
        : projects.filter((p) => p.status === activeProjectFilter);

    filtered.forEach((project, i) => {
      const card = el("article", {
        className: `project-card reveal${project.featured ? " featured" : ""}`,
        style: `--delay: ${i * 0.06}s`,
        onClick: () => openProjectModal(project),
      });

      const thumb = el("div", { className: "project-thumb" });
      const img = new Image();
      img.alt = project.title;
      img.onload = () => thumb.append(img);
      img.onerror = () => thumb.append(placeholderThumb(project.title));
      img.src = project.image;

      const body = el("div", { className: "project-body" }, [
        el("div", { className: "project-meta" }, [
          el("span", {
            className: `status-badge ${project.status}`,
            text: STATUS_LABELS[project.status] || project.status,
          }),
          el("span", { className: "project-year", text: project.year }),
        ]),
        el("h3", { text: project.title }),
        el("p", { text: project.description }),
      ]);

      if (project.progress < 100) {
        body.append(
          el("div", { className: "progress-bar" }, [
            el("div", {
              className: "progress-fill",
              style: `width: ${project.progress}%`,
            }),
          ])
        );
      }

      const tags = el("div", { className: "project-tags" });
      project.tags.forEach((t) => tags.append(el("span", { className: "tag" }, t)));
      body.append(tags);

      card.append(thumb, body);
      grid.append(card);
    });

    observeReveals();
  }

  function openProjectModal(project) {
    const modal = document.getElementById("detail-modal");
    const body = document.getElementById("modal-body");
    body.innerHTML = "";

    body.append(
      el("span", {
        className: `status-badge ${project.status}`,
        text: STATUS_LABELS[project.status],
      }),
      el("h2", { id: "modal-title", text: project.title }),
      el("p", { text: project.description }),
    );

    if (project.progress < 100) {
      body.append(
        el("p", { text: `Progress: ${project.progress}%` }),
        el("div", { className: "progress-bar" }, [
          el("div", {
            className: "progress-fill",
            style: `width: ${project.progress}%`,
          }),
        ])
      );
    }

    const tagWrap = el("div", { className: "project-tags" });
    project.tags.forEach((t) => tagWrap.append(el("span", { className: "tag" }, t)));
    body.append(tagWrap);

    if (project.link && project.link !== "#") {
      body.append(
        el("a", {
          href: project.link,
          className: "btn btn-primary",
          target: "_blank",
          rel: "noopener",
          style: "margin-top: 20px; display: inline-flex;",
        }, "View project →")
      );
    }

    modal.showModal();
  }

  /* ── Showcase ── */
  let activeShowcaseTab = "all";

  function renderShowcaseTabs() {
    const types = ["all", ...new Set(showcase.map((s) => s.type))];
    const container = document.getElementById("showcase-tabs");
    container.innerHTML = "";

    types.forEach((type) => {
      const btn = el("button", {
        className: `tab-btn${type === activeShowcaseTab ? " active" : ""}`,
        role: "tab",
        onClick: () => {
          activeShowcaseTab = type;
          renderShowcaseTabs();
          renderShowcase();
        },
      }, type === "all" ? "All" : TYPE_LABELS[type] || type);
      container.append(btn);
    });
  }

  function renderShowcase() {
    const grid = document.getElementById("showcase-grid");
    grid.innerHTML = "";

    const filtered =
      activeShowcaseTab === "all"
        ? showcase
        : showcase.filter((s) => s.type === activeShowcaseTab);

    filtered.forEach((item, i) => {
      grid.append(buildShowcaseCard(item, i));
    });

    observeReveals();
  }

  function buildShowcaseCard(item, index) {
    const card = el("article", {
      className: "showcase-card reveal",
      style: `--delay: ${index * 0.05}s`,
    });

    const visual = el("div", { className: "showcase-visual" });
    visual.append(
      el("span", { className: "showcase-type-label", text: TYPE_LABELS[item.type] })
    );

    const thumbSrc = item.thumbnail || item.cover || item.file;
    if (thumbSrc && (item.type === "photo" || item.thumbnail || item.cover)) {
      const img = new Image();
      img.alt = item.title;
      img.onerror = () => {
        img.remove();
        visual.append(el("span", { className: "showcase-icon", text: TYPE_ICONS[item.type] }));
      };
      img.src = thumbSrc;
      visual.append(img);
    } else {
      visual.append(el("span", { className: "showcase-icon", text: TYPE_ICONS[item.type] }));
    }

    const body = el("div", { className: "showcase-body" }, [
      el("h3", { text: item.title }),
      el("p", { text: item.description }),
    ]);

    if (item.type === "script" && item.preview) {
      body.append(el("pre", { className: "script-preview" }, item.preview));
    }

    if (item.type === "song") {
      body.append(buildAudioPlayer(item));
    } else {
      body.append(buildShowcaseActions(item));
    }

    card.append(visual, body);
    return card;
  }

  function buildShowcaseActions(item) {
    const actions = el("div", { className: "showcase-actions" });

    if (item.type === "pdf") {
      actions.append(
        el("a", {
          href: item.file,
          className: "showcase-btn primary",
          target: "_blank",
          rel: "noopener",
        }, "Open PDF"),
        el("a", {
          href: item.file,
          className: "showcase-btn",
          download: "",
        }, "Download")
      );
    } else if (item.type === "photo") {
      actions.append(
        el("button", {
          className: "showcase-btn primary",
          onClick: () => openLightbox(item.file, item.title),
        }, "View full size")
      );
    } else if (item.type === "script") {
      actions.append(
        el("a", {
          href: item.file,
          className: "showcase-btn primary",
          target: "_blank",
          rel: "noopener",
        }, "View file"),
        el("button", {
          className: "showcase-btn",
          onClick: () => openScriptModal(item),
        }, "Preview")
      );
    } else if (item.type === "website") {
      actions.append(
        el("a", {
          href: item.url,
          className: "showcase-btn primary",
          target: "_blank",
          rel: "noopener",
        }, "Visit site →")
      );
    }

    return actions;
  }

  function buildAudioPlayer(item) {
    const audio = new Audio(item.file);
    let playing = false;

    const playBtn = el("button", { text: "▶" });
    const durationEl = el("span", { className: "audio-duration", text: item.duration || "" });

    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (playing) {
        audio.pause();
        playBtn.textContent = "▶";
        playing = false;
      } else {
        document.querySelectorAll("audio").forEach((a) => a.pause());
        audio.play().catch(() => {});
        playBtn.textContent = "❚❚";
        playing = true;
      }
    });

    audio.addEventListener("ended", () => {
      playBtn.textContent = "▶";
      playing = false;
    });

    const cover = item.cover
      ? el("img", { className: "audio-cover", src: item.cover, alt: item.title })
      : el("div", { className: "audio-cover", style: "display:flex;align-items:center;justify-content:center;font-size:1.2rem;" }, "🎵");

    cover.onerror = () => {
      cover.replaceWith(
        el("div", { className: "audio-cover", style: "display:flex;align-items:center;justify-content:center;font-size:1.2rem;" }, "🎵")
      );
    };

    return el("div", { className: "audio-player" }, [
      cover,
      el("div", { className: "audio-controls" }, [
        el("div", { className: "audio-title", text: item.title }),
        durationEl,
        playBtn,
      ]),
    ]);
  }

  function openLightbox(src, caption) {
    const modal = document.getElementById("lightbox-modal");
    const img = document.getElementById("lightbox-img");
    img.src = src;
    img.alt = caption;
    document.getElementById("lightbox-caption").textContent = caption;
    modal.showModal();
  }

  function openScriptModal(item) {
    const modal = document.getElementById("detail-modal");
    const body = document.getElementById("modal-body");
    body.innerHTML = "";
    body.append(
      el("h2", { id: "modal-title", text: item.title }),
      el("p", { text: `${item.language || "Script"} · ${item.year}` }),
      el("pre", { className: "script-preview", style: "max-height: 400px;" }, item.preview || "// No preview available"),
      el("a", {
        href: item.file,
        className: "btn btn-primary",
        target: "_blank",
        style: "margin-top: 16px; display: inline-flex;",
      }, "Open full file →")
    );
    modal.showModal();
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

  /* ── Modals close ── */
  function setupModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.querySelector(".modal-close")?.addEventListener("click", () => modal.close());
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.close();
      });
    });
  }

  /* ── Mobile nav ── */
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
    document.querySelectorAll(".reveal:not(.visible)").forEach((el) => revealObserver.observe(el));
  }

  /* ── Init ── */
  function init() {
    document.getElementById("year").textContent = new Date().getFullYear();
    renderHeroStats();
    renderHeroFeatured();
    renderProjectFilters();
    renderProjects();
    renderShowcaseTabs();
    renderShowcase();
    renderAbout();
    renderContact();
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
