const https = require("https");
const option = {
  hostname: "httpbin.org",
  path: "/ip",
  method: "GET",
};

const req = https.request(option, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on("data", (response) => {
    console.log(response);
    json_obj = JSON.parse(response);
    ip = json_obj.origin;
    console.log({ip});
  });
});

req.on("error", (err) => {
  console.error(err);
});

req.end();
