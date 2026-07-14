from typing import Dict, Any

class TranslationEngine:
    def __init__(self):
        # Mocks a set of default greetings and phrases in supported languages
        self.phrases = {
            "en": {
                "greeting": "Hello! I am your AI Health Copilot. How can I assist you today?",
                "not_found": "I could not find the requested details.",
                "processing": "Analyzing medical inventories..."
            },
            "hi": {
                "greeting": "नमस्ते! मैं आपका एआई हेल्थ कोपायलट हूं। आज मैं आपकी क्या मदद कर सकता हूं?",
                "not_found": "मुझे अनुरोधित विवरण नहीं मिल सका।",
                "processing": "चिकित्सा सूची का विश्लेषण कर रहे हैं..."
            },
            "ta": {
                "greeting": "வணக்கம்! நான் உங்கள் AI ஹெல்த் கோபைலட். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
                "not_found": "கோரப்பட்ட விவரங்களை என்னால் கண்டுபிடிக்க முடியவில்லை.",
                "processing": "மருத்துவப் பொருட்களை பகுப்பாய்வு செய்கிறது..."
            },
            "te": {
                "greeting": "నమస్తే! నేను మీ AI హెల్త్ కోపైలట్. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
                "not_found": "అభ్యర్థించిన వివరాలను నేను కనుగొనలేకపోయాను.",
                "processing": "వైద్య నిల్వలను విశ్లేషిస్తోంది..."
            },
            "ml": {
                "greeting": "ഹലോ! ഞാൻ നിങ്ങളുടെ AI ഹെൽത്ത് കോപൈലറ്റ് ആണ്. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കും?",
                "not_found": "ആവശ്യപ്പെട്ട വിവരങ്ങൾ കണ്ടെത്താനായില്ല.",
                "processing": "മെഡിക്കൽ ഇൻവെന്ററി വിശകലനം ചെയ്യുന്നു..."
            },
            "kn": {
                "greeting": "ನಮಸ್ತೆ! ನಾನು ನಿಮ್ಮ AI ಹೆಲ್ತ್ ಕೋಪೈಲಟ್. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
                "not_found": "ವಿನಂತಿಸಿದ ವಿವರಗಳನ್ನು ಕಂಡುಹಿಡಿಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
                "processing": "ವೈದ್ಯಕೀಯ ದಾಸ್ತಾನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..."
            }
        }

    def translate(self, text: str, target_lang: str) -> str:
        """
        Translates phrases to target languages. Returns text unchanged if no translation is cached.
        """
        lang = target_lang.lower()
        if lang not in self.phrases:
            return text
            
        # Match standard keys
        for key, val in self.phrases["en"].items():
            if val.lower() in text.lower():
                return self.phrases[lang].get(key, text)
                
        return text
