/**
 * PDF helpers — render pages as images so gallery visitors see them like JPG/PNG
 * Uses Mozilla PDF.js
 */
(function (global) {
  "use strict";

  const cache = new Map();

  function ensurePdfJs() {
    if (!global.pdfjsLib) {
      throw new Error("PDF.js is not loaded yet.");
    }
    if (!global.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      global.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
  }

  async function getDocument(url) {
    ensurePdfJs();
    return global.pdfjsLib.getDocument({
      url,
      withCredentials: false,
      // Public Supabase URLs / data URLs
      disableRange: true,
      disableStream: true,
    }).promise;
  }

  async function renderPageToDataUrl(page, maxWidth) {
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(maxWidth / base.width, 1.6);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL("image/jpeg", 0.88);
  }

  /**
   * Returns data-URL images for every page in the PDF (cached).
   */
  async function renderAllPages(url, maxWidth = 900) {
    if (!url) return [];
    if (cache.has(url)) return cache.get(url);

    const pending = (async () => {
      const pdf = await getDocument(url);
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i += 1) {
        const page = await pdf.getPage(i);
        pages.push({
          page: i,
          total: pdf.numPages,
          src: await renderPageToDataUrl(page, maxWidth),
        });
      }
      return pages;
    })();

    cache.set(url, pending);
    try {
      return await pending;
    } catch (err) {
      cache.delete(url);
      throw err;
    }
  }

  async function renderFirstPage(url, maxWidth = 640) {
    const pages = await renderAllPages(url, maxWidth);
    return pages[0]?.src || "";
  }

  global.PortfolioPdf = {
    renderAllPages,
    renderFirstPage,
  };
})(window);
