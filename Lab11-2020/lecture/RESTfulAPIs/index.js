var express = require("express");
var app = express();
var fs = require("fs");
var pathUserFile = `${__dirname}/users.json`;
//Get List User
app.get("/listUsers", (req, res) => {
  fs.readFile(pathUserFile, "utf8", (err, data) => {
    console.log(data);
    res.end(data);
  });
});
//Get Some User
app.get("/:id", (req, res) => {
  fs.readFile(pathUserFile, "utf8", (err, data) => {
    let user = JSON.parse(data)[`user${req.params.id}`];
    console.log(user);
    res.end(JSON.stringify(user));
  });
});

//Delete Some User
app.delete("/deleteUser/:id", (req, res) => {
  fs.readFile(pathUserFile, "utf8", (err, data) => {
    let users = JSON.parse(data);
    delete users[`user${req.params.id}`];
    console.log(users);
    res.end(JSON.stringify(users));
  });
});

//Post new user
const user = {
  user4: {
    name: "piti",
    profession: "priest",
    hobbies: "meditation",
    id: 4,
  },
};
app.post("/addUser", (req, res) => {
  fs.readFile(pathUserFile, "utf8", (err, data) => {
    data = JSON.parse(data);
    data["user4"] = user["user4"];
    console.log(data);
    res.end(JSON.stringify(data));
  });
});

var server = app.listen(8081, () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://" + host + port);
});
