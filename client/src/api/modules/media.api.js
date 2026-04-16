import privateClient from "../client/private.client";
import publicClient from "../client/public.client";
import tmdbClient from "../client/tmdb.client";
import runtimeConfigs from "../configs/runtime.configs";

const mediaEndpoints = {
  list: ({ mediaType, mediaCategory, page }) => `${mediaType}/${mediaCategory}?page=${page}`,
  detail: ({ mediaType, mediaId }) => `${mediaType}/detail/${mediaId}`,
  search: ({ mediaType, query, page }) => `${mediaType}/search?query=${query}&page=${page}`,
  byGenre: ({ mediaType, genreId, page }) => `${mediaType}/genres/${genreId}?page=${page}`
};

const tmdbMediaEndpoints = {
  list: ({ mediaType, mediaCategory }) => `${mediaType}/${mediaCategory}`,
  detail: ({ mediaType, mediaId }) => `${mediaType}/${mediaId}`,
  search: ({ mediaType }) => mediaType === "people" ? "search/person" : `search/${mediaType}`,
  byGenre: ({ mediaType }) => `discover/${mediaType}`
};

const normalizeTmdbDetail = (response) => {
  const reviews = (response?.reviews?.results || []).map((review) => ({
    id: review.id,
    content: review.content,
    createdAt: review.created_at,
    user: {
      id: review.author_details?.username || review.author || review.id,
      displayName: review.author_details?.name || review.author || "TMDB user"
    }
  }));

  return {
    ...response,
    credits: response?.credits || { cast: [] },
    videos: response?.videos || { results: [] },
    images: response?.images || { backdrops: [], posters: [] },
    genres: response?.genres || [],
    reviews,
    recommend: response?.recommendations?.results || [],
    isFavorite: false
  };
};

const normalizeMediaResults = (results) => {
  const map = new Map();

  (results || []).forEach((item) => {
    const key = item?.id || item?.mediaId;
    if (!key || map.has(key)) return;
    map.set(key, item);
  });

  return Array.from(map.values());
};

const mediaApi = {
  getList: async ({ mediaType, mediaCategory, page }) => {
    try {
      const response = await publicClient.get(
        mediaEndpoints.list({ mediaType, mediaCategory, page })
      );

      return { response };
    } catch (err) {
      if (!runtimeConfigs.tmdbFallbackEnabled) return { err };

      try {
        const response = await tmdbClient.get(
          tmdbMediaEndpoints.list({ mediaType, mediaCategory }),
          { params: { page } }
        );

        return { response };
      } catch (tmdbErr) {
        return { err: tmdbErr };
      }
    }
  },
  getDetail: async ({ mediaType, mediaId }) => {
    try {
      const response = await privateClient.get(
        mediaEndpoints.detail({ mediaType, mediaId })
      );

      return { response };
    } catch (err) {
      if (!runtimeConfigs.tmdbFallbackEnabled) return { err };

      try {
        const response = await tmdbClient.get(
          tmdbMediaEndpoints.detail({ mediaType, mediaId }),
          {
            params: {
              append_to_response: "credits,videos,images,reviews,recommendations"
            }
          }
        );

        return { response: normalizeTmdbDetail(response) };
      } catch (tmdbErr) {
        return { err: tmdbErr };
      }
    }
  },
  search: async ({ mediaType, query, page }) => {
    try {
      const response = await publicClient.get(
        mediaEndpoints.search({ mediaType, query, page })
      );

      return { response };
    } catch (err) {
      if (!runtimeConfigs.tmdbFallbackEnabled) return { err };

      try {
        const response = await tmdbClient.get(
          tmdbMediaEndpoints.search({ mediaType }),
          {
            params: {
              query,
              page
            }
          }
        );

        return { response };
      } catch (tmdbErr) {
        return { err: tmdbErr };
      }
    }
  },
  getByGenre: async ({ mediaType, genreId, page }) => {
    try {
      const response = await publicClient.get(
        mediaEndpoints.byGenre({ mediaType, genreId, page })
      );

      return { response };
    } catch (err) {
      if (runtimeConfigs.tmdbKey) {
        try {
          const response = await tmdbClient.get(
            tmdbMediaEndpoints.byGenre({ mediaType }),
            {
              params: {
                with_genres: genreId,
                page
              }
            }
          );

          return { response };
        } catch {
          // Continue to local filtering fallback below.
        }
      }

      try {
        const [popularRes, topRatedRes] = await Promise.all([
          publicClient.get(mediaEndpoints.list({ mediaType, mediaCategory: "popular", page: 1 })),
          publicClient.get(mediaEndpoints.list({ mediaType, mediaCategory: "top_rated", page: 1 }))
        ]);

        const allResults = normalizeMediaResults([
          ...(popularRes?.results || []),
          ...(topRatedRes?.results || [])
        ]);

        const filtered = allResults.filter((item) =>
          Array.isArray(item?.genre_ids) && item.genre_ids.includes(Number(genreId))
        );

        return {
          response: {
            page: 1,
            results: filtered,
            total_pages: 1,
            total_results: filtered.length
          }
        };
      } catch {
        if (!runtimeConfigs.tmdbFallbackEnabled) return { err };

        try {
          const response = await tmdbClient.get(
            tmdbMediaEndpoints.byGenre({ mediaType }),
            {
              params: {
                with_genres: genreId,
                page
              }
            }
          );

          return { response };
        } catch (tmdbErr) {
          return { err: tmdbErr };
        }
      }
    }
  }
};

export default mediaApi;