import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { getVideoById, publishVideo } from "../controllers/video.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").post(
  verifyToken,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
);

router.route("/:videoId").get(verifyToken, getVideoById);

export default router;
