import publicClient from "../client/public.client";
import tmdbClient from "../client/tmdb.client";
import runtimeConfigs from "../configs/runtime.configs";

const genreEndpoints = {
  list: ({ mediaType }) => `${mediaType}/genres`
};

const tmdbGenreEndpoints = {
  list: ({ mediaType }) => `genre/${mediaType}/list`
};

const genreApi = {
  getList: async ({ mediaType }) => {
    try {
      const response = await publicClient.get(genreEndpoints.list({ mediaType }));

      return { response };
    } catch (err) {
      if (!runtimeConfigs.tmdbFallbackEnabled) return { err };

      try {
        const response = await tmdbClient.get(tmdbGenreEndpoints.list({ mediaType }));
        return { response };
      } catch (tmdbErr) {
        return { err: tmdbErr };
      }
    }
  }
};

export default genreApi;