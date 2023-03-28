const fs = require('fs');
const readline = require('readline');
const { map } = require('async');
const { parallel } = require('async');
const { reduce } = require('async');

const inputFile = './big.txt';
const outputFile = './output.txt';

const chunkSize = 1000000; // number of characters in each chunk
const numWorkers = 4; // number of worker threads to use

// Map function - takes a chunk of text and emits a key-value pair for each word
function mapFunction(chunk, callback) {
  const words = chunk.split(/\s+/); // split text into words
  const counts = {};
  for (const word of words) {
    counts[word] = (counts[word] || 0) + 1;
  }
  console.log('count dict:', Object.keys(counts).length);
  callback(null, counts);
}

// Reduce function - takes a key (word) and a list of values (counts) and sums the counts
function SaurabhreduceFunction(word, counts, callback) {
    
  const totalCount = counts.reduce((sum, count) => sum + count, 0);
//   console.log("total count: ", totalCount);
  callback(null, `${word}: ${totalCount}\n`);
}

// Function to read a chunk of the input file
function readChunk(inputFile, offset, length) {

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(inputFile, { start: offset, end: offset + length - 1 });
    const rl = readline.createInterface({ input: stream });
    let chunk = '';
    rl.on('line', line => {
      chunk += line + '\n';
    });
    rl.on('close', () => {
      resolve(chunk);
    });
    rl.on('error', error => {
      reject(error);
    });
  });
}

// Main function to perform frequency count using MapReduce
function frequencyCount(inputFile, outputFile, chunkSize, numWorkers) {
  const fileSize = fs.statSync(inputFile).size;
  const numChunks = Math.ceil(fileSize / chunkSize);
  console.log("chunks :", numChunks);

  const offsets = Array.from({ length: numChunks }, (_, i) => i * chunkSize);
  console.log("offsets: ", offsets);
  const lengths = Array.from({ length: numChunks }, (_, i) => Math.min(chunkSize, fileSize - i * chunkSize));
  console.log("lengths: ", lengths);
  const mapper = (i, callback) => {
    console.log("map called with index: ", i);

    readChunk(inputFile, offsets[i], lengths[i]).then(chunk => {
        mapFunction(chunk, callback);
      }).catch(error => {
        callback(error);
      });

  };

  // todo ?
//   const reducerFunction = (word, counts, callback) => {
//     console.log("word: ", word, " counts: ", counts);
//     reduceFunction(word, counts, callback);
//   };

  // todo use this parallel thing as an example
  parallel(Array.from({ length: numWorkers }, (_, i) => callback => {
    // map(Array.from({ length: numChunks }, (_, j) => j * numWorkers + i), mapper, (error, results) => {

    // Worker 0: Chunks 0, 4
    // Worker 1: Chunks 1, 5
    // Worker 2: Chunks 2, 6
    // Worker 3: Chunk 3

    function getChunksLengthForWorker(workerIdx){
        equalPart = numChunks / numWorkers;
        equalPart = Math.floor(equalPart)
        remainder = numChunks % numWorkers;
        if(workerIdx<remainder){
            console.log("c length is: ", equalPart+1," for worker: ", workerIdx);
            return equalPart+1;
        }
        console.log("c length is: ", equalPart," for worker: ", workerIdx);
        return equalPart;
    }

    function getChunkArrayForWorker(workerIdx, cl){
        chunkName = [workerIdx];
        for(i=1; i<cl;i++){
            chunkName.push(i*numWorkers + workerIdx);
        }
        return chunkName;
    }

    chunkLength = getChunksLengthForWorker(i);

    map(Array.from(getChunkArrayForWorker(i, chunkLength)), mapper, (error, results) => {
      if (error) {
        callback(error);
      } else {
        console.log("results: ", results);
        reduce(Object.entries(Object.assign({}, ...results)),{}, SaurabhreduceFunction, callback);
      }
    });
  }), (error, results) => {
    if (error) {
        console.error('error at line 113: ',error);
    } else {
      fs.writeFile(outputFile, results.join(''), error => {
        if (error) {
          console.error('error: ',error);
        } else {
          console.log('Done!');
        }
      });
    }
  });
}

// Call the main function to perform frequency count
frequencyCount(inputFile, outputFile, chunkSize, numWorkers);