const req = require("request");
const http = require("http");
const keyAPI = "jjZKiGSuLeBKKdj9ACl8pTpWmD8KGUDW";
const url =
  "https://api.nytimes.com/svc/mostpopular/v2/viewed/1.json?api-key=" + keyAPI;
var liNews;

req.get(url, (err, res, body) => {
  if (err) return console.error(err);
  const result = JSON.parse(body);
  //   console.log(result.results[0].media[0]["media-metadata"][2].url);
  liNews = result.results.reduce((sum, item) => {
    const media = item.media[0];
    let img;
    if (media) {
      img = media["media-metadata"][1].url;
    } else {
      img = null;
    }
    return (
      sum +
      `<li><a href="${item.url}"> ${
        item.title
      } </a><div style="display: flax; flex-direction: column"> ${
        img ? `<img src="${img}" alt="img"/>` : ""
      } </div></li>`
    );
  }, "");
});

http
  .createServer((req, res) => {
    res.writeHead(200);
    res.end(`<html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <title>Basic Web API Invocation</title>
          </head>
          <body>
            <h1>New York Times Popular</h1>
            <ol>${liNews}</ol>
          </body>
        </html>`);
  })
  .listen(8080);
