const add = (a, b) => {
  const c = parseInt(a) + parseInt(b);
  console.log(a + " + " + b + " = " + c);
};

const subtract = (a, b) => {
  const c = parseInt(a) - parseInt(b);
  console.log(a + " - " + b + " = " + c);
};

const argument = process.argv.slice(2);
const first_arg = argument[0];
const second_arg = argument[1];

const inquirer = require("inquirer");
const question = [
  {
    type: "input",
    name: "func",
    message: "Add | Subtract ",
  },
];

inquirer.prompt(question).then((res) => {
  const func = res["func"].toLowerCase();

  func == "add"
    ? add(first_arg, second_arg)
    : func == "subtract"
    ? subtract(first_arg, second_arg)
    : console.log("unkonw");
});
