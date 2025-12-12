# Monitoring (Prometheus & Grafana)

Ce document explique comment observer les microservices de la plateforme e-commerce avec Prometheus et Grafana, et lister les métriques principales (y compris les métriques personnalisées de `ms-product`).

## Démarrage rapide
- Lancer l’environnement : `docker-compose up -d`
- Accès Prometheus : http://localhost:9090
- Accès Grafana : http://localhost:3000 (user : admin / mdp :admin par défaut)

## Prometheus
- Configuration : `monitoring/prometheus/prometheus.yml`
- Targets scrappées :
  - `ms-membership:8081` (Spring Actuator `/actuator/prometheus`)
  - `ms-product:8082` (Spring Actuator `/actuator/prometheus`)
  - `ms-order:8083` (prévu, ajouter le service si besoin)
  - `prometheus:9090`

### Vérifications rapides
- Disponibilité des cibles : requête `up`
- Exemple de curl : `curl http://localhost:8082/actuator/prometheus | head`
- Vérifier les métriques disponibles : `http://localhost:9090/api/v1/label/__name__/values`

### Requêtes utiles (PromQL)
- Etat des scrapes : `up`
- Temps de réponse HTTP (toutes routes) : `rate(http_server_requests_seconds_sum[5m]) / rate(http_server_requests_seconds_count[5m])`
- Erreurs HTTP 5xx : `sum by (uri,method) (rate(http_server_requests_seconds_count{status=~"5.."}[5m]))`
- JDBC connexions actives : `jdbc_connections_active`

### Métriques personnalisées (ms-product)
- `products_low_stock_count` (gauge) : nombre de produits en dessous du seuil de stock.
- `products_total` (counter) : nombre de produits créés.
- `products_updated_total` (counter) : nombre de produits mis à jour.
- `products_stock_updated_total` (counter) : nombre de mises à jour de stock.

Exemples PromQL :
- Produits en stock faible : `products_low_stock_count`
- Créations produits par minute : `rate(products_total[5m])`
- Mises à jour de stock par minute : `rate(products_stock_updated_total[5m])`

## Grafana
- Datasource déjà provisionnée : `monitoring/grafana/provisioning/datasources/datasource.yml` (Prometheus sur `http://prometheus:9090`). Rien à configurer, Prometheus est prêt dans Grafana.
- Connexion : http://localhost:3000 (admin / admin).

### Méthode la plus rapide pour voir des métriques
1) Menu gauche → Explore  
2) Datasource → Prometheus  
3) Tape `products_low_stock_count` (ou `up{job="ms-product"}`) et exécute.

### Idées de tableaux de bord
- **Disponibilité** : panneau `up` par job (`ms-membership`, `ms-product`).
- **Stock** : graphique `products_low_stock_count` avec seuils (vert > 10, orange 5-10, rouge < 5).
- **Flux produits** :
  - `rate(products_total[5m])` (créations)
  - `rate(products_updated_total[5m])` (mises à jour)
  - `rate(products_stock_updated_total[5m])` (mises à jour de stock)
- **Performance HTTP** : latence p95 `histogram_quantile(0.95, sum by (le) (rate(http_server_requests_seconds_bucket{job="ms-product"}[5m])))`
- **Erreurs HTTP** : `sum by (status,uri) (rate(http_server_requests_seconds_count{job="ms-product",status=~"5.."}[5m]))`

### Seuils / alerting (pistes)
- Alerte stock bas : `products_low_stock_count > 0` sur 5 minutes.
- Alerte erreurs HTTP : taux d’erreur > 5% sur 5 minutes.
- Alerte lenteur : p95 > 1s sur 5 minutes.

## Dépannage
- Une cible est `down` dans Prometheus : vérifier que le conteneur tourne (`docker ps`) et que le port interne est 8081/8082/8083 selon le service.
- Pas de métriques : vérifier l’exposition Actuator `/actuator/prometheus` et la variable `SPRING_PROFILES_ACTIVE` si des profils désactivent l’Actuator.
- Grafana vide : confirmer que la datasource Prometheus est bien `prometheus:9090` (provision automatique) et que le dashboard pointe sur cette datasource.
