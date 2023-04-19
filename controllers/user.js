const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const privateKey = "C*F-JaNdRgUkXp2s5v8x/A?D(G+KbPeS";

exports.createUser = async (req, res) => {
  try {
    const { code } = req.body;
    const checkUser = await User.findOne({ code });
    if (!checkUser) {
      const user = await User.create(req.body);
      const salt = await bcrypt.genSalt(5);
      user.password = await bcrypt.hash(user.password, salt);
      await user.save();
      return res.status(201).json({ "User add": user });
    }
    return res.status(400).send("User exists in the DB");
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

exports.login = async (req, res) => {
  try {
    const { code, username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send("Please provide credentials");
    }
    const user = await User.findOne({ username });
    if (user) {
      if (username && password) {
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
          const token = jwt.sign(
            { _id: user._id, role: user.role },
            privateKey,
            {
              expiresIn: "60m",
            }
          );
          return res.status(200).send(token);
        }
      }
      return res.status(400).send("Incorrect credentials");
    } else {
      res.status(404).send("User does not exist");
    }
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (users.length === 0) {
      return res.status(400).send("No users in the DB");
    }
    return res.status(200).send(users);
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

exports.getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(400).send("User does not exist in the DB");
    }
    return res.status(200).send(user);
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userInfo = req.body;
    const checkUser = await User.findById(req.params.id);

    if (!checkUser) {
      return res.status(400).send("User does not exist in the DB");
    }

    const salt = await bcrypt.genSalt(5);
    userInfo.password = await bcrypt.hash(userInfo.password, salt);
    const user = await User.findOneAndUpdate({ _id: req.params.id }, userInfo);

    res.status(200).json({ msg: "User updated" });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const checkUser = await User.findById(req.params.id);

    if (!checkUser) {
      return res.status(400).send("User does not exist in the DB");
    }
    const user = await User.findOneAndDelete({ _id: req.params.id });
    res.status(200).json({ msg: "User deleted" });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

// middlewares
exports.authorizeAll = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, privateKey, (err, user) => {
      if (err) {
        if (err.message === "jwt expired") {
          return res.status(400).send("Token expired please login");
        }
        return res.status(400).send("Forbiden");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).send("Unauthorized...");
  }
};

exports.authorizeAdmin = (req, res, next) => {
  const { role } = req.user;
  if (role === "admin") {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
};

exports.authorizeRequest = (req, res, next) => {
  const { role } = req.user;
  if (role === "user") {
    next();
  } else {
    res.status(401).send("Unauthorized--");
  }
};
