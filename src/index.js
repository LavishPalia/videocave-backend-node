import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
import errorHandler from "./middlewares/error.middleware.js";

dotenv.config({
  path: "./.env",
});

await connectDB();

// import routes
import userRouter from "./routes/user.routes.js";

// mount routes
app.use("/api/v1/users", userRouter);

app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log(`server is running on port ${process.env.PORT}`)
);
