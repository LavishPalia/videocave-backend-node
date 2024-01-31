import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import uploadOnCloudinary from "../utils/upload.cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    next(
      new ApiError(
        500,
        "Something went wrong while generating access and refresh tokens"
      )
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { userName, email, password, fullName } = req.body;

  // TODO: check data validation/sanity using express validator
  if (
    [fullName, userName, email, password].some(
      (field) => field?.trim() === undefined || field?.trim() === ""
    )
  ) {
    return next(new ApiError(400, "Please enter the required fields"));
  }

  const username = userName.toLowerCase();

  const existingUser = await User.findOne({
    $or: [{ userName: username }, { email }],
  });

  if (existingUser) {
    return next(new ApiError(400, "Email or username is taken"));
  }

  if (!req.files || !req.files.avatar) {
    return next(new ApiError(400, "Please select an avatar image"));
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    return next(new ApiError(400, "Avatar file is required"));
  }

  // console.time("avatar upload");
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.timeEnd("avatar upload");

  if (!avatar) {
    return next(new ApiError(400, "Avatar file is required"));
  }

  // console.time("coverImage upload");
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // console.timeEnd("coverImage upload");

  const user = await User.create({
    userName: userName.toLowerCase(),
    email,
    password,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    return next(
      new ApiError(500, "something went wrong while registering the user")
    );
  }

  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res, next) => {
  /*
    get data from frontend - email, password
    perform data validation and sanity
    find user in DB
    if found, cross check the provided password against existing users in database
    generate access and refresh token and send to frontend in cookies
    send success response
  */

  const { userName, email, password } = req.body;

  if (!email && !userName) {
    return next(new ApiError(400, "Email or username is missing"));
  }

  if (!password) {
    return next(new ApiError(400, "Email or Password is missing"));
  }

  const username = userName ? userName.toLowerCase() : "";

  const user = await User.findOne({
    $or: [{ userName: username }, { email }],
  });

  if (!user) {
    return next(
      new ApiError(
        400,
        "User does not eixst, Please sign up first, if you are new to the website"
      )
    );
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ApiError(401, "Invalid user credentials"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In successfully..."
      )
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out Successfully..."));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return next(new ApiError(401, "unauthorized request"));
  }

  const decodedUser = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedUser._id);

  if (!user) {
    return next(new ApiError(401, "Invalid refresh token"));
  }

  if (incomingRefreshToken !== user.refreshToken) {
    return next(new ApiError(401, "Invalid or expired refresh token"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "access token refreshed successfully!"
      )
    );
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
