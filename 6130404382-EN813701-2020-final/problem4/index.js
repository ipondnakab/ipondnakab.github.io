var express = require("express");
var bodyPraser = require("body-parser");
var fs = require("fs");
var pathStudentFile = `${__dirname}/students.json`;

var app = express();
var port = 8080;

app.use(bodyPraser.json());
app.use(bodyPraser.urlencoded({ extended: true }));

var students;

fs.readFile(pathStudentFile, "utf8", (err, data) => {
  students = JSON.parse(data);
});

app.get("/students", (req, res) => {
  res.json(students);
});

app.get("/students/:id", (req, res) => {
  const result = students.filter((student) => student.id == req.params.id);
  res.json(result.length != 0 ? result : { message: "Not Found" });
});

app.post("/students", (req, res) => {
  console.log(req.body);
  const id = students[students.length - 1].id + 1;
  students.push({ id, ...req.body });
  console.log(students);
  res.json({ message: "New student added.", location: `/sutudents/${id}` });
});

app.listen(port);
console.log(`your server run at http://localhost:${port}`);
