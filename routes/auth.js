const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateMe,
  getAll,
  remove,
} = require("../controllers/authController");

const authenticate = require("../middlewares/authMiddleware");

router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);
router.get("/", authenticate, getAll);
router.delete("/:id", authenticate, remove);

router.post("/register", register);
router.post("/login", login);

module.exports = router;
