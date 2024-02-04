import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/Playlist.model.js";
import { isValidObjectId } from "mongoose";

const createPlaylist = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return next(new ApiError(400, "name and description are required fields"));
  }

  // create playlist in DB

  const createdPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  if (!createPlaylist) {
    return next(
      new ApiError(500, "Something went wrong while creating playlist")
    );
  }

  res
    .status(201)
    .json(
      new ApiResponse(200, createdPlaylist, "playlist created successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res, next) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    return next(new ApiError(400, "Playlist Id is missing"));
  }

  if (!isValidObjectId(playlistId)) {
    return next(new ApiError(400, "Invalid playlist Id"));
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return next(new ApiError(400, "Playlist doesn't exist in DB"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res, next) => {
  const { videoId, playlistId } = req.params;

  if (!videoId || !playlistId) {
    return next(new ApiError(400, "video id or playlist id is not provided"));
  }

  if (!isValidObjectId(videoId) || !isValidObjectId(playlistId)) {
    return next(new ApiError(400, "Invalid video id or playlist id"));
  }

  // find playlist and if found add the video id in the videos array
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return next(new ApiError(400, "Playlist does not exist in DB"));
  }

  // check if the video is already part of the playlist
  if (playlist.videos.includes(videoId)) {
    return next(new ApiError(400, "Video is already part of this playlist"));
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlist,
    {
      $push: { videos: videoId },
    },
    { new: true }
  );

  //   console.log(updatedPlaylist);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "video added to the playlist successfully"
      )
    );
});

export { createPlaylist, getPlaylistById, addVideoToPlaylist };
