// map method
const numbers = [1, 5, 10, 15];
// The associated function multiply each array number by 2
const doubles = numbers.map(x => x * 2);

console.log(numbers); // [1, 5, 10, 15] (no change)
console.log(doubles); // [2, 10, 20, 30]

// elegant job by map
// Get movie titles
const titles = movies => {
    /* Previous code
    const titles = [];
    for (const movie of movies) {
      titles.push(movie.title);
    }
    return titles;
    */
  
    // Return a new array containing only movie titles
    return movies.map(movie => movie.title);
  };

//  filters method
const numbers = [1, 5, 10, 15];
// Keep only the number greater than or equal to 10
const bigOnes = numbers.filter(x => x >= 10);

console.log(numbers); // [1, 5, 10, 15] (no change)
console.log(bigOnes); // [10, 15]

// Get movies by Christopher Nolan
const nolanMovies = movies => {
    /* Previous code
    const nolanMovies = [];
    for (const movie of movies) {
      if (movie.director === "Christopher Nolan") {
        nolanMovies.push(movie);
      }
    }
    return nolanMovies;
    */
  
    // Return a new array containing only movies by Christopher Nolan
    return movies.filter(movie => movie.director === "Christopher Nolan");
  };

 
//  power of map and filter
// Get titles of movies with an IMDB rating greater or equal to 7.5
const bestTitles = movies => {
    /* Previous code
    const bestTitles = [];
    for (const movie of movies) {
      if (movie.imdbRating >= 7.5) {
        bestTitles.push(movie.title);
      }
    }
    return bestTitles;
    */
  
    // Filter movies by IMDB rating, then creates a movie titles array
    return movies.filter(movie => movie.imdbRating >= 7.5).map(movie => movie.title);
  };

  
//   reduce method
const numbers = [1, 5, 10, 15];
// Compute the sum of array elements
const sum = numbers.reduce((acc, value) => acc + value, 0);

console.log(numbers); // [1, 5, 10, 15] (no change)
console.log(sum);     // 31

// explanation
// The reduce() method can take several parameters:
// The first one is the function associated to reduce() and called for each array element. It takes two parameters: the first is an accumulator which contains the accumulated value previously returned by the last invocation of the function. The other function parameter is the array element.
// The second one is the initial value of the accumulator (often 0).
// Here’s how to apply reduce() to calculate the average rating of a movie list.
// Compute average rating of a movie list
const averageRating = movies => {
    /* Previous code
    let ratingSum = 0;
    for (const movie of movies) {
      ratingSum += movie.imdbRating;
    }
    return ratingSum / movies.length;
    */
  
    // Compute the sum of all movie IMDB ratings
    const ratingSum = movies.reduce((acc, movie) => acc + movie.imdbRating, 0);
    return ratingSum / movies.length;
  };
 
// or another way is
// Compute the sum of all movie IMDB ratings
const ratingSum = movies.map(movie => movie.imdbRating).reduce((acc, value) => acc + value, 0);
  