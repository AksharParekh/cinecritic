import axiosClient from "../axios/axios.client.js";
import tmdbEndpoints from "./tmdb.endpoints.js";
import tmdbConfig from "./tmdb.config.js";

const requestConfig = () => ({ headers: tmdbConfig.getHeaders() });

const tmdbApi = {
  mediaList: async ({ mediaType, mediaCategory, page }) => await axiosClient.get(
    tmdbEndpoints.mediaList({ mediaType, mediaCategory, page }),
    requestConfig()
  ),
  mediaDetail: async ({ mediaType, mediaId }) => await axiosClient.get(
    tmdbEndpoints.mediaDetail({ mediaType, mediaId }),
    requestConfig()
  ),
  mediaGenres: async ({ mediaType }) => await axiosClient.get(
    tmdbEndpoints.mediaGenres({ mediaType }),
    requestConfig()
  ),
  mediaCredits: async ({ mediaType, mediaId }) => await axiosClient.get(
    tmdbEndpoints.mediaCredits({ mediaType, mediaId }),
    requestConfig()
  ),
  mediaVideos: async ({ mediaType, mediaId }) => await axiosClient.get(
    tmdbEndpoints.mediaVideos({ mediaType, mediaId }),
    requestConfig()
  ),
  mediaImages: async ({ mediaType, mediaId }) => await axiosClient.get(
    tmdbEndpoints.mediaImages({ mediaType, mediaId }),
    requestConfig()
  ),
  mediaRecommend: async ({ mediaType, mediaId }) => await axiosClient.get(
    tmdbEndpoints.mediaRecommend({ mediaType, mediaId }),
    requestConfig()
  ),
  mediaSearch: async ({ mediaType, query, page }) => await axiosClient.get(
    tmdbEndpoints.mediaSearch({ mediaType, query, page }),
    requestConfig()
  ),
  mediaByGenre: async ({ mediaType, genreId, page }) => await axiosClient.get(
    tmdbEndpoints.mediaByGenre({ mediaType, genreId, page }),
    requestConfig()
  ),
  personDetail: async ({ personId }) => await axiosClient.get(
    tmdbEndpoints.personDetail({ personId }),
    requestConfig()
  ),
  personMedias: async ({ personId }) => await axiosClient.get(
    tmdbEndpoints.personMedias({ personId }),
    requestConfig()
  )
};

export default tmdbApi;