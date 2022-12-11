/**
 * TODO: MAKE IT WWORK RIGHT
 */
"use strict";

/*
   New Perspectives on HTML5, CSS3, and JavaScript 6th Edition
   Tutorial 14
   Case Problem 4
   
   Filename: kg_stamps.js
   Author: Hesbon Osoro
   Date: 12/11/22  
   

*/

// Custom game object
function game() {
  this.stamps = [];
  this.currentTool = "brush";
  this.currentShape = "square";
  this.currentSize = 5;
  this.currentShade = 1.0;
}

// stamp Object Prototype
function stamp(shape, size, shade) {
  this.shape = shape;
  this.size = size;
  this.shade = shade;
}

// Method to add a stamp to the game object's stamps array
stamp.prototype.addToGame = function (game) {
  game.stamps.push(this);
};

// Method to remove all stamps from the game object's stamps array
game.prototype.removeStamps = function () {
  this.stamps = [];
};

// Create a new game object
var game1 = new game();

// Add a click event handler to the addStamp button
window.addEventListener("load", function () {});

/*---- Added Methods ---*/

// Method to return the x-coordinate of a mouse click within an element
Event.prototype.elementX = function () {
  var rectObject = this.target.getBoundingClientRect();
  return this.clientX - rectObject.left;
};

// Method to return the y-coordinate of a mouse click within an element
Event.prototype.elementY = function () {
  var rectObject = this.target.getBoundingClientRect();
  return this.clientY - rectObject.top;
};

/* Method added to any DOM element that removes all child nodes of element */
HTMLElement.prototype.removeChildren = function () {
  while (this.firstChild) {
    this.removeChild(this.firstChild);
  }
};
