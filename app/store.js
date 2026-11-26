/* HouseLedger store — one job: own the household's figures.
   Loads the seed from data.js on first visit, keeps every later change in
   localStorage, and answers every total the views need. No network. */
'use strict';

const STORE_KEY = 'houseledger-v1';

const Store = (() => {
  let state = null;

  function freshState() {
    return JSON.parse(JSON.stringify(SEED));
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.transactions)) return parsed;
      }
    } catch (e) { /* corrupted storage: fall through to the seed */ }
    return freshState();
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
  }

  function init() { state = load(); }

  function reset() {
    state = freshState();
    save();
  }

  /* --- lookups --- */
  function category(id) {
    return state.categories.find(c => c.id === id) || { id, name: id, color: '#8c8c8c' };
  }

  function budgetFor(catId) {
    const b = state.budgets.find(x => x.category === catId);
    return b ? b.amount : 0;
  }

  /* --- totals --- */
  function income() {
    return state.transactions.reduce((s, t) => s + (t.amount > 0 ? t.amount : 0), 0);
  }

  function spending() {
    return state.transactions.reduce((s, t) => s + (t.amount < 0 ? -t.amount : 0), 0);
  }

  function spentInCategory(catId) {
    return state.transactions.reduce((s, t) => s + (t.category === catId && t.amount < 0 ? -t.amount : 0), 0);
  }

  function spendingByCategory() {
    const out = {};
    state.categories.forEach(c => { out[c.id] = spentInCategory(c.id); });
    return out;
  }

  function balance() { return income() - spending(); }

  function totalBudget() {
    return state.budgets.reduce((s, b) => s + b.amount, 0);
  }

  function unpaidBillsTotal() {
    return state.bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0);
  }

  function totalSaved() {
    return state.goals.reduce((s, g) => s + g.saved, 0);
  }

  /* --- mutations --- */
  function nextTxId() {
    return 't' + Date.now().toString(36) + Math.floor(Math.random() * 1000);
  }

  function addTransaction(tx) {
    const rec = {
      id: nextTxId(),
      date: tx.date,
      merchant: tx.merchant.trim(),
      category: tx.category,
      amount: tx.amount,
      note: (tx.note || '').trim(),
    };
    state.transactions.unshift(rec);
    sortTransactions();
    save();
    return rec;
  }

  function updateTransaction(id, patch) {
    const rec = state.transactions.find(t => t.id === id);
    if (!rec) return null;
    Object.assign(rec, patch);
    sortTransactions();
    save();
    return rec;
  }

  function deleteTransaction(id) {
    state.transactions = state.transactions.filter(t => t.id !== id);
    save();
  }

  function sortTransactions() {
    state.transactions.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }

  function setBudget(catId, amount) {
    const b = state.budgets.find(x => x.category === catId);
    if (b) b.amount = amount;
    else state.budgets.push({ category: catId, amount });
    save();
  }

  function addFunds(goalId, amount) {
    const g = state.goals.find(x => x.id === goalId);
    if (!g) return null;
    g.saved = Math.max(0, +(g.saved + amount).toFixed(2));
    save();
    return g;
  }

  function toggleBill(billId) {
    const b = state.bills.find(x => x.id === billId);
    if (!b) return null;
    b.paid = !b.paid;
    save();
    return b;
  }

  /* --- formatting --- */
  const moneyFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  function money(n) { return moneyFmt.format(n); }
  function moneySigned(n) { return (n < 0 ? '−' : '+') + moneyFmt.format(Math.abs(n)); }

  function prettyDate(iso) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getState() { return state; }

  return {
    init, reset, save, getState,
    category, budgetFor,
    income, spending, balance, spentInCategory, spendingByCategory,
    totalBudget, unpaidBillsTotal, totalSaved,
    addTransaction, updateTransaction, deleteTransaction,
    setBudget, addFunds, toggleBill,
    money, moneySigned, prettyDate,
  };
})();
