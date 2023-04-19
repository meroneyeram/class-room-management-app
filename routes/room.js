const express = require("express");
const roomControllers = require("../controllers/room");
const userControllers = require("../controllers/user");
const router = express.Router();

// middleware
router.use(userControllers.authorizeAll);

// routes
router.post("", userControllers.authorizeAdmin, roomControllers.createRoom);

router.post(
  "/request-room",
  userControllers.authorizeRequest,
  roomControllers.requestRoom
);

router.get("", roomControllers.getAllRooms);

router.get("/:id", roomControllers.getSingleRoom);

router.put("/:id", userControllers.authorizeAdmin, roomControllers.updateRoom);

router.delete(
  "/:id",
  userControllers.authorizeAdmin,
  roomControllers.deleteRoom
);

module.exports = router;
