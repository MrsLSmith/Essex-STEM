import {default as R} from "ramda";
var box = document.getElementById("load");
var greetings = ["Hello", "Bonjour", "Konichiwa", "Guten Tag", "Howdy", "Buenos Dias"]

function greet(name, greeting) {
  return `${greeting} ${name}`;
}

var greetJohn = R.curry(greet)("John");

box.appendChild(greetings.reduce((container, greeting) => {
  container.innerHTML += (`<div>${greetJohn(greeting)}</div>`);
  return container;

}, document.createElement("div")));
