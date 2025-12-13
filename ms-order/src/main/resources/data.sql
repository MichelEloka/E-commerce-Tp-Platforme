-- Sample data for testing
-- Assumes users 1,2,3 exist in ms-membership and products 1,2,3,4,5 exist in ms-product

-- Insert sample orders
INSERT INTO orders (id, user_id, order_date, status, total_amount, shipping_address, created_at, updated_at)
VALUES
(1, 1, CURRENT_TIMESTAMP, 'PENDING', 299.99, '123 Rue de la Paix, Paris 75001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, CURRENT_TIMESTAMP, 'CONFIRMED', 149.99, '45 Avenue des Champs-Elysees, Paris 75008', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, DATEADD('DAY', -1, CURRENT_TIMESTAMP), 'DELIVERED', 599.98, '123 Rue de la Paix, Paris 75001', DATEADD('DAY', -1, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP),
(4, 3, DATEADD('DAY', -2, CURRENT_TIMESTAMP), 'SHIPPED', 89.99, '10 Boulevard Saint-Michel, Lyon 69001', DATEADD('DAY', -2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP),
(5, 2, DATEADD('DAY', -3, CURRENT_TIMESTAMP), 'CANCELLED', 0.00, '45 Avenue des Champs-Elysees, Paris 75008', DATEADD('DAY', -3, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP);

-- Insert order items
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, subtotal)
VALUES
-- Order 1 items
(1, 1, 1, 'Laptop Dell XPS 13', 1, 299.99, 299.99),
-- Order 2 items
(2, 2, 2, 'Wireless Mouse Logitech MX Master', 2, 74.995, 149.99),
-- Order 3 items
(3, 3, 1, 'Laptop Dell XPS 13', 2, 299.99, 599.98),
-- Order 4 items
(4, 4, 3, 'USB-C Hub Anker', 1, 89.99, 89.99),
-- Order 5 items (cancelled order)
(5, 5, 4, 'Mechanical Keyboard Keychron K2', 1, 119.99, 119.99);
