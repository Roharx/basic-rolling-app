import { DiceEngine, DiceParser } from "./js/dice.js";
import { ExtraRollManager } from "./js/extra-roll-manager.js";
import { ResultsRenderer } from "./js/results-renderer.js";

class RollerApp {
  constructor() {
    this.form = document.querySelector("#roller-form");
    this.diceCountInput = document.querySelector("#dice-count");
    this.diceSidesInput = document.querySelector("#dice-sides");
    this.modifierInput = document.querySelector("#modifier");
    this.mainModeInput = document.querySelector("#main-mode");
    this.difficultyInput = document.querySelector("#difficulty");
    this.errorBox = document.querySelector("#error");

    this.diceParser = new DiceParser();
    this.diceEngine = new DiceEngine();
    this.extraRollManager = new ExtraRollManager({
      listElement: document.querySelector("#extras-list"),
      addButton: document.querySelector("#add-extra"),
      parser: this.diceParser,
    });
    this.resultsRenderer = new ResultsRenderer({
      summaryElement: document.querySelector("#summary"),
      successBody: document.querySelector("#success-results-body"),
      failBody: document.querySelector("#fail-results-body"),
    });
  }

  start() {
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.rollAndRender();
    });

    this.extraRollManager.bind();
    this.rollAndRender();
  }

  buildMainConfig() {
    const parsed = this.diceParser.parse(
      this.diceCountInput.value,
      this.diceSidesInput.value,
      this.modifierInput.value
    );

    return {
      ...parsed,
      mode: this.mainModeInput.value,
    };
  }

  getDifficulty() {
    const difficulty = Number(this.difficultyInput.value);

    if (Number.isNaN(difficulty)) {
      throw new Error("Difficulty must be a number.");
    }

    return difficulty;
  }

  rollAndRender() {
    this.errorBox.textContent = "";

    try {
      const result = this.diceEngine.rollChecks({
        mainConfig: this.buildMainConfig(),
        extraConfigs: this.extraRollManager.getConfigs(),
        difficulty: this.getDifficulty(),
      });

      this.resultsRenderer.render(result);
    } catch (error) {
      this.resultsRenderer.clear();
      this.errorBox.textContent = error.message;
    }
  }
}

new RollerApp().start();
