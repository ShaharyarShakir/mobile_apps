import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;
import jwt from "jsonwebtoken";
const { sign } = jwt;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    username: {
      type: String,
      required: true,
      match: [/^[a-zA-Z0-9_]{3,30}$/, "Please provide a valid username"],
      unique: true,
    },
    email: { type: String, required: true, unique: true },
    picture: { type: String },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.createAccessToken = function () {
  return sign(
    {
      id: this._id,
      name: this.first_name + this.last_name,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.createRefreshToken = function () {
  return sign(
    { id: this._id, username: this.username },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = model("User", userSchema);
export default User;
