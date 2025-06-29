import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useInventory } from '../context/InventoryContext';

const { FiX, FiPlus, FiMinus, FiSave } = FiIcons;

function StockUpdateModal({ isOpen, onClose, product }) {
  const { dispatch } = useInventory();
  
  const [updateType, setUpdateType] = useState('stock_in');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setUpdateType('stock_in');
      setQuantity(1);
      setNotes('');
      setErrors({});
    }
  }, [isOpen, product]);

  const validateForm = () => {
    const newErrors = {};
    
    if (quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (updateType === 'stock_out' && product && quantity > product.quantity) {
      newErrors.quantity = 'Cannot remove more items than currently in stock';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm() || !product) return;

    dispatch({
      type: 'UPDATE_STOCK',
      payload: {
        productId: product.id,
        type: updateType,
        quantity: parseInt(quantity),
        notes: notes.trim() || `${updateType === 'stock_in' ? 'Added' : 'Removed'} ${quantity} units`
      }
    });
    
    onClose();
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setQuantity(value);
    
    if (errors.quantity) {
      setErrors(prev => ({ ...prev, quantity: '' }));
    }
  };

  if (!product) return null;

  const newQuantity = updateType === 'stock_in' 
    ? product.quantity + quantity 
    : Math.max(0, product.quantity - quantity);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full relative"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Update Stock
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Product Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                <p className="text-sm text-gray-600">Current Stock: {product.quantity}</p>
              </div>

              {/* Update Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Update Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUpdateType('stock_in')}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                      updateType === 'stock_in'
                        ? 'border-success-500 bg-success-50 text-success-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <SafeIcon icon={FiPlus} />
                    <span className="font-medium">Stock In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpdateType('stock_out')}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                      updateType === 'stock_out'
                        ? 'border-danger-500 bg-danger-50 text-danger-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <SafeIcon icon={FiMinus} />
                    <span className="font-medium">Stock Out</span>
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max={updateType === 'stock_out' ? product.quantity : undefined}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.quantity ? 'border-danger-500' : 'border-gray-300'
                  }`}
                />
                {errors.quantity && (
                  <p className="text-danger-500 text-sm mt-1">{errors.quantity}</p>
                )}
              </div>

              {/* Preview */}
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">New Stock Level:</span>{' '}
                  <span className={`font-bold ${
                    newQuantity > product.minStock ? 'text-success-600' : 
                    newQuantity > 0 ? 'text-warning-600' : 'text-danger-600'
                  }`}>
                    {newQuantity}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {newQuantity > product.minStock ? 'In Stock' : 
                   newQuantity > 0 ? 'Low Stock' : 'Out of Stock'}
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Add a note about this stock update..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                    updateType === 'stock_in' 
                      ? 'bg-success-500 hover:bg-success-600' 
                      : 'bg-danger-500 hover:bg-danger-600'
                  }`}
                >
                  <SafeIcon icon={FiSave} />
                  <span>Update Stock</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default StockUpdateModal;