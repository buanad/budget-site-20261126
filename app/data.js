/* HouseLedger seed data — the Alvarez household, November 2026.
   One job: hold the starting figures the site shows before the household
   edits anything. The store (store.js) owns all later changes. */
'use strict';

const SEED = {
  household: 'Alvarez household',
  month: '2026-11',
  monthLabel: 'November 2026',
  members: ['Maya', 'Jordan', 'Sofia', 'Leo'],

  categories: [
    { id: 'housing',       name: 'Housing',       color: '#1f5c46' },
    { id: 'groceries',    name: 'Groceries',     color: '#3f8f6b' },
    { id: 'transport',    name: 'Transport',     color: '#d9a441' },
    { id: 'utilities',    name: 'Utilities',     color: '#5b7fa6' },
    { id: 'dining',       name: 'Dining out',    color: '#c96f4a' },
    { id: 'entertainment',name: 'Entertainment', color: '#8a6fb8' },
    { id: 'health',       name: 'Health',        color: '#4a9aa8' },
    { id: 'clothing',     name: 'Clothing',      color: '#a8587d' },
    { id: 'kids',         name: 'Kids',          color: '#7a9e4b' },
    { id: 'subscriptions',name: 'Subscriptions', color: '#8c8c8c' },
    { id: 'savings',      name: 'Savings',       color: '#2e7d6b' },
    { id: 'other',        name: 'Other',         color: '#b0a08a' },
  ],

  /* Monthly budget targets, November 2026. */
  budgets: [
    { category: 'housing',       amount: 1450 },
    { category: 'groceries',    amount: 620 },
    { category: 'transport',    amount: 310 },
    { category: 'utilities',    amount: 240 },
    { category: 'dining',       amount: 220 },
    { category: 'entertainment',amount: 150 },
    { category: 'health',       amount: 180 },
    { category: 'clothing',     amount: 120 },
    { category: 'kids',         amount: 200 },
    { category: 'subscriptions',amount: 85 },
    { category: 'savings',      amount: 500 },
  ],

  /* Every transaction of the month so far, newest first. Amounts are USD;
     income is positive, spending is negative. */
  transactions: [
    { id: 't01', date: '2026-11-26', merchant: 'GreenMart Supermarket', category: 'groceries', amount: -86.40, note: 'Weekly shop' },
    { id: 't02', date: '2026-11-25', merchant: 'City Bus Pass', category: 'transport', amount: -48.00, note: 'Monthly pass, Jordan' },
    { id: 't03', date: '2026-11-25', merchant: 'Bright Smiles Dentist', category: 'health', amount: -120.00, note: 'Sofia check-up' },
    { id: 't04', date: '2026-11-24', merchant: 'Noodle House', category: 'dining', amount: -42.75, note: 'Family dinner' },
    { id: 't05', date: '2026-11-24', merchant: 'Shell Station', category: 'transport', amount: -38.20, note: 'Fuel' },
    { id: 't06', date: '2026-11-23', merchant: 'Kinder Books', category: 'kids', amount: -31.50, note: 'Leo school books' },
    { id: 't07', date: '2026-11-22', merchant: 'GreenMart Supermarket', category: 'groceries', amount: -112.85, note: 'Weekly shop' },
    { id: 't08', date: '2026-11-22', merchant: 'Cinema City', category: 'entertainment', amount: -36.00, note: 'Movie night, 4 tickets' },
    { id: 't09', date: '2026-11-21', merchant: 'Fresh Pharmacy', category: 'health', amount: -24.60, note: 'Vitamins' },
    { id: 't10', date: '2026-11-21', merchant: 'Thread & Co', category: 'clothing', amount: -58.90, note: 'Winter jackets for kids' },
    { id: 't11', date: '2026-11-20', merchant: 'GreenMart Supermarket', category: 'groceries', amount: -94.10, note: 'Weekly shop' },
    { id: 't12', date: '2026-11-20', merchant: 'Maya Alvarez — Salary', category: 'other', amount: 2900.00, note: 'Payday, second half' },
    { id: 't13', date: '2026-11-19', merchant: 'Pizza Corner', category: 'dining', amount: -28.40, note: 'Friday pizza' },
    { id: 't14', date: '2026-11-19', merchant: 'Riverdale Power', category: 'utilities', amount: -132.00, note: 'Electricity bill' },
    { id: 't15', date: '2026-11-18', merchant: 'Shell Station', category: 'transport', amount: -41.55, note: 'Fuel' },
    { id: 't16', date: '2026-11-17', merchant: 'Kids Art Club', category: 'kids', amount: -45.00, note: 'Sofia art class' },
    { id: 't17', date: '2026-11-16', merchant: 'GreenMart Supermarket', category: 'groceries', amount: -101.30, note: 'Weekly shop' },
    { id: 't18', date: '2026-11-15', merchant: 'StreamHub', category: 'subscriptions', amount: -15.99, note: 'Monthly plan' },
    { id: 't19', date: '2026-11-15', merchant: 'City Water Works', category: 'utilities', amount: -64.25, note: 'Water bill' },
    { id: 't20', date: '2026-11-14', merchant: 'Bistro Verde', category: 'dining', amount: -54.80, note: 'Anniversary lunch' },
    { id: 't21', date: '2026-11-13', merchant: 'Jordan Alvarez — Salary', category: 'other', amount: 1950.00, note: 'Payday' },
    { id: 't22', date: '2026-11-13', merchant: 'Toy Barn', category: 'kids', amount: -27.99, note: 'Leo birthday gift' },
    { id: 't23', date: '2026-11-12', merchant: 'GreenMart Supermarket', category: 'groceries', amount: -88.75, note: 'Weekly shop' },
    { id: 't24', date: '2026-11-12', merchant: 'FitZone Gym', category: 'health', amount: -45.00, note: 'Monthly membership' },
    { id: 't25', date: '2026-11-11', merchant: 'BookNook', category: 'entertainment', amount: -19.95, note: 'Two paperbacks' },
    { id: 't26', date: '2026-11-10', merchant: 'Shell Station', category: 'transport', amount: -36.80, note: 'Fuel' },
    { id: 't27', date: '2026-11-09', merchant: 'GreenMart Supermarket', category: 'groceries', amount: -97.60, note: 'Weekly shop' },
    { id: 't28', date: '2026-11-09', merchant: 'MusicStream', category: 'subscriptions', amount: -9.99, note: 'Family plan' },
    { id: 't29', date: '2026-11-08', merchant: 'Sunday Market', category: 'groceries', amount: -42.30, note: 'Fruit and vegetables' },
    { id: 't30', date: '2026-11-07', merchant: 'Cafe Aroma', category: 'dining', amount: -18.50, note: 'Coffee with friends' },
    { id: 't31', date: '2026-11-07', merchant: 'Pharmacy Plus', category: 'health', amount: -18.40, note: 'Cold medicine' },
    { id: 't32', date: '2026-11-06', merchant: 'Jordan Alvarez — Freelance', category: 'other', amount: 320.00, note: 'Weekend design job' },
    { id: 't33', date: '2026-11-05', merchant: 'GreenMart Supermarket', category: 'groceries', amount: -105.45, note: 'Weekly shop' },
    { id: 't34', date: '2026-11-05', merchant: 'Bus Fare', category: 'transport', amount: -12.50, note: 'Top-up' },
    { id: 't35', date: '2026-11-04', merchant: 'Kids Soccer Club', category: 'kids', amount: -60.00, note: 'Leo term fee' },
    { id: 't36', date: '2026-11-03', merchant: 'CloudDrive', category: 'subscriptions', amount: -6.99, note: 'Photo backup' },
    { id: 't37', date: '2026-11-02', merchant: 'GreenMart Supermarket', category: 'groceries', amount: -91.20, note: 'Weekly shop' },
    { id: 't38', date: '2026-11-02', merchant: 'Shell Station', category: 'transport', amount: -39.10, note: 'Fuel' },
    { id: 't39', date: '2026-11-01', merchant: 'Maple Court Apartments', category: 'housing', amount: -1450.00, note: 'November rent' },
    { id: 't40', date: '2026-11-01', merchant: 'NetLink Internet', category: 'utilities', amount: -79.00, note: 'Internet bill' },
    { id: 't41', date: '2026-11-01', merchant: 'Emergency Fund', category: 'savings', amount: -500.00, note: 'Monthly transfer' },
  ],

  /* Savings goals. saved is what is already in the pot. */
  goals: [
    { id: 'g1', name: 'Emergency fund', target: 6000, saved: 3850, note: 'Six months of essentials, kept in a separate account.' },
    { id: 'g2', name: 'Family vacation', target: 2400, saved: 1150, note: 'Beach trip in July 2027 — flights and a week by the sea.' },
    { id: 'g3', name: 'New car down payment', target: 5000, saved: 2200, note: 'Replace the old sedan before next winter.' },
  ],

  /* Recurring bills. paid means paid this month. */
  bills: [
    { id: 'b1', name: 'Rent — Maple Court Apartments', amount: 1450.00, due: '2026-11-01', paid: true, recurring: 'Monthly' },
    { id: 'b2', name: 'Electricity — Riverdale Power', amount: 132.00, due: '2026-11-12', paid: true, recurring: 'Monthly' },
    { id: 'b3', name: 'Internet — NetLink', amount: 79.00, due: '2026-11-15', paid: true, recurring: 'Monthly' },
    { id: 'b4', name: 'Water — City Water Works', amount: 64.25, due: '2026-11-18', paid: true, recurring: 'Monthly' },
    { id: 'b5', name: 'Mobile phones — CellOne', amount: 110.00, due: '2026-11-21', paid: true, recurring: 'Monthly' },
    { id: 'b6', name: 'Car insurance — SafeDrive', amount: 148.00, due: '2026-11-25', paid: false, recurring: 'Monthly' },
    { id: 'b7', name: 'Gym — FitZone', amount: 45.00, due: '2026-11-28', paid: false, recurring: 'Monthly' },
    { id: 'b8', name: 'Streaming bundle', amount: 34.97, due: '2026-11-30', paid: false, recurring: 'Monthly' },
  ],

  /* October 2026 totals, for the month-to-month comparison on Reports. */
  lastMonth: {
    label: 'October 2026',
    income: 4850.00,
    spendingByCategory: {
      housing: 1450, groceries: 588, transport: 296, utilities: 251,
      dining: 264, entertainment: 132, health: 154, clothing: 96,
      kids: 178, subscriptions: 84, savings: 500, other: 22,
    },
  },
};
