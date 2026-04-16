import axios from "axios";
import queryString from "query-string";
import runtimeConfigs from "../configs/runtime.configs";

const appPublicClient = axios.create({
  baseURL: runtimeConfigs.authApiBaseUrl,
  paramsSerializer: {
    encode: params => queryString.stringify(params)
  }
});

appPublicClient.interceptors.request.use(async config => {
  return {
    ...config,
    headers: {
      "Content-Type": "application/json"
    }
  };
});

appPublicClient.interceptors.response.use((response) => {
  if (response && response.data) return response.data;
  return response;
}, (err) => {
  throw (err?.response?.data || { message: "Network error. Please try again." });
});

export default appPublicClient;
