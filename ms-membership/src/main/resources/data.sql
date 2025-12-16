-- Données initiales pour la base de données H2
-- Ce script est exécuté automatiquement au démarrage de l'application après la création du schéma par Hibernate

-- Purge et reset de la séquence pour éviter les collisions d'ID
DELETE FROM users;
ALTER TABLE users ALTER COLUMN id RESTART WITH 1;

-- Insertion des utilisateurs initiaux pour les tests (sans ID explicite)
INSERT INTO users (first_name, last_name, email, active, created_at, updated_at)
VALUES
('Jean', 'Dupont', 'jean.dupont@example.com', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Marie', 'Martin', 'marie.martin@example.com', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Pierre', 'Durand', 'pierre.durand@example.com', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sophie', 'Lefebvre', 'sophie.lefebvre@example.com', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Luc', 'Bernard', 'luc.bernard@example.com', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Réaligner l'auto-incrément après les données de démo pour éviter les collisions
ALTER TABLE users ALTER COLUMN id RESTART WITH 100;
