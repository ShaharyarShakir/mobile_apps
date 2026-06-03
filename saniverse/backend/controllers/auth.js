import User, { findOne, findById } from "../models/User";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnauthenticatedError } from "../errors";
import { verify } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateUniqueUsername = async (name) => {
  let username;
  let isUnique = false;

  while (!isUnique) {
    username =
      name.replace(/\s/g, "").toLowerCase().substring(0, 6) +
      Math.random().toString(36).substr(2, 6);

    const existingUser = await findOne({ username });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return username;
};

const signInWithGoogle = async (req, res) => {
  const { id_token } = req.body;

  if (!id_token) {
    throw new BadRequestError("ID token is required");
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const verifiedEmail = payload.email;

    if (!verifiedEmail) {
      throw new UnauthenticatedError("Invalid Token or expired");
    }

    let user = await findOne({ email: verifiedEmail });

    if (user) {
      const accessToken = user.createAccessToken();
      const refreshToken = user.createRefreshToken();

      return res.status(StatusCodes.OK).json({
        user,
        tokens: { access_token: accessToken, refresh_token: refreshToken },
      });
    }
    const username = await generateUniqueUsername(payload?.name);

    user = new User({
      email: payload?.email,
      username: username,
      name: payload?.name,
      picture: payload?.picture,
    });

    await user.save();

    const accessToken = user.createAccessToken();
    const refreshToken = user.createRefreshToken();

    res.status(StatusCodes.CREATED).json({
      user,
      tokens: { access_token: accessToken, refresh_token: refreshToken },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    throw new BadRequestError("Refresh token is required");
  }

  try {
    const payload = verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    const user = await findById(payload.id);

    if (!user) {
      throw new UnauthenticatedError("Invalid refresh token");
    }

    const newAccessToken = user.createAccessToken();
    const newRefreshToken = user.createRefreshToken();

    res.status(StatusCodes.OK).json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    });
  } catch (error) {
    console.error(error);
    throw new UnauthenticatedError("Invalid refresh token");
  }
};

export default {
  signInWithGoogle,
  refreshToken,
};
