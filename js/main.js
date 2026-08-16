// Miqyas — shared interaction logic. No frameworks, no build step.

(function () {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
})();

// ---------- madhhab selector (index.html) ----------
(function () {
  const grid = document.getElementById("schoolGrid");
  const continueBtn = document.getElementById("continueBtn");
  if (!grid || !continueBtn) return;

  const cards = Array.from(grid.querySelectorAll(".school-card"));
  let selected = sessionStorage.getItem("miqyas_madhhab") || null;

  function paint() {
    cards.forEach((c) => {
      const isSel = c.dataset.school === selected;
      c.classList.toggle("selected", isSel);
      c.setAttribute("aria-checked", isSel ? "true" : "false");
    });
    continueBtn.disabled = !selected;
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      selected = card.dataset.school;
      sessionStorage.setItem("miqyas_madhhab", selected);
      paint();
    });
  });

  continueBtn.addEventListener("click", () => {
    if (!selected) return;
    window.location.href = "calculator.html";
  });

  paint();
})();

// ---------- calculator (calculator.html) ----------
(function () {
  const stepper = document.getElementById("stepper");
  if (!stepper) return; // not on the calculator page

  const MADHHAB = sessionStorage.getItem("miqyas_madhhab");
  const MADHHAB_LABEL = {
    hanafi: "Hanafi", maliki: "Maliki", shafii: "Shafi\u2019i", hanbali: "Hanbali",
  };

  const badge = document.getElementById("activeMadhhab");
  if (!MADHHAB) {
    // No school locked in — send back to the selector rather than guess.
    window.location.href = "index.html";
    return;
  }
  if (badge) badge.textContent = MADHHAB_LABEL[MADHHAB] || MADHHAB;

  const steps = Array.from(document.querySelectorAll(".form-step"));
  const dots = Array.from(document.querySelectorAll(".step-dot"));
  let current = 0;

  function render() {
    steps.forEach((s, i) => s.classList.toggle("active", i === current));
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === current);
      d.classList.toggle("done", i < current);
    });
    document.getElementById("prevBtn").style.visibility = current === 0 ? "hidden" : "visible";
    const nextBtn = document.getElementById("nextBtn");
    nextBtn.textContent = current === steps.length - 1 ? "See results" : "Next";
  }

  document.getElementById("prevBtn").addEventListener("click", () => {
    if (current > 0) { current--; render(); }
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (current < steps.length - 1) {
      current++;
      render();
    } else {
      calculate();
    }
  });
  dots.forEach((d, i) => d.addEventListener("click", () => { current = i; render(); }));

  const editBtn = document.getElementById("editAnswersBtn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      document.getElementById("resultsPanel").style.display = "none";
      document.getElementById("formPanel").style.display = "block";
    });
  }

  // ---------- data reads ----------
  function num(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const v = parseFloat(el.value);
    return isNaN(v) ? 0 : v;
  }
  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  // ============================================================
  // Income-by-category table (Step 1)
  // ============================================================
  const incomeTable = document.getElementById("incomeTable");
  let rowCounter = 0;

  function addIncomeRow(data) {
    data = data || {};
    rowCounter++;
    const id = "row" + rowCounter;
    const row = document.createElement("div");
    row.className = "income-row";
    row.dataset.rowId = id;
    row.innerHTML = `
      <div>
        <label for="${id}-cat">Category</label>
        <input type="text" id="${id}-cat" class="row-category" placeholder="e.g. Salary" value="${escapeAttr(data.category || "")}">
      </div>
      <div>
        <label for="${id}-cls">Classification</label>
        <select id="${id}-cls" class="row-class">
          <option value="">— Select —</option>
          <option value="halal">Halal</option>
          <option value="haram">Haram</option>
          <option value="mixed">Mixed</option>
          <option value="tentative">Tentative</option>
          <option value="missing">Missing information</option>
        </select>
      </div>
      <div>
        <label for="${id}-amt">Amount (CAD)</label>
        <input type="number" id="${id}-amt" class="row-amount" min="0" step="0.01" placeholder="0.00" value="${data.amount != null ? data.amount : ""}">
      </div>
      <div class="halal-portion-field">
        <label for="${id}-hp">Halal portion</label>
        <input type="number" id="${id}-hp" class="row-halal-portion" min="0" step="0.01" placeholder="0.00" value="${data.halal_portion != null ? data.halal_portion : ""}">
      </div>
      <button type="button" class="row-remove" aria-label="Remove row">&times;</button>
      <p class="row-status"></p>
    `;
    incomeTable.appendChild(row);

    const clsSelect = row.querySelector(".row-class");
    if (data.classification && ["halal","haram","mixed","tentative","missing"].includes(data.classification)) {
      clsSelect.value = data.classification;
    }
    updateRowState(row);

    clsSelect.addEventListener("change", () => updateRowState(row));
    row.querySelector(".row-remove").addEventListener("click", () => row.remove());
    return row;
  }

  function updateRowState(row) {
    const cls = row.querySelector(".row-class").value;
    row.classList.toggle("is-mixed", cls === "mixed");
    const status = row.querySelector(".row-status");
    const flagged = cls === "" || cls === "missing" || cls === "tentative";
    row.classList.toggle("flagged", flagged);
    if (cls === "") {
      status.textContent = "No classification selected — excluded from zakat until resolved.";
    } else if (cls === "missing") {
      status.textContent = "Marked missing information — excluded from zakat until you can classify it.";
    } else if (cls === "tentative") {
      status.textContent = "Marked tentative — Scholar Review Required, excluded from zakat for now.";
    } else {
      status.textContent = "";
    }
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function readIncomeRows() {
    return Array.from(incomeTable.querySelectorAll(".income-row")).map((row) => {
      const category = row.querySelector(".row-category").value.trim();
      const classification = row.querySelector(".row-class").value;
      const amount = parseFloat(row.querySelector(".row-amount").value);
      const halalPortionEl = row.querySelector(".row-halal-portion");
      const halalPortion = parseFloat(halalPortionEl.value);
      return {
        category: category || "(untitled category)",
        classification,
        amount: isNaN(amount) ? 0 : amount,
        halal_portion: isNaN(halalPortion) ? 0 : halalPortion,
      };
    });
  }

  if (incomeTable) {
    const defaults = [
      { category: "Salary / wages" },
      { category: "Business income" },
      { category: "Investment returns" },
      { category: "Gifts / inheritance" },
      { category: "Rental income" },
    ];
    defaults.forEach(addIncomeRow);

    document.getElementById("addRowBtn").addEventListener("click", () => addIncomeRow());

    // ---- CSV template download ----
    const templateLink = document.getElementById("csvTemplateLink");
    if (templateLink) {
      const csvTemplate = "category,classification,amount,halal_portion\n" +
        "Salary,halal,4200,\n" +
        "Freelance design work,mixed,1500,900\n" +
        "Inheritance received,tentative,3000,\n" +
        "Gift from relative,missing,,\n" +
        "Investment dividends,halal,220,\n";
      templateLink.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvTemplate);
    }

    // ---- CSV upload ----
    const csvFile = document.getElementById("csvFile");
    const csvStatus = document.getElementById("csvStatus");
    csvFile.addEventListener("change", () => {
      const file = csvFile.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const rows = parseCsv(String(reader.result));
          if (!rows.length) {
            csvStatus.textContent = "No rows found in that file.";
            csvStatus.className = "csv-status err";
            return;
          }
          incomeTable.innerHTML = "";
          rows.forEach(addIncomeRow);
          csvStatus.textContent = `Loaded ${rows.length} row${rows.length === 1 ? "" : "s"} from ${file.name}.`;
          csvStatus.className = "csv-status";
        } catch (e) {
          csvStatus.textContent = "Couldn't read that CSV — check the column order and try again.";
          csvStatus.className = "csv-status err";
        }
      };
      reader.onerror = () => {
        csvStatus.textContent = "Couldn't read that file.";
        csvStatus.className = "csv-status err";
      };
      reader.readAsText(file);
      csvFile.value = "";
    });
  }

  function parseCsv(text) {
    const lines = text.split(/\r\n|\n|\r/).map((l) => l.trim()).filter((l) => l.length);
    if (!lines.length) return [];
    const splitLine = (line) => line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    let start = 0;
    const first = splitLine(lines[0]).map((c) => c.toLowerCase());
    if (first[0] === "category") start = 1; // skip header row
    const validClass = ["halal", "haram", "mixed", "tentative", "missing"];
    const rows = [];
    for (let i = start; i < lines.length; i++) {
      const cells = splitLine(lines[i]);
      if (!cells.length || !cells[0]) continue;
      const category = cells[0] || "";
      let classification = (cells[1] || "").toLowerCase();
      if (!validClass.includes(classification)) classification = "";
      const amount = parseFloat(cells[2]);
      const halalPortion = parseFloat(cells[3]);
      rows.push({
        category,
        classification,
        amount: isNaN(amount) ? 0 : amount,
        halal_portion: isNaN(halalPortion) ? 0 : halalPortion,
      });
    }
    return rows;
  }

  // ---------- Nisab: fixed values, not live prices ----------
  // Classical nisab weights (fixed by fiqh, do not change):
  const GOLD_NISAB_GRAMS = 87.48;    // 20 mithqal
  const SILVER_NISAB_GRAMS = 612.36; // 200 dirhams

  // Price per gram in CAD — THE ONLY PART YOU SHOULD UPDATE.
  // Set this once, right before the event, using that day's spot price.
  // Do not wire this to a live price API — the event rules require a
  // fixed value used for every calculation and test case.
  const GOLD_PRICE_PER_GRAM_CAD = 154.00;   // ~CAD spot mid-2026 — update day-of if organizers provide a figure
  const SILVER_PRICE_PER_GRAM_CAD = 1.41;   // ~CAD spot mid-2026 — update day-of if organizers provide a figure

  const NISAB_GOLD_CAD = +(GOLD_NISAB_GRAMS * GOLD_PRICE_PER_GRAM_CAD).toFixed(2);
  const NISAB_SILVER_CAD = +(SILVER_NISAB_GRAMS * SILVER_PRICE_PER_GRAM_CAD).toFixed(2);

  // All four schools in this build use the silver threshold: it is lower,
  // so it brings more people into zakat obligation — the more cautious
  // reading, and the one most commonly used across the madhahib for this
  // kind of general calculator.
  const ACTIVE_NISAB_CAD = NISAB_SILVER_CAD;

  const MADHHAB_EXPLANATION = {
    hanafi: "Hanafi rules measure hawl only at the start and end of the lunar year, so a mid-year dip below nisab doesn't reset it. All gold and silver jewelry counts (metal value only), near-term qualifying debts are deducted, and expected receivables are included unless doubtful.",
    maliki: "Maliki rules require staying at or above nisab continuously; a dip resets the year. Customary personal jewelry is excluded. Near-term debts may reduce assets, and ordinary personal loans owed to you aren't zakated until received.",
    shafii: "Shafi\u2019i rules require continuous nisab; a dip resets the year. Personal debts are not deducted at all. Likely receivables are included as a zakatable asset every year, without waiting for receipt.",
    hanbali: "Hanbali rules require continuous nisab; a dip resets the year. The full outstanding balance owed to creditors is deducted, with no 12-month limit. Money you've lent to others stays excluded entirely while unpaid.",
  };

  function calculate() {
    // ---------- income by category ----------
    const incomeRows = readIncomeRows();
    const mixedDisposed = document.getElementById("mixedDisposedYes")
      ? document.getElementById("mixedDisposedYes").checked
      : true;

    let incomeHalalTotal = 0;   // zakatable portion of income
    let incomeHaramTotal = 0;   // separated out, not zakatable, must be disposed of
    let incomeFlags = [];

    incomeRows.forEach((r) => {
      if (r.classification === "" || r.classification === "missing") {
        incomeFlags.push(`"${r.category}" is missing a classification — excluded from zakat until you can classify it.`);
      } else if (r.classification === "tentative") {
        incomeFlags.push(`"${r.category}" is marked Tentative — Scholar Review Required. Excluded from zakat for now.`);
      } else if (r.classification === "halal") {
        incomeHalalTotal += r.amount;
      } else if (r.classification === "haram") {
        incomeHaramTotal += r.amount;
        incomeFlags.push(`"${r.category}" identified as haram income — separated from zakatable wealth. Removing it isn't zakat; it should still be disposed of appropriately.`);
      } else if (r.classification === "mixed") {
        const halalPart = Math.min(r.halal_portion, r.amount);
        const haramPart = r.amount - halalPart;
        if (mixedDisposed) {
          incomeHalalTotal += halalPart;
          incomeHaramTotal += haramPart;
        } else {
          // Retained mixed amount stays zakatable in full — not exempt solely for being mixed.
          incomeHalalTotal += r.amount;
        }
        incomeFlags.push(`"${r.category}" is mixed income — ${mixedDisposed
          ? `only its halal portion ($${halalPart.toLocaleString()}) is zakatable; the haram portion is separated out.`
          : `you're retaining the full amount, so it stays zakatable in full per the shared rule on retained mixed wealth.`}`);
      }
    });

    // ---------- other assets ----------
    const cash = num("cash") + num("chequing") + num("savings");
    const goldSilver = num("goldSilver");
    const investments = num("investments");
    const inventory = num("inventory");

    const debtNear = num("debtNear");     // due / overdue / within 12 months
    const debtLong = num("debtLong");     // long-term (mortgage, student loan)
    const receivable = num("receivable");
    const receivableConfidence = val("receivableConfidence"); // likely | doubtful

    let zakatable = cash + goldSilver + investments + inventory + incomeHalalTotal;
    let debtDeducted = 0;
    let receivableIncluded = 0;
    let flags = incomeFlags.slice();

    if (MADHHAB === "hanafi") {
      debtDeducted = debtNear; // near-term qualifying debts only
      if (receivable > 0) {
        if (receivableConfidence === "doubtful") {
          flags.push("Doubtful receivable — Scholar Review Required; calculation may be delayed until received.");
        } else {
          receivableIncluded = receivable;
        }
      }
      zakatable = zakatable + receivableIncluded - debtDeducted;
    } else if (MADHHAB === "maliki") {
      debtDeducted = debtNear;
      // Ordinary personal loans owed TO the user are not zakatable while unpaid.
      if (receivable > 0) flags.push("Personal receivable excluded until received, per Maliki rule for ordinary loans.");
      zakatable = zakatable - debtDeducted;
    } else if (MADHHAB === "shafii") {
      // No personal-debt deduction at all.
      if (receivable > 0) {
        if (receivableConfidence === "doubtful") {
          flags.push("Doubtful receivable — flagged Tentative / Scholar Review Required.");
        } else {
          receivableIncluded = receivable;
        }
      }
      zakatable = zakatable + receivableIncluded;
      if (debtNear + debtLong > 0) flags.push("Personal debts not deducted under Shafi\u2019i rules in this build.");
    } else if (MADHHAB === "hanbali") {
      debtDeducted = debtNear + debtLong; // full outstanding debt, no 12-month limit
      // Money lent to others stays excluded entirely while unpaid.
      if (receivable > 0) flags.push("Money lent to others excluded from this calculation while unpaid, per Hanbali rule.");
      zakatable = zakatable - debtDeducted;
    }

    const zakatable_final = Math.max(0, zakatable);
    const aboveNisab = zakatable_final >= ACTIVE_NISAB_CAD;
    const zakatDue = aboveNisab ? zakatable_final * 0.025 : 0;

    // ---------- render results ----------
    document.getElementById("resultMadhhab").textContent = MADHHAB_LABEL[MADHHAB];
    document.getElementById("resultFigure").textContent =
      "$" + zakatDue.toLocaleString(undefined, { maximumFractionDigits: 2 });
    document.getElementById("resultStatus").textContent = aboveNisab
      ? "At or above nisab ($" + ACTIVE_NISAB_CAD.toLocaleString() + " CAD, silver standard) — zakat is due."
      : "Below nisab ($" + ACTIVE_NISAB_CAD.toLocaleString() + " CAD, silver standard) — no zakat due this year.";

    const summary = document.getElementById("incomeSummary");
    if (summary) {
      summary.innerHTML = `
        <div class="halal"><span class="label">Zakatable income (halal / disposed-mixed)</span><span class="num">$${incomeHalalTotal.toLocaleString()}</span></div>
        <div class="haram"><span class="label">Haram income — separate, not zakatable</span><span class="num">$${incomeHaramTotal.toLocaleString()}</span></div>
      `;
    }

    const lines = document.getElementById("resultLines");
    lines.innerHTML = "";
    const rows = [
      ["Income (halal / disposed-mixed)", incomeHalalTotal, false],
      ["Cash, chequing & savings", cash, false],
      ["Gold & silver", goldSilver, false],
      ["Halal investments", investments, false],
      ["Business inventory", inventory, false],
      ["Receivables included", receivableIncluded, false],
      ["Debts deducted", -debtDeducted, true],
    ];
    rows.forEach(([label, amount, isSubtract]) => {
      const row = document.createElement("div");
      row.className = "result-line" + (isSubtract ? " subtract" : "");
      row.innerHTML = `<span>${label}</span><span>${amount < 0 ? "\u2212" : ""}$${Math.abs(amount).toLocaleString()}</span>`;
      lines.appendChild(row);
    });
    const totalRow = document.createElement("div");
    totalRow.className = "result-line total";
    totalRow.innerHTML = `<span>Net zakatable wealth</span><span>$${zakatable_final.toLocaleString()}</span>`;
    lines.appendChild(totalRow);

    const warnBox = document.getElementById("resultWarnings");
    if (flags.length) {
      warnBox.style.display = "block";
      warnBox.innerHTML = "<strong>Flagged for review</strong><ul style='margin:0.5em 0 0 1.1em;padding:0'>" +
        flags.map((f) => `<li>${f}</li>`).join("") + "</ul>";
    } else {
      warnBox.style.display = "none";
    }

    const explainBox = document.getElementById("resultExplain");
    if (explainBox) {
      explainBox.innerHTML = `<strong>Why this figure, under ${MADHHAB_LABEL[MADHHAB]}:</strong> ${MADHHAB_EXPLANATION[MADHHAB]} ` +
        `Net zakatable wealth of $${zakatable_final.toLocaleString()} is compared against the silver nisab of $${ACTIVE_NISAB_CAD.toLocaleString()} CAD. ` +
        (aboveNisab ? `Since it meets or exceeds nisab, zakat is 2.5% of that amount.` : `Since it falls short of nisab, no zakat is due this year.`);
    }

    document.getElementById("formPanel").style.display = "none";
    document.getElementById("resultsPanel").style.display = "block";
    const resultsPanel = document.getElementById("resultsPanel");
    if (typeof resultsPanel.scrollIntoView === "function") {
      resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  render();
})();
