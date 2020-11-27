var express = require("express");
var bodyPraser = require("body-parser");
var app = express();
var port = 8080;
var request = require("request");
const fetch = require("node-fetch");

app.use(bodyPraser.json());
app.use(bodyPraser.urlencoded({ extended: true }));

app.set("view engine", "pug");

app.get("/", (req, res) => res.render("form"));
app.post("/", async (req, res) => {
  console.log(req.body);
  const keyAPI = "7ed6a0ab58314119bebd1e41463e74be";
  const url = `https://newsapi.org/v2/everything?q=${req.body.keyword}&apiKey=${keyAPI}`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const listNews = data.articles.reduce((sum, item) => {
        console.log(item);
        return sum + `<li><a href="${item.url}">${item.title}</a></li>`;
      }, "");

      res.send(`<div>
      <p>There ar <b>${data.articles.length}</b> articles related to <b>${req.body.keyword}</b><ol>${listNews}</ol></p></div>`);
      // res.json(data);
    })
    .catch((err) => {
      res.send(err);
    });
  // res.send(
  //   `<p>
  //       <b>${req.body["keyword"]}</b> used these follow
  //       skills: <b>${req.body["keyword"]}</b>
  //       while doing intermship at <b>${req.body["keyword"]}</b>
  //   </p>`
  // );
});

app.listen(port);
console.log(`your server run at http://localhost:${port}`);
