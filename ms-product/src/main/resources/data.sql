-- Seed idempotent : insere les produits si absents (match sur le nom)
MERGE INTO products p
USING (
    VALUES
    ('Wireless Keyboard', 'Clavier mecanique sans fil RGB', 79.99, 50, 'ELECTRONICS', 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04', TRUE),
    ('Clean Code', 'Livre sur les bonnes pratiques de developpement', 34.90, 120, 'BOOKS', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', TRUE),
    ('Energy Bar Chocolate', 'Barre energetique au chocolat', 2.99, 500, 'FOOD', 'https://images.unsplash.com/photo-1590080877777-2c1d4f76b6f7', TRUE),
    ('Desk Lamp', 'Lampe de bureau LED moderne', 34.90, 12, 'OTHER', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c', TRUE),
    ('Bluetooth Headphones', 'Casque sans fil avec reduction de bruit', 129.99, 8, 'ELECTRONICS', 'https://images.unsplash.com/photo-1518441902117-fb5c1e0bfa3c', TRUE),
    ('Spring Boot in Action', 'Guide complet Spring Boot', 39.90, 90, 'BOOKS', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f', TRUE),
    ('Organic Coffee', 'Cafe bio grains premium', 12.90, 200, 'FOOD', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', TRUE),
    ('Office Chair', 'Chaise de bureau ergonomique', 199.99, 5, 'OTHER', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', TRUE),
    ('USB-C Hub', 'Hub USB-C multiports', 49.50, 60, 'ELECTRONICS', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0', TRUE),
    ('Product Management', 'Methodes et outils pour Product Managers', 29.90, 110, 'BOOKS', 'https://images.unsplash.com/photo-1519681393784-d120267933ba', TRUE),
    ('Protein Shake', 'Boisson proteinee saveur vanille', 4.99, 300, 'FOOD', 'https://images.unsplash.com/photo-1572441710534-680b0e53b1a5', TRUE),
    ('Wall Clock', 'Horloge murale design', 24.90, 18, 'OTHER', 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92', TRUE),
    ('Gaming Mouse', 'Souris gaming haute precision', 59.99, 70, 'ELECTRONICS', 'https://images.unsplash.com/photo-1586816001966-79b736744398', TRUE),
    ('Java Concurrency', 'Programmation concurrente en Java', 44.90, 40, 'BOOKS', 'https://images.unsplash.com/photo-1512820790803-83ca734da794', TRUE),
    ('Green Tea', 'The vert naturel antioxydant', 6.50, 260, 'FOOD', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', TRUE),
    ('Storage Box', 'Boite de rangement multifonction', 14.90, 22, 'OTHER', 'https://images.unsplash.com/photo-1616627450600-2f1d0c67e0da', TRUE),
    ('Laptop Stand', 'Support aluminium pour ordinateur portable', 29.90, 45, 'ELECTRONICS', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8', TRUE),
    ('DDD Blue Book', 'Domain Driven Design explique', 49.90, 35, 'BOOKS', 'https://images.unsplash.com/photo-1519681393784-d120267933ba', TRUE),
    ('Cereal Mix', 'Melange de cereales petit-dejeuner', 3.90, 180, 'FOOD', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759', TRUE),
    ('Table Organizer', 'Organisateur de bureau', 19.90, 14, 'OTHER', 'https://images.unsplash.com/photo-1582582421239-8d4c4f5b7d5a', TRUE),
    ('Smartphone Charger', 'Chargeur rapide USB-C', 19.99, 130, 'ELECTRONICS', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0', TRUE),
    ('Microservices Patterns', 'Architecture microservices', 42.00, 55, 'BOOKS', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f', TRUE),
    ('Dark Chocolate', 'Chocolat noir 70%', 3.50, 400, 'FOOD', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b', TRUE),
    ('Floor Lamp', 'Lampadaire design moderne', 89.90, 9, 'OTHER', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36', TRUE),
    ('Noise Cancelling Earbuds', 'Ecouteurs antibruit', 99.90, 25, 'ELECTRONICS', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df', TRUE),
    ('Agile Product Ownership', 'Guide pratique Agile', 31.90, 65, 'BOOKS', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', TRUE),
    ('Protein Cookies', 'Cookies proteines', 3.20, 210, 'FOOD', 'https://images.unsplash.com/photo-1587248720327-8eb72564be1b', TRUE),
    ('Shelf Unit', 'Etagere murale minimaliste', 59.90, 11, 'OTHER', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', TRUE),
    ('Webcam HD', 'Webcam Full HD', 69.90, 33, 'ELECTRONICS', 'https://images.unsplash.com/photo-1580894908361-967195033215', TRUE),
    ('Refactoring', 'Ameliorer le code existant', 38.90, 48, 'BOOKS', 'https://images.unsplash.com/photo-1512820790803-83ca734da794', TRUE),
    ('Fruit Juice', 'Jus de fruits naturel', 2.50, 320, 'FOOD', 'https://images.unsplash.com/photo-1571689936042-d42a63d8c06d', TRUE),
    ('Trash Bin', 'Poubelle design interieur', 24.90, 17, 'OTHER', 'https://images.unsplash.com/photo-1581579185169-47c6c7f8a3e1', TRUE),
    ('Mechanical Keyboard Pro', 'Clavier mecanique professionnel', 149.99, 6, 'ELECTRONICS', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8', TRUE),
    ('API Design', 'Conception d API modernes', 36.90, 58, 'BOOKS', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f', TRUE),
    ('Granola', 'Granola bio croustillant', 4.50, 240, 'FOOD', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759', TRUE),
    ('Laundry Basket', 'Panier a linge', 19.90, 13, 'OTHER', 'https://images.unsplash.com/photo-1616627450600-2f1d0c67e0da', TRUE),
    ('Power Bank', 'Batterie externe 20000mAh', 39.90, 95, 'ELECTRONICS', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0', TRUE),
    ('Software Architecture', 'Architecture logicielle moderne', 45.90, 42, 'BOOKS', 'https://images.unsplash.com/photo-1519681393784-d120267933ba', TRUE),
    ('Oat Cookies', 'Biscuits a l avoine', 3.10, 260, 'FOOD', 'https://images.unsplash.com/photo-1587248720327-8eb72564be1b', TRUE),
    ('Mirror', 'Miroir mural decoratif', 69.90, 7, 'OTHER', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36', TRUE),
    ('Bluetooth Speaker', 'Enceinte bluetooth portable', 89.90, 44, 'ELECTRONICS', 'https://images.unsplash.com/photo-1580894908361-967195033215', TRUE),
    ('Extreme Programming', 'Methodes XP expliquees', 33.90, 60, 'BOOKS', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', TRUE),
    ('Snack Mix', 'Melange de snacks sales', 3.70, 310, 'FOOD', 'https://images.unsplash.com/photo-1590080877777-2c1d4f76b6f7', TRUE),
    ('Coat Rack', 'Porte-manteau design', 49.90, 10, 'OTHER', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c', TRUE)
) AS v(name, description, price, stock, category, image_url, active)
ON p.name = v.name
WHEN NOT MATCHED THEN
INSERT (name, description, price, stock, category, image_url, active, created_at, updated_at)
VALUES (v.name, v.description, v.price, v.stock, v.category, v.image_url, v.active, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
