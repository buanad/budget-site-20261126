/* HouseLedger views — one job: turn the store's figures into HTML.
   Each render* function builds one page; main.js picks which one to show. */
'use strict';

const Views = (() => {
  const state = { txFilter: { q: '', category: 'all', kind: 'all' }, editingTx: null };

  function header(title, sub) {
    return '<div class="page-head"><h1>' + title + '</h1><p>' + sub + '</p></div>';
  }

  function statCard(label, value, note, tone) {
    return '<div class="stat ' + (tone || '') + '"><span class="stat-label">' + label +
      '</span><span class="stat-value">' + value + '</span><span class="stat-note">' + note + '</span></div>';
  }

  /* ---------- Dashboard ---------- */
  function dashboard() {
    const income = Store.income(), spent = Store.spending(), bal = Store.balance();
    const byCat = Store.spendingByCategory();
    const slices = Store.getState().categories
      .map(c => ({ label: c.name, value: byCat[c.id] || 0, color: c.color }))
      .filter(s => s.value > 0)
      .sort((a, b) => b.value - a.value);
    const topSlices = slices.slice(0, 7);
    const other = slices.slice(7).reduce((s, x) => s + x.value, 0);
    if (other > 0) topSlices.push({ label: 'Other', value: other, color: '#b0a08a' });

    const budgetRows = Store.getState().budgets.map(b => {
      const spentIn = Store.spentInCategory(b.category);
      const pct = b.amount ? 100 * spentIn / b.amount : 0;
      const left = b.amount - spentIn;
      return '<li><span class="mini-label">' + Charts.esc(Store.category(b.category).name) + '</span>' +
        Charts.progressBar(pct, pct > 100 ? 'over' : pct > 85 ? 'warn' : '') +
        '<span class="mini-vals">' + Store.money(spentIn) + ' of ' + Store.money(b.amount) +
        ' · ' + (left >= 0 ? Store.money(left) + ' left' : Store.money(-left) + ' over') + '</span></li>';
    }).join('');

    const upcoming = Store.getState().bills.filter(b => !b.paid).slice(0, 3).map(b =>
      '<li><span>' + Charts.esc(b.name) + '</span><span><b>' + Store.money(b.amount) +
      '</b> · due ' + Store.prettyDate(b.due) + '</span></li>').join('');

    const recent = Store.getState().transactions.slice(0, 6).map(txRow).join('');

    return header('November at a glance', 'Income, spending and what is left — for the Alvarez household, November 2026.') +
      '<section class="stats">' +
      statCard('Income so far', Store.money(income), 'Salaries + freelance', 'good') +
      statCard('Spent so far', Store.money(spent), 'of ' + Store.money(Store.totalBudget()) + ' budgeted', spent > Store.totalBudget() ? 'bad' : '') +
      statCard('Left to spend', Store.money(bal), bal >= 0 ? 'On track for the month' : 'Over budget this month', bal >= 0 ? 'good' : 'bad') +
      statCard('Saved in goals', Store.money(Store.totalSaved()), 'Across ' + Store.getState().goals.length + ' goals', 'good') +
      '</section>' +
      '<section class="grid-2">' +
      '<article class="card"><h2>Where the money went</h2>' + Charts.donut(topSlices, 180) +
      '<p class="card-link"><a href="#/reports">See the full breakdown →</a></p></article>' +
      '<article class="card"><h2>Budget progress</h2><ul class="mini-list">' + budgetRows + '</ul>' +
      '<p class="card-link"><a href="#/budgets">Adjust budgets →</a></p></article>' +
      '</section>' +
      '<section class="grid-2">' +
      '<article class="card"><h2>Bills still to pay</h2><ul class="bill-mini">' + upcoming + '</ul>' +
      '<p class="card-note">' + Store.money(Store.unpaidBillsTotal()) + ' due before the month ends.</p>' +
      '<p class="card-link"><a href="#/bills">All bills →</a></p></article>' +
      '<article class="card"><h2>Recent spending</h2><ul class="tx-list">' + recent + '</ul>' +
      '<p class="card-link"><a href="#/transactions">All transactions →</a></p></article>' +
      '</section>' +
      '<p class="reset-line"><button class="btn ghost" data-action="reset-demo">Reset demo data</button> ' +
      '<span>Restores the original November figures. Anything you add, edit or delete is saved in this browser.</span></p>';
  }

  /* ---------- Transactions ---------- */
  function txRow(t) {
    const cat = Store.category(t.category);
    return '<li class="tx-row"><span class="tx-date">' + Store.prettyDate(t.date) + '</span>' +
      '<span class="tx-main"><b>' + Charts.esc(t.merchant) + '</b>' +
      '<span class="tx-note">' + Charts.esc(t.note || '') + '</span></span>' +
      '<span class="tx-cat" style="--cat:' + cat.color + '">' + Charts.esc(cat.name) + '</span>' +
      '<span class="tx-amount ' + (t.amount < 0 ? 'out' : 'in') + '">' + Store.moneySigned(t.amount) + '</span>' +
      '<span class="tx-actions"><button class="btn small" data-action="edit-tx" data-id="' + t.id + '">Edit</button> ' +
      '<button class="btn small danger" data-action="delete-tx" data-id="' + t.id + '">Delete</button></span></li>';
  }

  function transactions() {
    const f = state.txFilter;
    const cats = Store.getState().categories;
    let list = Store.getState().transactions.filter(t => {
      if (f.category !== 'all' && t.category !== f.category) return false;
      if (f.kind === 'income' && t.amount <= 0) return false;
      if (f.kind === 'spending' && t.amount >= 0) return false;
      if (f.q) {
        const hay = (t.merchant + ' ' + (t.note || '') + ' ' + Store.category(t.category).name).toLowerCase();
        if (!hay.includes(f.q.toLowerCase())) return false;
      }
      return true;
    });
    const shownIncome = list.reduce((s, t) => s + (t.amount > 0 ? t.amount : 0), 0);
    const shownSpent = list.reduce((s, t) => s + (t.amount < 0 ? -t.amount : 0), 0);
    const editing = state.editingTx ? Store.getState().transactions.find(t => t.id === state.editingTx) : null;

    const catOptions = cats.map(c =>
      '<option value="' + c.id + '"' + (f.category === c.id ? ' selected' : '') + '>' + Charts.esc(c.name) + '</option>').join('');

    return header('Transactions', Store.getState().transactions.length + ' entries in November 2026. Search, filter, add, edit or delete — every change updates the totals everywhere.') +
      '<section class="card"><form class="tx-form" data-form="tx" id="tx-form">' +
      '<h2>' + (editing ? 'Edit transaction' : 'Add a transaction') + '</h2>' +
      '<div class="form-grid">' +
      '<label>Date<input type="date" name="date" required value="' + (editing ? editing.date : '2026-11-26') + '"></label>' +
      '<label>Merchant / description<input type="text" name="merchant" required maxlength="80" placeholder="e.g. GreenMart Supermarket" value="' + (editing ? Charts.esc(editing.merchant) : '') + '"></label>' +
      '<label>Category<select name="category">' + catOptions + '</select></label>' +
      '<label>Amount (USD)<input type="number" name="amount" step="0.01" required placeholder="-42.50 for spending" value="' + (editing ? editing.amount : '') + '"></label>' +
      '<label>Note<input type="text" name="note" maxlength="120" placeholder="Optional note" value="' + (editing ? Charts.esc(editing.note || '') : '') + '"></label>' +
      '</div>' +
      '<p class="form-hint">Enter spending as a negative number (for example −42.50) and income as a positive number.</p>' +
      '<div class="form-actions"><button class="btn primary" type="submit">' + (editing ? 'Save changes' : 'Add transaction') + '</button>' +
      (editing ? ' <button class="btn ghost" type="button" data-action="cancel-edit">Cancel</button>' : '') + '</div>' +
      '<input type="hidden" name="txid" value="' + (editing ? editing.id : '') + '">' +
      '</form></section>' +
      '<section class="card"><div class="filters">' +
      '<label>Search <input type="search" id="tx-search" placeholder="Merchant, note or category…" value="' + Charts.esc(f.q) + '"></label>' +
      '<label>Category <select id="tx-cat"><option value="all">All categories</option>' + catOptions + '</select></label>' +
      '<label>Type <select id="tx-kind"><option value="all"' + (f.kind === 'all' ? ' selected' : '') + '>All</option>' +
      '<option value="spending"' + (f.kind === 'spending' ? ' selected' : '') + '>Spending</option>' +
      '<option value="income"' + (f.kind === 'income' ? ' selected' : '') + '>Income</option></select></label>' +
      '<span class="filter-summary">' + list.length + ' shown · ' + Store.money(shownSpent) + ' spent · ' + Store.money(shownIncome) + ' in</span>' +
      '</div>' +
      (list.length ? '<ul class="tx-list full">' + list.map(txRow).join('') + '</ul>'
        : '<p class="empty">No transactions match this filter. Try clearing the search or choosing another category.</p>') +
      '</section>';
  }

  /* ---------- Budgets ---------- */
  function budgets() {
    const rows = Store.getState().budgets.map(b => {
      const cat = Store.category(b.category);
      const spent = Store.spentInCategory(b.category);
      const pct = b.amount ? 100 * spent / b.amount : 0;
      const left = b.amount - spent;
      const status = pct > 100 ? '<span class="badge over">Over budget</span>'
        : pct > 85 ? '<span class="badge warn">Almost there</span>'
        : '<span class="badge ok">On track</span>';
      return '<article class="card budget-card"><div class="budget-head"><span class="cat-dot" style="background:' + cat.color + '"></span>' +
        '<h2>' + Charts.esc(cat.name) + '</h2>' + status + '</div>' +
        Charts.progressBar(pct, pct > 100 ? 'over' : pct > 85 ? 'warn' : '') +
        '<p class="budget-figures"><b>' + Store.money(spent) + '</b> spent of <b>' + Store.money(b.amount) + '</b> budgeted</p>' +
        '<p class="budget-left">' + (left >= 0 ? Store.money(left) + ' left for the rest of November.' : Store.money(-left) + ' over budget — consider moving money from another category.') + '</p>' +
        '<form class="budget-form" data-form="budget" data-cat="' + b.category + '">' +
        '<label>Monthly budget <input type="number" name="amount" min="0" step="5" value="' + b.amount + '" required> USD</label>' +
        '<button class="btn small primary" type="submit">Save</button></form></article>';
    }).join('');
    const totalSpent = Store.spending();
    return header('Budgets', 'One monthly target per category. Change any amount and the progress bars, the Dashboard and the Reports update at once.') +
      '<section class="stats">' +
      statCard('Total budgeted', Store.money(Store.totalBudget()), 'Across ' + Store.getState().budgets.length + ' categories', '') +
      statCard('Total spent', Store.money(totalSpent), 'So far in November', totalSpent > Store.totalBudget() ? 'bad' : '') +
      statCard('Still available', Store.money(Store.totalBudget() - totalSpent), 'Budget minus spending', Store.totalBudget() - totalSpent >= 0 ? 'good' : 'bad') +
      '</section>' +
      '<section class="grid-2 budgets-grid">' + rows + '</section>' +
      '<p class="card-note">Tip: a household that keeps housing, groceries and transport under 65% of income has room for savings and surprises. This household is at ' +
      Math.round(100 * (Store.spentInCategory('housing') + Store.spentInCategory('groceries') + Store.spentInCategory('transport')) / Math.max(1, Store.income())) +
      '% of its November income.</p>';
  }

  /* ---------- Savings goals ---------- */
  function goals() {
    const cards = Store.getState().goals.map(g => {
      const pct = g.target ? 100 * g.saved / g.target : 0;
      const remaining = Math.max(0, g.target - g.saved);
      return '<article class="card goal-card"><h2>' + Charts.esc(g.name) + '</h2>' +
        '<p class="goal-note">' + Charts.esc(g.note) + '</p>' +
        Charts.progressBar(pct) +
        '<p class="goal-figures"><b>' + Store.money(g.saved) + '</b> of <b>' + Store.money(g.target) + '</b> · ' + Math.round(pct) + '%</p>' +
        '<p class="goal-left">' + (remaining > 0 ? Store.money(remaining) + ' to go.' : 'Goal reached — well done!') + '</p>' +
        '<form class="goal-form" data-form="goal" data-goal="' + g.id + '">' +
        '<label>Add funds <input type="number" name="amount" min="0" step="5" placeholder="50" required> USD</label>' +
        '<button class="btn small primary" type="submit">Add to goal</button></form></article>';
    }).join('');
    return header('Savings goals', 'Three pots the family is filling. Add money to a goal and watch its bar move — the Dashboard total moves with it.') +
      '<section class="stats">' +
      statCard('Saved so far', Store.money(Store.totalSaved()), 'Across ' + Store.getState().goals.length + ' goals', 'good') +
      statCard('Still to save', Store.money(Store.getState().goals.reduce((s, g) => s + Math.max(0, g.target - g.saved), 0)), 'To reach every target', '') +
      statCard('This month', Store.money(Store.spentInCategory('savings')), 'Moved to savings in November', 'good') +
      '</section>' +
      '<section class="grid-2 goals-grid">' + cards + '</section>' +
      '<section class="card"><h2>How the family saves</h2><p>On the 1st of every month, $500 moves to the emergency fund automatically — it is the first “bill” the household pays, before anything else. Whatever is left at the end of the month is split between the vacation and the car. A goal is only “done” when the bar hits 100%.</p></section>';
  }

  /* ---------- Bills ---------- */
  function bills() {
    const unpaid = Store.getState().bills.filter(b => !b.paid);
    const paid = Store.getState().bills.filter(b => b.paid);
    const row = b => '<li class="bill-row' + (b.paid ? ' is-paid' : '') + '">' +
      '<span class="bill-check"><button class="btn small' + (b.paid ? '' : ' primary') + '" data-action="toggle-bill" data-id="' + b.id + '">' +
      (b.paid ? '✓ Paid' : 'Mark paid') + '</button></span>' +
      '<span class="bill-main"><b>' + Charts.esc(b.name) + '</b><span class="bill-note">' + Charts.esc(b.recurring) + ' · due ' + Store.prettyDate(b.due) + '</span></span>' +
      '<span class="bill-amount">' + Store.money(b.amount) + '</span></li>';
    return header('Bills & recurring payments', 'Every regular bill for November, with its due date. Tick one off when it is paid — the Dashboard and the totals update.') +
      '<section class="stats">' +
      statCard('Still to pay', Store.money(Store.unpaidBillsTotal()), unpaid.length + ' bill' + (unpaid.length === 1 ? '' : 's') + ' left this month', unpaid.length ? 'warn' : 'good') +
      statCard('Already paid', Store.money(paid.reduce((s, b) => s + b.amount, 0)), paid.length + ' of ' + Store.getState().bills.length + ' bills', 'good') +
      statCard('Next due', unpaid.length ? Store.money(unpaid[0].amount) : '—', unpaid.length ? Charts.esc(unpaid[0].name) + ' · ' + Store.prettyDate(unpaid[0].due) : 'All bills paid', '') +
      '</section>' +
      '<section class="card"><h2>Upcoming</h2>' +
      (unpaid.length ? '<ul class="bill-list">' + unpaid.map(row).join('') + '</ul>' : '<p class="empty">Every bill for November is paid. Nice work.</p>') +
      '</section>' +
      '<section class="card"><h2>Paid this month</h2>' +
      (paid.length ? '<ul class="bill-list">' + paid.map(row).join('') + '</ul>' : '<p class="empty">Nothing paid yet.</p>') +
      '</section>' +
      '<section class="card"><h2>Add a bill</h2><form class="bill-form" data-form="bill"><div class="form-grid">' +
      '<label>Bill name<input type="text" name="name" required maxlength="80" placeholder="e.g. Car insurance — SafeDrive"></label>' +
      '<label>Amount (USD)<input type="number" name="amount" min="0.01" step="0.01" required placeholder="148.00"></label>' +
      '<label>Due date<input type="date" name="due" required value="2026-11-30"></label>' +
      '</div><div class="form-actions"><button class="btn primary" type="submit">Add bill</button></div></form></section>';
  }

  /* ---------- Reports ---------- */
  function reports() {
    const byCat = Store.spendingByCategory();
    const last = Store.getState().lastMonth.spendingByCategory;
    const slices = Store.getState().categories
      .map(c => ({ label: c.name, value: byCat[c.id] || 0, color: c.color }))
      .filter(s => s.value > 0)
      .sort((a, b) => b.value - a.value);
    const cmpRows = Store.getState().categories
      .map(c => ({ label: c.name, thisMonth: byCat[c.id] || 0, lastMonth: last[c.id] || 0, color: c.color }))
      .filter(r => r.thisMonth > 0 || r.lastMonth > 0)
      .sort((a, b) => b.thisMonth - a.thisMonth);

    const daily = [];
    for (let d = 1; d <= 26; d++) {
      const iso = '2026-11-' + String(d).padStart(2, '0');
      daily.push({ day: d, value: Store.getState().transactions
        .filter(t => t.date === iso && t.amount < 0).reduce((s, t) => s - t.amount, 0) });
    }
    const topMerchants = {};
    Store.getState().transactions.forEach(t => {
      if (t.amount >= 0) return;
      topMerchants[t.merchant] = (topMerchants[t.merchant] || 0) - t.amount;
    });
    const topList = Object.entries(topMerchants).sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([m, v], i) => '<li><span class="rank">' + (i + 1) + '</span><span>' + Charts.esc(m) + '</span><b>' + Store.money(v) + '</b></li>').join('');

    const lastTotal = Object.values(last).reduce((s, v) => s + v, 0);
    const diff = Store.spending() - lastTotal;
    const insight = diff <= 0
      ? 'The household spent ' + Store.money(-diff) + ' less than in October. Dining out fell the most — the anniversary lunch was the only big dinner out.'
      : 'The household spent ' + Store.money(diff) + ' more than in October. Check the categories that grew before the month ends.';

    return header('Reports & insights', 'Where November stands against October, day by day, and who got the most of the money.') +
      '<section class="stats">' +
      statCard('November spending', Store.money(Store.spending()), '1–26 November', '') +
      statCard('October spending', Store.money(lastTotal), 'Full month', '') +
      statCard('Change', (diff <= 0 ? '−' : '+') + Store.money(Math.abs(diff)), diff <= 0 ? 'Less than October — good' : 'More than October', diff <= 0 ? 'good' : 'bad') +
      '</section>' +
      '<section class="grid-2">' +
      '<article class="card"><h2>Spending by category</h2>' + Charts.donut(slices.slice(0, 8), 180) + '</article>' +
      '<article class="card"><h2>Top merchants</h2><ul class="rank-list">' + topList + '</ul>' +
      '<p class="card-note">GreenMart is the weekly supermarket — six shops so far this month, averaging ' +
      Store.money((topMerchants['GreenMart Supermarket'] || 0) / 6) + ' each.</p></article>' +
      '</section>' +
      '<section class="card"><h2>Daily spending — November</h2>' + Charts.dailyBars(daily) +
      '<p class="card-note">The $1,450 rent spike on 1 November and the $500 savings transfer are the month’s two tallest days. Most other days stay under $150.</p></section>' +
      '<section class="card"><h2>November vs October, by category</h2>' + Charts.compareBars(cmpRows) + '</section>' +
      '<section class="card"><h2>What this means</h2><p>' + insight + ' Groceries are the steadiest cost — six weekly shops between $86 and $113. Housing is fixed at $1,450. The one number to watch is dining out: at ' +
      Store.money(Store.spentInCategory('dining')) + ' of a ' + Store.money(Store.budgetFor('dining')) +
      ' budget with four days left, one more dinner out tips it over.</p></section>';
  }

  function notFound() {
    return header('Page not found', 'That page does not exist in HouseLedger.') +
      '<section class="card"><p>Try one of the sections above — the Dashboard, Transactions, Budgets, Savings goals, Bills or Reports.</p>' +
      '<p><a class="btn primary" href="#/">Back to the Dashboard</a></p></section>';
  }

  return {
    state, dashboard, transactions, budgets, goals, bills, reports, notFound,
  };
})();
