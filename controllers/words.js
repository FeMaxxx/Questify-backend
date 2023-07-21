import { HttpError, ctrlWrapper } from "../helpers/index.js";
import { Word } from "../models/word.js";
import { Stat } from "../models/stat.js";
import { ObjectId } from "mongodb";

const getAll = async (req, res) => {
  const { _id } = req.user;
  const result = await Word.find({ _id });

  res.json(result);
};

const getRandomVordFromVocabulary = async (req, res) => {
  const { _id } = req.user;
  const words = await Word.find({ _id });
  const vocabulary = [...words[0].vocabulary];
  const randomNumber = Math.floor(Math.random() * vocabulary.length);

  res.json(vocabulary[randomNumber]);
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
  await Stat.findByIdAndUpdate(_id, { $inc: { totalWordCount: 1, wordsInLearningProcess: 1 } });

  res.status(201).json("Word Added");
};

const moveWord = async (req, res) => {
  const { _id } = req.user;
  const { id, moveFrom, moveTo, canByConfirmed } = req.body;
  const specification = {
    vocabulary: 4,
    firstLvl: 1,
    secondLvl: 2,
    thirdLvl: 3,
  };
  const words = await Word.find({ _id });
  const foundWord = words[0][moveFrom].find(item => new ObjectId(id).equals(item._id));

  if (!foundWord) {
    throw HttpError(404, "Word not found");
  }

  const word = JSON.parse(JSON.stringify(foundWord));

  await Word.updateOne(
    { _id },
    {
      $pull: { [moveFrom]: foundWord },
      $push: { [moveTo]: { ...word, canByConfirmed } },
    }
  );

  let statsRequest = { successfulWordConfirmation: 1 };

  if (specification[moveFrom] > specification[moveTo]) {
    statsRequest.failedWordConfirmation = 1;

    if (moveFrom === "vocabulary") {
      statsRequest.wordsInVocabulary = -1;
      statsRequest.wordsInLearningProcess = 1;
    }
  }

  if (specification[moveFrom] < specification[moveTo] && moveTo === "vocabulary") {
    statsRequest.successfulWordConfirmation = 1;
    statsRequest.wordsInVocabulary = 1;
    statsRequest.wordsInLearningProcess = -1;
  }

  await Stat.findByIdAndUpdate(_id, { $inc: statsRequest });

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

  if (deleteFrom === "vocabulary") {
    statsRequest.wordsInVocabulary = -1;
  } else {
    statsRequest.wordsInLearningProcess = -1;
  }

  await Stat.findByIdAndUpdate(_id, { $inc: statsRequest });

  res.status(200).json("Word deleted");
};

export const ctrl = {
  getAll: ctrlWrapper(getAll),
  getRandomVordFromVocabulary: ctrlWrapper(getRandomVordFromVocabulary),
  add: ctrlWrapper(add),
  moveWord: ctrlWrapper(moveWord),
  deleteWord: ctrlWrapper(deleteWord),
};
