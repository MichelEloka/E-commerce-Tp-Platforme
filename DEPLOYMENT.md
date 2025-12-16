# DEPLOYMENT.md

## Prérequis
- Java 21 (JDK)
- Maven 3.9+
- Node 20+ (pour le front)
- Docker + Docker Compose

## Code source
1. **Cloner le repose depuis github**
lien du git : https://github.com/MichelEloka/E-commerce-Tp-Platforme.git

## Démarrage pas-à-pas


2. **Compiler les services Java**
   ```bash
   cd ms-membership && mvn clean package -DskipTests
   cd ../ms-product && mvn clean package -DskipTests
   cd ../ms-order && mvn clean package -DskipTests
   ```
3. **Compiler le front** (optionnel en local, l'image le fait)
   ```bash
   cd ../ms-ecommerce-ui && npm install && npm run build
   ```
4. **Démarrer en Docker** (à la racine)
   ```bash
   docker compose up -d --build
   ```
5. **Vérifier**
   - Membership API : http://localhost:8081/api/v1/users
   - Product API : http://localhost:8082/api/v1/products
   - Order API : http://localhost:8083/api/v1/orders (si implémentée)
   - Front : http://localhost:5173
   - Prometheus : http://localhost:9090
   - Grafana : http://localhost:3000 (admin/admin)

## Ports par défaut
- ms-membership : 8081
- ms-product : 8082
- ms-order : 8083
- ms-ecommerce-ui : 5173
- Prometheus : 9090
- Grafana : 3000

## Variables d'environnement (voir env.local)
- `MS_MEMBERSHIP_PORT`, `MS_PRODUCT_PORT`, `MS_ORDER_PORT`, `MS_UI_PORT`
- `VITE_MEMBERSHIP_API`, `VITE_PRODUCT_API`, `VITE_ORDER_API`
- `ORDER_SERVICE_URL`
- `SPRING_PROFILES_ACTIVE`

## Troubleshooting courant
- **Port déjà utilisé** : changer la variable dans `env.local` puis `docker compose up -d`.
- **JDK 21 manquant** : installer un JDK 21 (Temurin) ou baisser `java.version`/`maven.compiler.*` à 17.
- **Front ne charge pas** : vérifier `react-toastify` installé, relancer `npm install`; vérifier VITE_* pointent sur les bonnes URLs.
- **CORS** : déjà autorisé pour `http://localhost:5173`; adapter la variable `CORS_ALLOWED_ORIGINS` si besoin.
- **Prometheus/Grafana** : s'assurer que les services ciblés sont up; vérifier les endpoints `/actuator/prometheus`.
