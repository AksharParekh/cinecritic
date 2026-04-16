import responseHandler from "../handlers/response.handler.js";
import reviewModel from "../models/review.model.js";
import userModel from "../models/user.model.js";
import crypto from "crypto";

const create = async (req, res) => {
  try {
    const { movieId } = req.params;

    const review = new reviewModel({
      user: req.user.id,
      movieId,
      ...req.body
    });

    await review.save();

    responseHandler.created(res, {
      ...review._doc,
      id: review.id,
      user: req.user
    });
  } catch {
    responseHandler.error(res);
  }
};

const remove = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await reviewModel.findOne({
      _id: reviewId,
      user: req.user.id
    });

    if (!review) return responseHandler.notfound(res);

    await review.remove();

    responseHandler.ok(res);
  } catch {
    responseHandler.error(res);
  }
};

const getReviewsOfUser = async (req, res) => {
  try {
    const reviews = await reviewModel.find({
      user: req.user.id
    }).sort("-createdAt");

    responseHandler.ok(res, reviews);
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

const syncReviews = async (req, res) => {
  try {
    const { username, displayName, reviews = [] } = req.body;

    const user = await ensureUserByUsername({ username, displayName });

    await reviewModel.deleteMany({ user: user.id });

    const sanitizedReviews = (Array.isArray(reviews) ? reviews : [])
      .filter((item) => item?.mediaId && item?.mediaType && item?.mediaTitle && item?.mediaPoster && item?.content)
      .map((item) => ({
        user: user.id,
        mediaType: item.mediaType,
        mediaId: String(item.mediaId),
        mediaTitle: item.mediaTitle,
        mediaPoster: item.mediaPoster,
        content: item.content
      }));

    if (sanitizedReviews.length > 0) {
      await reviewModel.insertMany(sanitizedReviews);
    }

    responseHandler.ok(res, { total: sanitizedReviews.length });
  } catch {
    responseHandler.error(res);
  }
};

export default { create, remove, getReviewsOfUser, syncReviews };