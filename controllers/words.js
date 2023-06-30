import { HttpError, ctrlWrapper } from "../helpers/index.js";
import { Word } from "../models/word.js";
import { ObjectId } from "mongodb";

const getAll = async (req, res) => {
  const { _id } = req.user;
  const result = await Word.find({ _id });

  res.json(result);
};

const add = async (req, res) => {
  const { _id } = req.user;
  const words = await Word.find({ _id });
  const allWords = [
    ...words[0].vocabulary,
    ...words[0].firstLvl,
    ...words[0].secondLvl,
    ...words[0].thirdLvl,
  ];
  const wordAlreadyAdded = allWords.some(item => item.word === req.body.word);

  if (wordAlreadyAdded) {
    throw HttpError(409, "Word already exists");
  }

  await Word.updateOne({ _id }, { $push: { firstLvl: req.body } });

  res.status(201).json("Word Added");
};

const moveWord = async (req, res) => {
  const { _id } = req.user;
  const { id, moveFrom, moveTo } = req.body;
  const words = await Word.find({ _id });
  const foundWord = words[0][moveFrom].find(item => new ObjectId(id).equals(item._id));

  if (!foundWord) {
    throw HttpError(404, "Word not found");
  }

  await Word.updateOne(
    { _id },
    {
      $pull: { [moveFrom]: foundWord },
      $push: { [moveTo]: foundWord },
    }
  );

  res.status(200).json("Word moved");
};

const deleteWord = async (req, res) => {
  const { _id } = req.user;
  const { id, deleteFrom } = req.body;
  const result = await Word.updateOne({ _id }, { $pull: { [deleteFrom]: { _id: id } } });

  if (result.modifiedCount === 0) {
    throw HttpError(404, "Word not found");
  }

  res.status(200).json("Word deleted");
};

export const ctrl = {
  getAll: ctrlWrapper(getAll),
  add: ctrlWrapper(add),
  moveWord: ctrlWrapper(moveWord),
  deleteWord: ctrlWrapper(deleteWord),
};
