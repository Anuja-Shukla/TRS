# The Research School — website

A static, dependency-free website (plain HTML/CSS/JS — no build step) for **The Research School**, covering:

- `index.html` — Home (hero, both practice areas, process, contact form)
- `academic-research.html` — Academic Research services in detail
- `business-research.html` — Business Research & Consulting services in detail
- `about.html` — About / approach / values / who we work with
- `css/style.css`, `js/main.js` — shared styling and behaviour

## 1. Push this to GitHub

Repo: `https://github.com/Anuja-Shukla/Theresearchschool.git`

**If you have git installed:**
```bash
cd theresearchschool-site
git init
git remote add origin https://github.com/Anuja-Shukla/Theresearchschool.git
git add .
git commit -m "Initial site: The Research School"
git branch -M main
git push -u origin main
```

**If you don't have git installed** (same as the IRSPL site): go to
`https://github.com/Anuja-Shukla/Theresearchschool.git`, click **Add file → Upload files**,
and drag the contents of this folder in (including the `css/` and `js/` subfolders), then commit
to the `main` branch.

## 2. Turn on GitHub Pages

1. In the repo, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Branch: `main`, folder: `/ (root)`. Save.
4. GitHub will publish the site at `https://anuja-shukla.github.io/Theresearchschool/` within a minute or two.

## 3. Point your domain at it (optional, once you own the domain)

If/when you register a domain (e.g. `theresearchschool.com`) on GoDaddy:

1. In the repo, **Settings → Pages → Custom domain**, enter your domain and save. This creates a
   `CNAME` file in the repo automatically.
2. In GoDaddy DNS for the domain, add:
   - Four **A** records for `@` pointing to GitHub Pages' IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - A **CNAME** record for `www` pointing to `anuja-shukla.github.io`
3. Back in GitHub Pages settings, tick **Enforce HTTPS** once the certificate is issued (can take
   up to 24 hours after DNS propagates).

## Notes / things to double-check before launch

- **Contact form**: there's no backend, so the form opens the visitor's email client pre-filled
  and addressed to `info@theresearchschool.com` (see `js/main.js`). Swap in a form service
  (e.g. Formspree) if you'd rather collect submissions without relying on the visitor's mail app.
- **Email address**: set to `info@theresearchschool.com` (matching the original page content) in
  both `index.html` and `js/main.js` — update everywhere if you want a different inbox, the same
  way the IRSPL site's contact address was changed.
- **LinkedIn link**: currently a placeholder (`#`) in the footer and contact card on every page —
  replace with your actual LinkedIn URL.
- **Address**: "Noida, India" carried over from the original content — update if that's not
  accurate for this brand.
- **Logo mark**: currently a text monogram ("RS") in a navy tile — swap for a real logo file when
  you have one (replace the `.brand-mark` span with an `<img>`).
