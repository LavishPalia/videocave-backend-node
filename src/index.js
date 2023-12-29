import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

connectDB();

// Database connection using IIFE based approach
// import express from "express";
// const app = express();

// (async () => {
//   try {
//     const connectionInstance = await mongoose.connect(
//       `${process.env.MONGO_URI}/${DB_NAME}`
//     );
//     console.log("Line 21: ", connectionInstance.connection.host);

//     app.on("error", (error) => {
//       console.error("Error: ", error);
//       throw error;
//     });

//     app.listen(`${process.env.PORT}`, () =>
//       console.log(`App is listening on port ${process.env.PORT}`)
//     );
//   } catch (error) {
//     console.error("Error: ", error);
//     throw error;
//   }
// })();
