import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useInventory } from '../context/InventoryContext';

const { FiSettings, FiSave, FiTrash2, FiUpload, FiDownload, FiAlertTriangle } = FiIcons;

function Settings() {
  const { state, dispatch } = useInventory();
  const [activeTab, setActiveTab] = useState('general');
  const [showClearModal, setShowClearModal] = useState(false);

  const tabs = [
    { key: 'general', label: 'General', icon: FiSettings },
    { key: 'data', label: 'Data Management', icon: FiUpload }
  ];

  const exportData = () => {
    const dataToExport = {
      products: state.products,
      transactions: state.transactions,
      categories: state.categories,
      suppliers: state.suppliers,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.products && Array.isArray(importedData.products)) {
          dispatch({ type: 'LOAD_DATA', payload: importedData });
          alert('Data imported successfully!');
        } else {
          alert('Invalid file format. Please select a valid backup file.');
        }
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const clearAllData = () => {
    const initialState = {
      products: [],
      transactions: [],
      categories: ['Electronics', 'Furniture', 'Stationery', 'Clothing', 'Books'],
      suppliers: ['TechCorp', 'GameTech', 'FurniCorp', 'PaperPlus', 'StyleCorp']
    };
    
    dispatch({ type: 'LOAD_DATA', payload: initialState });
    setShowClearModal(false);
    alert('All data has been cleared successfully!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your inventory system preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <SafeIcon icon={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Products
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {state.products.length}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Transactions
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {state.transactions.length}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {state.categories.length}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suppliers
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {state.suppliers.length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Alerts</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-warning-50 rounded-lg border border-warning-200">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiAlertTriangle} className="text-warning-600" />
                  <div>
                    <p className="font-medium text-gray-900">Low Stock Items</p>
                    <p className="text-sm text-gray-600">
                      {state.products.filter(p => p.quantity <= p.minStock && p.quantity > 0).length} items need restocking
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-danger-50 rounded-lg border border-danger-200">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiAlertTriangle} className="text-danger-600" />
                  <div>
                    <p className="font-medium text-gray-900">Out of Stock Items</p>
                    <p className="text-sm text-gray-600">
                      {state.products.filter(p => p.quantity === 0).length} items are completely out of stock
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Data Management */}
      {activeTab === 'data' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup & Restore</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-200">
                <div>
                  <h4 className="font-medium text-gray-900">Export Data</h4>
                  <p className="text-sm text-gray-600">Download a backup of all your inventory data</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportData}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <SafeIcon icon={FiDownload} />
                  <span>Export</span>
                </motion.button>
              </div>

              <div className="flex items-center justify-between p-4 bg-success-50 rounded-lg border border-success-200">
                <div>
                  <h4 className="font-medium text-gray-900">Import Data</h4>
                  <p className="text-sm text-gray-600">Restore from a previously exported backup file</p>
                </div>
                <label className="bg-success-500 hover:bg-success-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer">
                  <SafeIcon icon={FiUpload} />
                  <span>Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
            <div className="p-4 bg-danger-50 rounded-lg border border-danger-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Clear All Data</h4>
                  <p className="text-sm text-gray-600">
                    Permanently delete all products, transactions, and settings. This action cannot be undone.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowClearModal(true)}
                  className="bg-danger-500 hover:bg-danger-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <SafeIcon icon={FiTrash2} />
                  <span>Clear All</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Clear Data Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowClearModal(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full relative"
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-danger-100 p-2 rounded-lg">
                  <SafeIcon icon={FiAlertTriangle} className="text-danger-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Clear All Data</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete all inventory data? This will remove all products, 
                transactions, and settings. This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearAllData}
                  className="px-6 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors"
                >
                  Clear All Data
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default Settings;