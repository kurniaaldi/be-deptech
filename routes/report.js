const express = require("express");
const router = express.Router();
const { employeeWithLeaves } = require("../controllers/reportController");
const auth = require("../middlewares/authMiddleware");

router.use(auth);
router.get("/employees-leave", employeeWithLeaves);

module.exports = router;
