// Sends an asynchronous HTTP request to the target url
fetch(url)
  .then(() => {
    // Code called in the future when the request ends successfully
  })
  .catch(() => {
    // Code called in the future when an errors occurs during the request
  });


//   api call to show the list
fetch(
    "https://raw.githubusercontent.com/bpesquet/thejsway/master/resources/languages.txt"
  )
    .then(response => response.text()) // Access and return response's text content
    .then(text => {
      const languages = text.split(";");
      const listElement = document.getElementById("languageList");
      languages.forEach(language => {
        // Create the list item for the language
        const languageElement = document.createElement("li");
        languageElement.textContent = language;
        // Add the item to the list
        listElement.appendChild(languageElement);
      });
    })
    .catch(err => {
      console.error(err.message);
    });

{/* <html>
 <head>
 </head>
 <body>
	<h2>A few programming languages</h2>
	<ul id="languageList">
	</ul>
  </body>
</html> */}

// show painting details
fetch(
    "https://raw.githubusercontent.com/bpesquet/thejsway/master/resources/paintings.json"
  )
    .then(response => response.json()) // Access and return response's JSON content
    .then(paintings => {
      const paintingsElement = document.getElementById("paintings");
      paintings.forEach(painting => {
        const paintingElement = document.createElement("tr");
        paintingElement.innerHTML = `<td>
          ${painting.name}
          </td>
          <td>
          ${painting.year}
          </td>
          <td>
          ${painting.artist}
          </td>`;
        paintingsElement.appendChild(paintingElement);
      });
    })
    .catch(err => {
      console.error(err.message);
    });

//  <html>
//  <head>
//  </head>
//  <body>
// 	<h2>Some famous paintings</h2>
// 	<table id="paintings">
//     <tr>
//         <th>Name</th>
//         <th>Year</th>
//         <th>Artist</th>
//     </tr>
// </table>
  
//  </body>
// </html>

// sending form-data to server
// Handle form submission
document.querySelector("form").addEventListener("submit", e => {
    // Cancel default behavior of sending a synchronous POST request
    e.preventDefault();
    // Create a FormData object, passing the form as a parameter
    const formData = new FormData(e.target);
    // Send form data to the server with an asynchronous POST request
    fetch("https://thejsway-server.herokuapp.com/animals", {
      method: "POST",
      body: formData
    })
      .then(response => response.text())
      .then(result => {
        document.getElementById("result").textContent = result;
      })
      .catch(err => {
        console.error(err.message);
      });
  });
//  one more example
document.getElementById("buyButton").addEventListener("click", () => {
    // Create a new, empty FormData object
    const formData = new FormData();
    // Fill the object with key/value pairs
    formData.append("size", "L");
    formData.append("color", "blue");
    // Send data to the server
    fetch("https://thejsway-server.herokuapp.com/tshirt", {
      method: "POST",
      body: formData
    })
    .then(response => response.text())
    .then(result => {
      document.getElementById("result").textContent = result;
    })
    .catch(err => {
      console.error(err.message);
    });
});

// send JSON data to the server
// Create an array containing two objects
const cars = [
    {
      model: "Peugeot",
      color: "blue",
      registration: 2012,
      checkups: [2015, 2017]
    },
    {
      model: "Citroën",
      color: "white",
      registration: 1999,
      checkups: [2003, 2005, 2007, 2009, 2011, 2013]
    }
  ];
  
  // Send this array as JSON data to the server
  fetch("https://thejsway-server.herokuapp.com/api/cars", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(cars)
  })
    .then(response => response.text())
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.error(err.message);
    });
    