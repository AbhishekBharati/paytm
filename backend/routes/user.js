const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { User, Account } = require("../db");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");
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
});

const updateSchema = zod.object({
  firstname: zod.string().optional(),
  lastname: zod.string().optional(),
  password: zod.string().optional()
});

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
    const cUser = await User.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      password: req.body.password
    });

    const userId = cUser._id;
    console.log(userId);
    // Creating new Account :-
    await Account.create({
      userId,
      balance: 1 + Math.random() * 10000
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

router.put("/", authMiddleware, async (req, res) => {
  const { success } = updateSchema.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Error while updating the information"
    })
  }
  await User.updateOne({ _id: req.userId }, req.body);
  res.status(200).json({
    message: "Updated Successfully"
  });
});

router.get("/bulk", authMiddleware, async (req, res) => {
  const filter = req.query.filter || "";
  const users = await User.find({
    $or: [{
      firstname: {
        "$regex": filter
      }
    }, {
      lastname: {
        "$regex": filter
      }
    }]
  });

  res.status(200).json({
    user: users.map(user => ({
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      _id: user._id
    }))
  });
})

module.exports = router;
