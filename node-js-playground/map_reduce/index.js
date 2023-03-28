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
  callback(null, counts);
}

// Reduce function - takes a key (word) and a list of values (counts) and sums the counts
function reduceFunction(word, counts, callback) {
  const totalCount = counts.reduce((sum, count) => sum + count, 0);
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
  const offsets = Array.from({ length: numChunks }, (_, i) => i * chunkSize);
  const lengths = Array.from({ length: numChunks }, (_, i) => Math.min(chunkSize, fileSize - i * chunkSize));
  const mapper = (i, callback) => {
    readChunk(inputFile, offsets[i], lengths[i]).then(chunk => {
      mapFunction(chunk, callback);
    }).catch(error => {
      callback(error);
    });
  };
  const reducer = (word, counts, callback) => {
    reduceFunction(word, counts, callback);
  };
  parallel(Array.from({ length: numWorkers }, (_, i) => callback => {
    map(Array.from({ length: numChunks }, (_, j) => j * numWorkers + i), mapper, (error, results) => {
      if (error) {
        callback(error);
      } else {
        reduce(Object.entries(Object.assign({}, ...results)), reducer, callback);
      }
    });
  }), (error, results) => {
    if (error) {
      console.error(error);
    } else {
      fs.writeFile(outputFile, results.join(''), error => {
        if (error) {
          console.error(error);
        } else {
          console.log('Done!');
        }
      });
    }
  });
}

// Call the main function to perform frequency count
frequencyCount(inputFile, outputFile, chunkSize, numWorkers);