import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/Subscription.model.js";
import { User } from "../models/User.model.js";
import { isValidObjectId } from "mongoose";

const toogleSubscription = asyncHandler(async (req, res, next) => {
  const { channelId } = req.params;

  if (!channelId) {
    return next(new ApiError(400, `channeId is missing`));
  }

  if (!isValidObjectId(channelId)) {
    return next(new ApiError(400, `${channelId} is not a valid channel id`));
  }

  // handle the case when the channel Id is correctly formatted  but doesn't exist in DB
  const channel = await User.findById(channelId);

  if (!channel) {
    return next(
      new ApiError(400, `channel Id ${channelId} is not available in DB`)
    );
  }

  const subscriber = req.user._id;

  // check if user is already subscribed,
  // check using both channel and subscriber fields otherwise other channel subscription might get deleted
  //as single user can subscribe to multiple channels
  const isSubscribed = await Subscription.findOne({
    subscriber,
    channel: channelId,
  });

  //   console.log("Already subscribed user: ", isSubscribed);

  if (isSubscribed) {
    // remove subscription
    const deletedSubscription = await Subscription.findByIdAndDelete(
      isSubscribed._id
    );

    // console.log("deleted subscription details: ", deletedSubscription);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Subscription removed successfully"));
  }

  const subscriptionAdded = await Subscription.create({
    subscriber,
    channel: channelId,
  });

  if (!subscriptionAdded) {
    return next(
      new ApiError(400, `something went wrong while adding your subscription`)
    );
  }

  //   console.log("Subscription details: \n", subscriptionAdded);

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Subscription added successfully"));
});

export { toogleSubscription };