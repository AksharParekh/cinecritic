import appPrivateClient from "../client/app.private.client";
import axios from "axios";
import runtimeConfigs from "../configs/runtime.configs";

const reviewEndpoints = {
  list: "reviews",
  add: "reviews",
  remove: ({ reviewId }) => `reviews/${reviewId}`,
  userInfo: "user/info",
  syncReviews: "user/sync-reviews"
};

const syncReviewsToLocal = async () => {
  try {
    const [profile, reviews] = await Promise.all([
      appPrivateClient.get(reviewEndpoints.userInfo),
      appPrivateClient.get(reviewEndpoints.list)
    ]);

    if (!profile?.username) return;

    await axios.post(
      `${runtimeConfigs.localSyncApiBaseUrl}${reviewEndpoints.syncReviews}`,
      {
        username: profile.username,
        displayName: profile.displayName,
        reviews: Array.isArray(reviews) ? reviews : []
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

const reviewApi = {
  add: async ({
    mediaId,
    mediaType,
    mediaTitle,
    mediaPoster,
    content
  }) => {
    try {
      const response = await appPrivateClient.post(
        reviewEndpoints.add,
        {
          mediaId,
          mediaType,
          mediaTitle,
          mediaPoster,
          content
        }
      );

      await syncReviewsToLocal();

      return { response };
    } catch (err) { return { err }; }
  },
  remove: async ({ reviewId }) => {
    try {
      const response = await appPrivateClient.delete(reviewEndpoints.remove({ reviewId }));

      await syncReviewsToLocal();

      return { response };
    } catch (err) { return { err }; }
  },
  getList: async () => {
    try {
      const response = await appPrivateClient.get(reviewEndpoints.list);

      return { response };
    } catch (err) { return { err }; }
  }
};

export default reviewApi;