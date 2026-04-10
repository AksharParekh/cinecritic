import axios from "axios";

const get = async (url, config = {}) => {
  const headers = {
    Accept: "application/json",
    "Accept-Encoding": "identity",
    ...(config.headers || {})
  };

  const response = await axios.get(url, {
    ...config,
    headers
  });
  return response.data;
};

export default { get };