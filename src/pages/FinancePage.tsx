import React, { useState, useMemo } from 'react';
import useStore from '../store/useStore';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  AlertTriangle,
  Calendar,
  Tag,
  CreditCard,
  Trash2,
  Filter,
} from 'lucide-react';
import { getPhoto } from '../utils/photoAssets';
import { EmptyState } from '../components/ui';
import ContextualTipBanner from '../components/ContextualTipBanner';
import type { TransactionType } from '../types';

export default function FinancePage() {
  const settings = useStore((s) => s.settings);
  const transactions = useStore((s) => s.financeTransactions);
  const budgets = useStore((s) => s.financeBudgets);
  const savingsGoals = useStore((s) => s.savingsGoals);
  const addTransaction = useStore((s) => s.addTransaction);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const saveBudget = useStore((s) => s.saveBudget);
  const addSavingsGoal = useStore((s) => s.addSavingsGoal);
  const depositSavings = useStore((s) => s.depositSavings);
  const deleteSavingsGoal = useStore((s) => s.deleteSavingsGoal);

  const currency = settings.currencySymbol || '$';
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Filter state
  const [timeframe, setTimeframe] = useState<'month' | 'week' | 'year' | 'all'>('month');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modals state
  const [showTxModal, setShowTxModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');

  // Form states
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Groceries');
  const [txDate, setTxDate] = useState(todayStr);
  const [txDesc, setTxDesc] = useState('');
  const [txMethod, setTxMethod] = useState<'Credit Card' | 'Debit Card' | 'Cash' | 'Bank Transfer' | 'UPI'>('Credit Card');

  const [budgetCat, setBudgetCat] = useState('Groceries');
  const [budgetLimit, setBudgetLimit] = useState('');

  const [savingsTitle, setSavingsTitle] = useState('');
  const [savingsTarget, setSavingsTarget] = useState('');
  const [savingsCurrent, setSavingsCurrent] = useState('0');
  const [savingsDate, setSavingsDate] = useState('');
  const [savingsCat, setSavingsCat] = useState('General');

  const categories = [
    'Housing',
    'Groceries',
    'Dining',
    'Tech & Tools',
    'Fitness',
    'Transport',
    'Education',
    'Entertainment',
    'Salary & Freelance',
    'Investments',
    'Other',
  ];

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;

      if (timeframe === 'month') {
        return t.date.startsWith(currentMonthStr);
      } else if (timeframe === 'week') {
        const txTime = new Date(t.date).getTime();
        const sevenDaysAgo = Date.now() - 7 * 86400000;
        return txTime >= sevenDaysAgo;
      } else if (timeframe === 'year') {
        return t.date.startsWith(todayStr.substring(0, 4));
      }
      return true;
    });
  }, [transactions, filterType, filterCategory, timeframe, currentMonthStr, todayStr]);

  // Summaries
  const { totalIncome, totalExpense, netSavings, savingsRate } = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    const net = income - expense;
    const rate = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;
    return { totalIncome: income, totalExpense: expense, netSavings: net, savingsRate: rate };
  }, [filteredTransactions]);

  // Category breakdown for charts
  const categorySpending = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredTransactions]);

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || isNaN(Number(txAmount))) return;
    await addTransaction({
      type: txType,
      amount: parseFloat(txAmount),
      category: txCategory,
      date: txDate,
      description: txDesc || txCategory,
      paymentMethod: txMethod,
    });
    setTxAmount('');
    setTxDesc('');
    setShowTxModal(false);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetLimit || isNaN(Number(budgetLimit))) return;
    await saveBudget({
      category: budgetCat,
      monthlyLimit: parseFloat(budgetLimit),
      month: currentMonthStr,
    });
    setBudgetLimit('');
    setShowBudgetModal(false);
  };

  const handleAddSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savingsTitle || !savingsTarget || isNaN(Number(savingsTarget))) return;
    await addSavingsGoal({
      title: savingsTitle,
      targetAmount: parseFloat(savingsTarget),
      currentAmount: parseFloat(savingsCurrent) || 0,
      targetDate: savingsDate || todayStr,
      category: savingsCat,
    });
    setSavingsTitle('');
    setSavingsTarget('');
    setShowSavingsModal(false);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId || !depositAmount || isNaN(Number(depositAmount))) return;
    await depositSavings(depositGoalId, parseFloat(depositAmount));
    setDepositGoalId(null);
    setDepositAmount('');
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. EDITORIAL PHOTOGRAPHIC HERO SECTION */}
      <section
        className="editorial-hero"
        style={{
          minHeight: '220px',
          backgroundImage: `url(${getPhoto('finance-hero').path})`,
          backgroundPosition: 'center 40%',
        }}
      >
        <div className="editorial-hero-scrim" />

        <div className="editorial-hero-content" style={{ padding: '24px 32px' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--accent-light)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '6px',
              }}
            >
              Capital &amp; Wealth Architecture
            </span>
            <h1
              className="font-editorial"
              style={{
                fontSize: '32px',
                fontWeight: 500,
                color: '#ffffff',
                margin: '0 0 6px 0',
                letterSpacing: '-0.02em',
              }}
            >
              Financial Velocity &amp; Cashflow
            </h1>
            <p style={{ margin: 0, fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '520px' }}>
              Local-first expense tracking, savings runways, and disciplined allocation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowBudgetModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ background: 'rgba(20, 19, 1, 0.85)', backdropFilter: 'blur(8px)', color: '#FFFFFF', borderColor: 'var(--border-default)' }}
            >
              Set Budget
            </button>
            <button
              onClick={() => setShowSavingsModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ background: 'rgba(20, 19, 1, 0.85)', backdropFilter: 'blur(8px)', color: '#FFFFFF', borderColor: 'var(--border-default)' }}
            >
              <PiggyBank size={13} /> Savings Goal
            </button>
            <button
              onClick={() => setShowTxModal(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={13} /> Add Transaction
            </button>
          </div>
        </div>
      </section>

      {/* Contextual Progressive Guidance Tip */}
      <ContextualTipBanner
        tipId="finance_intro"
        icon={DollarSign}
        title="Financial Velocity & Cash Runway"
        description="Track incoming cash flow, monthly recurring commitments, and compute your liquid emergency runway. All transaction data is stored locally in your browser."
        actionText="Log Transaction"
        onAction={() => setShowTxModal(true)}
        style={{ marginBottom: '14px' }}
      />

      {/* Sleek Financial Summary Strip (replaces bulky AI cards) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '8px 14px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-small)',
          boxShadow: 'var(--panel-shadow)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total Inflow:</span>
          <span style={{ fontWeight: 700, color: 'var(--status-success)' }} className="tabular">
            +{currency}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </span>

        <span style={{ color: 'var(--border-default)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total Outflow:</span>
          <span style={{ fontWeight: 700, color: 'var(--status-danger)' }} className="tabular">
            -{currency}{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </span>

        <span style={{ color: 'var(--border-default)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Net Cashflow:</span>
          <span style={{ fontWeight: 700, color: netSavings >= 0 ? 'var(--status-success)' : 'var(--status-danger)' }} className="tabular">
            {netSavings >= 0 ? '+' : '-'}{currency}{Math.abs(netSavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="tabular">
            ({savingsRate}% rate)
          </span>
        </span>

        <span style={{ color: 'var(--border-default)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Savings Targets:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {currency}{savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0).toLocaleString()} / {currency}{savingsGoals.reduce((acc, g) => acc + g.targetAmount, 0).toLocaleString()}
          </span>
        </span>
      </div>

      {/* Main Grid: Budgets & Analytics (Left) + Transactions (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', marginBottom: '32px' }}>
        
        {/* Left: Monthly Budgets & Spending Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Monthly Budgets Card */}
          <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)', boxShadow: 'var(--panel-shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="section-eyebrow">BUDGET LIMITS</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({currentMonthStr})</span>
              </div>
              <button onClick={() => setShowBudgetModal(true)} className="btn btn-ghost" style={{ fontSize: '11px', padding: '3px 8px', height: '26px' }}>
                + Add Cap
              </button>
            </div>

            {budgets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                No budgets configured for this month. Set spending caps to prevent budget overruns.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {budgets.map((b) => {
                  const spent = transactions
                    .filter((t) => t.type === 'expense' && t.category === b.category && t.date.startsWith(currentMonthStr))
                    .reduce((acc, t) => acc + t.amount, 0);
                  const percent = Math.min(100, Math.round((spent / b.monthlyLimit) * 100));
                  const isWarning = percent >= 80 && percent < 100;
                  const isExceeded = spent > b.monthlyLimit;

                  return (
                    <div key={b.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {b.category}
                          {isExceeded && <span title="Budget Exceeded!"><AlertTriangle size={13} color="var(--status-danger)" /></span>}
                          {isWarning && <span title="Approaching Limit!"><AlertTriangle size={13} color="var(--status-warning)" /></span>}
                        </span>
                        <span style={{ color: isExceeded ? 'var(--status-danger)' : isWarning ? 'var(--status-warning)' : 'var(--text-secondary)' }} className="tabular">
                          {currency}{spent.toFixed(0)} / {currency}{b.monthlyLimit.toFixed(0)} <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({percent}%)</span>
                        </span>
                      </div>
                      <div className="progress-hairline">
                        <div
                          className="progress-hairline-fill"
                          style={{
                            width: `${percent}%`,
                            background: isExceeded ? 'var(--status-danger)' : isWarning ? 'var(--status-warning)' : 'var(--accent)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Spending Breakdown */}
          <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)', boxShadow: 'var(--panel-shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="section-eyebrow">EXPENSE DISTRIBUTION</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="tabular">
                Total: {currency}{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </span>
            </div>

            {categorySpending.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                No expenses logged in this timeframe.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categorySpending.map(([cat, amt]) => {
                  const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
                  return (
                    <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{cat}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular">
                          {currency}{amt.toFixed(0)} <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 400 }}>({pct}%)</span>
                        </span>
                      </div>
                      <div className="progress-hairline">
                        <div className="progress-hairline-fill" style={{ width: `${pct}%`, background: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Savings Goals Cards */}
          <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)', boxShadow: 'var(--panel-shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="section-eyebrow">SAVINGS TARGETS</span>
              <button onClick={() => setShowSavingsModal(true)} className="btn btn-ghost" style={{ fontSize: '11px', padding: '3px 8px', height: '26px' }}>
                + Add Target
              </button>
            </div>

            {savingsGoals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                No savings targets set yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {savingsGoals.map((g) => {
                  const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                  return (
                    <div
                      key={g.id}
                      style={{
                        padding: '12px 14px',
                        background: 'var(--bg-subtle)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{g.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }} className="tabular">
                            Target: {currency}{g.targetAmount.toLocaleString()} · Due: {g.targetDate || 'Ongoing'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => setDepositGoalId(g.id)}
                            className="btn btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '11px', height: '24px' }}
                          >
                            + Deposit
                          </button>
                          <button
                            onClick={() => deleteSavingsGoal(g.id)}
                            className="btn btn-ghost"
                            style={{ padding: '3px 6px', color: 'var(--text-muted)', height: '24px' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="progress-hairline" style={{ margin: '8px 0 6px 0' }}>
                        <div
                          className="progress-hairline-fill"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 100 ? 'var(--status-success)' : 'var(--accent)',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span className="tabular">Accumulated: {currency}{g.currentAmount.toLocaleString()}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }} className="tabular">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Transaction Ledger & Filters */}
        <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)', boxShadow: 'var(--panel-shadow)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="section-eyebrow">TRANSACTION LEDGER</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="tabular">
                ({filteredTransactions.length} records)
              </span>
            </div>

            {/* Timeframe selector */}
            <div style={{ display: 'flex', gap: '3px', background: 'var(--bg-subtle)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
              {(['week', 'month', 'year', 'all'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  style={{
                    border: 'none',
                    background: timeframe === t ? 'var(--bg-elevated)' : 'transparent',
                    color: timeframe === t ? 'var(--text-primary)' : 'var(--text-muted)',
                    padding: '3px 9px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: timeframe === t ? 600 : 500,
                    cursor: 'pointer',
                    boxShadow: timeframe === t ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="input"
              style={{ fontSize: '11.5px', padding: '5px 10px', width: 'auto', height: '30px' }}
            >
              <option value="all">All Flow Types</option>
              <option value="expense">Expenses (-)</option>
              <option value="income">Inflow (+)</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input"
              style={{ fontSize: '11.5px', padding: '5px 10px', width: 'auto', height: '30px' }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Structured Transactions Table */}
          {filteredTransactions.length === 0 ? (
            <div style={{ padding: '36px 16px' }}>
              {transactions.length === 0 ? (
                <EmptyState
                  illustration="finance"
                  badge="Clean Slate"
                  title="Your financial picture starts here."
                  description="Log income, recurring bills, and daily expenses to calculate your net cash runway."
                  action={
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setFilterCategory('All');
                        setFilterType('all');
                        setShowTxModal(true);
                      }}
                    >
                      <Plus size={15} /> Add your first transaction
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  illustration="finance"
                  badge="Filtered View"
                  title="No matching transactions found"
                  description="No financial records match your selected category or type filter."
                  action={
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setFilterCategory('All');
                        setFilterType('all');
                      }}
                    >
                      Clear filters
                    </button>
                  }
                  secondaryAction={
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowTxModal(true)}
                    >
                      <Plus size={15} /> Log Transaction
                    </button>
                  }
                />
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="desktop-only" style={{ overflowX: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '8px 12px', fontWeight: 600, width: '90px' }}>Type</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Description</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600, width: '130px' }}>Category</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600, width: '100px' }}>Date</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600, width: '100px' }}>Method</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right', width: '110px' }}>Amount</th>
                      <th style={{ padding: '8px 8px', width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="task-row"
                        style={{
                          borderBottom: '1px solid var(--border-default)',
                          transition: 'background 0.12s ease',
                        }}
                      >
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '10px',
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: tx.type === 'income' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: tx.type === 'income' ? 'var(--status-success)' : 'var(--status-danger)',
                            }}
                          >
                            {tx.type === 'income' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {tx.type === 'income' ? 'INFLOW' : 'OUTFLOW'}
                          </span>
                        </td>

                        <td style={{ padding: '10px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {tx.description}
                        </td>

                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                          <span style={{ background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', border: '1px solid var(--border-default)' }}>
                            {tx.category}
                          </span>
                        </td>

                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }} className="tabular">
                          {tx.date}
                        </td>

                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                          {tx.paymentMethod}
                        </td>

                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }} className="tabular">
                          <span style={{ color: tx.type === 'income' ? 'var(--status-success)' : 'var(--text-primary)' }}>
                            {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toFixed(2)}
                          </span>
                        </td>

                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="btn btn-ghost"
                            style={{ padding: '3px', color: 'var(--text-muted)', height: '24px', width: '24px' }}
                            title="Delete entry"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View (Eliminates horizontal scrolling on phones) */}
              <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="card mobile-tx-card"
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          background: tx.type === 'income' ? 'rgba(78, 99, 45, 0.12)' : 'rgba(184, 12, 9, 0.12)',
                          color: tx.type === 'income' ? 'var(--status-success)' : 'var(--palette-brick)',
                        }}
                      >
                        {tx.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.description}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '6px', marginTop: '2px' }}>
                          <span>{tx.category}</span>
                          <span>·</span>
                          <span>{tx.date}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span
                        className="tabular"
                        style={{
                          fontWeight: 700,
                          fontSize: '13.5px',
                          color: tx.type === 'income' ? 'var(--status-success)' : 'var(--text-primary)',
                        }}
                      >
                        {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="btn btn-ghost"
                        style={{ padding: '6px', color: 'var(--text-muted)' }}
                        aria-label="Delete transaction"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL: ADD TRANSACTION */}
      {showTxModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>Add Transaction</h2>
            <form onSubmit={handleAddTx} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`btn ${txType === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`btn ${txType === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="label">Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="input"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Whole Foods groceries"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Category</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="input"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Payment Method</label>
                <select
                  value={txMethod}
                  onChange={(e) => setTxMethod(e.target.value as any)}
                  className="input"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowTxModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BUDGET */}
      {showBudgetModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>Set Monthly Budget</h2>
            <form onSubmit={handleSaveBudget} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Category</label>
                <select
                  value={budgetCat}
                  onChange={(e) => setBudgetCat(e.target.value)}
                  className="input"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Monthly Spending Limit ({currency})</label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="500"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowBudgetModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Budget Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SAVINGS GOAL */}
      {showSavingsModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>New Savings Target</h2>
            <form onSubmit={handleAddSavings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro M4 Fund"
                  value={savingsTitle}
                  onChange={(e) => setSavingsTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Target Amount ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={savingsTarget}
                    onChange={(e) => setSavingsTarget(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Initial Saved ({currency})</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={savingsCurrent}
                    onChange={(e) => setSavingsCurrent(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Target Date</label>
                <input
                  type="date"
                  value={savingsDate}
                  onChange={(e) => setSavingsDate(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowSavingsModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DEPOSIT TO SAVINGS */}
      {depositGoalId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '360px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 14px 0' }}>Deposit to Goal</h2>
            <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Deposit Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="100.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="input"
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setDepositGoalId(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
