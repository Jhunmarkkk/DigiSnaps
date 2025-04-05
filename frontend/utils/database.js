import * as SQLite from 'expo-sqlite';

// Open or create the database
const db = SQLite.openDatabase('digisnaps.db');

// Initialize the database
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(tx => {
        // Create cart items table if it doesn't exist
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS cart_items (
            id TEXT PRIMARY KEY,
            product_id TEXT,
            name TEXT,
            price REAL,
            image TEXT,
            stock INTEGER,
            quantity INTEGER
          )`,
          [],
          (_, result) => {
            console.log('Database initialized successfully');
            resolve(result);
          },
          (_, error) => {
            console.error('Error initializing database:', error);
            reject(error);
            return false; // Explicitly return false to indicate error handling
          }
        );
      });
    } catch (error) {
      console.error('Transaction setup error:', error);
      reject(error);
    }
  });
};

// Save cart items to SQLite
export const saveCartItems = (cartItems) => {
  return new Promise((resolve, reject) => {
    // First clear the existing items
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM cart_items',
        [],
        (_, deleteResult) => {
          // Then insert the new items
          if (cartItems.length === 0) {
            resolve(deleteResult);
            return;
          }

          let insertCount = 0;
          
          // Process each cart item sequentially
          cartItems.forEach(item => {
            tx.executeSql(
              `INSERT INTO cart_items (
                id, product_id, name, price, image, stock, quantity
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                `${item.product}_${Date.now()}_${Math.random().toString(36).substring(7)}`, // Unique ID with random component
                item.product,
                item.name,
                item.price,
                item.image,
                item.stock,
                item.quantity
              ],
              (_, insertResult) => {
                insertCount++;
                if (insertCount === cartItems.length) {
                  console.log('All cart items saved successfully');
                  resolve(insertResult);
                }
              },
              (_, error) => {
                console.error('Error saving cart item:', error);
                reject(error);
                return false;
              }
            );
          });
        },
        (_, error) => {
          console.error('Error clearing cart items:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

// Load cart items from SQLite
export const loadCartItems = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM cart_items',
        [],
        (_, { rows }) => {
          // Transform the data to match Redux store format
          const cartItems = Array.from(rows._array).map(item => ({
            product: item.product_id,
            name: item.name,
            price: item.price,
            image: item.image,
            stock: item.stock,
            quantity: item.quantity
          }));
          
          console.log('Cart items loaded successfully:', cartItems.length);
          resolve(cartItems);
        },
        (_, error) => {
          console.error('Error loading cart items:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

// Clear all cart items
export const clearCartItems = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM cart_items',
        [],
        (_, result) => {
          console.log('Cart items cleared successfully');
          resolve(result);
        },
        (_, error) => {
          console.error('Error clearing cart items:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export default {
  initDatabase,
  saveCartItems,
  loadCartItems,
  clearCartItems
}; 