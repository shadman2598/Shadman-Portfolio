# Shadman Portfolio

A modern portfolio highlighting **[Zarish Charity](https://zarishcharity.org/)**, plus photo and script uploads for grant reviewers.

## Preview

```bash
cd ~/shadman-portfolio
python3 -m http.server 8765
```

Open [http://localhost:8765](http://localhost:8765)

## What's on the site

1. **Zarish Charity** — featured first with goals (food, water, clothing, education) and a link to [zarishcharity.org](https://zarishcharity.org/)
2. **Photos** — drag & drop or click to upload images (saved in your browser)
3. **Scripts** — upload code files to preview and share
4. **About / Contact** — your bio and links

## Customize

Edit **`js/content.js`** for name, bio, charity copy, and permanent seed items.

### Permanent photos & scripts (for deployment)

Browser uploads are stored in **localStorage** (this device/browser only). For a live public site:

1. Put files in `assets/images/` or `assets/scripts/`
2. Add them to the `photos` / `scripts` arrays in `js/content.js`

## Deploy

Static site — works on GitHub Pages, Netlify, or Vercel with no build step.
