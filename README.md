# UPS Creator Studio — Final Auto Pilot Starter

## Included
- One-question-at-a-time project wizard.
- Auto mode and fresh topic defaults.
- Categories: story, motivational, education, GK/MCQ, facts, documentary, news/current affairs, vlog, podcast, shayari, business, dance/music.
- Format, duration, aspect ratio, audience, language, dialogue tone, visual engine, image quality and frame-count filters.
- Storyboard/dialogue, image prompts and sequential video shot prompts.
- Real sequential image generation through OpenAI Images API.
- Individual PNG download and complete image-sequence ZIP.
- Secure server-side API key handling.

## Requirements
Node.js 18+ and an OpenAI API key with image-generation access. API usage can incur charges.

## Run on a computer
1. Extract this ZIP.
2. Open a terminal in the extracted folder.
3. Run `npm install`.
4. Set `OPENAI_API_KEY` as a private environment variable:
   - macOS/Linux: `export OPENAI_API_KEY="your_key"`
   - Windows PowerShell: `$env:OPENAI_API_KEY="your_key"`
5. Run `npm start`.
6. Visit `http://localhost:3000`.

## Deploy
Deploy the whole repository as a Node.js Web Service. Build command: `npm install`. Start command: `npm start`. Add `OPENAI_API_KEY` in the host's private Environment Variables. Do not put it in HTML, JS, or GitHub.

## Important limitations
- This project is not a static GitHub Pages-only app. It needs a Node.js server for image generation.
- It produces video shot prompts/storyboard, not rendered video files. Real video rendering requires a separate supported video-generation provider/API and its credentials.
- Auto-generated topic/script are starter templates; fact-sensitive GK/current-affairs content must be verified before publishing.
- Character continuity is prompt-guided, not guaranteed identical. Strong identity consistency may require supported reference-image conditioning.
- Aspect ratios map to nearest supported image dimensions; 3:4 and 4:3 are approximate in this implementation.
- The ZIP contains source code, not pre-generated images. Actual images are created after API setup and clicking Generate Images.
- JSZip is loaded from a CDN; internet is required for ZIP export.
