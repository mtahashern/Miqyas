// Miqyas; shared interaction logic. No frameworks, no build step.

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

// ---------- accessibility reading controls ----------
(function () {
  const toggle = document.getElementById("accessibilityToggle");
  const menu = document.getElementById("accessibilityMenu");
  if (!toggle || !menu) return;
  const body = document.body;
  const saved = JSON.parse(localStorage.getItem("miqyas_accessibility") || "{}");
  body.classList.toggle("accessibility-larger", saved.larger === true);
  body.classList.toggle("accessibility-contrast", saved.contrast === true);
  toggle.addEventListener("click", () => {
    const open = !menu.hidden;
    menu.hidden = open;
    toggle.setAttribute("aria-expanded", String(!open));
  });
  menu.querySelectorAll("[data-accessibility]").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.accessibility;
      if (choice === "larger") body.classList.toggle("accessibility-larger");
      if (choice === "contrast") body.classList.toggle("accessibility-contrast");
      if (choice === "reset") { body.classList.remove("accessibility-larger", "accessibility-contrast"); }
      localStorage.setItem("miqyas_accessibility", JSON.stringify({ larger: body.classList.contains("accessibility-larger"), contrast: body.classList.contains("accessibility-contrast") }));
    });
  });
})();

// ---------- Masarif directory ----------
(function () {
  const filter = document.getElementById("regionFilter");
  const list = document.getElementById("organizationList");
  const empty = document.getElementById("filterEmpty");
  const prompt = document.getElementById("directoryPrompt");
  const listings = {
    "st-catharines": [
      { name: "Islamic Society of St. Catharines | Masjid An-Noor", type: "Local organization", categories: "Community support | Confirm zakat", description: "A St. Catharines Islamic community centre with prayer, education, community services, and a donate page. Confirm the current zakat designation directly.", url: "https://islamicsocietyofstcatharines.ca/donate" },
      { name: "National Zakat Foundation Canada", type: "Regional referral", categories: "Al-fuqara | Al-masakin | Al-gharimin", description: "A Canadian zakat organization with a formal application and donation pathway. Use its instructions to confirm service for your city.", url: "https://www.nzfcanada.com/" },
      { name: "Muslim Food Bank Niagara Falls", type: "Regional referral", categories: "Al-fuqara | Al-masakin", description: "A Niagara food-support program that states it is accredited to accept zakat. Confirm delivery or eligibility for St. Catharines before giving.", url: "https://muslimfoodbank.com/location/muslim-food-bank-niagara-falls/" }
    ],
    "niagara-falls": [
      { name: "Niagara Falls Islamic Center | Masjid Alsalam", type: "Local organization", categories: "Community support | Confirm zakat", description: "A Niagara Falls Islamic centre offering prayer, education, and community services. Confirm its current zakat collection and distribution policy.", url: "https://niagarafallsislamiccenter.com/" },
      { name: "Muslim Food Bank Niagara Falls", type: "Local program", categories: "Al-fuqara | Al-masakin", description: "A Niagara Falls food-support program that states it is accredited to accept zakat for vulnerable families.", url: "https://muslimfoodbank.com/location/muslim-food-bank-niagara-falls/" },
      { name: "National Zakat Foundation Canada", type: "Regional organization", categories: "Al-fuqara | Al-masakin | Al-gharimin", description: "A Canadian zakat organization with a formal application and donation pathway for people needing support.", url: "https://www.nzfcanada.com/" }
    ],
    "welland": [
      { name: "Masjid Ameer Hamza", type: "Local organization", categories: "Community support | Confirm zakat", description: "A Welland mosque at 109 Chaffey Street. Visit its official page to confirm current zakat or local assistance options.", url: "https://masjidameerhamza.org/" },
      { name: "National Zakat Foundation Canada", type: "Regional referral", categories: "Al-fuqara | Al-masakin | Al-gharimin", description: "A Canadian zakat organization with an application pathway. Confirm service availability for Welland before donating.", url: "https://www.nzfcanada.com/" },
      { name: "Muslim Food Bank Niagara Falls", type: "Regional referral", categories: "Al-fuqara | Al-masakin", description: "A Niagara food-support program that states it is accredited to accept zakat. Confirm whether Welland households are served.", url: "https://muslimfoodbank.com/location/muslim-food-bank-niagara-falls/" }
    ],
    "thorold": [
      { name: "Mosque Aisha", type: "Local-area organization", categories: "Community support | Confirm zakat", description: "An Islamic community organization serving the Niagara area, including Thorold-area residents. Confirm current donation and zakat services directly.", url: "https://www.mosqueaisha.ca/" },
      { name: "Peace Community Center", type: "Local-area organization", categories: "Community support | Confirm zakat", description: "A masjid and Muslim community centre on Thorold Townline Road. Confirm whether it currently accepts or distributes zakat.", url: "https://peacecommunitycenter.com/" },
      { name: "National Zakat Foundation Canada", type: "Regional referral", categories: "Al-fuqara | Al-masakin | Al-gharimin", description: "A Canadian zakat organization with a formal application and donation pathway. Confirm service for Thorold.", url: "https://www.nzfcanada.com/" }
    ],
    "port-colborne": [
      { name: "National Zakat Foundation Canada", type: "Regional referral", categories: "Al-fuqara | Al-masakin | Al-gharimin", description: "A Canadian zakat organization with a formal application and donation pathway. Confirm service availability for Port Colborne.", url: "https://www.nzfcanada.com/" },
      { name: "Muslim Food Bank Niagara Falls", type: "Regional referral", categories: "Al-fuqara | Al-masakin", description: "A Niagara food-support program that states it is accredited to accept zakat. Confirm whether Port Colborne households are served.", url: "https://muslimfoodbank.com/location/muslim-food-bank-niagara-falls/" },
      { name: "Islamic Society of St. Catharines | Masjid An-Noor", type: "Regional referral", categories: "Community support | Confirm zakat", description: "A Niagara Islamic community centre with community services and a donate page. Ask whether it can refer Port Colborne residents.", url: "https://islamicsocietyofstcatharines.ca/donate" }
    ]
  };
  function render(city) {
    if (!list) return;
    list.innerHTML = "";
    const rows = listings[city] || [];
    rows.forEach((item) => {
      const card = document.createElement("article");
      card.className = "info-card";
      card.innerHTML = `<span class="listing-type">${item.type}</span><h3>${item.name}</h3><span class="tag">${item.categories}</span><p>${item.description}</p><p><a href="${item.url}" target="_blank" rel="noopener">Visit official page <span aria-hidden="true">→</span></a></p>`;
      list.appendChild(card);
    });
    if (prompt) prompt.hidden = Boolean(city);
    if (empty) empty.hidden = Boolean(rows.length || !city);
  }
  if (filter) filter.addEventListener("change", () => render(filter.value));
  render("");

  const form = document.getElementById("masarifRequestForm");
  const status = document.getElementById("masarifFormStatus");
  if (form && status) form.addEventListener("submit", (event) => {
    event.preventDefault();
    const org = document.getElementById("orgName").value.trim();
    const email = document.getElementById("orgContact").value.trim();
    status.textContent = `Thank you. ${org} was recorded for review. We will follow up at ${email}.`;
    status.className = "hint csv-status";
    form.reset();
  });
})();

// ---------- work-sector classification and eligibility ----------
(function () {
  const sector = document.getElementById("workSector");
  const result = document.getElementById("eligibilityResult");
  if (!sector || !result) return;
  const labels = { hanafi: "Hanafi", maliki: "Maliki", shafii: "Shafi’i", hanbali: "Hanbali" };
  const notes = {
    hanafi: "Under the Hanafi path selected for this session, permissible earnings can become zakatable assets once the relevant nisab and hawl conditions are met. Review debts and receivables using the Hanafi rules shown later.",
    maliki: "Under the Maliki path selected for this session, permissible earnings can become zakatable assets once the relevant nisab and continuous hawl conditions are met. A scholar should review mixed or disputed work.",
    shafii: "Under the Shafi’i path selected for this session, permissible earnings can become zakatable assets once the relevant nisab and continuous hawl conditions are met. Personal debt is not automatically deducted in this path.",
    hanbali: "Under the Hanbali path selected for this session, permissible earnings can become zakatable assets once the relevant nisab and continuous hawl conditions are met. Qualifying debts are handled according to the Hanbali rules shown later."
  };
  function classify() {
    const value = sector.value;
    if (!value) { result.hidden = true; return; }
    const madhhab = sessionStorage.getItem("miqyas_madhhab") || "hanafi";
    let title = "Preliminary review: Tentative";
    let body = "This category needs a person-by-person review. Keep the income unclassified until you can describe the actual work and ask a qualified scholar.";
    let tone = "tentative";
    if (value.startsWith("halal-")) { title = "Preliminary signal: Usually permissible"; body = `${notes[madhhab] || notes.hanafi} The signal is not a final ruling.`; tone = "halal"; }
    if (value.startsWith("mixed-")) { title = "Preliminary signal: Mixed or disputed"; body = `This sector can contain both permissible and impermissible duties or income sources. Under the ${labels[madhhab] || "selected madhhab"} path, separate the actual income streams and ask a qualified scholar before marking the row Halal.`; tone = "mixed"; }
    if (value.startsWith("haram-")) { title = "Preliminary signal: Prohibited-income indicator"; body = "Do not count prohibited income as zakatable wealth by simply adding it to the zakat total. Record it separately, do not treat disposal as zakat, and ask a qualified scholar about the appropriate next step."; tone = "haram"; }
    result.hidden = false; result.className = `eligibility-result ${tone}`; result.innerHTML = `<strong>${title}</strong><p>${body}</p><small>Selected path: ${labels[madhhab] || "Madhhab not selected"}. Use the Classification control below to confirm or change the row status.</small>`;
  }
  sector.addEventListener("change", classify);
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
    // No school locked in; send back to the selector rather than guess.
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

  const savePdfBtn = document.getElementById("savePdfBtn");
  if (savePdfBtn) {
    savePdfBtn.addEventListener("click", () => {
      document.title = "Miqyas Zakat Calculation";
      window.print();
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
          <option value="expense">Expense / excluded</option>
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
    if (data.classification && ["halal","haram","mixed","tentative","expense"].includes(data.classification)) {
      clsSelect.value = data.classification;
    }
    updateRowState(row);

    clsSelect.addEventListener("change", () => updateRowState(row));
    const categoryInput = row.querySelector(".row-category");
    categoryInput.addEventListener("input", () => {
      const current = clsSelect.value;
      if (!categoryInput.value.trim() || !["", "tentative"].includes(current)) return;
      clsSelect.value = inferClassification(categoryInput.value);
      updateRowState(row);
    });
    row.querySelector(".row-remove").addEventListener("click", () => row.remove());
    return row;
  }

  function updateRowState(row) {
    const cls = row.querySelector(".row-class").value;
    row.classList.toggle("is-mixed", cls === "mixed");
    row.classList.toggle("is-expense", cls === "expense");
    const status = row.querySelector(".row-status");
    const flagged = cls === "" || cls === "tentative";
    row.classList.toggle("flagged", flagged);
    if (cls === "") {
      status.textContent = "Choose Halal, Haram, Mixed, or Tentative before continuing.";
    } else if (cls === "tentative") {
      status.textContent = "Marked tentative; Scholar Review Required, excluded from zakat for now.";
    } else if (cls === "expense") {
      status.textContent = "Recognized as an expense; excluded from zakat assets.";
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
      { category: "Salary / wages", classification: "halal" },
      { category: "Business income", classification: "tentative" },
      { category: "Investment returns", classification: "mixed" },
      { category: "Gifts / inheritance", classification: "halal" },
      { category: "Rental income", classification: "halal" },
    ];
    defaults.forEach(addIncomeRow);

    document.getElementById("addRowBtn").addEventListener("click", () => addIncomeRow());

    const workSector = document.getElementById("workSector");
    if (workSector) workSector.addEventListener("change", () => {
      const firstRow = incomeTable.querySelector(".income-row");
      const classification = firstRow?.querySelector(".row-class");
      if (!classification) return;
      const value = workSector.value;
      const suggested = value.startsWith("halal-") ? "halal" : value.startsWith("haram-") ? "haram" : value.startsWith("mixed-") ? "mixed" : "";
      classification.value = suggested;
      classification.dispatchEvent(new Event("change"));
    });

    // ---- CSV template download ----
    const templateLink = document.getElementById("csvTemplateLink");
    if (templateLink) {
      const csvTemplate = "category,classification,amount,halal_portion\n" +
        "Salary,halal,4200,\n" +
        "Freelance design work,mixed,1500,900\n" +
        "Inheritance received,tentative,3000,\n" +
        "Gift from relative,tentative,,\n" +
        "Investment dividends,halal,220,\n";
      templateLink.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvTemplate);
    }

    // ---- Multi-format document upload ----
    const csvFile = document.getElementById("csvFile");
    const csvStatus = document.getElementById("csvStatus");
    csvFile.addEventListener("change", async () => {
      const file = csvFile.files[0];
      if (!file) return;
      csvStatus.textContent = `Reading ${file.name}...`;
      csvStatus.className = "csv-status";
      try {
        const rows = await parseUploadedDocument(file);
        if (!rows.length) throw new Error("No usable rows found");
        incomeTable.innerHTML = "";
        rows.forEach(addIncomeRow);
        csvStatus.textContent = `Loaded ${rows.length} row${rows.length === 1 ? "" : "s"} from ${file.name}. Categories, amounts, and preliminary classifications were inferred where possible; unavailable fields remain editable.`;
        csvStatus.className = "csv-status";
      } catch (error) {
        csvStatus.textContent = "This file could not be read. Try a CSV, TSV, Excel, PDF, TXT, or JSON file with one income item per row.";
        csvStatus.className = "csv-status err";
      } finally {
        csvFile.value = "";
      }
    });
  }

  async function parseUploadedDocument(file) {
    const extension = file.name.toLowerCase().split(".").pop();
    if (["xlsx", "xls"].includes(extension)) {
      if (!window.XLSX) throw new Error("Spreadsheet library unavailable");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      return normalizeImportedRows(XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }));
    }
    if (extension === "pdf") return parsePdfDocument(file);
    const text = await file.text();
    if (extension === "json") {
      const data = JSON.parse(text);
      return normalizeImportedRows(Array.isArray(data) ? data : (data.rows || [data]));
    }
    return parseCsv(text);
  }

  function inferClassification(category, description = "") {
    const text = `${category || ""} ${description || ""}`.toLowerCase();
    const expense = /\b(expense|expenses|bill|bills|purchase|purchases|cost|costs|monthly phone bill|phone bill|cell phone bill|internet bill|utility bill|utilities|advertising expense|business advertising|business expense|office expense|business supplies?|office supplies?|supplies purchase|equipment purchase|transportation expense|travel expense|mileage expense|transit expense|fuel expense|software subscription|software expense|software purchase|software license|app subscription|cloud subscription|hosting expense|subscription fee|membership fee|operating cost|business cost|office cost|maintenance cost|repair cost|shipping expense|delivery expense|payroll expense)\b/;
    const haram = /\b(gambling|betting|casino|alcohol|liquor|wine|beer|pork|swine|adult entertainment|porn|illegal drug|drug trafficking|interest-only lending|riba)\b/;
    const mixed = /\b(bank|banking|finance|financial|loan|lending|mortgage|insurance|investment|broker|brokerage|advertising|media|government|legal|compliance|conventional)\b/;
    const halal = /\b(masjid|mosque|islamic centre|islamic center|imam|madrasa|madrasah|quran|charity|nonprofit|non-profit|zakat|sadaqah|halal|teaching|teacher|education|healthcare|medical|nursing|software|engineering|construction|trades|freelance design|freelance|professional work|professional services|consulting|design|retail|restaurant|food|salary|wages|tips|gift|inheritance|rent|rental)\b/;
    if (expense.test(text)) return "expense";
    if (haram.test(text)) return "haram";
    if (mixed.test(text)) return "mixed";
    if (halal.test(text)) return "halal";
    return "tentative";
  }

  function extractAmount(value) {
    const match = String(value ?? "").match(/(?:CAD|CA\$|\$)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i);
    return match ? match[1].replace(/,/g, "") : "";
  }

  function normalizeImportedRows(rawRows) {
    if (!rawRows || !rawRows.length) return [];
    const normalizeHeader = (value) => String(value ?? "").trim().toLowerCase().replace(/[()$]/g, " ").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
    const first = Array.isArray(rawRows[0]) ? rawRows[0].map(normalizeHeader) : Object.keys(rawRows[0]).map(normalizeHeader);
    const hasHeader = first.some((v) => ["category", "classification", "amount", "amount cad", "amount canadian dollars", "halal portion", "income", "description", "payment", "earnings"].includes(v));
    const headers = hasHeader ? first : ["category", "classification", "amount", "halal portion"];
    const rows = hasHeader ? rawRows.slice(1) : rawRows;
    return rows.map((row) => {
      const values = Array.isArray(row) ? row : headers.map((header) => { const key = Object.keys(row).find((candidate) => normalizeHeader(candidate) === header); return key ? row[key] : ""; });
      const pick = (...names) => { const wanted = names.map(normalizeHeader); const index = headers.findIndex((h) => wanted.includes(h)); return index >= 0 ? String(values[index] ?? "").trim() : ""; };
      let category = pick("category", "income", "description", "item", "name", "work", "source");
      const explicit = pick("classification", "class", "status").toLowerCase();
      const amountRaw = pick("amount", "amount cad", "amount canadian dollars", "value", "total", "income amount", "payment", "earnings", "cad", "price", "cost");
      const description = pick("description", "details", "notes", "work", "source");
      const embeddedAmount = !amountRaw ? extractAmount(category || description) : "";
      if (embeddedAmount) category = category.replace(/(?:CAD\s*|CA\$|\$)?\s*[0-9][0-9,]*(?:\.\d{1,2})?/i, "").replace(/[,:;|]+$/, "").trim();
      const classification = ["halal", "haram", "mixed", "tentative", "expense"].includes(explicit) ? explicit : inferClassification(category, description);
      return { category: category || description || "", classification, amount: extractAmount(amountRaw || embeddedAmount), halal_portion: extractAmount(pick("halal portion", "halal_portion", "eligible amount")) };
    }).filter((row) => row.category || row.amount || row.classification || row.halal_portion);
  }

  async function parsePdfDocument(file) {
    const pdfjs = window.pdfjsLib;
    if (!pdfjs) throw new Error("PDF library unavailable");
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const lines = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const grouped = new Map();
      content.items.forEach((item) => { const y = Math.round(item.transform?.[5] || 0); const key = String(y); grouped.set(key, `${grouped.get(key) || ""} ${item.str}`.trim()); });
      lines.push(...Array.from(grouped.values()).map((line) => line.trim()).filter(Boolean));
    }
    return lines.map((line) => {
      const classificationMatch = line.match(/\b(halal|haram|mixed|tentative|expense)\b/i);
      const numbers = line.match(/(?:CAD\s*|CA\$|\$)?\s*\d[\d,]*(?:\.\d{1,2})?/gi) || [];
      const category = line.replace(classificationMatch?.[0] || "", "").replace(/(?:CAD\s*|CA\$|\$)?\s*\d[\d,]*(?:\.\d{1,2})?/gi, "").replace(/[,:;|]+$/, "").trim();
      const detectedClass = classificationMatch ? classificationMatch[1].toLowerCase() : inferClassification(category);
      return { category: category || "", classification: ["halal", "haram", "mixed", "tentative", "expense"].includes(detectedClass) ? detectedClass : "tentative", amount: extractAmount(numbers[0] || ""), halal_portion: extractAmount(numbers[1] || "") };
    }).filter((row) => row.category || row.amount);
  }

  function parseCsv(text) {
    const lines = text.split(/\r\n|\n|\r/).map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return [];
    const delimiter = lines[0].includes("\t") ? "\t" : ",";
    const splitLine = (line) => line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, ""));
    const rawRows = lines.map(splitLine);
    return normalizeImportedRows(rawRows);
  }

  // ---------- Nisab: fixed values, not live prices ----------
  // Classical nisab weights (fixed by fiqh, do not change):
  const GOLD_NISAB_GRAMS = 87.48;    // 20 mithqal
  const SILVER_NISAB_GRAMS = 612.36; // 200 dirhams

  // Price per gram in CAD; THE ONLY PART YOU SHOULD UPDATE.
  // Set this once, right before the event, using that day's spot price.
  // Do not wire this to a live price API; the event rules require a
  // fixed value used for every calculation and test case.
  const GOLD_PRICE_PER_GRAM_CAD = 154.00;   // ~CAD spot mid-2026; update day-of if organizers provide a figure
  const SILVER_PRICE_PER_GRAM_CAD = 1.41;   // ~CAD spot mid-2026; update day-of if organizers provide a figure

  const NISAB_GOLD_CAD = +(GOLD_NISAB_GRAMS * GOLD_PRICE_PER_GRAM_CAD).toFixed(2);
  const NISAB_SILVER_CAD = +(SILVER_NISAB_GRAMS * SILVER_PRICE_PER_GRAM_CAD).toFixed(2);

  // All four schools in this build use the silver threshold: it is lower,
  // so it brings more people into zakat obligation; the more cautious
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
    let incomeFlags = [];       // genuine unresolved or scholar-review items
    let incomeNotes = [];       // informational classification notes, not review flags
    let incomeExpenseTotal = 0; // excluded operating expenses

    incomeRows.forEach((r) => {
      if (r.classification === "") {
        incomeFlags.push(`"${r.category}" needs a Halal, Haram, Mixed, or Tentative classification before it can be included.`);
      } else if (r.classification === "tentative") {
        incomeFlags.push(`"${r.category}" is marked Tentative; Scholar Review Required. Excluded from zakat for now.`);
      } else if (r.classification === "expense") {
        incomeExpenseTotal += r.amount;
        incomeNotes.push(`"${r.category}" was recognized as an expense and excluded from zakat assets.`);
      } else if (r.classification === "halal") {
        incomeHalalTotal += r.amount;
      } else if (r.classification === "haram") {
        incomeHaramTotal += r.amount;
        incomeFlags.push(`"${r.category}" identified as haram income; separated from zakatable wealth. Removing it isn't zakat; it should still be disposed of appropriately.`);
      } else if (r.classification === "mixed") {
        const halalPart = Math.min(r.halal_portion, r.amount);
        const haramPart = r.amount - halalPart;
        if (mixedDisposed) {
          incomeHalalTotal += halalPart;
          incomeHaramTotal += haramPart;
        } else {
          // Retained mixed amount stays zakatable in full; not exempt solely for being mixed.
          incomeHalalTotal += r.amount;
        }
        incomeFlags.push(`"${r.category}" is mixed income; ${mixedDisposed
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
          flags.push("Doubtful receivable; Scholar Review Required; calculation may be delayed until received.");
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
          flags.push("Doubtful receivable; flagged Tentative / Scholar Review Required.");
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
      ? "At or above nisab ($" + ACTIVE_NISAB_CAD.toLocaleString() + " CAD, silver standard); zakat is due."
      : "Below nisab ($" + ACTIVE_NISAB_CAD.toLocaleString() + " CAD, silver standard); no zakat due this year.";

    const summary = document.getElementById("incomeSummary");
    if (summary) {
      summary.innerHTML = `
        <div class="halal"><span class="label">Zakatable income (halal / disposed-mixed)</span><span class="num">$${incomeHalalTotal.toLocaleString()}</span></div>
        <div class="haram"><span class="label">Haram income; separate, not zakatable</span><span class="num">$${incomeHaramTotal.toLocaleString()}</span></div>
        <div class="expense"><span class="label">Recognized expenses; excluded from assets</span><span class="num">$${incomeExpenseTotal.toLocaleString()}</span></div>
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
        (aboveNisab ? `Since it meets or exceeds nisab, zakat is 2.5% of that amount.` : `Since it falls short of nisab, no zakat is due this year.`) +
        (incomeNotes.length ? `<br><strong>Classification notes:</strong> ${incomeNotes.join(" ")}` : "");
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
