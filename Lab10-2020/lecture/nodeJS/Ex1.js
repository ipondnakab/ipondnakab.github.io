const status = (res) => {
  return res.status >= 200 && res.status < 300
    ? Promise.resolve(res)
    : Promise.reject(new Error(res.statusText));
};
const json = (res) => res.json();
const fetch = require("node-fetch");
fetch("https://api.github.com/users/ipondnakab")
  .then(status)
  .then(json)
  .then((data) => console.log("Request succeded with JSON response", data))
  .catch((err) => console.log("Request failed", err));