export class DiceParser {
  parse(countValue, sidesValue, modifierValue) {
    const count = Number(countValue);
    const sides = Number(sidesValue);
    const modifier = Number(modifierValue);

    if (!Number.isInteger(count) || count < 1) {
      throw new Error("You need at least one die.");
    }

    if (!Number.isInteger(sides) || sides < 2) {
      throw new Error("Dice need at least two sides.");
    }

    if (!Number.isInteger(modifier)) {
      throw new Error("Modifier must be a whole number.");
    }

    return {
      count,
      sides,
      modifier,
      notation: this.formatNotation({ count, sides, modifier }),
    };
  }

  formatNotation({ count, sides, modifier }) {
    if (modifier === 0) {
      return `${count}d${sides}+0`;
    }

    return `${count}d${sides}${modifier > 0 ? "+" : ""}${modifier}`;
  }
}

export class DiceEngine {
  rollChecks({ mainConfig, extraConfigs, difficulty }) {
    const rolls = Array.from({ length: mainConfig.count }, () =>
      this.rollCheck({
        mainConfig: {
          name: "Main",
          count: 1,
          sides: mainConfig.sides,
          modifier: mainConfig.modifier,
          mode: mainConfig.mode,
        },
        extraConfigs,
        difficulty,
        criticalSides: mainConfig.sides,
      })
    );

    return {
      notation: mainConfig.notation,
      difficulty,
      rolls,
    };
  }

  rollCheck({ mainConfig, extraConfigs, difficulty, criticalSides }) {
    const main = this.rollExpression(mainConfig);
    const extras = extraConfigs.map((config) => this.rollExpression(config));
    const total = main.total + extras.reduce(
      (sum, extra) => sum + this.getExtraContribution(extra),
      0
    );
    const raw = main.rawRolls[0];
    const critical =
      raw === 1 ? "fail" : raw === criticalSides ? "success" : null;
    const passed =
      critical === "success"
        ? true
        : critical === "fail"
          ? false
          : total >= difficulty;

    return {
      raw,
      total,
      main,
      extras,
      difficulty,
      critical,
      passed,
    };
  }

  getExtraContribution(extra) {
    return extra.operation === "subtract" ? -extra.total : extra.total;
  }

  rollExpression(config) {
    const attempts = config.mode === "normal" ? 1 : 2;
    const results = Array.from({ length: attempts }, () =>
      Array.from({ length: config.count }, () => this.rollDie(config.sides))
    );
    const totals = results.map(
      (set) => set.reduce((sum, value) => sum + value, 0) + config.modifier
    );
    const selectedIndex = this.selectAttemptIndex(config.mode, totals);

    return {
      ...config,
      notation: this.formatNotation(config),
      rawRolls: results[selectedIndex],
      total: totals[selectedIndex],
      attempts: results,
      attemptTotals: totals,
      selectedIndex,
    };
  }

  selectAttemptIndex(mode, totals) {
    if (mode === "advantage") {
      return totals[1] > totals[0] ? 1 : 0;
    }

    if (mode === "disadvantage") {
      return totals[1] < totals[0] ? 1 : 0;
    }

    return 0;
  }

  formatNotation({ count, sides, modifier }) {
    if (modifier === 0) {
      return `${count}d${sides}`;
    }

    return `${count}d${sides}${modifier > 0 ? "+" : ""}${modifier}`;
  }

  rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
  }
}
