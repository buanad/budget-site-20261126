/* HouseLedger boot — one job: route between pages and wire up controls.
   Hash routes (#/, #/transactions, …) pick a view; one delegated click
   handler and one delegated submit handler run every control on the page. */
'use strict';

const App = (() => {
  const viewEl = document.getElementById('view');

  const routes = {
    '': Views.dashboard,
    'transactions': Views.transactions,
    'budgets': Views.budgets,
    'goals': Views.goals,
    'bills': Views.bills,
    'reports': Views.reports,
  };

  function currentRoute() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash.split('/')[0];
  }

  function render() {
    const route = currentRoute();
    const fn = routes[route] || Views.notFound;
    viewEl.innerHTML = fn();
    document.querySelectorAll('[data-nav]').forEach(a => {
      const key = a.getAttribute('data-nav');
      a.classList.toggle('active', (route === '' && key === 'dashboard') || key === route);
    });
    window.scrollTo(0, 0);
  }

  function rerenderKeepScroll() {
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
  }

  function toast(message) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function onClick(event) {
    const btn = event.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');

    if (action === 'delete-tx') {
      const rec = Store.getState().transactions.find(t => t.id === id);
      if (rec && window.confirm('Delete "' + rec.merchant + '" (' + Store.money(rec.amount) + ')?')) {
        Store.deleteTransaction(id);
        toast('Transaction deleted.');
        rerenderKeepScroll();
      }
    } else if (action === 'edit-tx') {
      Views.state.editingTx = id;
      render();
      const form = document.getElementById('tx-form');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (action === 'cancel-edit') {
      Views.state.editingTx = null;
      render();
    } else if (action === 'toggle-bill') {
      const bill = Store.toggleBill(id);
      if (bill) toast(bill.paid ? '"' + bill.name + '" marked paid.' : '"' + bill.name + '" marked unpaid.');
      rerenderKeepScroll();
    } else if (action === 'reset-demo') {
      if (window.confirm('Reset all figures to the original November demo data? Your changes will be lost.')) {
        Store.reset();
        Views.state.editingTx = null;
        Views.state.txFilter = { q: '', category: 'all', kind: 'all' };
        toast('Demo data restored.');
        render();
      }
    }
  }

  function onSubmit(event) {
    const form = event.target.closest('[data-form]');
    if (!form) return;
    event.preventDefault();
    const kind = form.getAttribute('data-form');
    const data = new FormData(form);

    if (kind === 'tx') {
      const amount = parseFloat(data.get('amount'));
      const merchant = String(data.get('merchant') || '').trim();
      const date = String(data.get('date') || '');
      if (!merchant || !date || !isFinite(amount) || amount === 0) {
        toast('Fill in a merchant, a date and a non-zero amount.');
        return;
      }
      const txid = String(data.get('txid') || '');
      const rec = {
        date, merchant,
        category: String(data.get('category') || 'other'),
        amount: Math.round(amount * 100) / 100,
        note: String(data.get('note') || ''),
      };
      if (txid) {
        Store.updateTransaction(txid, rec);
        Views.state.editingTx = null;
        toast('Transaction updated.');
      } else {
        Store.addTransaction(rec);
        toast('Transaction added.');
      }
      render();
    } else if (kind === 'budget') {
      const amount = parseFloat(data.get('amount'));
      if (!isFinite(amount) || amount < 0) { toast('Enter a budget of $0 or more.'); return; }
      Store.setBudget(form.getAttribute('data-cat'), Math.round(amount * 100) / 100);
      toast('Budget saved.');
      rerenderKeepScroll();
    } else if (kind === 'goal') {
      const amount = parseFloat(data.get('amount'));
      if (!isFinite(amount) || amount <= 0) { toast('Enter an amount above $0.'); return; }
      const goal = Store.addFunds(form.getAttribute('data-goal'), amount);
      toast(goal ? Store.money(amount) + ' added to ' + goal.name + '.' : 'Goal not found.');
      rerenderKeepScroll();
    } else if (kind === 'bill') {
      const amount = parseFloat(data.get('amount'));
      const name = String(data.get('name') || '').trim();
      const due = String(data.get('due') || '');
      if (!name || !due || !isFinite(amount) || amount <= 0) {
        toast('Fill in a bill name, an amount and a due date.');
        return;
      }
      const st = Store.getState();
      st.bills.push({
        id: 'b' + Date.now().toString(36), name,
        amount: Math.round(amount * 100) / 100, due, paid: false, recurring: 'One-off',
      });
      st.bills.sort((a, b) => (a.due < b.due ? -1 : 1));
      Store.save();
      toast('Bill added.');
      render();
    }
  }

  function onInput(event) {
    const el = event.target;
    if (el.id === 'tx-search') {
      Views.state.txFilter.q = el.value;
      const pos = el.selectionStart;
      const list = document.querySelector('.tx-list.full');
      if (list) {
        const keepScroll = window.scrollY;
        const html = Views.transactions();
        viewEl.innerHTML = html;
        const search = document.getElementById('tx-search');
        if (search) { search.focus(); search.setSelectionRange(pos, pos); }
        window.scrollTo(0, keepScroll);
      }
    } else if (el.id === 'tx-cat' || el.id === 'tx-kind') {
      Views.state.txFilter.category = document.getElementById('tx-cat').value;
      Views.state.txFilter.kind = document.getElementById('tx-kind').value;
      const keepScroll = window.scrollY;
      viewEl.innerHTML = Views.transactions();
      window.scrollTo(0, keepScroll);
    }
  }

  function init() {
    Store.init();
    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('input', onInput);
    window.addEventListener('hashchange', render);
    render();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
