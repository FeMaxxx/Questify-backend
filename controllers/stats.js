import { HttpError, ctrlWrapper } from "../helpers/index.js";
import { User } from "../models/user.js";

const updateRandomWordStats = async (req, res) => {
  const { id } = req.user;
  let request = { successfulRandomWordConfirmation: 1 };

  if (req.body.successes !== true) {
    request = { failedRandomWordConfirmation: 1 };
  }

  await User.findByIdAndUpdate(id, { $inc: request }, { new: true });

  res.json("Successful statistics update");
};

export const ctrl = {
  updateRandomWordStats: ctrlWrapper(updateRandomWordStats),
};
