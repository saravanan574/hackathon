import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PieChart } from 'lucide-react';

interface CategoryData {
  categoryId: string;
  categoryName: string;
  total: number;
  count: number;
  color: string;
}

export default function CategorySummary() {
  const { user } = useAuth();
  const [incomeData, setIncomeData] = useState<CategoryData[]>([]);
  const [expenseData, setExpenseData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    if (user) {
      fetchCategorySummary();
    }
  }, [user]);

  const fetchCategorySummary = async () => {
    if (!user) return;

    setLoading(true);

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .in('type', ['income', 'expense']);

    if (transactions) {
      const incomeSummary = new Map<string, CategoryData>();
      const expenseSummary = new Map<string, CategoryData>();

      transactions.forEach((transaction: any) => {
        if (!transaction.category) return;

        const map = transaction.type === 'income' ? incomeSummary : expenseSummary;
        const existing = map.get(transaction.category_id);

        if (existing) {
          existing.total += Number(transaction.amount);
          existing.count += 1;
        } else {
          map.set(transaction.category_id, {
            categoryId: transaction.category_id,
            categoryName: transaction.category.name,
            total: Number(transaction.amount),
            count: 1,
            color: transaction.category.color,
          });
        }
      });

      const sortedIncome = Array.from(incomeSummary.values()).sort((a, b) => b.total - a.total);
      const sortedExpense = Array.from(expenseSummary.values()).sort((a, b) => b.total - a.total);

      setIncomeData(sortedIncome);
      setExpenseData(sortedExpense);
    }

    setLoading(false);
  };

  const currentData = activeTab === 'income' ? incomeData : expenseData;
  const totalAmount = currentData.reduce((sum, item) => sum + item.total, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Category Summary</h2>

      <div className="flex gap-2 mb-4">
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
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {currentData.length === 0 ? (
          <div className="p-12 text-center">
            <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No {activeTab} transactions found
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {currentData.map((item) => {
              const percentage = (item.total / totalAmount) * 100;
              return (
                <div key={item.categoryId} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <p className="font-medium text-gray-800">{item.categoryName}</p>
                        <p className="text-sm text-gray-500">{item.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        activeTab === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${item.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        activeTab === 'income' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">Total</span>
                <span className={`text-xl font-bold ${
                  activeTab === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
