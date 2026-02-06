import React,{ useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import TransactionHistory from './components/Transaction/TransactionHistory';
import CategorySummary from './components/Summary/CategorySummary.tsx';
import AccountManagement from './components/Account/AccountManagement.tsx';
import AddTransactionModal from './components/Transaction/AddTransactionModal';
import EditTransactionModal from './components/Transaction/EditTransactionModal';
import {
  LayoutDashboard,
  History,
  PieChart,
  Wallet,
  Plus,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import type { TransactionWithDetails } from './lib/types';

function App() {
  const { user, loading, signOut } = useAuth();
  const [showAuthToggle, setShowAuthToggle] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'summary' | 'accounts'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithDetails | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return showAuthToggle ? (
      <Register onToggle={() => setShowAuthToggle(false)} />
    ) : (
      <Login onToggle={() => setShowAuthToggle(true)} />
    );
  }

  const handleTransactionSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleEdit = (transaction: TransactionWithDetails) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const menuItems = [
    { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'history' as const, icon: History, label: 'History' },
    { id: 'summary' as const, icon: PieChart, label: 'Summary' },
    { id: 'accounts' as const, icon: Wallet, label: 'Accounts' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Money Manager</h1>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-2">
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                        activeTab === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'history' && (
              <TransactionHistory onEdit={handleEdit} refresh={refreshKey} />
            )}
            {activeTab === 'summary' && <CategorySummary />}
            {activeTab === 'accounts' && <AccountManagement />}
          </main>
        </div>
      </div>

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleTransactionSuccess}
      />

      <EditTransactionModal
        isOpen={showEditModal}
        transaction={editingTransaction}
        onClose={() => {
          setShowEditModal(false);
          setEditingTransaction(null);
        }}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}

export default App;
