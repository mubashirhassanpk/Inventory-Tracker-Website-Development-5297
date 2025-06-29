import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useInventory } from '../context/InventoryContext';
import { format } from 'date-fns';

const { FiActivity, FiTrendingUp, FiTrendingDown, FiClock } = FiIcons;

function RecentActivity() {
  const { state } = useInventory();
  const { transactions, products } = state;

  const recentTransactions = transactions
    .slice(0, 10)
    .map(transaction => {
      const product = products.find(p => p.id === transaction.productId);
      return { ...transaction, product };
    })
    .filter(t => t.product);

  const getTransactionIcon = (type) => {
    return type === 'stock_in' ? FiTrendingUp : FiTrendingDown;
  };

  const getTransactionColor = (type) => {
    return type === 'stock_in' ? 'text-success-600' : 'text-danger-600';
  };

  const getTransactionBg = (type) => {
    return type === 'stock_in' ? 'bg-success-100' : 'bg-danger-100';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-primary-100 p-2 rounded-lg">
          <SafeIcon icon={FiActivity} className="text-primary-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-gray-600 text-sm">Latest inventory movements</p>
        </div>
      </div>

      <div className="space-y-4">
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className={`p-2 rounded-lg ${getTransactionBg(transaction.type)}`}>
                <SafeIcon 
                  icon={getTransactionIcon(transaction.type)} 
                  className={`${getTransactionColor(transaction.type)}`} 
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {transaction.product.name}
                  </p>
                  <span className={`text-sm font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'stock_in' ? '+' : '-'}{transaction.quantity}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {transaction.notes}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <SafeIcon icon={FiClock} className="text-gray-400 text-xs" />
                  <span className="text-xs text-gray-500">
                    {format(new Date(transaction.date), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <SafeIcon icon={FiActivity} className="text-gray-400 text-3xl mb-3 mx-auto" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default RecentActivity;