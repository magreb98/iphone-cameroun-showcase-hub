
-- Création de la base de données
CREATE DATABASE IF NOT EXISTS iphone_cameroun;
USE iphone_cameroun;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  isAdmin BOOLEAN DEFAULT false,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS Categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des produits
CREATE TABLE IF NOT EXISTS Products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  imageUrl VARCHAR(255) NOT NULL,
  inStock BOOLEAN DEFAULT true,
  quantity INT DEFAULT 0,
  categoryId INT NOT NULL,
  isOnPromotion BOOLEAN DEFAULT false,
  promotionPrice INT NULL,
  promotionEndDate DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES Categories(id)
);

-- Insertion des données de test
-- Utilisateur admin
INSERT INTO Users (email, password, isAdmin) VALUES 
('admin@iphonecameroun.com', '$2a$10$XFGYTcKBxED/KY0KpU5Ke.n8XZ1QY5CeYIw.9rWtpQNVCiX2Yx.cO', true);
-- Le mot de passe est 'admin123' hashé avec bcrypt

-- Catégories
INSERT INTO Categories (name, description) VALUES 
('iPhones', 'Smartphones Apple iPhone'),
('iPads', 'Tablettes Apple iPad'),
('Macbooks', 'Ordinateurs portables Apple MacBook'),
('Accessoires', 'Accessoires pour produits Apple');

-- Produits
INSERT INTO Products (name, price, imageUrl, categoryId, inStock, quantity) VALUES 
('iPhone 14 Pro', 899000, 'https://placehold.co/600x400?text=iPhone+14+Pro', 1, true, 10),
('iPhone 15', 999000, 'https://placehold.co/600x400?text=iPhone+15', 1, true, 5),
('iPad Air', 699000, 'https://placehold.co/600x400?text=iPad+Air', 2, true, 8),
('MacBook Pro 16"', 1899000, 'https://placehold.co/600x400?text=MacBook+Pro', 3, true, 3),
('AirPods Pro', 199000, 'https://placehold.co/600x400?text=AirPods+Pro', 4, true, 15),
('Chargeur MagSafe', 49000, 'https://placehold.co/600x400?text=MagSafe+Charger', 4, true, 20);

-- Produits en promotion (exemple)
INSERT INTO Products (name, price, imageUrl, categoryId, inStock, quantity, isOnPromotion, promotionPrice, promotionEndDate) VALUES 
('iPhone 13', 799000, 'https://placehold.co/600x400?text=iPhone+13', 1, true, 7, true, 699000, DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY)),
('AirPods 3', 159000, 'https://placehold.co/600x400?text=AirPods+3', 4, true, 12, true, 129000, DATE_ADD(CURRENT_DATE(), INTERVAL 15 DAY));
