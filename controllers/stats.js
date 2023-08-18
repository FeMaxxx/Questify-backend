import { HttpError, ctrlWrapper } from "../helpers/index.js";
import { Stat } from "../models/stat.js";

const getStats = async (req, res) => {
  const { id } = req.user;
  const result = await Stat.find({ user: id });

  res.json(result);
};

const updateRandomWordStats = async (req, res) => {
  const { id } = req.user;
  let request = { successfulRandomWordConfirmation: 1 };

  if (req.body.successes !== true) {
    request = { failedRandomWordConfirmation: 1 };
  }

  await Stat.findOneAndUpdate({ user: id }, { $inc: request });

  res.json("Successful statistics update");
};

export const ctrl = {
  getStats: ctrlWrapper(getStats),
  updateRandomWordStats: ctrlWrapper(updateRandomWordStats),
};
