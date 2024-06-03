//moo button
const mooBtn = document.querySelector("#moo");
const mooSound = document.querySelector("#mooSound");
mooBtn.addEventListener("click", () => {
  if (mooSound.paused) {
    mooSound.play();
    mooBtn.textContent = "Stop it!";
  } else {
    mooSound.pause();
    mooBtn.textContent = "Suprise!";
  }
});

// I'll give an idea of what the evaluate function
// might look like if we wanted to get rid of the scary eval() function.
// I didn't test this, so it might not work perfectly. It's mostly just to give an idea of how it could be done.
const evaluateExpression = (expression) => {
  // Lets find where the operator is in the expression, and what its length is (cuz it might be 1 or 2 for the ** operator)
  // Remember that the way we've designed the calculator, a maximum of 1 operator can exist in the expression at a time.
  // TODO: How do we filter out negative numbers? Maybe we have to search and skip over "(-", but not "-" by itself.
  const operatorIndex = expression.findIndex(isOperator);
  const operator = expression.find(isOperator);

  // Once we know where the operator is, we can find all of the characters to the left. This becomes our first number.
  // Next, we can find all of the characters to the right of the operator. This becomes our second number.
  const leftSide = expression.slice(0, operatorIndex).join("");
  const rightSide = expression.slice(operatorIndex + operator.length).join("");

  let firstNumber = Number(leftSide);
  let secondNumber = Number(rightSide);

  // If either of the numbers are invalid, we should throw an error.
  if (isNaN(firstNumber) || isNaN(secondNumber)) {
    throw new Error(
      "One of the following numbers is invalid: " +
        firstNumber +
        ", " +
        secondNumber
    );
  }

  // A "switch" statement is a good way to handle different operators.
  // Because we are matching on a string, you can give it strings to look for, each "case".
  // Then if it matches, it will run that code.
  // Notice how we "return" from each "case". This will exit the function.
  // If we didn't have a "return", it would continue on to the next "case".
  // Lastly, if we don't find a "case" that matches, we will always run the "default" case.
  // In this particular switch/case statement, we will throw an error for an unrecognized operator.
  switch (operator) {
    case "+":
      return firstNumber + secondNumber;
    case "-":
      return firstNumber - secondNumber;
    case "*":
      return firstNumber * secondNumber;
    case "/":
      return firstNumber / secondNumber;
    case "^":
      return firstNumber ** secondNumber;
    case "**":
      return firstNumber ** secondNumber;
    default:
      throw new Error("Invalid operator");
  }
};

// const displayBottomRow = document.querySelector("#displayBottomRow");
const displayTopRow = document.querySelector("#displayTopRow");
const btns = document.querySelectorAll("button");
const MAX_INPUT_LENGTH = 18;
const decimalPointButton = document.querySelector("#decimalPoint");

let operatorArr = ["+", "-", "*", "/", "^"];

// This bad boy will store our entire expression.
// It will only ever contain a single operator at a time.
// If we ever get a 2nd operator, we'll evaluate the expression and store the result.
const myArray = [];

// I made a bunch of simple helper functions to check what type of button we've clicked.
const isNumber = (value) => !isNaN(value);
const isOperator = (value) => operatorArr.includes(value);
const isEquals = (value) => value === "=";
const isClear = (value) => value === "C";
const isDecimal = (value) => value === ".";
const isNegative = (value) => value === "negative";
const isDelete = (value) => value === "DEL";

/*
    I decided not to implement a stack-based calculator. It is a bit more complicated.

    Instead, I'll go a similar path to what you did.
    The main difference is I'll store the entire expression in a single array instead of multiple.

    I'll handle each button event handler separately instead of creating one shared event handler for all buttons.

    This can help isolate and simplify the logic for each button.

    Although some buttons are still really complicated (looking at you, 'negative' button!)
*/
btns.forEach((btn) => {
  const value = btn.value;

  // If the clear button is the one we clicked, clear the array and re-enable the decimal point button.
  if (isClear(value)) {
    btn.addEventListener("click", () => {
      myArray.length = 0;
      decimalPointButton.disabled = false;
    });
  }

  // If the equals button is the one we clicked, evaluate the expression and store the result.
  // Also we can re-enable the decimal point button.
  if (isEquals(value)) {
    btn.addEventListener("click", () => {
      /* 
        eval() is a REALLY SCARY function.

        It will run literally any JavaScript code you give it.
        This can be a really scary security risk, as people can do whatever they want.

        I'm kind of cheating by using it, we could create our own function that
        reads through our array, splits it into 2 halves based on the operator,
        and does the math that way, but I'm being lazy.
      */
      const result = eval(myArray.join(""));
      myArray.length = 0;
      myArray.push(result);
      decimalPointButton.disabled = false;
    });
  }

  /*
    Holy moly.

    If we clicked the negative button, we need to handle a lot of edge cases.
    If we haven't been provided an operator yet, we are working with the first number.

    If our number is negative, we can just remove the negative sign.
    If our number is positive, we can add a negative sign before the first number.
    
    If we have an operator, we need to add a negative sign before the next number.
    There are shenanigans that happen if we already have an operator.
    We need to wrap the 2nd number with parenthesis and put the negative sign inside of it.
    A lot of the logic is basically saying, "hey, where the heck does the 2nd number start and end? Ok lets put the negative sign in the right spot."
  */
  if (isNegative(value)) {
    btn.addEventListener("click", () => {
      const containsOperator = myArray.some(isOperator);

      if (!containsOperator && myArray[0] === "-") {
        myArray.shift(); // Removes the element at the beginning of the array.
      } else if (!containsOperator) {
        myArray.unshift("-"); // Adds an element to the beginning of the array.
      } else {
        const indexOfOperator = myArray.findIndex(isOperator);
        const nextValue = myArray[indexOfOperator + 1];

        if (isNumber(nextValue)) {
          myArray.splice(indexOfOperator + 1, 0, "(-");
          myArray.push(")");
        } else if (isNegative(nextValue) || nextValue.includes("(")) {
          myArray.splice(indexOfOperator + 1, 1);
          const indexOfRightParenthesis = myArray.indexOf(")", indexOfOperator);
          myArray.splice(indexOfRightParenthesis, 1);
        }
      }
    });
  }

  // If we clicked an operator button, there are a few edge cases to handle.
  // If we have an operator already, we need to evaluate the expression and store the result before we add the next operator.
  // If we clicked the power operator, we need to convert it to the JavaScript power operator (**).
  // If we clicked any other operator, we can just add it to the array.
  // Additionally, if we clicked on an operator, we are ready for the next number, so we can re-enable the decimal point button.
  if (isOperator(value)) {
    btn.addEventListener("click", () => {
      const containsOperator = myArray.some(isOperator);
      if (containsOperator) {
        const result = eval(myArray.join(""));
        myArray.length = 0;
        myArray.push(result);
      }

      if (value === "^") {
        myArray.push("**");
      } else {
        myArray.push(value);
      }

      decimalPointButton.disabled = false;
    });
  }

  // If we clicked the delete button, we need to remove the last element from the array.
  // If the last element was a decimal point, we can re-enable the decimal point button.
  if (isDelete(value)) {
    btn.addEventListener("click", () => {
      const deletedValue = myArray.pop();

      if (isDecimal(deletedValue)) {
        decimalPointButton.disabled = false;
      }
    });
  }

  // If we clicked the decimal point button, we need to add it to the array.
  if (isDecimal(value)) {
    btn.addEventListener("click", () => {
      myArray.push(value);
      decimalPointButton.disabled = true;
    });
  }

  // If we clicked a number button, we need to add it to the array.
  if (isNumber(value)) {
    btn.addEventListener("click", () => {
      myArray.push(value);
    });
  }

  // At the end of every computation, we need to update the display.
  // Whereas the other event listeners were added to the button conditionally,
  // this event listener is added to every button AFTER the other event listeners.
  // So, each button will really have 2 event listeners.
  // 1. The one that does the computation.
  // 2. The one that updates the display.
  // The alternative would be to copy this code into every event listener, but that's a lot of code duplication.
  btn.addEventListener("click", function () {
    displayTopRow.textContent = myArray.join("");
  });
});

const keyMap = {
  0: "0",
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  "+": "+",
  "-": "-",
  "*": "*",
  "/": "/",
  Enter: "=",
  "=": "=",
  Backspace: "DEL",
  c: "C",
  C: "C",
  ".": ".",
  "^": "^",
};

document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (keyMap[key]) {
    handleKeyPress(keyMap[key]);
  }
});

function handleKeyPress(value) {
  const btn = document.querySelector(`button[value="${value}"]`);
  if (btn) {
    btn.click();
  }
}
