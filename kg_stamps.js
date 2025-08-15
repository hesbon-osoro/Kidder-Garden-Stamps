"use strict";
/*
   New Perspectives on HTML5, CSS3, and JavaScript 6th Edition
   Tutorial 14
   Case Problem 4
   
   Filename: kg_stamps.js

   Kidder Garden Stamps Game – functional implementation
   
   Author: Hesbon Osoro
   Notes:
    - Fulfills required object models & prototype methods
    - Adds light UI feedback for selected shape/size/shade/tool
    - Click a tool, then click a stamp on the canvas to apply it
*/

/*****************
 * Game Object   *
 *****************/
function game() {
  this.stamps = []; // array of Stamp objects
  this.currentTool = "addStamp"; // selected tool id
  this.currentShapeId = "stamp0"; // id of selected shape control
  this.currentSize = 80; // pixels (default medium)
  this.currentShade = 1.0; // opacity 0..1
}

/*****************
 * Stamp Object  *
 *****************/
function stamp(opts) {
  this.id = opts.id; // numeric id
  this.shapeId = opts.shapeId; // e.g., "stamp3"
  this.src = opts.src; // image src
  this.size = opts.size; // px (width/height)
  this.shade = opts.shade; // opacity
  this.x = opts.x; // left (px)
  this.y = opts.y; // top (px)
  this.rotation = opts.rotation || 0; // deg
  this.el = opts.el || null; // DOM element reference
}

// addToGame(): add this stamp to the game's stamps array
stamp.prototype.addToGame = function (g) {
  g.stamps.push(this);
};

/*************************
 * Game Prototype Method *
 *************************/
// removeStamps(): empty out game.stamps and clear canvas
game.prototype.removeStamps = function () {
  this.stamps.length = 0;
  const canvas = document.getElementById("canvas");
  if (canvas) canvas.removeChildren();
};

/***********************
 * Utility Enhancements *
 ***********************/
// Provided helper methods
Event.prototype.elementX = function () {
  const rect = this.currentTarget.getBoundingClientRect();
  return this.clientX - rect.left;
};
Event.prototype.elementY = function () {
  const rect = this.currentTarget.getBoundingClientRect();
  return this.clientY - rect.top;
};
HTMLElement.prototype.removeChildren = function () {
  while (this.firstChild) this.removeChild(this.firstChild);
};

/*****************
 * Main Runtime  *
 *****************/
const KG = new game();
let _uid = 0; // incremental id for stamps

window.addEventListener("load", init);

function init() {
  wireShapeControls();
  wireSizeControls();
  wireShadeControls();
  wireToolButtons();
  wireCanvas();
  wireGarbage();
  injectStatusBar();
  updateUIState();
}

/*****************
 * UI Wiring     *
 *****************/
function wireShapeControls() {
  const shapeImgs = document.querySelectorAll("#shapes .controlShape");
  shapeImgs.forEach((img) => {
    img.addEventListener("click", () => {
      KG.currentShapeId = img.id;
      setActive(shapeImgs, img);
      updateUIState();
    });
  });
  // default select
  const def = document.getElementById(KG.currentShapeId);
  if (def) def.classList.add("active");
}

function wireSizeControls() {
  const sizeMap = {
    size0: 40, // small
    size1: 80, // medium
    size2: 120, // large
  };
  const sizeDivs = document.querySelectorAll("#sizes .controlSize");
  sizeDivs.forEach((div) => {
    div.addEventListener("click", () => {
      KG.currentSize = sizeMap[div.id] || 80;
      setActive(sizeDivs, div);
      updateUIState();
    });
  });
  // default
  const def = document.getElementById("size1");
  if (def) def.classList.add("active");
}

function wireShadeControls() {
  const shadeTds = document.querySelectorAll("#shades .controlShade");
  shadeTds.forEach((td) => {
    td.addEventListener("click", () => {
      const pct = parseInt(td.id.replace("shade", ""), 10);
      KG.currentShade = Math.max(0.1, Math.min(1, pct / 100));
      setActive(shadeTds, td);
      updateUIState();
    });
  });
  // default select 100%
  const def = document.getElementById("shade100");
  if (def) def.classList.add("active");
}

function wireToolButtons() {
  const toolBtns = document.querySelectorAll("#tools .toolButtons");
  toolBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      KG.currentTool = btn.id; // e.g., "addStamp", "removeStamp"...
      setActive(toolBtns, btn);
      updateUIState();
    });
  });
  // default tool
  const def = document.getElementById("addStamp");
  if (def) def.classList.add("active");
}

function wireCanvas() {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;

  // Place new stamp on empty canvas click when tool is addStamp
  canvas.addEventListener("click", (evt) => {
    // If clicked directly on canvas background
    if (evt.target === canvas && KG.currentTool === "addStamp") {
      const x = evt.elementX();
      const y = evt.elementY();
      createStampAt({ x, y });
    }
  });

  // Delegate clicks to stamp images for tool actions
  canvas.addEventListener("click", (evt) => {
    const el = evt.target;
    if (
      !(el instanceof HTMLImageElement) ||
      !el.classList.contains("stampImage")
    )
      return;

    const s = getStampByEl(el);
    if (!s) return;

    switch (KG.currentTool) {
      case "removeStamp":
        removeStamp(s);
        break;
      case "enlargeStamp":
        resizeStamp(s, +15);
        break;
      case "shrinkStamp":
        resizeStamp(s, -15);
        break;
      case "moveLeft":
        moveStamp(s, -10, 0);
        break;
      case "moveRight":
        moveStamp(s, +10, 0);
        break;
      case "moveUp":
        moveStamp(s, 0, -10);
        break;
      case "moveDown":
        moveStamp(s, 0, +10);
        break;
      case "rotateRight":
        rotateStamp(s, +15);
        break;
      case "rotateLeft":
        rotateStamp(s, -15);
        break;
      case "lighten":
        shadeStamp(s, -0.1);
        break;
      case "darken":
        shadeStamp(s, +0.1);
        break;
      case "addStamp":
        // If user clicks an existing stamp while add tool is active,
        // create a new stamp slightly offset so it’s visible
        const rect = el.getBoundingClientRect();
        createStampAt({
          x: rect.width / 2 + 10 + parseFloat(el.style.left || 0),
          y: rect.height / 2 + 10 + parseFloat(el.style.top || 0),
        });
        break;
      default:
        break;
    }
  });
}

function wireGarbage() {
  const garbage = document.getElementById("garbage");
  garbage?.addEventListener("click", () => {
    KG.removeStamps();
    updateUIState();
  });
}

/*****************
 * Actions       *
 *****************/
function createStampAt({ x, y }) {
  const shapeEl = document.getElementById(KG.currentShapeId);
  if (!shapeEl) return;

  const size = KG.currentSize;
  const shade = KG.currentShade;

  // Center the stamp on click
  const left = x - size / 2;
  const top = y - size / 2;

  const img = document.createElement("img");
  img.src = shapeEl.getAttribute("src");
  img.alt = "stamp";
  img.className = "stampImage";
  img.style.position = "absolute";
  img.style.left = `${left}px`;
  img.style.top = `${top}px`;
  img.style.width = `${size}px`;
  img.style.height = `${size}px`;
  img.style.opacity = `${shade}`;
  img.style.transform = `rotate(0deg)`;
  img.dataset.rotation = "0";
  img.dataset.uid = String(++_uid);

  const canvas = document.getElementById("canvas");
  canvas.appendChild(img);

  const s = new stamp({
    id: _uid,
    shapeId: KG.currentShapeId,
    src: img.src,
    size,
    shade,
    x: left,
    y: top,
    rotation: 0,
    el: img,
  });
  s.addToGame(KG);
  updateUIState();
}

function getStampByEl(el) {
  const uid = parseInt(el.dataset.uid || "0", 10);
  return KG.stamps.find((s) => s.id === uid);
}

function removeStamp(s) {
  if (s?.el?.parentNode) s.el.parentNode.removeChild(s.el);
  // remove from array
  const i = KG.stamps.findIndex((x) => x.id === s.id);
  if (i > -1) KG.stamps.splice(i, 1);
  updateUIState();
}

function resizeStamp(s, delta) {
  const newSize = Math.max(20, Math.min(300, s.size + delta));
  s.size = newSize;
  s.el.style.width = `${newSize}px`;
  s.el.style.height = `${newSize}px`;
  updateUIState();
}

function moveStamp(s, dx, dy) {
  s.x = (parseFloat(s.el.style.left) || 0) + dx;
  s.y = (parseFloat(s.el.style.top) || 0) + dy;
  s.el.style.left = `${s.x}px`;
  s.el.style.top = `${s.y}px`;
}

function rotateStamp(s, ddeg) {
  s.rotation = (parseFloat(s.el.dataset.rotation) || 0) + ddeg;
  s.el.dataset.rotation = String(s.rotation);
  s.el.style.transform = `rotate(${s.rotation}deg)`;
}

function shadeStamp(s, dop) {
  s.shade = Math.max(
    0.1,
    Math.min(1, (parseFloat(s.el.style.opacity) || 1) + dop)
  );
  s.el.style.opacity = `${s.shade}`;
  updateUIState();
}

/*****************
 * UI Feedback   *
 *****************/
function setActive(nodeList, activeEl) {
  nodeList.forEach((n) => n.classList.remove("active"));
  activeEl.classList.add("active");
}

function injectStatusBar() {
  // Adds a small status line under the tool buttons without changing the HTML file
  const tools = document.getElementById("tools");
  if (!tools) return;
  const status = document.createElement("div");
  status.id = "kg_status";
  status.style.marginTop = "8px";
  status.style.fontSize = "0.9rem";
  status.style.fontFamily =
    "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  tools.appendChild(status);
}

function updateUIState() {
  const status = document.getElementById("kg_status");
  if (!status) return;
  const shapeLabel = KG.currentShapeId;
  status.textContent = `Tool: ${
    KG.currentTool
  }  |  Shape: ${shapeLabel}  |  Size: ${
    KG.currentSize
  }px  |  Opacity: ${KG.currentShade.toFixed(2)}  |  Stamps: ${
    KG.stamps.length
  }`;
}

/*****************
 * Minimal Styles *
 *****************/
// Graceful highlighting via JS-injected CSS so no CSS file changes required
(function injectHighlightCSS() {
  const css = `
    .active { outline: 3px solid #2b8a3e; outline-offset: 2px; }
    #canvas { position: relative; min-height: 420px; background: #fff; overflow: hidden; }
    #tools { user-select: none; }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
})();
