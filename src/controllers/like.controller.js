import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/Like.model.js";
import { Video } from "../models/Video.model.js";
import { Comment } from "../models/Comment.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  if (!videoId) {
    return next(new ApiError(400, "video id is missing."));
  }

  if (!isValidObjectId(videoId)) {
    return next(new ApiError(400, "invalid video id"));
  }

  const video = await Video.findById(videoId);
  if (!video) {
    return next(new ApiError(500, `video with id ${videoId} does not exist`));
  }
  //   console.log(req.user);

  // check if the video is already liked
  const alreadyLiked = await Like.findOne({
    likedBy: req.user._id,
    video: videoId,
  });

  if (alreadyLiked) {
    // remove like
    await Like.deleteOne(alreadyLiked);

    return res.status(200).json(new ApiResponse(200, {}, "video like removed"));
  }

  const likeDoc = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, likeDoc, "video like added"));
});

const toggleCommentLike = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  if (!commentId) {
    return next(new ApiError(400, "video id is missing."));
  }

  if (!isValidObjectId(commentId)) {
    return next(new ApiError(400, "invalid video id"));
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(
      new ApiError(500, `comment with id ${commentId} does not exist`)
    );
  }
  //   console.log(req.user);

  // check if the comment is already liked
  const alreadyLiked = await Like.findOne({
    likedBy: req.user._id,
    comment: commentId,
  });

  if (alreadyLiked) {
    // remove like
    await Like.deleteOne(alreadyLiked);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment like removed"));
  }

  const likeDoc = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, likeDoc, "comment like added"));
});
const toggleTweetLike = asyncHandler(async (req, res, next) => {});
const getLikedVideos = asyncHandler(async (req, res, next) => {});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
