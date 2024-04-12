import Reel from "./Reel.js";
import Symbol from "./Symbol.js";

export default class Slot {
  constructor(domElement, config = {}) {
    Symbol.preload();

    // Initialize current and next symbols
    this.currentSymbols = [
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
    ];

    this.nextSymbols = [
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
    ];

    // Store container element
    this.container = domElement;

    // Create reels and initialize with current symbols
    this.reels = Array.from(this.container.getElementsByClassName("reel")).map(
      (reelContainer, idx) =>
        new Reel(reelContainer, idx, this.currentSymbols[idx])
    );

    // Get spin button and set click event listener
    this.spinButton = document.getElementById("spin");
    this.spinButton.addEventListener("click", () => this.spin());

    // Get autoplay checkbox
    this.autoPlayCheckbox = document.getElementById("autoplay");

    // Apply inverted class if specified in config
    if (config.inverted) {
      this.container.classList.add("inverted");
    }

    // Store config
    this.config = config;
    // Initialize player's points
    this.points = 1000;

    // Disable spin button if points are zero or less
    if (this.points <= 0) {
      this.spinButton.disabled = true;
    }
  }

  spin() {
    // Check if player has enough points to spin
    if (this.points <= 0) {
      console.log("You don't have enough points to spin!");
      return;
    }

    // Update current symbols with next symbols
    this.currentSymbols = this.nextSymbols;
    // Generate new random symbols for next spin
    this.nextSymbols = [
      [Symbol.random(), Symbol.random(), Symbol.random()],
      [Symbol.random(), Symbol.random(), Symbol.random()],
      [Symbol.random(), Symbol.random(), Symbol.random()],
      [Symbol.random(), Symbol.random(), Symbol.random()],
      [Symbol.random(), Symbol.random(), Symbol.random()],
    ];

    // Trigger spin start event
    this.onSpinStart(this.nextSymbols);

    // Render symbols on each reel and trigger spin animation
    return Promise.all(
      this.reels.map((reel) => {
        reel.renderSymbols(this.nextSymbols[reel.idx]);
        return reel.spin();
      })
    ).then(() => this.onSpinEnd(this.nextSymbols));
  }

  onSpinStart(symbols) {
    // Disable spin button when spinning
    this.spinButton.disabled = true;

    // Trigger spin start event from config
    this.config.onSpinStart?.(symbols);
  }

  onSpinEnd(symbols) {
    // Enable spin button after spinning
    this.spinButton.disabled = false;

    // Calculate outcome based on symbols
    const outcome = this.calculateOutcome(symbols);

    // Update points based on outcome
    this.points += outcome.points;

    // Display points on the page
    document.getElementById("points").textContent = this.points;

    // Deduct points for spinning
    this.points -= 50; // Assuming a fixed deduction of 50 points per spin

    // Check if auto play is enabled and there are points left
    if (this.autoPlayCheckbox.checked && this.points > 0) {
      // Automatically trigger spin after a delay if auto play is enabled
      return window.setTimeout(() => this.spin(), 200);
    }

    // Disable spin button if points are zero or less
    if (this.points <= 0) {
      this.spinButton.disabled = true;
    }
  }

  calculateOutcome(symbols) {
    let payout = 0; // Initialize the payout

    // Check for three consecutive symbols matching across reels
    for (let i = 0; i < symbols[0].length; i++) {
      if (symbols[0][i] === symbols[1][i] && symbols[1][i] === symbols[2][i]) {
        // Three consecutive symbols match across reels
        // Determine the payout based on the symbol
        switch (symbols[0][i]) {
          case "c3po":
            payout += 5000; // Payout for symbol "c3po"
            break;
          case "at_at":
            payout += 200; // Payout for symbol "at_at"
            break;
          case "darth_vader":
            payout += 300; // Payout for symbol "darth_vader"
            break;
          case "death_star":
            payout += 500; // Payout for symbol "death_star"
            break;
          case "falcon":
            payout += 300; // Payout for symbol "falcon"
            break;
          case "r2d2":
            payout += 500; // Payout for symbol "r2d2"
            break;
          case "stormtrooper":
            payout += 300; // Payout for symbol "stormtrooper"
            break;
          case "yoda":
            payout += 10000; // Payout for symbol "yoda"
            break;
          // Add more cases for other symbols as needed
          default:
            break;
        }
      }
    }

    // Return the payout
    return { points: payout };
  }
}
