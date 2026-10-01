-- Seed Data for Warranty Management System

-- Categories
INSERT INTO categories (name, description) VALUES
('Laptops & Computers', 'Laptops, desktop PCs, monitors, and computing accessories'),
('Smartphones & Tablets', 'Mobile phones, tablets, smartwatches, and accessories'),
('Home Appliances', 'Refrigerators, washing machines, microwaves, and vacuums'),
('Audio & Entertainment', 'Headphones, soundbars, televisions, and gaming consoles'),
('Office Equipment', 'Printers, scanners, projectors, and office machinery')
ON CONFLICT (name) DO NOTHING;
