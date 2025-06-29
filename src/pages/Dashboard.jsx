import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useInventory } from '../context/InventoryContext';
import StatsCard from '../components/StatsCard';
import RecentActivity from '../components/RecentActivity';
import LowStockAlert from '../components/LowStockAlert';
import InventoryChart from '../components/InventoryChart';

const { FiPackage, FiAlertTriangle, FiTrendingUp, FiDollarSign } = FiIcons;

function Dashboard() {
  const { state } = useInventory();
  const { products, transactions } = state;

  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.quantity <= p.minStock).length;
  const outOfStockItems = products.filter(p => p.quantity === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your inventory overview.</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <StatsCard
          title="Total Products"
          value={totalProducts}
          icon={FiPackage}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockItems}
          icon={FiAlertTriangle}
          color="yellow"
          trend={{ value: 3, isPositive: false }}
        />
        <StatsCard
          title="Out of Stock"
          value={outOfStockItems}
          icon={FiAlertTriangle}
          color="red"
          trend={{ value: 1, isPositive: false }}
        />
        <StatsCard
          title="Total Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={FiDollarSign}
          color="green"
          trend={{ value: 8.5, isPositive: true }}
        />
      </motion.div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <InventoryChart />
        </motion.div>
        <motion.div variants={itemVariants}>
          <LowStockAlert />
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <RecentActivity />
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;