import appPrivateClient from "../client/app.private.client";
import appPublicClient from "../client/app.public.client";
import axios from "axios";
import runtimeConfigs from "../configs/runtime.configs";

const userEndpoints = {
  signin: "user/signin",
  signup: "user/signup",
  syncSignin: "user/sync-signin",
  getInfo: "user/info",
  passwordUpdate: "user/update-password"
};

const localApiBaseUrl = runtimeConfigs.localSyncApiBaseUrl;

const syncSignedInUserToLocal = async ({ username, displayName }) => {
  try {
    await axios.post(`${localApiBaseUrl}${userEndpoints.syncSignin}`, {
      username,
      displayName
    }, {
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 5000
    });
  } catch {
    // Best-effort sync. Do not block normal signin flow.
  }
};

const userApi = {
  signin: async ({ username, password }) => {
    try {
      console.log("send request");
      const response = await appPublicClient.post(
        userEndpoints.signin,
        { username, password }
      );

      await syncSignedInUserToLocal({
        username: response?.username || username,
        displayName: response?.displayName || username
      });

      return { response };
    } catch (err) { console.log("err"); return { err }; }
  },
  signup: async ({ username, password, confirmPassword, displayName }) => {
    try {
      const response = await appPublicClient.post(
        userEndpoints.signup,
        { username, password, confirmPassword, displayName }
      );

      await syncSignedInUserToLocal({
        username: response?.username || username,
        displayName: response?.displayName || displayName || username
      });

      return { response };
    } catch (err) { return { err }; }
  },
  getInfo: async () => {
    try {
      const response = await appPrivateClient.get(userEndpoints.getInfo);

      return { response };
    } catch (err) { return { err }; }
  },
  passwordUpdate: async ({ password, newPassword, confirmNewPassword }) => {
    try {
      const response = await appPrivateClient.put(
        userEndpoints.passwordUpdate,
        { password, newPassword, confirmNewPassword }
      );

      return { response };
    } catch (err) { return { err }; }
  }
};

export default userApi;