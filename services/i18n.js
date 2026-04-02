import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
  en: {
    translation: {
      tabs: {
        home: 'Home',
        harvest: 'Harvest',
        scan: 'Scan QR',
        hub: 'Hub',
        profile: 'Profile'
      },
      dashboard: {
        greeting: 'Welcome back.',
        quick_actions: 'Quick Actions',
        ledger: 'Ledger',
        reports: 'Analytics / Reports',
        iot: 'IoT Sensors',
        gis: 'GIS Map',
        market: 'Market Prices',
        recent_activity: 'Recent Activity'
      },
      harvest: {
        title: 'My Harvests',
        advisor: 'Advisor',
        ai_assist: 'AI Assist',
        add: 'Add Batch',
        empty: 'No harvests yet.',
        crop: 'Crop Type',
        quantity: 'Quantity',
        unit: 'Unit',
        location: 'Location / Village',
        payout: 'Farmer Payout (₹/kg)',
        consumer_price: 'Consumer Price (₹/kg)',
        transport: 'Transport Cost (₹/kg)',
        submit: 'Save to Ledger'
      }
    }
  },
  hi: {
    translation: {
      tabs: { home: 'होम', harvest: 'फसल', scan: 'स्कैन', hub: 'हब', profile: 'प्रोफ़ाइल' },
      dashboard: {
        greeting: 'वापसी पर स्वागत है।',
        quick_actions: 'त्वरित कार्रवाई',
        ledger: 'बहीखाता',
        reports: 'रिपोर्ट',
        iot: 'IoT सेंसर',
        gis: 'खेत का नक्शा',
        market: 'बाज़ार भाव',
        recent_activity: 'हाल की गतिविधि'
      },
      harvest: {
        title: 'मेरी फसलें', advisor: 'सलाहकार', ai_assist: 'AI सहायता', add: 'जोड़ें', empty: 'अभी कोई फसल नहीं।',
        crop: 'फसल का प्रकार', quantity: 'मात्रा', unit: 'इकाई', location: 'स्थान / गाँव',
        payout: 'किसान भुगतान (₹/kg)', consumer_price: 'उपभोक्ता मूल्य (₹/kg)', transport: 'परिवहन लागत (₹/kg)', submit: 'बहीखाते में सहेजें'
      }
    }
  },
  te: {
    translation: {
      tabs: { home: 'హోమ్', harvest: 'పంట', scan: 'స్కాన్', hub: 'హబ్', profile: 'ప్రొఫైల్' },
      dashboard: {
        greeting: 'స్వాగతం.',
        quick_actions: 'త్వరిత చర్యలు',
        ledger: 'లెడ్జర్',
        reports: 'నివేదికలు',
        iot: 'IoT సెన్సార్లు',
        gis: 'పొలం మ్యాప్',
        market: 'మార్కెట్ ధరలు',
        recent_activity: 'ఇటీవలి కార్యాచరణ'
      },
      harvest: {
        title: 'నా పంటలు', advisor: 'సలహాదారు', ai_assist: 'AI సహాయం', add: 'జోడించు', empty: 'ఇంకా పంటలు లేవు.',
        crop: 'పంట రకం', quantity: 'పరిమాణం', unit: 'యూనిట్', location: 'స్థానం',
        payout: 'రైతు చెల్లింపు (₹/kg)', consumer_price: 'వినియోగదారు ధర (₹/kg)', transport: 'రవాణా ఖర్చు (₹/kg)', submit: 'లెడ్జర్‌కు సేవ్ చేయండి'
      }
    }
  },
  kn: {
    translation: {
      tabs: { home: 'ಮುಖಪುಟ', harvest: 'ಫಸಲು', scan: 'ಸ್ಕ್ಯಾನ್', hub: 'ಹಬ್', profile: 'ಪ್ರೊಫೈಲ್' },
      dashboard: {
        greeting: 'ಸ್ವಾಗತ.', quick_actions: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು', ledger: 'ಲೆಡ್ಜರ್', reports: 'ವರದಿಗಳು',
        iot: 'ಸಂವೇದಕಗಳು (IoT)', gis: 'ನಕ್ಷೆ', market: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು', recent_activity: 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ'
      },
      harvest: {
        title: 'ನನ್ನ ಫಸಲುಗಳು', advisor: 'ಸಲಹೆಗಾರ', ai_assist: 'AI ಸಹಾಯ', add: 'ಸೇರಿಸಿ', empty: 'ಯಾವುದೇ ಫಸಲುಗಳಿಲ್ಲ.',
        crop: 'ಬೆಳೆಯ ಪ್ರಕಾರ', quantity: 'ಪ್ರಮಾಣ', unit: 'ಘಟಕ', location: 'ಸ್ಥಳ / ಗ್ರಾಮ',
        payout: 'ರೈತರ ಪಾವತಿ (₹/kg)', consumer_price: 'ಗ್ರಾಹಕರ ಬೆಲೆ (₹/kg)', transport: 'ಸಾರಿಗೆ ವೆಚ್ಚ (₹/kg)', submit: 'ಉಳಿಸು'
      }
    }
  },
  ta: {
    translation: {
      tabs: { home: 'முகப்பு', harvest: 'அறுவடை', scan: 'ஸ்கேன்', hub: 'மையம்', profile: 'விவரம்' },
      dashboard: {
        greeting: 'வரவேற்கிறோம்.', quick_actions: 'செயல்பாடுகள்', ledger: 'லெட்ஜர்', reports: 'அறிக்கைகள்',
        iot: 'கருவிகள்', gis: 'வரைபடம்', market: 'சந்தை விலைகள்', recent_activity: 'சமீபத்திய செயல்பாடு'
      },
      harvest: {
        title: 'என் அறுவடைகள்', advisor: 'ஆலோசகர்', ai_assist: 'AI உதவி', add: 'சேர்', empty: 'எந்த அறுவடையும் இல்லை.',
        crop: 'பயிர் வகை', quantity: 'அளவு', unit: 'அலகு', location: 'இடம்',
        payout: 'விவசாயி கட்டணம் (₹/kg)', consumer_price: 'நுகர்வோர் விலை (₹/kg)', transport: 'போக்குவரத்து செலவு (₹/kg)', submit: 'சேமிக்க'
      }
    }
  }
};

const initI18n = async () => {
  let savedLang = 'en';
  try {
    const val = await AsyncStorage.getItem('appLang');
    if (val) savedLang = val;
  } catch (e) {
    console.log('Error reading language', e);
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v3' // Required for Android React Native
  });
};

initI18n();

export default i18n;
