import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiTrendingUp, FiTrendingDown } = FiIcons;

function StatsCard({ title, value, icon, color = 'blue', trend }) {
  const colorClasses = {
    blue: 'bg-primary-500 text-white',
    green: 'bg-success-500 text-white',
    yellow: 'bg-warning-500 text-white',
    red: 'bg-danger-500 text-white'
  };

  const bgColors = {
    blue: 'bg-primary-50',
    green: 'bg-success-50',
    yellow: 'bg-warning-50',
    red: 'bg-danger-50'
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`${bgColors[color]} p-6 rounded-xl border transition-all duration-200 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <SafeIcon icon={icon} className="text-xl" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend.isPositive ? 'text-success-600' : 'text-danger-600'
          }`}>
            <SafeIcon 
              icon={trend.isPositive ? FiTrendingUp : FiTrendingDown} 
              className="text-xs" 
            />
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-gray-600 text-sm">{title}</p>
      </div>
    </motion.div>
  );
}

export default StatsCard;