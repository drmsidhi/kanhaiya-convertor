# FileMango

A privacy-first, static online utility platform for photo, signature, image and document preparation. It is designed to deploy to GitHub Pages with no backend for normal image processing.

## What works today

- Image upload by picker or drag-and-drop (JPG, PNG, WEBP; 20 MB limit).
- Client-side canvas resize, square crop, rotation, white-margin trimming for signatures, brightness, contrast, grayscale and background colour.
- JPG, PNG and WEBP exports, including target-size JPEG/WEBP compression using a bounded binary quality search.
- Batch processing: tools accept multiple images where relevant and produce individually downloadable results.
- Local single-image PDF generation from processed images.
- SEO-oriented crawlable static routes, tool metadata, legal/trust pages, sitemap, robots, manifest, ad placeholders and configurable site identity.

## Development

This repository intentionally uses zero runtime dependencies: the browser Canvas, Blob, File and URL APIs provide core processing. This keeps the static shell very small for mobile networks.

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

`npm run dev` starts a local static server on `http://localhost:5173`. The static production bundle is written to `dist/`.

## Deployment to GitHub Pages

1. In GitHub, set **Pages** source to **GitHub Actions**.
2. Push to `main`; the supplied workflow builds and deploys `dist/`.
3. The workflow derives the canonical GitHub Pages URL from the repository owner/name; use `SITE_URL` only when deploying to a custom domain.

The production build emits a static `index.html` for every important route, so direct tool URLs work on GitHub Pages and can be crawled without server rewrites.

## Configuration

- `config/site.js` controls the brand name, canonical URL, privacy copy and optional analytics identifier.
- `presets/index.js` holds editable, clearly caveated application-size presets.
- `src/main.js` holds tool metadata; add tools there to create cards and related links.

## Privacy and limitations

Files are processed in-memory in the browser and are never uploaded by normal tools. This version deliberately does not claim official government acceptance for presets. Verify current requirements with the receiving organisation. PDF creation is image-based; it does not edit or rasterize existing PDF files. ZIP download and PDF-to-JPG are reserved for a future library-backed enhancement.
