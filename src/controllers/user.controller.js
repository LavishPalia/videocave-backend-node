import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import uploadOnCloudinary from "../utils/upload.cloudinary.js";

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

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    return next(new ApiError(400, "Avatar file is required"));
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

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

export { registerUser };
