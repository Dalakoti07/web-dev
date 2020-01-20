// one way of making function
function functionName(){
    // do some work
}
functionName();


// another way of making functions
const hello = function(name) {
    const message = `Hello, ${name}!`;
    return message;
  };
  
  console.log(hello("Richard")); // "Hello, Richard!"
// now this function was anonymous as it did not has any name
// better way to do this in ES6 is as follows

const hello = (name) => {
    const message = `Hello, ${name}!`;
    return message;
  };
  
  console.log(hello("William")); // "Hello, William!"
//   fat arrow functions.

// Assignment of an anonymous function to the myFunc variable
const myFunc = (param1, param2) => {
    // Statements using param1, param2, ...
  };
  
  // Anonymous function call
  // param1 value is set to arg1, param2 to arg2, ...
  myFunc(arg1, arg2);

// a more concise way
// When there’s only one statement in the function body, everything can be written on the same line without curly braces. The return statement is omitted and implicit.
// When the function accepts only one parameter, parentheses around it can be omitted.
// Minimalist to the max
const hello = name => `Hello, ${name}!`;

console.log(hello("Kate")); // "Hello, Kate!"
