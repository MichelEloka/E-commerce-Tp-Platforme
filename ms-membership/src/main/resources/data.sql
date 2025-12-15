-- Données initiales pour la base de données H2
-- Ce script est exécuté automatiquement au démarrage de l'application après la création du schéma par Hibernate

-- Insertion des utilisateurs initiaux pour les tests
INSERT INTO users (id, first_name, last_name, email, active, created_at, updated_at)
VALUES
(1, 'Jean', 'Dupont', 'jean.dupont@example.com', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Marie', 'Martin', 'marie.martin@example.com', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Pierre', 'Durand', 'pierre.durand@example.com', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Sophie', 'Lefebvre', 'sophie.lefebvre@example.com', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Luc', 'Bernard', 'luc.bernard@example.com', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
