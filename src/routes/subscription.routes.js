import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { toogleSubscription } from "../controllers/subscription.controller.js";

const router = express.Router();

router.use(verifyToken);

router.route("/c/:channelId").post(toogleSubscription);

export default router;
