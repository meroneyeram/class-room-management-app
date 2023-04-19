const express = require("express");
const userControllers = require("../controllers/user");
const router = express.Router();

router.post("", userControllers.createUser);

router.post("/login", userControllers.login);

router.get("", userControllers.getAllUsers);

router.get("/:id", userControllers.getSingleUser);

router.put("/:id", userControllers.updateUser);

router.delete("/:id", userControllers.deleteUser);

module.exports = router;
