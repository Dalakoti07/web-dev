//  get elemet by tag
// Get all h2 elements into an array
const titleElements = document.getElementsByTagName("h2");

console.log(titleElements[0].innerHTML);     // Show the first h2
console.log(titleElements.length); // 3 (total number of h2 elements in the page)

// selecting element by class
// Show all elements that have the class "exists"
const existingElements = Array.from(document.getElementsByClassName("exists"));
existingElements.forEach(element => {
  console.log(element.innerHTML);
});

// select by id
// Show element with the ID "new"
console.log(document.getElementById("new").innerHTML);

// add para with link via js
const paragraphElement = document.createElement("p");
const linkElement = document.createElement("a");
linkElement.id = "link"
linkElement.href = "https://en.wikipedia.org/wiki/List_of_programming_languages";
linkElement.textContent = "list";
paragraphElement.appendChild(document.createTextNode("Here is a more complete "));
paragraphElement.appendChild(linkElement);
paragraphElement.appendChild(document.createTextNode(" of languages."));
document.getElementById("content").appendChild(paragraphElement);

// add news list via js
// Newspaper list
const newspapers = [
    "https://www.nytimes.com",
    "https://www.washingtonpost.com",
    "http://www.economist.com"
  ];
  
  //Write-Your-Code-Here
  const contentElement = document.getElementById("content");
  newspapers.forEach(newspaper => {
    // Create the link
    const linkElement = document.createElement("a");
    linkElement.textContent = newspaper;
    linkElement.href = newspaper;
    // Add the link
    contentElement.appendChild(linkElement);
    // Add a <br> tag
    contentElement.appendChild(document.createElement("br"));
  });
  
// add dictionary at runtime
const words = [{
    term: "Procrastination",
    definition: "Avoidance of doing a task that needs to be accomplished"
  }, {
    term: "Tautology",
    definition: "logical argument constructed in such a way that it is logically irrefutable"
  }, {
    term: "Oxymoron",
    definition: "figure of speech that juxtaposes elements that appear to be contradictory"
  }];
  
  //Write-Your-Code-Here
  // Create a definition list tag
  const dlElement = document.createElement("dl");
  // For each word, a <dt> tag is built containing both term and definition
  words.forEach(word => {
    const dtElement = document.createElement("dt");
    const strongElt = document.createElement("strong");
    strongElt.textContent = word.term;
    const ddElement = document.createElement("dd");
    ddElement.textContent = word.definition;
  
    dtElement.appendChild(strongElt);
    dlElement.appendChild(dtElement);
    dlElement.appendChild(ddElement);
  });
  
  // Lastly, the DOM is update with the definition list
  document.getElementById("content").appendChild(dlElement); // Ajout de la liste à la page

// click listeners


// Click handler on the button
document.getElementById("propa").addEventListener("click", e => {
    console.log("Button handler");
    e.stopPropagation(); // Stop the event propagation
  });

//   Most of the user actions on a page are associated to a default behavior. 
//Clicking on a link navigates to the link target, clicking anywhere with the right mouse button show a contextual menu, etc. 
// Cancelling a default behavior is possible by calling the preventDefault() method on the Event object in an event handler. 
// Handling clicking on the forbidden link
document.getElementById("forbidden").addEventListener("click", e => {
    alert("Yes... But no.");
    e.preventDefault(); // Cancels the default behavior
  });
 
  
//  counter button and deactivate listener
const click = () => {
    const clickCountElement = document.getElementById("clickCount");
    const clickCount = Number(clickCountElement.textContent);
    clickCountElement.textContent = clickCount + 1;
  };
  
  document.getElementById("myButton").addEventListener("click", click);
  
  document.getElementById("deactivate").addEventListener("click", () => {
    document.getElementById("myButton").removeEventListener("click", click);
  });
 
//  email validation
// Check email validity when field loses focus
document.getElementById("emailAddress").addEventListener("blur", e => {
    // Match a string of the form xxx@yyy.zzz
    const emailRegex = /.+@.+\..+/;
    let validityMessage = "";
    if (!emailRegex.test(e.target.value)) {
      validityMessage = "Invalid address";
    }
    document.getElementById("emailHelp").textContent = validityMessage;
  });

  
//   auto complete
{/* <html>
 <head>
 </head>
 <body>
   <label for="country">Enter a country name</label>:
	<input type="text" id="country">
	<div id="suggestions"></div>

 </body>
</html> */}
// Country list
const countryList = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Anguilla",
    "Antarctica",
    "Antigua-and-Barbuda",
    "Argentina",
    "Armenia",
    "Aruba",
    "Australia",
    "Autria",
    "Azerbaïjan"
  ];
  const countryElement = document.querySelector("input");
  const suggestionsElement = document.getElementById("suggestions");
  
  // Create and return a suggestion
  const createSuggestionElement = country => {
    const element = document.createElement("div");
    element.classList.add("suggestion");
    element.textContent = country;
    // Handle click on a suggestion
    element.addEventListener("click", e => {
      // Replace input with suggested country
      countryElement.value = e.target.textContent;
      // Empty the suggestion list
      suggestionsElement.innerHTML = "";
    });
    return element;
  };
  
  // Handle input change
  countryElement.addEventListener("input", () => {
    // Empty suggestion list
    suggestionsElement.innerHTML = "";
    countryList.forEach(country => {
      // Check if the inputted value matches the start of the country
      if (country.startsWith(countryElement.value)) {
        // Add the country as suggestion
        suggestionsElement.appendChild(createSuggestionElement(country));
      }
    });
  });

/* Add spacing between each country suggestion */
// .suggestion {
//     padding-left: 2px;
//     padding-right: 2px;
// }

// /* Change suggestion color when hovering it with the mouse */
// .suggestion:hover {
//     background-color: #adf;
//     cursor: pointer;
// }

// /* Position the suggestion list just below the input box */
// #suggestions {
//     position: absolute;
//     border: 1px solid black;
//     left: 155px;
// } 