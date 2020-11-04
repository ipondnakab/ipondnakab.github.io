let express = require("express");
let app = express();
let port = 3000;
let things = require("./things");
let ip = require("./ip");

app.use("/things", things);
app.use("/ip", ip);

console.log(`your sever at http://localhost:${port}`);
app.listen(port);
