const async = require('async')

function doTask1(callback){
    setTimeout(()=>{
        console.log("task 1 complete");
        callback(null, "result 1");
    },2000);
}

function doTask2(callback){
    setTimeout(()=>{
        console.log("task 2 complete");
        callback(null, "result 2");
    },3000);
}

function easyFunc(){

}

function doTask3(calback){
    setTimeout(()=>{
        console.log("task 3 failed");
        calback(easyFunc, null);
    }, 100);
}

// async.parallel([
//     doTask3,
//     doTask1,
//     doTask2,
// ],(error, results)=>{
//     if(error){
//         console.log(error);
//     }else{
//         console.log("all task completed");
//         console.log("results are: " , results);
//     }
// })



const numbers = [1, 2, 3, 4, 5];

// The initial value for the accumulator
const initialValue = 0;

// The reducer function that accumulates the sum of the numbers
function sumReducer(accumulator, currentValue, callback) {
  // Add the current value to the accumulator
  const result = accumulator + currentValue;
  
  // Call the callback with the new accumulator value
  callback(null, result);
}

// Use the reduce function from the async library to sum the numbers
async.reduce(numbers, initialValue, sumReducer, (error, result) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`The sum of the numbers is ${result}`);
  }
});
