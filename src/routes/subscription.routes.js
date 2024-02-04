import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toogleSubscription,
} from "../controllers/subscription.controller.js";

const router = express.Router();

router.use(verifyToken);

router
  .route("/c/:channelId")
  .post(toogleSubscription)
  .get(getUserChannelSubscribers);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;
