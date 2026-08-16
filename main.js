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

  // ---------- Nisab: fixed values, not live prices ----------
  // Classical nisab weights (fixed by fiqh, do not change):
  const GOLD_NISAB_GRAMS = 87.48;    // 20 mithqal
  const SILVER_NISAB_GRAMS = 612.36; // 200 dirhams

  // Price per gram in CAD — THE ONLY PART YOU SHOULD UPDATE.
  // Set this once, right before the event, using that day's spot price.
  // Do not wire this to a live price API — the event rules require a
  // fixed value used for every calculation and test case.
  const GOLD_PRICE_PER_GRAM_CAD = 118.00;   // TODO: replace with organizer/day-of figure
  const SILVER_PRICE_PER_GRAM_CAD = 1.35;   // TODO: replace with organizer/day-of figure

  const NISAB_GOLD_CAD = +(GOLD_NISAB_GRAMS * GOLD_PRICE_PER_GRAM_CAD).toFixed(2);
  const NISAB_SILVER_CAD = +(SILVER_NISAB_GRAMS * SILVER_PRICE_PER_GRAM_CAD).toFixed(2);

  // All four schools in this build use the silver threshold: it is lower,
  // so it brings more people into zakat obligation — the more cautious
  // reading, and the one most commonly used across the madhahib for this
  // kind of general calculator.
  const ACTIVE_NISAB_CAD = NISAB_SILVER_CAD;

  function calculate() {
    const cash = num("cash") + num("chequing") + num("savings");
    const goldSilver = num("goldSilver");
    const investments = num("investments");
    const inventory = num("inventory");
    const haramAmount = num("haramAmount");
    const mixedHalal = num("mixedHalalPortion");

    const debtNear = num("debtNear");     // due / overdue / within 12 months
    const debtLong = num("debtLong");     // long-term (mortgage, student loan)
    const receivable = num("receivable");
    const receivableConfidence = val("receivableConfidence"); // likely | doubtful

    let zakatable = cash + goldSilver + investments + inventory + mixedHalal;
    let debtDeducted = 0;
    let receivableIncluded = 0;
    let flags = [];

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

    if (haramAmount > 0) {
      flags.push("Haram income identified — separated from zakatable wealth. It is not zakat-exempt by removal; it should be disposed of appropriately.");
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

    const lines = document.getElementById("resultLines");
    lines.innerHTML = "";
    const rows = [
      ["Cash, chequing & savings", cash],
      ["Gold & silver", goldSilver],
      ["Halal investments", investments],
      ["Business inventory", inventory],
      ["Halal portion of mixed income", mixedHalal],
      ["Receivables included", receivableIncluded],
      ["Debts deducted", -debtDeducted],
    ];
    rows.forEach(([label, amount]) => {
      const row = document.createElement("div");
      row.className = "result-line";
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

    document.getElementById("formPanel").style.display = "none";
    document.getElementById("resultsPanel").style.display = "block";
    const resultsPanel = document.getElementById("resultsPanel");
    if (typeof resultsPanel.scrollIntoView === "function") {
      resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  render();
})();
