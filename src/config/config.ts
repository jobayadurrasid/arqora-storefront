
const env = import.meta.env;

const config = {
  app: {
    currency: env.VITE_CURRENCY || "BDT",
    theme: env.VITE_THEME || "classic",
    logo: (env.VITE_LOGO as string | undefined)?.trim() || "ARQORA",
    name: env.VITE_APP_NAME || "Arqora Store",
    environment: env.VITE_APP_ENV || "development",
  },

  api: {
    baseURL: env.VITE_API_BASE_URL,
    timeout: 10000,
  },
};

export default config;
