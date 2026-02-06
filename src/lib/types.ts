export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          balance: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: string;
          balance?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string;
          balance?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          icon: string;
          color: string;
          type: 'income' | 'expense' | 'both';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          icon?: string;
          color?: string;
          type: 'income' | 'expense' | 'both';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          icon?: string;
          color?: string;
          type?: 'income' | 'expense' | 'both';
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          category_id: string | null;
          type: 'income' | 'expense' | 'transfer';
          amount: number;
          description: string;
          division: 'office' | 'personal';
          transaction_date: string;
          to_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          category_id?: string | null;
          type: 'income' | 'expense' | 'transfer';
          amount: number;
          description: string;
          division: 'office' | 'personal';
          transaction_date?: string;
          to_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          category_id?: string | null;
          type?: 'income' | 'expense' | 'transfer';
          amount?: number;
          description?: string;
          division?: 'office' | 'personal';
          transaction_date?: string;
          to_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Account = Database['public']['Tables']['accounts']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];

export interface TransactionWithDetails extends Transaction {
  category?: Category;
  account?: Account;
  to_account?: Account;
}
