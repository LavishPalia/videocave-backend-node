import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getUserChannelSubscribers,
  toogleSubscription,
} from "../controllers/subscription.controller.js";

const router = express.Router();

router.use(verifyToken);

router
  .route("/c/:channelId")
  .post(toogleSubscription)
  .get(getUserChannelSubscribers);

export default router;
