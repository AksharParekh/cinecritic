import axios from "axios";
import queryString from "query-string";
import runtimeConfigs from "../configs/runtime.configs";

const tmdbClient = axios.create({
  baseURL: runtimeConfigs.tmdbBaseUrl,
  paramsSerializer: {
    encode: params => queryString.stringify(params)
  }
});

tmdbClient.interceptors.request.use(async config => {
  const params = {
    ...(config.params || {})
  };

  if (runtimeConfigs.tmdbKey && !params.api_key) {
    params.api_key = runtimeConfigs.tmdbKey;
  }

  return {
    ...config,
    params,
    headers: {
      "Content-Type": "application/json"
    }
  };
});

tmdbClient.interceptors.response.use((response) => {
  if (response && response.data) return response.data;
  return response;
}, (err) => {
  throw (err?.response?.data || { message: "Network error. Please try again." });
});

export default tmdbClient;