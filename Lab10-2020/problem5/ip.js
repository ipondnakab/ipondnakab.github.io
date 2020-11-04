const req = require("request");
let express = require("express");
let router = express.Router();

const url = "https://httpbin.org/ip";

req.get(url, (err, res, body) => {
  if (err) return console.error(err);
  const result = JSON.parse(body);
  router.get("/", (req, res) => {
    res.json({ ip: result.origin });
  });
});

module.exports = router;
