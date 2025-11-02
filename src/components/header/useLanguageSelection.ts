import { useMemo } from "react";
import { Language } from "utils/constants";
import i18n from "i18n/config";

export const useLanguageSelection = (): Language => {
  return useMemo(() => {
    switch (i18n.language) {
      case Language.CROATIA:
        return Language.CROATIA;
      case Language.DUTCH:
        return Language.DUTCH;
      case Language.GERMAN:
        return Language.GERMAN;
      case Language.ITALIAN:
        return Language.ITALIAN;
      case Language.PORTUGUESE:
        return Language.PORTUGUESE;
      case Language.RUSSIAN:
        return Language.RUSSIAN;
      case Language.SPANISH:
        return Language.SPANISH;
      default:
        return Language.ENGLISH;
    }
  }, [i18n.language]);
};

