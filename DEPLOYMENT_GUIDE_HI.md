# Render पर UPS Creator Studio Deploy करने का तरीका

1. ZIP Extract करें।
2. पूरा `UPS_CREATOR_STUDIO_FINAL` फ़ोल्डर GitHub की नई repository में अपलोड करें। पुरानी repository न हटाएँ।
3. Render → New → Web Service → GitHub repository चुनें।
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Environment Variables में जोड़ें:
   - KEY: `GEMINI_API_KEY`
   - VALUE: Google AI Studio से बनाई गई नई API Key
   - वैकल्पिक KEY: `GEMINI_TEXT_MODEL`, VALUE: `gemini-2.5-flash`
7. Deploy Web Service दबाएँ।
8. वेबसाइट खुलने पर `/api/health` खोलें। `keyConfigured: true` दिखना चाहिए।

सावधानी: API Key को GitHub या `public/app.js` में कभी न डालें। पहले भेजी गई/उजागर हुई Key को revoke करके नई Key बनाएँ।

यह ZIP नया working starter है। पुराना Login, Super Admin, Razorpay/UPI, Supabase Auth और production database इसमें स्वतः migrate नहीं हुए हैं क्योंकि उपलब्ध पुरानी ZIP खाली (0 bytes) थी। पुराने सिस्टम को हटाने से पहले उसकी अलग backup प्रति रखें।
