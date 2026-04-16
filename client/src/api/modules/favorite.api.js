import appPrivateClient from "../client/app.private.client";
import axios from "axios";
import runtimeConfigs from "../configs/runtime.configs";

const favoriteEndpoints = {
  list: "user/favorites",
  add: "user/favorites",
  remove: ({ favoriteId }) => `user/favorites/${favoriteId}`,
  userInfo: "user/info",
  syncFavorites: "user/sync-favorites"
};

const syncFavoritesToLocal = async () => {
  try {
    const [profile, favorites] = await Promise.all([
      appPrivateClient.get(favoriteEndpoints.userInfo),
      appPrivateClient.get(favoriteEndpoints.list)
    ]);

    if (!profile?.username) return;

    await axios.post(
      `${runtimeConfigs.localSyncApiBaseUrl}${favoriteEndpoints.syncFavorites}`,
      {
        username: profile.username,
        displayName: profile.displayName,
        favorites: Array.isArray(favorites) ? favorites : []
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 5000
      }
    );
  } catch {
    // Best-effort sync to local MongoDB.
  }
};

const favoriteApi = {
  getList: async () => {
    try {
      const response = await appPrivateClient.get(favoriteEndpoints.list);

      return { response };
    } catch (err) { return { err }; }
  },
  add: async ({
    mediaId,
    mediaType,
    mediaTitle,
    mediaPoster,
    mediaRate
  }) => {
    try {
      const response = await appPrivateClient.post(
        favoriteEndpoints.add,
        {
          mediaId,
          mediaType,
          mediaTitle,
          mediaPoster,
          mediaRate
        }
      );

      await syncFavoritesToLocal();

      return { response };
    } catch (err) { return { err }; }
  },
  remove: async ({ favoriteId }) => {
    try {
      const response = await appPrivateClient.delete(favoriteEndpoints.remove({ favoriteId }));

      await syncFavoritesToLocal();

      return { response };
    } catch (err) { return { err }; }
  }
};

export default favoriteApi;