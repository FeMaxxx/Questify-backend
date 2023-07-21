import { app } from "./app.js";
import mongoose from "mongoose";

const { DB_HOST } = process.env;

mongoose
  .connect(DB_HOST)
  .then(() => {
    console.log("Database connection successful");

    app.listen(5555);
  })
  .catch(error => {
    console.log(error.message);
    process.exit(1);
  });
