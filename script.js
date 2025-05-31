const COLORS = ["red", "green", "blue", "yellow", "black", "white"];
const COLOR_CLASSES = COLORS.map(c => "color-" + c);

const tilesDiv = document.getElementById("tiles");
const stakeForm = document.getElementById("stakeForm");
const resultDiv = document.getElementById("result");
const playAgainBtn = document.getElementById("playAgainBtn");
const resetBtn = document.getElementById("resetBtn");
const balanceSpan = document.getElementById("balance");
const gameOverDiv = document.getElementById("gameOver");

// Persistent state
let balance = 500;

// Draw tiles with optional colors (if not provided, always grey)
function drawTiles(colors = null) {
  tilesDiv.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.textContent = i + 1;
    // Always start grey unless colors are provided after animation
    if (!colors) {
      COLOR_CLASSES.forEach(cls => tile.classList.remove(cls));
    } else if (colors[i]) {
      tile.classList.add("color-" + colors[i]);
    }
    tilesDiv.appendChild(tile);
  }
}

function updateBalance() {
  balanceSpan.textContent = balance;
}

function validateAmount(val) {
  return /^[1-9][0-9]*$/.test(val) && Number(val) % 10 === 0;
}

function showResult(message, win) {
  resultDiv.textContent = message;
  resultDiv.className = "result " + (win ? "win" : "lose");
}

function animateTiles(colors, cb) {
  // Animate each tile one after another: grey -> flip -> color
  let i = 0;
  function animateNext() {
    if (i >= 6) {
      if (cb) cb();
      return;
    }
    const tile = tilesDiv.children[i];
    // Remove color if any, back to grey before animation
    COLOR_CLASSES.forEach(cls => tile.classList.remove(cls));
    tile.classList.remove("animated");
    // Animate flip (add .animated, wait, then apply color)
    tile.classList.add("animated");
    setTimeout(() => {
      tile.classList.remove("animated");
      // On the "back" of the flip, set the color
      tile.classList.add("color-" + colors[i]);
      i++;
      animateNext();
    }, 300);
  }
  animateNext();
}

function setFormEnabled(enabled) {
  stakeForm.querySelectorAll("input,button").forEach(el => el.disabled = !enabled);
}

function showGameOver() {
  gameOverDiv.style.display = "flex";
  resultDiv.textContent = "";
  playAgainBtn.style.display = "none";
  resetBtn.style.display = "inline-block";
  setFormEnabled(false);
}

function hideGameOver() {
  gameOverDiv.style.display = "none";
}

// Helper: shuffle array in-place
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

stakeForm.onsubmit = function (e) {
  e.preventDefault();

  // Get input values
  const color = stakeForm.color.value;
  const tileChoice = Number(stakeForm.tileChoice.value);
  const amount = parseInt(stakeForm.amount.value, 10);

  // Input validation
  if (!COLORS.includes(color)) {
    alert("Choose a color.");
    return;
  }
  if (tileChoice < 1 || tileChoice > 6) {
    alert("Choose a tile number between 1 and 6.");
    return;
  }
  if (!validateAmount(amount)) {
    alert("Amount must be a positive integer and a multiple of 10.");
    return;
  }
  if (amount > balance) {
    alert("You don't have enough balance for this stake.");
    return;
  }

  setFormEnabled(false);

  // Generate a random permutation of COLORS for tiles (unique color per tile)
  const shuffledColors = shuffleArray([...COLORS]);

  // Animate the tiles: always start with grey, then flip one by one to color
  animateTiles(shuffledColors, () => {
    const win = shuffledColors[tileChoice - 1] === color;
    if (win) {
      balance += amount;
      updateBalance();
      showResult("You've won!", true);
      playAgainBtn.style.display = "inline-block";
      resetBtn.style.display = "inline-block";
      animateResult();
      setTimeout(() => {
        if (balance <= 0) showGameOver();
      }, 500);
    } else {
      balance -= amount;
      updateBalance();
      showResult("You've lost!", false);
      playAgainBtn.style.display = "inline-block";
      resetBtn.style.display = "inline-block";
      if (balance <= 0) {
        setTimeout(showGameOver, 650);
      }
    }
  });
};

function animateResult() {
  // Animate the result text with a color pop
  resultDiv.style.transform = "scale(1.15)";
  setTimeout(() => {
    resultDiv.style.transform = "scale(1)";
  }, 400);
}

playAgainBtn.onclick = function () {
  drawTiles(); // reset to all grey at new round
  stakeForm.reset();
  resultDiv.textContent = "";
  resultDiv.className = "result";
  playAgainBtn.style.display = "none";
  resetBtn.style.display = "none";
  setFormEnabled(true);
};

resetBtn.onclick = function () {
  balance = 500;
  updateBalance();
  drawTiles();
  stakeForm.reset();
  resultDiv.textContent = "";
  resultDiv.className = "result";
  playAgainBtn.style.display = "none";
  resetBtn.style.display = "none";
  hideGameOver();
  setFormEnabled(true);
};

function initGame() {
  balance = 500;
  updateBalance();
  drawTiles();
  stakeForm.reset();
  resultDiv.textContent = "";
  resultDiv.className = "result";
  playAgainBtn.style.display = "none";
  resetBtn.style.display = "none";
  hideGameOver();
  setFormEnabled(true);
}

initGame();