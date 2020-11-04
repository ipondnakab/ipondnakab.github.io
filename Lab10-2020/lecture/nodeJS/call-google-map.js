const req = require("request");
const http = require("http");
const googleKeyAPI = "AIzaSyDarRTzGJ3VunLCYlrg-7BV0G8qZPT-B9Q";
const url =
  "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants%20in%20Khon%20Kaen&key=" +
  googleKeyAPI;
var liName;

req.get(url, (err, res, body) => {
  if (err) return console.error(err);
  const result = JSON.parse(body);
  liName = result.results.reduce((sum, item) => {
    return sum + `<li>${item.name}</li>`;
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
            <title>Document</title>
          </head>
          <body>
            <h1>Restaurant in Khon Kaen</h1>
            <ol>${liName}</ol>
          </body>
        </html>`);
  })
  .listen(8080);
