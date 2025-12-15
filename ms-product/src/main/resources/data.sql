-- Seed idempotent : insere les produits si absents (match sur le nom)
-- 10 produits avec images reelles verifiees
MERGE INTO products p
USING (
    VALUES
    ('Wireless Keyboard', 'Clavier mecanique sans fil RGB avec retroeclairage', 79.99, 50, 'ELECTRONICS', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', TRUE),
    ('Clean Code', 'Livre sur les bonnes pratiques de developpement logiciel', 34.90, 120, 'BOOKS', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', TRUE),
    ('Energy Bar Chocolate', 'Barre energetique au chocolat noir 70%', 2.99, 500, 'FOOD', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', TRUE),
    ('Desk Lamp', 'Lampe de bureau LED ajustable avec variateur', 34.90, 12, 'OTHER', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', TRUE),
    ('Bluetooth Headphones', 'Casque sans fil avec reduction de bruit active', 129.99, 8, 'ELECTRONICS', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', TRUE),
    ('Spring Boot in Action', 'Guide complet pour maitriser Spring Boot', 39.90, 90, 'BOOKS', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', TRUE),
    ('Organic Coffee', 'Cafe bio grains arabica premium torrefaction artisanale', 12.90, 200, 'FOOD', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400', TRUE),
    ('Office Chair', 'Chaise de bureau ergonomique avec support lombaire', 199.99, 5, 'OTHER', 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400', TRUE),
    ('USB-C Hub', 'Hub USB-C 7-en-1 avec HDMI et lecteur SD', 49.50, 60, 'ELECTRONICS', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400', TRUE),
    ('Gaming Mouse', 'Souris gaming RGB haute precision 16000 DPI', 59.99, 70, 'ELECTRONICS', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', TRUE)
) AS v(name, description, price, stock, category, image_url, active)
ON p.name = v.name
WHEN NOT MATCHED THEN
INSERT (name, description, price, stock, category, image_url, active, created_at, updated_at)
VALUES (v.name, v.description, v.price, v.stock, v.category, v.image_url, v.active, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
