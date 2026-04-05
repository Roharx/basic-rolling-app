export class ResultsRenderer {
  constructor({ summaryElement, successBody, failBody }) {
    this.summaryElement = summaryElement;
    this.successBody = successBody;
    this.failBody = failBody;
  }

  render({ rolls, notation, difficulty }) {
    this.clearTables();

    const successes = rolls.filter((roll) => roll.passed);
    const fails = rolls.filter((roll) => !roll.passed);
    const critSuccesses = rolls.filter((roll) => roll.critical === "success").length;
    const critFails = rolls.filter((roll) => roll.critical === "fail").length;

    successes.forEach((roll, index) => {
      this.successBody.appendChild(this.renderRollRow(roll, index));
    });

    fails.forEach((roll, index) => {
      this.failBody.appendChild(this.renderRollRow(roll, index));
    });

    if (successes.length === 0) {
      this.successBody.appendChild(this.renderEmptyRow("No successful checks."));
    }

    if (fails.length === 0) {
      this.failBody.appendChild(this.renderEmptyRow("No failed checks."));
    }

    this.summaryElement.innerHTML = `
      <strong>${notation}</strong> against difficulty <strong>${difficulty}</strong><br />
      ${successes.length} passed, ${fails.length} failed, ${critSuccesses} critical success, ${critFails} critical fail.
    `;
  }

  clear() {
    this.summaryElement.innerHTML = "";
    this.clearTables();
  }

  clearTables() {
    this.successBody.innerHTML = "";
    this.failBody.innerHTML = "";
  }

  renderRollRow(roll, index) {
    const row = document.createElement("tr");

    if (roll.critical === "success") {
      row.classList.add("crit-success-row");
    }

    if (roll.critical === "fail") {
      row.classList.add("crit-fail-row");
    }

    row.appendChild(this.createCell(String(index + 1), "check-col"));
    row.appendChild(this.createCell(this.formatExpressionDetails(roll.main), "details-col"));
    row.appendChild(this.renderExtrasCell(roll.extras));
    row.appendChild(this.createCell(`${roll.total} vs ${roll.difficulty}`, "total-col"));

    return row;
  }

  renderExtrasCell(extras) {
    const cell = document.createElement("td");
    cell.className = "details-col";

    if (extras.length === 0) {
      cell.textContent = "None";
      return cell;
    }

    const list = document.createElement("div");
    list.className = "table-stack";

    extras.forEach((extra) => {
      const line = document.createElement("div");
      line.textContent = this.formatExpressionDetails(extra);
      list.appendChild(line);
    });

    cell.appendChild(list);
    return cell;
  }

  renderEmptyRow(text) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 4;
    cell.className = "empty-cell";
    cell.textContent = text;
    row.appendChild(cell);

    return row;
  }

  createCell(content, className = "") {
    const cell = document.createElement("td");

    if (className) {
      cell.className = className;
    }

    cell.textContent = content;
    return cell;
  }

  formatExpressionDetails(expression) {
    const rollText =
      expression.mode === "normal"
        ? this.formatAttempt(expression, 0)
        : `attempt 1: ${this.formatAttempt(expression, 0)}; attempt 2: ${this.formatAttempt(expression, 1)}; selected total: ${expression.total}`;

    return `${this.buildRollLabel(expression)}. ${rollText}`;
  }

  formatAttempt(expression, index) {
    const rolls = expression.attempts[index].join(", ");
    const modifierText =
      expression.modifier === 0
        ? ""
        : `${expression.modifier > 0 ? "+" : ""}${expression.modifier}`;
    const rawTotal = expression.attempts[index].reduce((sum, value) => sum + value, 0);
    const totalText =
      expression.modifier === 0
        ? `${expression.attemptTotals[index]}`
        : `${rawTotal}${modifierText}=${expression.attemptTotals[index]}`;

    return `rolls: ${rolls}; total: ${totalText}`;
  }

  buildRollLabel({ name, notation, mode, operation }) {
    const effectPrefix =
      name && typeof operation === "string"
        ? operation === "subtract"
          ? "-"
          : "+"
        : "";

    return name
      ? `${effectPrefix}${name}: ${notation} (${mode})`
      : `${notation} (${mode})`;
  }
}
