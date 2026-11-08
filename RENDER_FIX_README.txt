UPS Creator Studio Render 404 fix
=================================

Replace these two files in the repository root:
- package.json
- server/index.js

Keep server/pipeline-config.js where it is.
Keep index.html, styles.css and app.js in the repository root.
Do not move them into a public folder for this version.

Render settings:
- Root Directory: blank (repository root)
- Build Command: npm install
- Start Command: npm start

Render Environment:
- GEMINI_API_KEY = your own Google AI Studio API key
- GEMINI_TEXT_MODEL = gemini-2.5-flash (optional)
- MAX_UPLOAD_MB = 20 (optional)

The server serves /, /index.html, /styles.css and /app.js from the repository root.
It does not implement FFmpeg rendering or MP4 export; this patch fixes frontend serving and preserves the Gemini generation/media-analysis routes from the supplied server code.

After deploy, test:
1. https://YOUR-RENDER-DOMAIN/
2. https://YOUR-RENDER-DOMAIN/api/health
3. https://YOUR-RENDER-DOMAIN/styles.css
4. https://YOUR-RENDER-DOMAIN/app.js
