import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Category, Account } from '../../lib/types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TabType = 'income' | 'expense' | 'transfer';

export default function AddTransactionModal({ isOpen, onClose, onSuccess }: AddTransactionModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('expense');
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: '',
    accountId: '',
    toAccountId: '',
    division: 'personal' as 'personal' | 'office',
    transactionDate: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    if (isOpen && user) {
      fetchCategories();
      fetchAccounts();
    }
  }, [isOpen, user, activeTab]);

  const fetchCategories = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('categories')
      .select('*')
      .or(`type.eq.${activeTab},type.eq.both`)
      .order('name');

    if (data) {
      setCategories(data);
      if (data.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: data[0].id }));
      }
    }
  };

  const fetchAccounts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (data) {
      setAccounts(data);
      if (data.length > 0 && !formData.accountId) {
        setFormData(prev => ({ ...prev, accountId: data[0].id }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (activeTab === 'transfer' && !formData.toAccountId) {
        throw new Error('Please select a destination account');
      }

      if (activeTab === 'transfer' && formData.accountId === formData.toAccountId) {
        throw new Error('Source and destination accounts must be different');
      }

      const { error: insertError } = await supabase.from('transactions').insert({
        user_id: user.id,
        account_id: formData.accountId,
        category_id: activeTab === 'transfer' ? null : formData.categoryId,
        type: activeTab,
        amount,
        description: formData.description,
        division: formData.division,
        transaction_date: new Date(formData.transactionDate).toISOString(),
        to_account_id: activeTab === 'transfer' ? formData.toAccountId : null,
      });

      if (insertError) throw insertError;

      setFormData({
        amount: '',
        description: '',
        categoryId: categories[0]?.id || '',
        accountId: accounts[0]?.id || '',
        toAccountId: '',
        division: 'personal',
        transactionDate: new Date().toISOString().slice(0, 16),
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Add Transaction</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('income')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                activeTab === 'income'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                activeTab === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                activeTab === 'transfer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Transfer
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Grocery shopping"
            />
          </div>

          {activeTab !== 'transfer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {activeTab === 'transfer' ? 'From Account' : 'Account'}
            </label>
            <select
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} (${Number(account.balance).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'transfer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Account
              </label>
              <select
                value={formData.toAccountId}
                onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select account</option>
                {accounts
                  .filter(acc => acc.id !== formData.accountId)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} (${Number(account.balance).toFixed(2)})
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Division
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, division: 'personal' })}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  formData.division === 'personal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Personal
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, division: 'office' })}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  formData.division === 'office'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Office
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.transactionDate}
              onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}
