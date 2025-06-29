import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useInventory } from '../context/InventoryContext';

const { FiAlertTriangle, FiPackage } = FiIcons;

function LowStockAlert() {
  const { state } = useInventory();
  const { products } = state;

  const lowStockItems = products.filter(product => 
    product.quantity <= product.minStock && product.quantity > 0
  );
  
  const outOfStockItems = products.filter(product => 
    product.quantity === 0
  );

  const alertItems = [...outOfStockItems, ...lowStockItems].slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border p-6 h-fit"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-warning-100 p-2 rounded-lg">
          <SafeIcon icon={FiAlertTriangle} className="text-warning-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Stock Alerts</h2>
          <p className="text-gray-600 text-sm">Items requiring attention</p>
        </div>
      </div>

      <div className="space-y-3">
        {alertItems.length > 0 ? (
          alertItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center space-x-3 p-3 rounded-lg border-l-4 ${
                item.quantity === 0 
                  ? 'bg-danger-50 border-danger-500' 
                  : 'bg-warning-50 border-warning-500'
              }`}
            >
              <div className={`p-1.5 rounded ${
                item.quantity === 0 ? 'bg-danger-100' : 'bg-warning-100'
              }`}>
                <SafeIcon 
                  icon={FiPackage} 
                  className={`text-sm ${
                    item.quantity === 0 ? 'text-danger-600' : 'text-warning-600'
                  }`} 
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  Stock: {item.quantity} / Min: {item.minStock}
                </p>
              </div>
              
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.quantity === 0 
                  ? 'bg-danger-100 text-danger-800'
                  : 'bg-warning-100 text-warning-800'
              }`}>
                {item.quantity === 0 ? 'Out' : 'Low'}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="bg-success-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <SafeIcon icon={FiPackage} className="text-success-600" />
            </div>
            <p className="text-gray-500 text-sm">All items are well stocked!</p>
          </div>
        )}
      </div>

      {alertItems.length > 8 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-500 text-center">
            +{alertItems.length - 8} more items need attention
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default LowStockAlert;