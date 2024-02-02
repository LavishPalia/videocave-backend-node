import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/upload.cloudinary.js";
import { Video } from "../models/Video.model.js";
import { User } from "../models/User.model.js";

const publishVideo = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;

  if (!(title && description)) {
    return next(new ApiError(400, "title or description cannot be empty"));
  }

  //   console.log(req.files);
  if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
    return next(
      new ApiError(400, "Please select a video and a thubnail image to upload")
    );
  }

  const videoLocalPath = req?.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req?.files?.thumbnail[0]?.path;

  const video = await uploadOnCloudinary(videoLocalPath);
  if (!video) {
    return next(
      new ApiError(500, "something went wrong while uploading video")
    );
  }

  // console.log("data returned after video upload \n", video);

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    return next(
      new ApiError(500, "something went wrong while uploading thumbnail")
    );
  }

  // create a Video document and save in DB
  const videoDoc = await Video.create({
    title,
    description,
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration,
    owner: req.user._id,
  });

  if (!videoDoc) {
    return next(
      new ApiError(500, "something went wrong while saving video in database")
    );
  }

  res
    .status(201)
    .json(new ApiResponse(200, videoDoc, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  if (!videoId) {
    return next(new ApiError(400, "video id is missing."));
  }

  const video = await Video.findById(videoId);
  if (!video) {
    return next(
      new ApiError(500, "something went wrong while fetching the video from DB")
    );
  }

  // check if the videoId already exists in the watchHistory of the user
  const currentWatchHistory = req.user.watchHistory;

  const index = currentWatchHistory.indexOf(videoId);
  if (index > -1) {
    currentWatchHistory.splice(index, 1);
  }

  currentWatchHistory.push(videoId);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        watchHistory: currentWatchHistory,
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    return next(
      new ApiError(
        500,
        "something went wrong while updating users watch history"
      )
    );
  }

  // console.log("watch history updated user: \n", updatedUser.watchHistory);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        `video with id ${videoId} fetched successfully`
      )
    );
});

export { publishVideo, getVideoById };
