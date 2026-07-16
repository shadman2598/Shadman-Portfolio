# Shadman Portfolio

A beautiful, modern portfolio website designed for grant reviewers — showcasing active projects, work-in-progress, and creative artifacts (PDFs, photos, scripts, websites, music).

## Preview locally

```bash
cd ~/shadman-portfolio
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080)

## Customize your content

Edit **`js/content.js`** — that's the only file you need to update for most changes:

| Section | What to edit |
|---------|--------------|
| `profile` | Name, bio, contact links, focus areas |
| `projects` | Active & past projects with status & progress |
| `showcase` | PDFs, photos, scripts, websites, songs |

### Add media files

Drop files into the `assets/` folders:

```
assets/
├── images/      # Photos
├── pdfs/        # PDF documents
├── audio/       # Songs (.mp3, .wav)
├── scripts/     # Code files (.py, .sh, etc.)
└── thumbnails/  # Preview images for cards
```

Then reference the paths in `content.js`.

### Project statuses

- `in-progress` — active work (amber badge)
- `prototype` — early concept (violet badge)
- `complete` — finished (teal badge)

## Deploy

This is a static site — host anywhere for free:

- **GitHub Pages** — push to GitHub, enable Pages from `main` branch
- **Netlify** — drag & drop the folder
- **Vercel** — import the repo

## Structure

```
shadman-portfolio/
├── index.html
├── css/styles.css
├── js/
│   ├── content.js   ← edit this
│   └── main.js
└── assets/
```
