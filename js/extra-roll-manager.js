export class ExtraRollManager {
  constructor({ listElement, addButton, parser }) {
    this.listElement = listElement;
    this.addButton = addButton;
    this.parser = parser;
  }

  bind() {
    this.addButton.addEventListener("click", () => {
      this.addRow();
    });
  }

  addRow(values = {}) {
    const row = document.createElement("div");
    row.className = "extra-row";

    const name = values.name || "";
    const count = values.count ?? 1;
    const sides = values.sides ?? 6;
    const modifier = values.modifier ?? 0;
    const mode = values.mode || "normal";
    const operation = values.operation || "add";

    row.innerHTML = `
      <label class="field">
        <span>Name</span>
        <input name="extraName" type="text" value="${name}" placeholder="Bardic Inspiration" />
      </label>
      <div class="mini-dice-inputs">
        <label class="field">
          <span>Dice</span>
          <input name="extraCount" type="number" value="${count}" min="1" max="999" />
        </label>
        <div class="mini-separator" aria-hidden="true">d</div>
        <label class="field">
          <span>Sides</span>
          <input name="extraSides" type="number" value="${sides}" min="2" max="999" />
        </label>
        <div class="mini-separator" aria-hidden="true">+</div>
        <label class="field">
          <span>Modifier</span>
          <input name="extraModifier" type="number" value="${modifier}" min="-999" max="999" />
        </label>
      </div>
      <label class="field">
        <span>Mode</span>
        <select name="extraMode">
          <option value="normal"${mode === "normal" ? " selected" : ""}>Normal</option>
          <option value="advantage"${mode === "advantage" ? " selected" : ""}>Advantage</option>
          <option value="disadvantage"${mode === "disadvantage" ? " selected" : ""}>Disadvantage</option>
        </select>
      </label>
      <label class="field">
        <span>Effect</span>
        <select name="extraOperation">
          <option value="add"${operation === "add" ? " selected" : ""}>Positive</option>
          <option value="subtract"${operation === "subtract" ? " selected" : ""}>Negative</option>
        </select>
      </label>
      <button type="button" class="remove-extra">Remove</button>
    `;

    row.querySelector(".remove-extra").addEventListener("click", () => {
      row.remove();
    });

    this.listElement.appendChild(row);
  }

  getConfigs() {
    return Array.from(this.listElement.querySelectorAll(".extra-row")).map((row) => {
      const parsed = this.parser.parse(
        row.querySelector('[name="extraCount"]').value,
        row.querySelector('[name="extraSides"]').value,
        row.querySelector('[name="extraModifier"]').value
      );

      return {
        ...parsed,
        name: row.querySelector('[name="extraName"]').value.trim() || "Extra",
        mode: row.querySelector('[name="extraMode"]').value,
        operation: row.querySelector('[name="extraOperation"]').value,
      };
    });
  }
}
