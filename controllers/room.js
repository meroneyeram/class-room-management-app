const Room = require("../models/room");

exports.createRoom = async (req, res) => {
  try {
    const { code } = req.body;
    const checkRoom = await Room.findOne({ code });
    if (!checkRoom) {
      const room = await Room.create(req.body);
      await room.save();
      return res.status(201).send(room);
    }
    return res.status(400).send("Room already in the DB");
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

exports.getAllRooms = async (req, res) => {
  const queryLength = Object.keys(req.query).length;

  if (queryLength === 0) {
    displayAllRooms(req, res);
  } else {
    displayQueriedRooms(req, res, req.query);
  }
};
async function displayAllRooms(req, res) {
  try {
    const rooms = await Room.find();
    if (rooms.length > 0) {
      return res.status(200).send(rooms);
    }
    return res.status(400).send("No rooms in the DB");
  } catch (error) {
    res.status(500).json({ msg: error });
  }
}

async function displayQueriedRooms(req, res, query) {
  try {
    const rooms = await queryRooms(query);
    if (rooms.length === 0) {
      return res.status(400).send("No rooms that matches the query in the DB");
    }
    return res.status(200).send(rooms);
  } catch (error) {
    res.status(500).json({ msg: error });
  }
}

async function queryRooms(query) {
  const { slot, status } = query;
  if (status) status.toLowerCase();
  const queryRooms = {};
  const projection = { _id: 0 };

  if (slot && status) {
    queryRooms.slots = { $elemMatch: { number: slot, status: status } };
    projection.slots = { $elemMatch: { number: slot, status: status } };
    projection.code = 1;
    projection.number = 1;
    projection.status = 1;
  } else if (slot) {
    queryRooms.slots = { $elemMatch: { number: slot } };
    projection.slots = { $elemMatch: { number: slot } };
    projection.code = 1;
    projection.number = 1;
    projection.status = 1;
  } else if (status) {
    queryRooms.slots = { $elemMatch: { status: status } };
    projection.slots = { $elemMatch: { status: status } };
    projection.code = 1;
    projection.number = 1;
    projection.status = 1;
  }
  return await Room.find(queryRooms, projection);
}
exports.requestRoom = async (req, res) => {
  try {
    const { code, slot, status } = req.body;
    const user = req.user;
    const room = await Room.findOne({ code });
    if (!room) {
      return res.status(400).send("Room does not exsit");
    }

    const slotInfo = room.slots.find((item) => item.number === Number(slot));
    if (!slotInfo) {
      return res.status(400).json({ msg: "Invalid status request" });
    }
    if (status === "requested") {
      if (slotInfo.number === Number(slot) && slotInfo.status === "available") {
        slotInfo.status = "busy";
        slotInfo.used_by = user._id;
        room.save();
        return res
          .status(200)
          .json({ msg: `Request made ${slot}`, room: room });
      }
      return res.status(400).json({ msg: "Room is not available for service" });
    }
    if (status === "completed") {
      if (slotInfo.number === Number(slot) && slotInfo.status === "busy") {
        slotInfo.status = "available";
        slotInfo.used_by = "";
        room.save();
        return res
          .status(200)
          .json({ msg: `Client finished using slot ${slot}`, room: room });
      }
      return res
        .status(200)
        .json({ msg: `Slot ${slot} is available`, room: room });
    }
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

exports.getSingleRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(400).send("Room does not exsit");
    }
    return res.status(200).send(room);
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(400).send("Room does not exsit");
    }
    await Room.findOneAndUpdate({ _id: req.params.id }, req.body);
    return res.status(200).json({ msg: "Room Updated" });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(400).send("Room does not exsit");
    }
    await Room.findOneAndDelete({ _id: req.params.id });
    return res.status(200).json({ "Room deleted": room });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};
