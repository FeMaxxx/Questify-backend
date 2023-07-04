import { HttpError, ctrlWrapper } from "../helpers/index.js";
import { Word } from "../models/word.js";
import { User } from "../models/user.js";
import { ObjectId } from "mongodb";

const getAll = async (req, res) => {
  const { _id } = req.user;
  const result = await Word.find({ _id });

  res.json(result);
};

const getRandomVordFromDictionary = async (req, res) => {
  const { _id } = req.user;
  const words = await Word.find({ _id });
  const dictionary = [...words[0].dictionary];
  const randomNumber = Math.floor(Math.random() * dictionary.length);

  res.json(dictionary[randomNumber]);
};

const add = async (req, res) => {
  const { _id } = req.user;
  const words = await Word.find({ _id });
  const allWords = [
    ...words[0].dictionary,
    ...words[0].firstLvl,
    ...words[0].secondLvl,
    ...words[0].thirdLvl,
  ];
  const wordAlreadyAdded = allWords.some(item => item.word === req.body.word);

  if (wordAlreadyAdded) {
    throw HttpError(409, "Word already exists");
  }

  await Word.updateOne({ _id }, { $push: { firstLvl: req.body } });
  await User.findByIdAndUpdate(_id, { $inc: { totalWordCount: 1, wordsInLearningProcess: 1 } });

  res.status(201).json("Word Added");
};

const moveWord = async (req, res) => {
  const { _id } = req.user;
  const { id, moveFrom, moveTo } = req.body;
  const specification = {
    dictionary: 4,
    firstLvl: 1,
    secondLvl: 2,
    thirdLvl: 3,
  };
  const words = await Word.find({ _id });
  const foundWord = words[0][moveFrom].find(item => new ObjectId(id).equals(item._id));

  if (!foundWord) {
    throw HttpError(404, "Word not found");
  }

  let statsRequest = { successfulWordConfirmation: 1 };

  if (specification[moveFrom] > specification[moveTo]) {
    statsRequest.failedWordConfirmation = 1;

    if (moveFrom === "dictionary") {
      statsRequest.wordsInDictionary = -1;
      statsRequest.wordsInLearningProcess = 1;
    }
  }

  if (specification[moveFrom] < specification[moveTo] && moveTo === "dictionary") {
    statsRequest.successfulWordConfirmation = 1;
    statsRequest.wordsInDictionary = 1;
    statsRequest.wordsInLearningProcess = -1;
  }

  await User.findByIdAndUpdate(_id, { $inc: statsRequest });
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

  let statsRequest = { totalWordCount: -1 };

  if (deleteFrom === "dictionary") {
    statsRequest.wordsInDictionary = -1;
  } else {
    statsRequest.wordsInLearningProcess = -1;
  }

  await User.findByIdAndUpdate(_id, { $inc: statsRequest });

  res.status(200).json("Word deleted");
};

export const ctrl = {
  getAll: ctrlWrapper(getAll),
  getRandomVordFromDictionary: ctrlWrapper(getRandomVordFromDictionary),
  add: ctrlWrapper(add),
  moveWord: ctrlWrapper(moveWord),
  deleteWord: ctrlWrapper(deleteWord),
};
