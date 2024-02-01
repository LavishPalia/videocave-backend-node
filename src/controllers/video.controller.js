import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/upload.cloudinary.js";
import { Video } from "../models/Video.model.js";

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

export { publishVideo };
