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
    <div className="page-container" style={{ padding: '24px 28px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Finance Command
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
            Local-first wealth management, expense tracking, and savings objectives.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            Set Budget
          </button>
          <button
            onClick={() => setShowSavingsModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <PiggyBank size={16} /> Savings Goal
          </button>
          <button
            onClick={() => setShowTxModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Plus size={16} /> Add Transaction
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Total Income */}
        <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Inflow</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.12)', color: 'var(--success)' }}>
              <TrendingUp size={16} />
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {currency}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Filtered {timeframe} window
          </div>
        </div>

        {/* Total Expenses */}
        <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Outflow</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)' }}>
              <TrendingDown size={16} />
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {currency}{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Total spent across categories
          </div>
        </div>

        {/* Net Savings */}
        <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Net Cashflow</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: netSavings >= 0 ? 'rgba(59, 130, 246, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: netSavings >= 0 ? 'var(--info)' : 'var(--danger)' }}>
              <DollarSign size={16} />
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: netSavings >= 0 ? 'var(--success)' : 'var(--danger)', letterSpacing: '-0.02em' }}>
            {netSavings >= 0 ? '+' : '-'}{currency}{Math.abs(netSavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {savingsRate}% net savings rate
          </div>
        </div>

        {/* Savings Reserve */}
        <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Goals</span>
            <span style={{ padding: '6px', borderRadius: 'var(--radius-xs)', background: 'var(--bg-hover)', color: 'var(--text-primary)' }}>
              <PiggyBank size={16} />
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {currency}{savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across {savingsGoals.length} targets
          </div>
        </div>
      </div>

      {/* Main Grid: Budgets & Analytics (Left) + Transactions (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Left: Monthly Budgets & Spending Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Monthly Budgets Card */}
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Category Budgets ({currentMonthStr})</h2>
              <button onClick={() => setShowBudgetModal(true)} className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 8px' }}>
                + Add Limit
              </button>
            </div>

            {budgets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                No budgets set for this month. Set spending caps to prevent budget overruns.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {budgets.map((b) => {
                  const spent = transactions
                    .filter((t) => t.type === 'expense' && t.category === b.category && t.date.startsWith(currentMonthStr))
                    .reduce((acc, t) => acc + t.amount, 0);
                  const percent = Math.min(100, Math.round((spent / b.monthlyLimit) * 100));
                  const isWarning = percent >= 80 && percent < 100;
                  const isExceeded = spent > b.monthlyLimit;

                  return (
                    <div key={b.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {b.category}
                          {isExceeded && <span title="Budget Exceeded!"><AlertTriangle size={14} color="var(--danger)" /></span>}
                          {isWarning && <span title="Approaching Limit!"><AlertTriangle size={14} color="var(--warning)" /></span>}
                        </span>
                        <span style={{ color: isExceeded ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--text-secondary)' }}>
                          {currency}{spent.toFixed(0)} / {currency}{b.monthlyLimit.toFixed(0)} ({percent}%)
                        </span>
                      </div>
                      <div style={{ height: '7px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${percent}%`,
                            background: isExceeded ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--accent)',
                            borderRadius: '10px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Spending Breakdown (SVG Donut & Bar Representation) */}
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>Expense Distribution</h2>

            {categorySpending.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                No expenses logged in this timeframe.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categorySpending.map(([cat, amt]) => {
                  const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
                  return (
                    <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ minWidth: '110px', fontSize: '13px', color: 'var(--text-secondary)' }}>{cat}</div>
                      <div className="progress-track" style={{ flex: 1 }}>
                        <div
                          className="progress-thumb"
                          style={{
                            width: `${pct}%`,
                            background: 'var(--text-primary)',
                          }}
                        />
                      </div>
                      <div style={{ minWidth: '70px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>
                        {currency}{amt.toFixed(0)} <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Savings Goals Cards */}
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Savings Targets</h2>
              <button onClick={() => setShowSavingsModal(true)} className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 8px' }}>
                + Add Target
              </button>
            </div>

            {savingsGoals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                No savings goals created yet. Set a financial milestone to build wealth.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {savingsGoals.map((g) => {
                  const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                  return (
                    <div
                      key={g.id}
                      style={{
                        padding: '14px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{g.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Target: {currency}{g.targetAmount.toLocaleString()} by {g.targetDate || 'No date'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => setDepositGoalId(g.id)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            + Deposit
                          </button>
                          <button
                            onClick={() => deleteSavingsGoal(g.id)}
                            className="btn btn-ghost"
                            style={{ padding: '4px', color: 'var(--text-muted)' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden', margin: '8px 0 6px 0' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: pct >= 100 ? 'var(--success)' : 'var(--accent)',
                            borderRadius: '6px',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        <span>Saved: {currency}{g.currentAmount.toLocaleString()}</span>
                        <span style={{ fontWeight: 600 }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Transaction Ledger & Filters */}
        <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Transaction Ledger</h2>

            {/* Timeframe selector */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              {(['week', 'month', 'year', 'all'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  style={{
                    border: 'none',
                    background: timeframe === t ? 'var(--bg-card)' : 'transparent',
                    color: timeframe === t ? 'var(--text-primary)' : 'var(--text-muted)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: timeframe === t ? 600 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="input"
              style={{ fontSize: '12px', padding: '6px 10px', width: 'auto' }}
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Incomes Only</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input"
              style={{ fontSize: '12px', padding: '6px 10px', width: 'auto' }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              No transactions found matching your criteria.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '680px', overflowY: 'auto' }}>
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: tx.type === 'income' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {tx.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                        {tx.description}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '14px',
                        color: tx.type === 'income' ? 'var(--success)' : 'var(--text-primary)',
                        textAlign: 'right',
                      }}
                    >
                      {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toFixed(2)}
                    </div>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="btn btn-ghost"
                      style={{ padding: '6px', color: 'var(--text-muted)' }}
                      title="Delete transaction"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
