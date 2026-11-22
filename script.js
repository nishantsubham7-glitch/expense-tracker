const STORAGE_KEY = "expense_tracker_transactions_v1";

const form = document.getElementById("transaction-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const filterSelect = document.getElementById("filter-category");
const clearAllBtn = document.getElementById("clear-all-btn");
const listEl = document.getElementById("transaction-list");

const totalBalanceEl = document.getElementById("total-balance");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");

let transactions = loadTransactions();

function loadTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);
}

function updateSummary() {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  totalBalanceEl.textContent = formatCurrency(balance);
  totalIncomeEl.textContent = formatCurrency(income);
  totalExpenseEl.textContent = formatCurrency(expense);
}

function renderTransactions() {
  const selectedCategory = filterSelect.value;
  const filtered =
    selectedCategory === "All"
      ? transactions
      : transactions.filter((t) => t.category === selectedCategory);

  listEl.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent =
      selectedCategory === "All"
        ? "No transactions yet. Add one above to get started."
        : `No transactions found in "${selectedCategory}".`;
    listEl.appendChild(empty);
    return;
  }

  filtered.forEach((tx) => {
    const li = document.createElement("li");
    li.className = `transaction-item ${tx.type}`;

    const infoDiv = document.createElement("div");
    const titleSpan = document.createElement("div");
    titleSpan.className = "tx-title";
    titleSpan.textContent = tx.title;

    const metaSpan = document.createElement("div");
    metaSpan.className = "tx-meta";
    metaSpan.textContent = `${tx.category} • ${tx.date}`;

    infoDiv.append(titleSpan, metaSpan);

    const rightDiv = document.createElement("div");
    rightDiv.className = "tx-right";

    const amountSpan = document.createElement("span");
    amountSpan.className = `tx-amount ${tx.type}`;
    const sign = tx.type === "income" ? "+" : "-";
    amountSpan.textContent = `${sign}${formatCurrency(tx.amount)}`;

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "delete-btn";
    delBtn.setAttribute("aria-label", `Delete ${tx.title}`);
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => deleteTransaction(tx.id));

    rightDiv.append(amountSpan, delBtn);
    li.append(infoDiv, rightDiv);
    listEl.appendChild(li);
  });
}

function addTransaction(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value;

  if (!title || Number.isNaN(amount) || amount <= 0) {
    return;
  }

  const transaction = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title,
    amount,
    type,
    category,
    date: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  };

  transactions.unshift(transaction);
  saveTransactions();
  updateSummary();
  renderTransactions();

  form.reset();
  titleInput.focus();
}

function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  updateSummary();
  renderTransactions();
}

function clearAllTransactions() {
  if (transactions.length === 0) return;
  transactions = [];
  saveTransactions();
  updateSummary();
  renderTransactions();
}

form.addEventListener("submit", addTransaction);
filterSelect.addEventListener("change", renderTransactions);
clearAllBtn.addEventListener("click", clearAllTransactions);

updateSummary();
renderTransactions();
