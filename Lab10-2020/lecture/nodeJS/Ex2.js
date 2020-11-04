// const doSomeThingAsync = () =>
//   new Promise((resolve) => setTimeout(() => resolve("I did something"), 1000));
// const doSomeThing = async () => console.log(await doSomeThingAsync());
// doSomeThing()
const fetch = require("node-fetch");
const getUsersAsync = async () => {
  const res = await fetch("https://api.github.com/users");
  const data = await res.json();
  let loginAndName = [];
  for (const user of data) {
    const resp = await fetch("https://api.github.com/users/" + user.login);
    const dataUser = await resp.json();
    loginAndName.push({ login: dataUser.login, name: dataUser.name });
  }
  console.log(loginAndName);
};

getUsersAsync();
