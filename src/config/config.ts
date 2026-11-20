
const env = import.meta.env;

const config = {
  app: {
    name: env.VITE_APP_NAME || "Arqora Store",
    environment: env.VITE_APP_ENV || "development"
  },

  api: {
    baseURL: env.VITE_API_BASE_URL,
    timeout: 10000,
  },
};

export default config;
