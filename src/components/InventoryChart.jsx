import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useInventory } from '../context/InventoryContext';

const { FiBarChart3 } = FiIcons;

function InventoryChart() {
  const { state } = useInventory();
  const { products } = state;

  const chartData = useMemo(() => {
    const categoryData = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          category: product.category,
          totalItems: 0,
          totalValue: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0
        };
      }
      
      acc[product.category].totalItems++;
      acc[product.category].totalValue += product.quantity * product.price;
      
      if (product.quantity === 0) {
        acc[product.category].outOfStock++;
      } else if (product.quantity <= product.minStock) {
        acc[product.category].lowStock++;
      } else {
        acc[product.category].inStock++;
      }
      
      return acc;
    }, {});

    return Object.values(categoryData);
  }, [products]);

  const maxValue = Math.max(...chartData.map(d => d.totalValue));

  const colors = [
    'bg-primary-500',
    'bg-success-500',
    'bg-warning-500',
    'bg-danger-500',
    'bg-purple-500',
    'bg-indigo-500'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-primary-100 p-2 rounded-lg">
          <SafeIcon icon={FiBarChart3} className="text-primary-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Inventory by Category</h2>
          <p className="text-gray-600 text-sm">Stock distribution and value</p>
        </div>
      </div>

      <div className="space-y-6">
        {chartData.map((data, index) => (
          <div key={data.category} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                <span className="font-medium text-gray-900">{data.category}</span>
                <span className="text-sm text-gray-500">({data.totalItems} items)</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                ${data.totalValue.toLocaleString()}
              </span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.totalValue / maxValue) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-2 rounded-full ${colors[index % colors.length]}`}
                />
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <div className="flex space-x-4">
                <span>✓ {data.inStock} In Stock</span>
                <span>⚠ {data.lowStock} Low Stock</span>
                <span>✗ {data.outOfStock} Out of Stock</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {chartData.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiBarChart3} className="text-gray-400 text-4xl mb-4 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-500">Add some products to see the inventory chart</p>
        </div>
      )}
    </motion.div>
  );
}

export default InventoryChart;