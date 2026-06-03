import jwt from "jsonwebtoken";
const { verify } = jwt;
import { UnauthenticatedError } from "../errors/index.js";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthenticatedError("Authentication invalid");
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: payload.id, full_name: payload.full_name };
    req.socket = req.io;

    const user = await User.findById(payload.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication invalid");
  }
};

export default auth;
