const express = require("express");
const router = express.Router();
const controller = require("../controllers/employeeController");
const auth = require("../middlewares/authMiddleware");

router.use(auth);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
