
import express, { json } from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import authRoutes from './routes/auth';
import seedDatabase from './seedData';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(json());

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
    
    // Seed database with demo data
    await seedDatabase();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default { sequelize };
