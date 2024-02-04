import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  getPlaylistById,
} from "../controllers/playlist.controller.js";

const router = express.Router();

router.use(verifyToken);

router.route("/:playlistId").get(getPlaylistById);
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/").post(createPlaylist);

export default router;
