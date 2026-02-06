import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { TransactionWithDetails, Category, Account } from '../../lib/types';

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: TransactionWithDetails | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTransactionModal({ isOpen, transaction, onClose, onSuccess }: EditTransactionModalProps) {
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
    transactionDate: '',
  });

  useEffect(() => {
    if (isOpen && transaction) {
      const canEdit = checkIfEditable(transaction.created_at);
      if (!canEdit) {
        setError('Cannot edit transactions older than 12 hours');
        return;
      }

      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description,
        categoryId: transaction.category_id || '',
        accountId: transaction.account_id,
        toAccountId: transaction.to_account_id || '',
        division: transaction.division,
        transactionDate: new Date(transaction.transaction_date).toISOString().slice(0, 16),
      });

      fetchCategories(transaction.type);
      fetchAccounts();
    }
  }, [isOpen, transaction]);

  const checkIfEditable = (createdAt: string) => {
    const hoursSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation <= 12;
  };

  const fetchCategories = async (type: string) => {
    if (type === 'transfer') return;

    const { data } = await supabase
      .from('categories')
      .select('*')
      .or(`type.eq.${type},type.eq.both`)
      .order('name');

    if (data) {
      setCategories(data);
    }
  };

  const fetchAccounts = async () => {
    const { data } = await supabase
      .from('accounts')
      .select('*')
      .order('name');

    if (data) {
      setAccounts(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    setLoading(true);
    setError('');

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (transaction.type === 'transfer' && !formData.toAccountId) {
        throw new Error('Please select a destination account');
      }

      if (transaction.type === 'transfer' && formData.accountId === formData.toAccountId) {
        throw new Error('Source and destination accounts must be different');
      }

      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          amount,
          description: formData.description,
          category_id: transaction.type === 'transfer' ? null : formData.categoryId,
          account_id: formData.accountId,
          to_account_id: transaction.type === 'transfer' ? formData.toAccountId : null,
          division: formData.division,
          transaction_date: new Date(formData.transactionDate).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !transaction) return null;

  const canEdit = checkIfEditable(transaction.created_at);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Edit Transaction</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {!canEdit ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Cannot edit transactions older than 12 hours
            </div>
            <button
              onClick={onClose}
              className="w-full mt-4 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                Type: <span className="font-semibold capitalize">{transaction.type}</span>
              </p>
            </div>

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

            {transaction.type !== 'transfer' && (
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
                {transaction.type === 'transfer' ? 'From Account' : 'Account'}
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

            {transaction.type === 'transfer' && (
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
              <Save className="w-5 h-5" />
              {loading ? 'Updating...' : 'Update Transaction'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
