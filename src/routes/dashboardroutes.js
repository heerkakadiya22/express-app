//dashboard routes
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middlewares/middleware");
const csrf = require("csurf");
router.use(csrf());

router.get("/dashboard", protect, dashboardController.dashboard);

module.exports = router;
