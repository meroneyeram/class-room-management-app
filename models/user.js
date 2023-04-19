const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    code: { type: Number, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["admin", "user"] },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
