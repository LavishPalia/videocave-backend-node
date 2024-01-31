import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUserPassword,
  updateAccountDetails,
  updateUserAvatarImage,
  updateUserCoverImage,
  getLoggedInUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyToken, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyToken, updateUserPassword);
router.route("/update-account").patch(verifyToken, updateAccountDetails);
router
  .route("/avatar")
  .patch(verifyToken, upload.single("avatar"), updateUserAvatarImage);
router
  .route("/cover-image")
  .patch(verifyToken, upload.single("coverImage"), updateUserCoverImage);

router.route("/current-user").get(verifyToken, getLoggedInUser);

export default router;
