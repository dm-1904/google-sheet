# Blog Image Workflow

This project now supports local blog images from:

- `client/public/images/blog`

Anything in that folder is available in the browser at:

- `/images/blog/<file-name>`

## What To Do For Each New Article

1. Add your image file to:
   - `client/public/images/blog`
2. In your Google Sheet, set `featured_image_url` using one of these formats:
   - `my-article-image.jpg` (recommended, shortest)
   - `images/blog/my-article-image.jpg`
   - `/images/blog/my-article-image.jpg`
   - `https://...` (external image URL)
3. Set `featured_image_alt` in the sheet with a real descriptive alt text.
4. Save the row and make sure the article `status` is `published`.
5. Open your post URL and confirm the image renders.

## URL Mapping Rules (Now Implemented)

The backend normalizes `featured_image_url` as follows:

- Full URL (`https://...`) stays as-is.
- Path starting with `/` stays as-is.
- `images/...` becomes `/images/...`.
- `blog/...` becomes `/images/blog/...`.
- Just a filename like `photo.jpg` becomes `/images/blog/photo.jpg`.

## Notes

- If you changed only Google Sheet data and do not see updates immediately, wait for API cache refresh (up to ~3 minutes) or restart the server.
- Use compressed JPG/WebP files when possible for faster load times.
