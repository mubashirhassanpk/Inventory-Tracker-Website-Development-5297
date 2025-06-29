import React, { createContext, useContext, useReducer, useEffect } from 'react';

const InventoryContext = createContext();

const initialState = {
  products: [
    {
      id: 1,
      name: 'Wireless Headphones',
      sku: 'WH-001',
      category: 'Electronics',
      quantity: 45,
      minStock: 10,
      maxStock: 100,
      price: 99.99,
      supplier: 'TechCorp',
      location: 'Warehouse A',
      lastUpdated: new Date().toISOString(),
      status: 'In Stock'
    },
    {
      id: 2,
      name: 'Gaming Mouse',
      sku: 'GM-002',
      category: 'Electronics',
      quantity: 8,
      minStock: 15,
      maxStock: 50,
      price: 59.99,
      supplier: 'GameTech',
      location: 'Warehouse A',
      lastUpdated: new Date().toISOString(),
      status: 'Low Stock'
    },
    {
      id: 3,
      name: 'Office Chair',
      sku: 'OC-003',
      category: 'Furniture',
      quantity: 0,
      minStock: 5,
      maxStock: 25,
      price: 299.99,
      supplier: 'FurniCorp',
      location: 'Warehouse B',
      lastUpdated: new Date().toISOString(),
      status: 'Out of Stock'
    },
    {
      id: 4,
      name: 'Notebook Set',
      sku: 'NB-004',
      category: 'Stationery',
      quantity: 120,
      minStock: 20,
      maxStock: 200,
      price: 12.99,
      supplier: 'PaperPlus',
      location: 'Warehouse C',
      lastUpdated: new Date().toISOString(),
      status: 'In Stock'
    }
  ],
  transactions: [
    {
      id: 1,
      productId: 1,
      type: 'stock_in',
      quantity: 20,
      date: new Date().toISOString(),
      notes: 'Weekly restock'
    },
    {
      id: 2,
      productId: 2,
      type: 'stock_out',
      quantity: 7,
      date: new Date().toISOString(),
      notes: 'Customer order fulfillment'
    }
  ],
  categories: ['Electronics', 'Furniture', 'Stationery', 'Clothing', 'Books'],
  suppliers: ['TechCorp', 'GameTech', 'FurniCorp', 'PaperPlus', 'StyleCorp']
};

function inventoryReducer(state, action) {
  switch (action.type) {
    case 'ADD_PRODUCT':
      const newProduct = {
        ...action.payload,
        id: Date.now(),
        lastUpdated: new Date().toISOString(),
        status: action.payload.quantity > action.payload.minStock ? 'In Stock' : 
                action.payload.quantity > 0 ? 'Low Stock' : 'Out of Stock'
      };
      return {
        ...state,
        products: [...state.products, newProduct]
      };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id
            ? {
                ...action.payload,
                lastUpdated: new Date().toISOString(),
                status: action.payload.quantity > action.payload.minStock ? 'In Stock' : 
                        action.payload.quantity > 0 ? 'Low Stock' : 'Out of Stock'
              }
            : product
        )
      };

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };

    case 'UPDATE_STOCK':
      const updatedProducts = state.products.map(product => {
        if (product.id === action.payload.productId) {
          const newQuantity = action.payload.type === 'stock_in' 
            ? product.quantity + action.payload.quantity
            : product.quantity - action.payload.quantity;
          
          return {
            ...product,
            quantity: Math.max(0, newQuantity),
            lastUpdated: new Date().toISOString(),
            status: newQuantity > product.minStock ? 'In Stock' : 
                    newQuantity > 0 ? 'Low Stock' : 'Out of Stock'
          };
        }
        return product;
      });

      const newTransaction = {
        id: Date.now(),
        ...action.payload,
        date: new Date().toISOString()
      };

      return {
        ...state,
        products: updatedProducts,
        transactions: [newTransaction, ...state.transactions]
      };

    case 'LOAD_DATA':
      return action.payload;

    default:
      return state;
  }
}

export function InventoryProvider({ children }) {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('inventoryData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('inventoryData', JSON.stringify(state));
  }, [state]);

  return (
    <InventoryContext.Provider value={{ state, dispatch }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}