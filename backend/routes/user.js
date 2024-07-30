const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { User } = require("../db");
const { JWT_SECRET } = require("../config");
const router = express.Router();

const signupSchema = zod.object({
  username: zod.string(),
  firstname: zod.string(),
  lastname: zod.string(),
  password: zod.string()
});

const loginSchema = zod.object({
  username: zod.string(),
  password: zod.string()
})

router.post("/signup", async (req, res) => {
  try {
    const user = signupSchema.safeParse(req.body);
    if (!user.success) {
      res.status(411).json({
        msg: "Please send the input in correct format"
      });
    }

    const eUser = await User.findOne({
      username: req.body.username
    });
    if (eUser) {
      return res.status(403).json({
        msg: "User already exists"
      });
    }
    const cUser = User.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      password: req.body.password
    });

    const token = jwt.sign({ userId: cUser._id, username: cUser.username }, JWT_SECRET);

    return res.status(200).json({
      msg: "User created Successfully.",
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Internal Server Error"
    })
  }
});

router.post("/signin", async (req, res) => {
  const { success } = loginSchema.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      msg: 'Incorrect input format'
    });
  }

  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password
  });
  if (!user) {
    return res.status(401).json({
      msg: "Email or Password isn't correct"
    });
  }

  if (user.password != req.body.password) {
    return res.status(401).json({
      msg: "Email or Password isn't correct"
    });
  }

  const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET);

  return res.status(200).json({
    token: token
  })
})

module.exports = router;
