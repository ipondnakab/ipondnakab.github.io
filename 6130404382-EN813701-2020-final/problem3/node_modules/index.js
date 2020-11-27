var express = require("express");
var bodyPraser = require("body-parser");
var cookiesParser = require("cookie-parser")
var multer = require("multer");
var upload = multer();
var app = express();
var port = 8080;




app.use(bodyPraser.json());
app.use(bodyPraser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(express.static("public"));
app.use(cookiesParser())

app.set("view engine", "pug");

app.get("/", (req, res) => res.render("form"));
app.post("/", (req, res) => {
  console.log(req.body);
  res.send("received your request!");
});

app.get("/problem1", (req, res) => res.render("problem1"));
app.get("/problem2", (req, res) => res.render("problem2"));
app.post("/problem2", (req, res) => {
  console.log(req.body);
  res.send(
    `<p>
        <b>${req.body["name"]}</b> used these follow 
        skills: <b>${req.body["skills"]}</b> 
        while doing intermship at <b>${req.body["intern"]}</b>
    </p>`
  );
});



app.listen(port);
console.log(`your server run at http://localhost:${port}`);
