import publicClient from "../client/public.client";
import tmdbClient from "../client/tmdb.client";
import runtimeConfigs from "../configs/runtime.configs";

const personEndpoints = {
  detail: ({ personId }) => `person/${personId}`,
  medias: ({ personId }) => `person/${personId}/medias`
};

const tmdbPersonEndpoints = {
  detail: ({ personId }) => `person/${personId}`,
  medias: ({ personId }) => `person/${personId}/combined_credits`
};

const personApi = {
  detail: async ({ personId }) => {
    try {
      const response = await publicClient.get(personEndpoints.detail({ personId }));

      return { response };
    } catch (err) {
      if (!runtimeConfigs.tmdbFallbackEnabled) return { err };

      try {
        const response = await tmdbClient.get(tmdbPersonEndpoints.detail({ personId }));
        return { response };
      } catch (tmdbErr) {
        return { err: tmdbErr };
      }
    }
  },
  medias: async ({ personId }) => {
    try {
      const response = await publicClient.get(personEndpoints.medias({ personId }));

      return { response };
    } catch (err) {
      if (!runtimeConfigs.tmdbFallbackEnabled) return { err };

      try {
        const response = await tmdbClient.get(tmdbPersonEndpoints.medias({ personId }));
        return { response: { cast: response?.cast || [] } };
      } catch (tmdbErr) {
        return { err: tmdbErr };
      }
    }
  }
};

export default personApi;