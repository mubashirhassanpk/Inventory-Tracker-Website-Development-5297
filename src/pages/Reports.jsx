import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useInventory } from '../context/InventoryContext';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const { FiBarChart3, FiDownload, FiCalendar, FiTrendingUp, FiPackage, FiDollarSign } = FiIcons;

function Reports() {
  const { state } = useInventory();
  const { products, transactions } = state;
  
  const [dateRange, setDateRange] = useState('7days');
  const [reportType, setReportType] = useState('overview');

  const dateRanges = {
    '7days': { label: 'Last 7 Days', days: 7 },
    '30days': { label: 'Last 30 Days', days: 30 },
    '90days': { label: 'Last 90 Days', days: 90 },
  };

  const filteredTransactions = useMemo(() => {
    const days = dateRanges[dateRange].days;
    const cutoffDate = startOfDay(subDays(new Date(), days));
    
    return transactions.filter(transaction => 
      new Date(transaction.date) >= cutoffDate
    );
  }, [transactions, dateRange]);

  const reportData = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
    const lowStockItems = products.filter(p => p.quantity <= p.minStock).length;
    const outOfStockItems = products.filter(p => p.quantity === 0).length;
    
    const stockIn = filteredTransactions
      .filter(t => t.type === 'stock_in')
      .reduce((sum, t) => sum + t.quantity, 0);
    
    const stockOut = filteredTransactions
      .filter(t => t.type === 'stock_out')
      .reduce((sum, t) => sum + t.quantity, 0);

    const categoryBreakdown = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          count: 0,
          value: 0,
          quantity: 0
        };
      }
      acc[product.category].count++;
      acc[product.category].value += product.quantity * product.price;
      acc[product.category].quantity += product.quantity;
      return acc;
    }, {});

    const topProducts = products
      .sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price))
      .slice(0, 10);

    return {
      overview: {
        totalProducts,
        totalValue,
        lowStockItems,
        outOfStockItems,
        stockIn,
        stockOut,
        netMovement: stockIn - stockOut
      },
      categories: Object.entries(categoryBreakdown).map(([name, data]) => ({
        name,
        ...data
      })),
      topProducts,
      transactions: filteredTransactions
    };
  }, [products, filteredTransactions]);

  const exportReport = () => {
    const reportContent = {
      generatedAt: new Date().toISOString(),
      dateRange: dateRanges[dateRange].label,
      data: reportData
    };
    
    const blob = new Blob([JSON.stringify(reportContent, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">Inventory analytics and insights</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {Object.entries(dateRanges).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportReport}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <SafeIcon icon={FiDownload} />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
        {[
          { key: 'overview', label: 'Overview', icon: FiBarChart3 },
          { key: 'categories', label: 'Categories', icon: FiPackage },
          { key: 'products', label: 'Top Products', icon: FiTrendingUp }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setReportType(tab.key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
              reportType === tab.key
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <SafeIcon icon={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <SafeIcon icon={FiPackage} className="text-primary-600 text-xl" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {reportData.overview.totalProducts}
              </h3>
              <p className="text-gray-600 text-sm">Total Products</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-success-100 p-3 rounded-lg">
                  <SafeIcon icon={FiDollarSign} className="text-success-600 text-xl" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                ${reportData.overview.totalValue.toLocaleString()}
              </h3>
              <p className="text-gray-600 text-sm">Total Inventory Value</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm border"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-warning-100 p-3 rounded-lg">
                  <SafeIcon icon={FiTrendingUp} className="text-warning-600 text-xl" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {reportData.overview.stockIn}
              </h3>
              <p className="text-gray-600 text-sm">Items Added ({dateRanges[dateRange].label})</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-sm border"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-danger-100 p-3 rounded-lg">
                  <SafeIcon icon={FiTrendingUp} className="text-danger-600 text-xl transform rotate-180" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {reportData.overview.stockOut}
              </h3>
              <p className="text-gray-600 text-sm">Items Removed ({dateRanges[dateRange].label})</p>
            </motion.div>
          </div>

          {/* Stock Status Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Status Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-success-600 mb-2">
                  {reportData.overview.totalProducts - reportData.overview.lowStockItems - reportData.overview.outOfStockItems}
                </div>
                <p className="text-gray-600">In Stock</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-success-500 h-2 rounded-full"
                    style={{ 
                      width: `${((reportData.overview.totalProducts - reportData.overview.lowStockItems - reportData.overview.outOfStockItems) / reportData.overview.totalProducts) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning-600 mb-2">
                  {reportData.overview.lowStockItems}
                </div>
                <p className="text-gray-600">Low Stock</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-warning-500 h-2 rounded-full"
                    style={{ 
                      width: `${(reportData.overview.lowStockItems / reportData.overview.totalProducts) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-danger-600 mb-2">
                  {reportData.overview.outOfStockItems}
                </div>
                <p className="text-gray-600">Out of Stock</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-danger-500 h-2 rounded-full"
                    style={{ 
                      width: `${(reportData.overview.outOfStockItems / reportData.overview.totalProducts) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Categories Report */}
      {reportType === 'categories' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory by Category</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Products</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {reportData.categories.map((category, index) => (
                  <motion.tr
                    key={category.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">{category.name}</td>
                    <td className="py-3 px-4 text-gray-600">{category.count}</td>
                    <td className="py-3 px-4 text-gray-600">{category.quantity}</td>
                    <td className="py-3 px-4 text-gray-600">${category.value.toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Top Products Report */}
      {reportType === 'products' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products by Value</h3>
          <div className="space-y-4">
            {reportData.topProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <SafeIcon icon={FiPackage} className="text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.category} • {product.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${(product.quantity * product.price).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {product.quantity} × ${product.price}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Reports;