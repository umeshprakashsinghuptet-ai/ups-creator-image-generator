# UPS CREATOR STUDIO V10 INFINITY — V10.5 MULTI-TRACK EDITOR

## चलाना
1. ZIP extract करें.
2. Node.js hosting/server पर `npm install` चलाएँ.
3. `npm start` चलाएँ.
4. Browser में server URL खोलें.

**महत्त्वपूर्ण:** GitHub Pages केवल static frontend host करता है; `/api/render/mp4` चलाने के लिए Node backend (Render या अन्य Node host) आवश्यक है। `npm install` में `ffmpeg-static` और `multer` dependencies install होंगी। यदि host system FFmpeg देता है तो `FFMPEG_PATH` environment variable से उसका path दें.

## V10.5 में नया
- Timeline-based synchronized local multi-track preview: video clips timeline position पर दिखाई देते हैं और Voice/Music/SFX clips overlapping playback करते हैं.
- Server-side FFmpeg MP4 render endpoint: multiple uploaded media files, trim in/out, timeline offsets, sequential/overlaid video shots, audio delay, per-track Voice/Music/SFX gain, limiter, H.264/AAC MP4 output.
- Render controls: 1080p/720p, 24/25/30/60 FPS selection, track gain controls, MP4 download और render preview.
- Existing Storyboard → Timeline, Captions → Timeline, split/trim/duplicate/reorder/ripple delete/undo/redo, waveform and EDL features.

## MP4 बनाने का workflow
1. प्रत्येक Video/Voice/Music/Sound Effect timeline clip को वास्तविक local media file से जोड़ें: Editor में file चुनें, Trim In/Out सेट करें, सही Track चुनें, फिर **Add trimmed range to timeline** दबाएँ.
2. Render panel में उन सभी source files को चुनें जिनके नाम timeline clips में दिखते हैं.
3. Preview Timeline Mix चलाकर sync जाँचें.
4. Output width/FPS और Voice/Music/SFX gain सेट करें.
5. **Render & Download MP4** दबाएँ. Backend को FFmpeg उपलब्ध होना चाहिए.

## सीमाएँ और ईमानदार QA
- Storyboard से भेजे गए clips केवल scene metadata होते हैं; वे अपने-आप वास्तविक video नहीं बनते। ऐसे clips के लिए वास्तविक rendered video file को उसी timeline clip से sourceName द्वारा जोड़ना आवश्यक है.
- Preview browser media codecs, autoplay permissions और device performance पर निर्भर है; audio clips का playback HTML media elements से होता है, जबकि final mix FFmpeg server पर बनता है.
- Video track clips overlay होते हैं; अधिक बाद में शुरू होने वाला shot पहले वाले के ऊपर दिखाई देता है. Caption/Text track अभी MP4 पर burn-in नहीं होता.
- Crossfades, animated keyframes, color grading, transitions, proxy editing, full waveform editing और professional effects अभी शामिल नहीं हैं.
- Browser local asset references session-scoped हैं. Render करने से पहले source files फिर से चुनें.
- वास्तविक Android/Desktop manual E2E और sample MP4 output quality की पुष्टि hosting पर deployment के बाद करनी होगी. QA में FFmpeg capability उपलब्ध होना, सफल sample render के बराबर नहीं है.

Developed by Umesh Prakash Singh
