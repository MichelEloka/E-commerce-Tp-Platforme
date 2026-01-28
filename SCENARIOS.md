# Scenarios de test JWT (Postman + curl)

## Prerequis
- Docker Desktop + Docker Compose v2
- Ports libres: 80, 443, 5173, 8081, 8082, 8083, 5432
- Cles RSA presentes:
  - `secrets/private_key.pem`
  - `secrets/public_key.pem`
- `env.local` present (optionnel), sinon les defaults sont utilises
- Utilisateur seed pour login:
  - email: `jean.dupont@example.com`
  - password: `password123`

## Lancer la plateforme
Depuis la racine du repo:
```bash
docker compose up -d --build
```

Verifier que tout tourne:
```bash
docker compose ps
```

Acces UI:
- HTTPS via Traefik: `https://localhost`

APIs:
- HTTPS via Traefik:
  - `https://localhost/api/membership`
  - `https://localhost/api/product`
  - `https://localhost/api/order`
- HTTP direct (ports):
  - `http://localhost:8081`
  - `http://localhost:8082`
  - `http://localhost:8083`

Note HTTPS:
- Certificat auto-signe -> activer "Disable SSL verification" dans Postman
- En curl, ajouter `-k`

## Scenarios de test (Postman)
Importer la collection: `postman/platform-secured.json`

Variables a definir dans Postman (au choix):
- Option HTTPS:
  - `membership_api = https://localhost/api/membership`
  - `product_api = https://localhost/api/product`
  - `order_api = https://localhost/api/order`
- Option HTTP:
  - `membership_api = http://localhost:8081`
  - `product_api = http://localhost:8082`
  - `order_api = http://localhost:8083`

Executer les requetes dans l'ordre:
1. Login -> recupere le token (stocke dans `auth_token`)
2. Product avec token -> 200
3. Product sans token -> 401
4. Order avec token expire -> 403
5. Creation commande complete -> 201

## Scenarios de test (curl)
HTTPS:
```bash
CURL="curl -k"
MEMBERSHIP_API="https://localhost/api/membership"
PRODUCT_API="https://localhost/api/product"
ORDER_API="https://localhost/api/order"
```

HTTP:
```bash
CURL="curl"
MEMBERSHIP_API="http://localhost:8081"
PRODUCT_API="http://localhost:8082"
ORDER_API="http://localhost:8083"
```

1) Login -> token
```bash
TOKEN=$($CURL -s -X POST "$MEMBERSHIP_API/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"jean.dupont@example.com","password":"password123"}' | \
  python -c "import sys, json; print(json.load(sys.stdin)['token'])")
echo "$TOKEN"
```

2) Product avec token -> 200
```bash
$CURL -i "$PRODUCT_API/api/v1/products" -H "Authorization: Bearer $TOKEN"
```

3) Product sans token -> 401
```bash
$CURL -i "$PRODUCT_API/api/v1/products"
```

4) Order avec token expire -> 403
```bash
EXPIRED_TOKEN="COLLE_ICI_UN_TOKEN_EXPIRE"
$CURL -i "$ORDER_API/api/v1/orders" -H "Authorization: Bearer $EXPIRED_TOKEN"
```

5) Creation commande complete -> 201
```bash
$CURL -i -X POST "$ORDER_API/api/v1/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"userId":1,"shippingAddress":"10 rue de Paris, 75001 Paris","items":[{"productId":1,"quantity":1}]}'
```

## Comment obtenir un token expire
1) Mettre une duree tres courte dans `env.local`:
```
JWT_EXPIRATION_SECONDS=1
```
2) Recrer le conteneur ms-membership:
```bash
docker compose up -d --force-recreate ms-membership
```
3) Faire un login, recuperer le token, attendre 2-3 secondes.
4) Utiliser ce token sur un endpoint protege (ex: `GET /api/v1/orders`) -> 403.

Remettre la valeur normale ensuite (ex: 3600) et recreer ms-membership.
