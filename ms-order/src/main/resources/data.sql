-- Sample data for testing
-- Uses real users from ms-membership (1,2,3) and real products from ms-product

-- Insert sample orders
INSERT INTO orders (id, user_id, order_date, status, total_amount, shipping_address, created_at, updated_at)
VALUES
(1, 1, CURRENT_TIMESTAMP, 'PENDING', 79.99, '123 Rue de la Paix, Paris 75001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, CURRENT_TIMESTAMP, 'CONFIRMED', 229.98, '45 Avenue des Champs-Elysees, Paris 75008', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, DATEADD('DAY', -1, CURRENT_TIMESTAMP), 'DELIVERED', 114.65, '123 Rue de la Paix, Paris 75001', DATEADD('DAY', -1, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP),
(4, 3, DATEADD('DAY', -2, CURRENT_TIMESTAMP), 'SHIPPED', 59.99, '10 Boulevard Saint-Michel, Lyon 69001', DATEADD('DAY', -2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP),
(5, 2, DATEADD('DAY', -3, CURRENT_TIMESTAMP), 'CANCELLED', 0.00, '45 Avenue des Champs-Elysees, Paris 75008', DATEADD('DAY', -3, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP);

-- Insert order items using real product IDs and names from ms-product (10 products)
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, subtotal)
VALUES
-- Order 1: 1x Wireless Keyboard (id=1, 79.99)
(1, 1, 1, 'Wireless Keyboard', 1, 79.99, 79.99),
-- Order 2: 1x Bluetooth Headphones (id=5, 129.99) + 1x Gaming Mouse (id=10, 59.99)
(2, 2, 5, 'Bluetooth Headphones', 1, 129.99, 129.99),
(3, 2, 10, 'Gaming Mouse', 1, 59.99, 59.99),
-- Order 3: 2x Clean Code (id=2, 34.90) + 15x Energy Bar Chocolate (id=3, 2.99)
(4, 3, 2, 'Clean Code', 2, 34.90, 69.80),
(5, 3, 3, 'Energy Bar Chocolate', 15, 2.99, 44.85),
-- Order 4: 1x Gaming Mouse (id=10, 59.99)
(6, 4, 10, 'Gaming Mouse', 1, 59.99, 59.99),
-- Order 5: 1x USB-C Hub (id=9, 49.50) - cancelled order
(7, 5, 9, 'USB-C Hub', 1, 49.50, 49.50);
