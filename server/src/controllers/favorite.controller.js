import responseHandler from "../handlers/response.handler.js";
import favoriteModel from "../models/favorite.model.js";
import userModel from "../models/user.model.js";
import crypto from "crypto";

const addFavorite = async (req, res) => {
  try {
    const isFavorite = await favoriteModel.findOne({
      user: req.user.id,
      mediaId: req.body.mediaId
    });

    if (isFavorite) return responseHandler.ok(res, isFavorite);

    const favorite = new favoriteModel({
      ...req.body,
      user: req.user.id
    });

    await favorite.save();

    responseHandler.created(res, favorite);
  } catch {
    responseHandler.error(res);
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { favoriteId } = req.params;

    const favorite = await favoriteModel.findOne({
      user: req.user.id,
      _id: favoriteId
    });

    if (!favorite) return responseHandler.notfound(res);

    await favorite.remove();

    responseHandler.ok(res);
  } catch {
    responseHandler.error(res);
  }
};

const getFavoritesOfUser = async (req, res) => {
  try {
    const favorite = await favoriteModel.find({ user: req.user.id }).sort("-createdAt");

    responseHandler.ok(res, favorite);
  } catch {
    responseHandler.error(res);
  }
};

const ensureUserByUsername = async ({ username, displayName }) => {
  let user = await userModel.findOne({ username }).select("id username displayName");

  if (!user) {
    user = new userModel();
    user.username = username;
    user.displayName = displayName || username;
    user.setPassword(crypto.randomBytes(24).toString("hex"));
    await user.save();
    return user;
  }

  if (displayName && user.displayName !== displayName) {
    user.displayName = displayName;
    await user.save();
  }

  return user;
};

const syncFavorites = async (req, res) => {
  try {
    const { username, displayName, favorites = [] } = req.body;

    const user = await ensureUserByUsername({ username, displayName });

    await favoriteModel.deleteMany({ user: user.id });

    const sanitizedFavorites = (Array.isArray(favorites) ? favorites : [])
      .filter((item) => item?.mediaId && item?.mediaType && item?.mediaTitle && item?.mediaPoster)
      .map((item) => ({
        user: user.id,
        mediaType: item.mediaType,
        mediaId: String(item.mediaId),
        mediaTitle: item.mediaTitle,
        mediaPoster: item.mediaPoster,
        mediaRate: Number(item.mediaRate || 0)
      }));

    if (sanitizedFavorites.length > 0) {
      await favoriteModel.insertMany(sanitizedFavorites);
    }

    responseHandler.ok(res, { total: sanitizedFavorites.length });
  } catch {
    responseHandler.error(res);
  }
};

export default { addFavorite, removeFavorite, getFavoritesOfUser, syncFavorites };