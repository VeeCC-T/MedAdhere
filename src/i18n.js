// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      please_fill_all_fields: "Please fill all required fields.",
      offline_saved: "You’re offline. Entry saved locally and will sync when online.",
      synced_success: "Data synced successfully.",
      queued_for_sync: "Could not sync now — saved locally and queued.",
      free_limit_reached: "You’ve reached your free limit. Upgrade to Premium for unlimited access!",
      add_medication: "Add Medication 💊",
      save_medication: "Save Medication",
      clear: "Clear",
      saved_medications: "Saved Medications",
      no_meds: "No medications added yet.",
      free_plan_usage: "Free plan usage:",
      med_name_placeholder: "Medication name",
      dosage_placeholder: "Dosage (e.g., 500mg)",
      submit_error: "Something went wrong. Please try again.",
    },
  },
  yo: {
    translation: {
      please_fill_all_fields: "Jọwọ fọwọsi gbogbo awọn aaye ti o jẹ dandan.",
      offline_saved: "O wa lori ayelujara tabi ofo. A ti fipamọ igbasilẹ rẹ laifọwọyi ki yoo ṣepọ nigbati o ba pada lori ayelujara.",
      synced_success: "Data ti ṣepọ ni aṣeyọri.",
      queued_for_sync: "Ko le ṣepọ bayi — a fipamọ ati pe a ti ṣeto fun iṣepọ nigbamii.",
      free_limit_reached: "O ti de opin eto ọfẹ. Ṣe imudojuiwọn si Premium fun wiwọle ailopin!",
      add_medication: "Ṣe afikun oogun 💊",
      save_medication: "Fipamọ Oogun",
      clear: "Nu",
      saved_medications: "Awọn oogun ti fipamọ",
      no_meds: "Ko si oogun ti a fi kun sibẹsibẹ.",
      free_plan_usage: "Lilo eto ọfẹ:",
      med_name_placeholder: "Orukọ oogun",
      dosage_placeholder: "Iwọn (fun apẹẹrẹ, 500mg)",
      submit_error: "Ohun kan bajẹ. Jọwọ gbiyanju lẹẹkansi.",
    },
  },
};

const saved = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: saved,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
