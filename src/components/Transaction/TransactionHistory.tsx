import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Filter, Edit2, Trash2, Calendar, ArrowUpRight, ArrowDownRight, ArrowRightLeft } from 'lucide-react';
import type { TransactionWithDetails, Category, Account } from '../../lib/types';

interface TransactionHistoryProps {
  onEdit: (transaction: TransactionWithDetails) => void;
  refresh: number;
}

export default function TransactionHistory({ onEdit, refresh }: TransactionHistoryProps) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [filters, setFilters] = useState({
    type: 'all',
    division: 'all',
    categoryId: 'all',
    accountId: 'all',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, refresh]);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    const [transactionsRes, categoriesRes, accountsRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*, category:categories(*), account:accounts!transactions_account_id_fkey(*), to_account:accounts!transactions_to_account_id_fkey(*)')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('accounts').select('*').eq('user_id', user.id).order('name'),
    ]);

    if (transactionsRes.data) {
      setTransactions(transactionsRes.data as TransactionWithDetails[]);
    }
    if (categoriesRes.data) {
      setCategories(categoriesRes.data);
    }
    if (accountsRes.data) {
      setAccounts(accountsRes.data);
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.division !== 'all') {
      filtered = filtered.filter(t => t.division === filters.division);
    }

    if (filters.categoryId !== 'all') {
      filtered = filtered.filter(t => t.category_id === filters.categoryId);
    }

    if (filters.accountId !== 'all') {
      filtered = filtered.filter(t => t.account_id === filters.accountId || t.to_account_id === filters.accountId);
    }

    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.transaction_date) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.transaction_date) <= endDate);
    }

    setFilteredTransactions(filtered);
  };

  const handleDelete = async (id: string, createdAt: string) => {
    const hoursSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation > 12) {
      alert('Cannot delete transactions older than 12 hours');
      return;
    }

    if (!confirm('Are you sure you want to delete this transaction?')) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchData();
    }
  };

  const canEdit = (createdAt: string) => {
    const hoursSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation <= 12;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowDownRight className="w-5 h-5 text-green-600" />;
      case 'expense':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      case 'transfer':
        return <ArrowRightLeft className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const resetFilters = () => {
    setFilters({
      type: 'all',
      division: 'all',
      categoryId: 'all',
      accountId: 'all',
      startDate: '',
      endDate: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
              <select
                value={filters.division}
                onChange={(e) => setFilters({ ...filters, division: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Divisions</option>
                <option value="personal">Personal</option>
                <option value="office">Office</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.categoryId}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
              <select
                value={filters.accountId}
                onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Accounts</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      {getTypeIcon(transaction.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-800">{transaction.description}</p>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {transaction.division}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {transaction.category?.name || 'Transfer'} • {transaction.account?.name}
                        {transaction.type === 'transfer' && transaction.to_account &&
                          ` → ${transaction.to_account.name}`
                        }
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(transaction.transaction_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`text-lg font-bold ${
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : transaction.type === 'expense'
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                      ${Number(transaction.amount).toFixed(2)}
                    </p>
                    {canEdit(transaction.created_at) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(transaction)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id, transaction.created_at)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
