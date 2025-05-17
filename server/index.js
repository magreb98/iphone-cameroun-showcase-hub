
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const sequelize = new Sequelize('iphone_cameroun', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

// Test DB connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connection established successfully.');
    
    // Sync models with database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
    
    // Import routes after models are defined and synced
    const productRoutes = require('./routes/products');
    const categoryRoutes = require('./routes/categories');
    const authRoutes = require('./routes/auth');
    
    // Routes
    app.use('/api/products', productRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/auth', authRoutes);
    
    // Seed database with demo data
    const seedDatabase = require('./seedData');
    await seedDatabase();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { sequelize };
