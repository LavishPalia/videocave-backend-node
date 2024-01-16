import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Username field cannot be empty"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email field cannot be empty"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Please enter your full name"],
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      require: [true, "Please select an avatar image for your profile"],
    },
    coverImage: { type: String },
    password: {
      type: String,
      required: [true, "Password field cannot be empty."],
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // run pre hook only if password field is modified
  if (!this.isModified("password")) return next();
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

userSchema.methods.generateAccessToken = async function () {
  const payload = {
    _id: this._id,
    email: this.email,
    userName: this.userName,
    fullName: this.fullName,
  };
  try {
    const accessToken = await jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
    return accessToken;
  } catch (err) {
    // TODO: check if need to send failure response or not how the flow will work?
    console.log(err.message);
  }
};

userSchema.methods.generateRefreshToken = async function () {
  const payload = {
    _id: this._id,
  };
  try {
    const refreshToken = await jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );
    // TODO: need to check when to save the refresh token in database

    return refreshToken;
  } catch (err) {
    // TODO: check if need to send failure response or not how the flow will work?
    console.log(err.message);
  }
};

export const User = mongoose.model("User", userSchema);
