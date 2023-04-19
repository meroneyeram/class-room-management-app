const mongoose = require("mongoose");

const roomSchema = mongoose.Schema(
  {
    code: { type: String, required: true },
    slots: [
      {
        number: { type: Number, required: true },
        status: { type: String, required: true, enum: ["busy", "available"] },
        used_by: { type: String },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
