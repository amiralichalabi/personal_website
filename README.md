# Amir Ali Chalabi — Bilingual Personal Website

A fast, static, bilingual (English / Persian) personal website: research, projects, experience, education, and downloadable CVs. No backend, no trackers, no third-party requests — fonts are self-hosted.

## Structure
| Path | Purpose |
|---|---|
| `index.html`, `research.html` | **English** pages (source of truth for structure) |
| `fa/index.html`, `fa/research.html` | **Persian** pages — generated, do not edit by hand |
| `build/fa.json` | Persian text for every `data-i18n` element |
| `build/build.py` | Generates `fa/*.html` from the English pages + `fa.json` |
| `style.css`, `script.js` | Styles (dark/light, RTL) and small runtime (theme, menu, language preference) |
| `assets/` | Photo, favicon, social image, self-hosted fonts, CV PDFs |
| `404.html`, `robots.txt`, `sitemap.xml` | Hosting / SEO files |
| `set-domain.sh` | Fills in your domain and writes `CNAME` |
| `DEPLOY-FA.md` | Domain purchase + publishing guide (Persian) |

## Editing content
1. Change English text in `index.html` / `research.html`.
2. Change the matching Persian text in `build/fa.json` (same key as the element's `data-i18n`).
3. Regenerate: `pip install beautifulsoup4 && python3 build/build.py`
4. Commit both the English files and the regenerated `fa/` files.

## Run locally
```bash
python3 -m http.server 8000   # open http://localhost:8000  (Persian: /fa/)
```

## Language & theme
- Each language is a separate, indexable URL (`/` and `/fa/`) with `hreflang` links. The FA/EN button links between them and remembers the choice; first-time visitors whose browser is Persian are sent to `/fa/` once.
- Theme follows the system setting on first visit, then remembers the toggle.

## Publish
See `DEPLOY-FA.md`: push to GitHub → enable Pages → `./set-domain.sh yourname.ir` → DNS records.

## Privacy
The site collects no data. The public contact detail is the e-mail address (also in the CV PDFs). Phone numbers were removed from the site and the PDFs. Editable Word versions of the CVs are intentionally **not** in this repository.
