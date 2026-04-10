import envConfig from "../configs/env.config.js";

const baseUrl = envConfig.tmdbBaseUrl;
const key = envConfig.tmdbKey;
const accessToken = envConfig.tmdbAccessToken;

const getUrl = (endpoint, params) => {
  const qs = new URLSearchParams(params);

  if (key) {
    qs.set("api_key", key);
  }

  return `${baseUrl}${endpoint}?${qs}`;
};

const getHeaders = () => {
  if (!accessToken) return {};

  return {
    Authorization: `Bearer ${accessToken}`
  };
};

export default { getUrl, getHeaders };