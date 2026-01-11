-- Données initiales pour la base PostgreSQL
-- Ce script est exécuté automatiquement au démarrage de l'application après la création du schéma par Hibernate

-- Purge et reset de la séquence pour éviter les collisions d'ID
DELETE FROM users;
ALTER TABLE users ALTER COLUMN id RESTART WITH 1;

-- Insertion des utilisateurs initiaux pour les tests (sans ID explicite)
INSERT INTO users (first_name, last_name, email, password, roles, active, created_at, updated_at)
VALUES
('Jean', 'Dupont', 'jean.dupont@example.com', '$2a$10$W79PlmT50o6.yRbMu1YAVOh495X.1estyvrMAwiCQxaHjSSWoKnTW', 'ROLE_USER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Marie', 'Martin', 'marie.martin@example.com', '$2a$10$W79PlmT50o6.yRbMu1YAVOh495X.1estyvrMAwiCQxaHjSSWoKnTW', 'ROLE_USER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Pierre', 'Durand', 'pierre.durand@example.com', '$2a$10$W79PlmT50o6.yRbMu1YAVOh495X.1estyvrMAwiCQxaHjSSWoKnTW', 'ROLE_USER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sophie', 'Lefebvre', 'sophie.lefebvre@example.com', '$2a$10$W79PlmT50o6.yRbMu1YAVOh495X.1estyvrMAwiCQxaHjSSWoKnTW', 'ROLE_USER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Luc', 'Bernard', 'luc.bernard@example.com', '$2a$10$W79PlmT50o6.yRbMu1YAVOh495X.1estyvrMAwiCQxaHjSSWoKnTW', 'ROLE_USER', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Réaligner l'auto-incrément après les données de démo pour éviter les collisions
ALTER TABLE users ALTER COLUMN id RESTART WITH 100;
