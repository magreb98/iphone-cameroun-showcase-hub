
-- Création de la base de données
CREATE DATABASE IF NOT EXISTS iphone_cameroun;
USE iphone_cameroun;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  isAdmin BOOLEAN DEFAULT false,
  isSuperAdmin BOOLEAN DEFAULT false,
  locationId INT NULL,
  name VARCHAR(255) NULL,
  whatsappNumber VARCHAR(20) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des emplacements (magasins)
CREATE TABLE IF NOT EXISTS Locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  address VARCHAR(255) NULL,
  description TEXT NULL,
  imageUrl VARCHAR(255) NULL,
  phone VARCHAR(20) NULL,
  email VARCHAR(255) NULL,
  whatsappNumber VARCHAR(20) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS Categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  imageUrl VARCHAR(255) NULL,
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
  locationId INT NOT NULL,
  isOnPromotion BOOLEAN DEFAULT false,
  promotionPrice INT NULL,
  promotionEndDate DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES Categories(id),
  FOREIGN KEY (locationId) REFERENCES Locations(id)
);

-- Nouvelle table pour les images de produits
CREATE TABLE IF NOT EXISTS ProductImages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  imageUrl VARCHAR(255) NOT NULL,
  isMainImage BOOLEAN DEFAULT false,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
);

-- Table des configurations
CREATE TABLE IF NOT EXISTS Configurations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  configKey VARCHAR(255) NOT NULL UNIQUE,
  configValue TEXT NOT NULL,
  description TEXT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ajout de la contrainte de clé étrangère pour locationId dans la table Users
ALTER TABLE Users ADD FOREIGN KEY (locationId) REFERENCES Locations(id);

-- Insertion des données de test
-- Emplacements
INSERT INTO Locations (name, address, whatsappNumber, phone, email) VALUES 
('Principal', 'Yaoundé Centre, Cameroun', '+237600000001', '+237600000001', 'principal@iphonecameroun.com'),
('Douala', 'Douala Centre, Cameroun', '+237600000002', '+237600000002', 'douala@iphonecameroun.com'),
('Bafoussam', 'Bafoussam Centre, Cameroun', '+237600000003', '+237600000003', 'bafoussam@iphonecameroun.com');

-- Utilisateur super admin et admin pour chaque emplacement
INSERT INTO Users (email, password, isAdmin, isSuperAdmin, locationId, name, whatsappNumber) VALUES 
('superadmin@iphonecameroun.com', '$2a$10$XFGYTcKBxED/KY0KpU5Ke.n8XZ1QY5CeYIw.9rWtpQNVCiX2Yx.cO', true, true, 1, 'Super Admin', '+237600000001'),
('admin.douala@iphonecameroun.com', '$2a$10$XFGYTcKBxED/KY0KpU5Ke.n8XZ1QY5CeYIw.9rWtpQNVCiX2Yx.cO', true, false, 2, 'Admin Douala', '+237600000002'),
('admin.bafoussam@iphonecameroun.com', '$2a$10$XFGYTcKBxED/KY0KpU5Ke.n8XZ1QY5CeYIw.9rWtpQNVCiX2Yx.cO', true, false, 3, 'Admin Bafoussam', '+237600000003');

-- Catégories
INSERT INTO Categories (name, description) VALUES 
('iPhones', 'Smartphones Apple iPhone'),
('iPads', 'Tablettes Apple iPad'),
('Macbooks', 'Ordinateurs portables Apple MacBook'),
('Accessoires', 'Accessoires pour produits Apple');

-- Configuration WhatsApp
INSERT INTO Configurations (configKey, configValue, description) VALUES
('whatsapp_number', '+237600000001', 'Numéro WhatsApp pour les contacts clients (admin principal)');

-- Produits
INSERT INTO Products (name, price, imageUrl, categoryId, locationId, inStock, quantity) VALUES 
('iPhone 14 Pro', 899000, 'https://placehold.co/600x400?text=iPhone+14+Pro', 1, 1, true, 10),
('iPhone 15', 999000, 'https://placehold.co/600x400?text=iPhone+15', 1, 1, true, 5),
('iPad Air', 699000, 'https://placehold.co/600x400?text=iPad+Air', 2, 2, true, 8),
('MacBook Pro 16"', 1899000, 'https://placehold.co/600x400?text=MacBook+Pro', 3, 2, true, 3),
('AirPods Pro', 199000, 'https://placehold.co/600x400?text=AirPods+Pro', 4, 3, true, 15),
('Chargeur MagSafe', 49000, 'https://placehold.co/600x400?text=MagSafe+Charger', 4, 3, true, 20);

-- Produits en promotion (exemple)
INSERT INTO Products (name, price, imageUrl, categoryId, locationId, inStock, quantity, isOnPromotion, promotionPrice, promotionEndDate) VALUES 
('iPhone 13', 799000, 'https://placehold.co/600x400?text=iPhone+13', 1, 1, true, 7, true, 699000, DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY)),
('AirPods 3', 159000, 'https://placehold.co/600x400?text=AirPods+3', 4, 2, true, 12, true, 129000, DATE_ADD(CURRENT_DATE(), INTERVAL 15 DAY));

-- Images supplémentaires pour les produits
INSERT INTO ProductImages (productId, imageUrl, isMainImage) VALUES 
(1, 'https://placehold.co/600x400?text=iPhone+14+Pro', true),
(1, 'https://placehold.co/600x400?text=iPhone+14+Pro+Side', false),
(1, 'https://placehold.co/600x400?text=iPhone+14+Pro+Back', false),
(2, 'https://placehold.co/600x400?text=iPhone+15', true),
(2, 'https://placehold.co/600x400?text=iPhone+15+Side', false);
