import responseHandler from "../handlers/response.handler.js";
import tmdbApi from "../tmdb/tmdb.api.js";
import userModel from "../models/user.model.js";
import favoriteModel from "../models/favorite.model.js";
import reviewModel from "../models/review.model.js";
import tokenMiddlerware from "../middlewares/token.middleware.js";
import envConfig from "../configs/env.config.js";
import {
  localGenres,
  getLocalList,
  getLocalById,
  searchLocal,
  getLocalAll
} from "../tmdb/local.catalog.js";

const getEmptyListPayload = (page = 1) => ({
  page: Number(page) || 1,
  results: [],
  total_pages: 0,
  total_results: 0
});

const getLocalListPayload = ({ page = 1, results = [] }) => ({
  page: Number(page) || 1,
  results,
  total_pages: 1,
  total_results: results.length
});

const getEmptyDetailPayload = ({ mediaType, mediaId }) => ({
  id: mediaId,
  media_type: mediaType,
  title: "Not available in local mode",
  name: "Not available in local mode",
  overview: "Set TMDB_KEY or TMDB_ACCESS_TOKEN in server/.env to load media metadata.",
  release_date: "",
  first_air_date: "",
  vote_average: 0,
  poster_path: "",
  backdrop_path: "",
  genres: [],
  credits: { cast: [] },
  videos: { results: [] },
  images: { backdrops: [], posters: [] },
  recommend: [],
  reviews: [],
  isFavorite: false
});

const getList = async (req, res) => {
  try {
    const { page } = req.query;
    const { mediaType, mediaCategory } = req.params;

    if (!envConfig.hasTmdbCredentials) {
      const localResults = getLocalList({ mediaType, mediaCategory });
      return responseHandler.ok(res, getLocalListPayload({ page, results: localResults }));
    }

    const response = await tmdbApi.mediaList({ mediaType, mediaCategory, page });

    return responseHandler.ok(res, response);
  } catch {
    responseHandler.error(res);
  }
};

const getGenres = async (req, res) => {
  try {
    const { mediaType } = req.params;

    if (!envConfig.hasTmdbCredentials) {
      return responseHandler.ok(res, { genres: localGenres[mediaType] || [] });
    }

    const response = await tmdbApi.mediaGenres({ mediaType });

    return responseHandler.ok(res, response);
  } catch {
    responseHandler.error(res);
  }
};

const search = async (req, res) => {
  try {
    const { mediaType } = req.params;
    const { query, page } = req.query;

    if (!envConfig.hasTmdbCredentials) {
      const localResults = mediaType === "people"
        ? []
        : searchLocal({ mediaType, query });

      return responseHandler.ok(res, getLocalListPayload({ page, results: localResults }));
    }

    const response = await tmdbApi.mediaSearch({
      query,
      page,
      mediaType: mediaType === "people" ? "person" : mediaType
    });

    responseHandler.ok(res, response);
  } catch {
    responseHandler.error(res);
  }
};

const getDetail = async (req, res) => {
  try {
    const { mediaType, mediaId } = req.params;

    if (!envConfig.hasTmdbCredentials) {
      const localItem = getLocalById({ mediaType, mediaId });
      const media = localItem
        ? {
          ...getEmptyDetailPayload({ mediaType, mediaId }),
          ...localItem,
          genres: (localItem.genre_ids || [])
            .map((genreId) => (localGenres[mediaType] || []).find((genre) => genre.id === genreId))
            .filter(Boolean),
          recommend: getLocalAll({ mediaType }).filter((item) => item.id !== localItem.id).slice(0, 8)
        }
        : getEmptyDetailPayload({ mediaType, mediaId });

      const tokenDecoded = tokenMiddlerware.tokenDecode(req);

      if (tokenDecoded) {
        const user = await userModel.findById(tokenDecoded.data);

        if (user) {
          const isFavorite = await favoriteModel.findOne({ user: user.id, mediaId });
          media.isFavorite = isFavorite !== null;
        }
      }

      media.reviews = await reviewModel.find({ mediaId }).populate("user").sort("-createdAt");

      return responseHandler.ok(res, media);
    }

    const params = { mediaType, mediaId };

    const media = await tmdbApi.mediaDetail(params);

    media.credits = await tmdbApi.mediaCredits(params);

    const videos = await tmdbApi.mediaVideos(params);

    media.videos = videos;

    const recommend = await tmdbApi.mediaRecommend(params);

    media.recommend = recommend.results;

    media.images = await tmdbApi.mediaImages(params);

    const tokenDecoded = tokenMiddlerware.tokenDecode(req);

    if (tokenDecoded) {
      const user = await userModel.findById(tokenDecoded.data);

      if (user) {
        const isFavorite = await favoriteModel.findOne({ user: user.id, mediaId });
        media.isFavorite = isFavorite !== null;
      }
    }

    media.reviews = await reviewModel.find({ mediaId }).populate("user").sort("-createdAt");

    responseHandler.ok(res, media);
  } catch (e) {
    console.log(e);
    responseHandler.error(res);
  }
};

export default { getList, getGenres, search, getDetail };