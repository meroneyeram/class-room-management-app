const express = require("express");
const mongoose = require("mongoose");
const roomRouter = require("./routes/room");
const userRouter = require("./routes/user");

const app = express();

// middleware
app.use(express.json());

// routes
app.use("/rooms", roomRouter);
app.use("/users", userRouter);

//errors
app.use((err, req, res, next) => {
  res.send(err.message);
});

mongoose.connect("mongodb://localhost:27017/finalproject", (err) => {
  if (err) {
    console.log("DB error :" + err);
  } else {
    console.log("connected to DB....");
  }
});

const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port} ....`));
