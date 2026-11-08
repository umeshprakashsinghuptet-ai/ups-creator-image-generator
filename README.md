# UPS Creator Studio — AI Film Director

Developed by Umesh Prakash Singh. This is a deployable starter application with an Express backend, Gemini integration, Auto/Manual workflow modes, production-plan generation, uploaded audio/video analysis, browser microphone recording, and a mobile-responsive dashboard.

## Important capability boundaries
- Text generation and uploaded-media analysis run through the configured Gemini API model. Model support, file-size limits, regional availability, quotas and billing depend on Google AI Studio/Gemini API account settings.
- A URL by itself is not a media download or guaranteed transcript. The app builds a URL analysis plan from supplied URL/context; use the upload control for media the user is authorized to analyze, or paste a transcript.
- Recording is browser-local and downloadable. It is not stored in Supabase.
- The app creates prompts and production plans; it does not itself render finished image/video/audio assets. Connect a provider that supports those outputs before advertising those features as rendering.
- Supabase SQL is an optional starter schema only. Existing authentication, Super Admin, payments, subscriptions and previous production database are not migrated in this starter package.

## Deploy to Render
1. Extract ZIP and upload the folder contents to a new GitHub repository (do not delete the old repository).
2. In Render, create a **Web Service** connected to that repository.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add Environment Variable: `GEMINI_API_KEY` = your newly created Google AI Studio API key.
6. Optional: `GEMINI_TEXT_MODEL` = `gemini-2.5-flash`; `MAX_UPLOAD_MB` = `20`.
7. Deploy. Open `/api/health`; `keyConfigured` should be `true`.

## Local run
- Install Node.js 20+
- `npm install`
- Copy `.env.example` to `.env` and set `GEMINI_API_KEY`
- `npm start`
- Open `http://localhost:10000`

## Modules and locks
The Director prompt applies 8 engines, a 50-module production scope and 15 master locks as planning instructions. They are orchestration rules, not 50 independently deployed AI services.

## Security
Never put API keys in `public/`, GitHub commits, browser JavaScript or screenshots. If a key has been exposed, revoke it and create a replacement. Use Render Environment settings. Add authentication, rate limiting, user quotas and storage controls before public multi-user launch.

## Included files
- `public/`: responsive web UI and browser recording
- `server/`: Gemini API backend and media upload analysis
- `supabase/schema.sql`: optional user-owned project table with RLS
- `legacy-reference/`: retained prior HTML/QA reference artifacts for comparison; not automatically merged into the new application
