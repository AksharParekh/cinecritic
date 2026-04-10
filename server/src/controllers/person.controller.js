import responseHandler from "../handlers/response.handler.js";
import tmdbApi from "../tmdb/tmdb.api.js";
import envConfig from "../configs/env.config.js";

const personDetail = async (req, res) => {
  try {
    const { personId } = req.params;

    if (!envConfig.hasTmdbCredentials) {
      return responseHandler.ok(res, {
        id: personId,
        name: "Not available in local mode",
        biography: "Set TMDB_KEY or TMDB_ACCESS_TOKEN in server/.env to load person metadata.",
        profile_path: "",
        birthday: "",
        deathday: ""
      });
    }

    const person = await tmdbApi.personDetail({ personId });

    responseHandler.ok(res, person);
  } catch {
    responseHandler.error(res);
  }
};

const personMedias = async (req, res) => {
  try {
    const { personId } = req.params;

    if (!envConfig.hasTmdbCredentials) {
      return responseHandler.ok(res, { id: personId, cast: [] });
    }

    const medias = await tmdbApi.personMedias({ personId });

    responseHandler.ok(res, medias);
  } catch {
    responseHandler.error(res);
  }
};


export default { personDetail, personMedias };