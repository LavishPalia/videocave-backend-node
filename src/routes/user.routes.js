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
  getUserChannelDetails,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { check, checkSchema } from "express-validator";

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
  [
    check(
      "userName",
      "username should not be empty and without any special characters"
    )
      .trim()
      .isAlphanumeric(),
    check("email", "Please enter a valid email address").trim().isEmail(),
    check(
      "fullName",
      "Full Name must be atleast 3 characters and atmost 50 characters"
    )
      .trim()
      .isLength({ min: 3, max: 50 }),
    check(
      "password",
      "Password must contain one uppercase, one lowercase, one special char, one digit and min 8 chars long"
    )
      .trim()
      .isStrongPassword(),
    checkSchema({
      avatar: {
        custom: {
          options: (_value, { req, path }) => !!req.files[path],
          errorMessage: "Please select an avatar image for your account",
        },
      },
    }),
  ],
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
router.route("/c/:userName").get(verifyToken, getUserChannelDetails);
router.route("/history").get(verifyToken, getWatchHistory);

export default router;
