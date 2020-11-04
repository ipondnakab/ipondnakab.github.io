let express = require("express");
let router = express.Router();

router.get("/", (req, res) => {
  res.send("GET route on things\n");
});

router.post("/", (req, res) => {
  res.send("POST route on things\n");
});

module.exports = router;
