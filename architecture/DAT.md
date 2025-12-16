# Document d'Architecture Technique (DAT)

## 1. Vue d'ensemble
Plateforme e-commerce composee de microservices Spring Boot (ms-membership, ms-product, ms-order), exposees en REST, surveillees par Prometheus/Grafana, front Vite/React. Communication HTTP interne via DNS Docker, base PostgreSQL partagee (dev). Packaging Docker + docker-compose.

```mermaid
graph LR
  UI[ms-ecommerce-ui (Vite/React)] -->|REST| MS-PRODUCT
  UI -->|REST| MS-MEMBERSHIP
  UI -->|REST| MS-ORDER
  MS-PRODUCT -->|REST (OrderClient)| MS-ORDER
  PROM[Prometheus] --> MS-PRODUCT
  PROM --> MS-MEMBERSHIP
  GRAF[Grafana] --> PROM
```

## 2. Microservices
- **ms-membership** : gestion utilisateurs (CRUD, activation). Spring Boot 3.5, JPA/PostgreSQL, port `${MS_MEMBERSHIP_PORT:-8081}`. Actuator + metrics Prometheus exposés sur `/actuator/*`.
- **ms-product** : catalogue/stock, filtres par categorie, CRUD. Spring Boot 3.5, JPA/PostgreSQL, port `${MS_PRODUCT_PORT:-8082}`. Client Order pour vérifier l'usage produit. Expose des métriques personnalisées (`products_low_stock_count`, `products_total`, etc.).
- **ms-order** : squelette commandes, port `${MS_ORDER_PORT:-8083}` (non terminé, référencé par ms-product via `ORDER_SERVICE_URL`).
- **Front** : Vite/React, consomme les API, port `${MS_UI_PORT:-5173}`. Variables VITE_* injectées côté build.
- **Monitoring** : Prometheus (9090) scrape Actuator, Grafana (3000) dashboards (datasource Prometheus pré-provisionnée).

## 3. Choix technologiques
- Java 21, Spring Boot 3.5
- Spring Web, Spring Data JPA, Validation
- SpringDoc OpenAPI pour la doc (swagger-ui)
- Actuator + Micrometer Prometheus pour metrics
- Docker/Docker Compose pour orchestration locale
- Vite/React (Tailwind) pour le front
- PostgreSQL persistant pour dev (volume Docker)

## 4. Communication inter-services
- REST/HTTP, JSON
- Decouverte statique via reseau Docker (`ms-product`, `ms-membership`, `ms-order`)
- Front consomme les URLs config via variables `VITE_*`
- OrderClient (ms-product) cible `ORDER_SERVICE_URL`

## 5. Donnees
- Base `ecommerce` Postgres partagee (tables distinctes par service)
- Seeds produits dans ms-product (data.sql)
- Persistance via volume Docker `postgres_data`

## 6. Erreurs / resilience
- Mapping d'erreurs back (product/membership) -> reponses JSON
- CORS autorise pour le front (localhost:5173)
- Health Actuator expose, suivi par Prometheus
- Logs applicatifs pour tracer les requetes
- Pas de retry/circuit-breaker (communication inter-service simple via HTTP)

## 7. Securite (dev)
- Pas d'authentification dans cette version
- A prevoir : gateway ou JWT pour les API publiques

## 8. Ports et variables clefs
- Voir `env.local` et DEPLOYMENT.md
- Ports par defaut : 8081 (membership), 8082 (product), 8083 (order), 5173 (UI), 9090 (Prometheus), 3000 (Grafana)
- URLs front : `VITE_MEMBERSHIP_API`, `VITE_PRODUCT_API`, `VITE_ORDER_API`
- Service Order vu par Product : `ORDER_SERVICE_URL`

## 9. Deploiement local
- Prerequis : Docker + Docker Compose
- Commande : `docker-compose up -d`
- Front : http://localhost:5173
- Swagger UI : http://localhost:8081/swagger-ui.html et http://localhost:8082/swagger-ui.html
- Monitoring : Prometheus http://localhost:9090, Grafana http://localhost:3000

## 10. Observabilite (detail)
- Metrics techniques : `http_server_requests_seconds_*`, `jdbc_connections_*`, `jvm_*`, `process_*`, `system_*`.
- Metrics metier (ms-product) : `products_low_stock_count`, `products_total`, `products_updated_total`, `products_stock_updated_total`.
- Verification rapide :
  - Prometheus : requete `up` ou `products_low_stock_count` dans http://localhost:9090 (onglet Graph/Explore).
  - Grafana : menu Explore -> datasource Prometheus -> taper une requete (ex: `products_low_stock_count`, `up{job="ms-product"}`).
- Logs : sortie console des conteneurs (`docker logs ms-product`, etc.).

## 11. Points d'attention / limites dev
- Bases H2 en memoire : pas de durabilite; redemarrage = perte des donnees.
- ms-order est partiel (endpoints non finalises), mais deja reference par ms-product.
- Pas d'authz/authn ni TLS; a securiser avant prod.
- Pas de tests d'integration/documentation sur ms-order; tester manuellement ou completer avant usage.
