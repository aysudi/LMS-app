declare module "*.json" {
  const value: any;
  export default value;
}

declare module "react-i18next" {
  export function useTranslation(ns?: string): {
    t: (key: string, options?: any) => string;
    i18n: {
      language: string;
      changeLanguage: (lng: string) => Promise<any>;
    };
  };

  export const initReactI18next: any;
}
