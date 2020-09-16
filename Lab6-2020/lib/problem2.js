const isInteger = (value) => parseInt(value) == value;
let numberList = [];

loop: while (true) {
  let getInput = prompt("Enter an integers (a negative integer to quit):");
  if (parseInt(getInput) < 0) {
    displayStats(readInput());
    break loop;
  } else if (isInteger(getInput)) {
    numberList.push(parseInt(getInput));
    console.log(readInput());
  }
}

function readInput() {
  return (list = [...numberList].sort(function (a, b) {
    return a - b;
  }));
}

function listAverage(numberArray) {
  return numberArray.reduce((a, b) => a + b) / numberArray.length;
}

function displayStats(numberArray) {
  let textForShow =
    numberArray.length > 0
      ? `For the list ${numberArray} the average is ${listAverage(
          numberArray
        )}, the minnimum is ${Math.min(
          ...numberArray
        )}, the maximum is ${Math.max(...numberArray)}`
      : `For the list empty the average is 0, the minnimum is 0, the maximum is 0`;

  alert(textForShow);
}
