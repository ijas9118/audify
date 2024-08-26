const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("admin/adminHome", {
    title: "Home",
  });
});

module.exports = router;
