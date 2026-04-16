import userModel from "../models/user.model.js";
import jsonwebtoken from "jsonwebtoken";
import crypto from "crypto";
import responseHandler from "../handlers/response.handler.js";

const adminUsername = "akshar_190";

const isAdminSignin = ({ username, password }) => {
  const usernameIsAdmin = (username || "").toLowerCase() === adminUsername;
  if (!usernameIsAdmin) return false;

  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (!adminPassword) return true;

  return password === adminPassword;
};

const signup = async (req, res) => {
  try {
    const { username, password, displayName } = req.body;

    const checkUser = await userModel.findOne({ username });

    if (checkUser) return responseHandler.badrequest(res, "username already used");

    const user = new userModel();

    user.displayName = displayName;
    user.username = username;
    user.setPassword(password);

    await user.save();

    const token = jsonwebtoken.sign(
      { data: user.id },
      process.env.TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    responseHandler.created(res, {
      token,
      ...user._doc,
      id: user.id
    });
  } catch {
    responseHandler.error(res);
  }
};

const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await userModel.findOne({ username }).select("username password salt id displayName isAdmin");

    if (!user) return responseHandler.badrequest(res, "User not exist");

    if (!user.validPassword(password)) return responseHandler.badrequest(res, "Wrong password");

    const isAdmin = isAdminSignin({ username, password });

    if (user.isAdmin !== isAdmin) {
      user.isAdmin = isAdmin;
      await user.save();
    }

    const token = jsonwebtoken.sign(
      { data: user.id },
      process.env.TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    user.password = undefined;
    user.salt = undefined;

    responseHandler.created(res, {
      token,
      ...user._doc,
      id: user.id
    });
  } catch {
    responseHandler.error(res);
  }
};

const updatePassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body;

    const user = await userModel.findById(req.user.id).select("password id salt");

    if (!user) return responseHandler.unauthorize(res);

    if (!user.validPassword(password)) return responseHandler.badrequest(res, "Wrong password");

    user.setPassword(newPassword);

    await user.save();

    responseHandler.ok(res);
  } catch {
    responseHandler.error(res);
  }
};

const getInfo = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) return responseHandler.notfound(res);

    user.isAdmin = user.username?.toLowerCase() === adminUsername;

    responseHandler.ok(res, user);
  } catch {
    responseHandler.error(res);
  }
};

const syncSignin = async (req, res) => {
  try {
    const { username, displayName } = req.body;

    let user = await userModel.findOne({ username }).select("username displayName id");

    if (!user) {
      user = new userModel();
      user.username = username;
      user.displayName = displayName || username;

      // Keep schema constraints satisfied while avoiding password handling changes.
      user.setPassword(crypto.randomBytes(24).toString("hex"));
      await user.save();
    } else if (displayName && user.displayName !== displayName) {
      user.displayName = displayName;
      await user.save();
    }

    responseHandler.ok(res, {
      id: user.id,
      username: user.username,
      displayName: user.displayName
    });
  } catch {
    responseHandler.error(res);
  }
};

export default {
  signup,
  signin,
  getInfo,
  updatePassword,
  syncSignin
};