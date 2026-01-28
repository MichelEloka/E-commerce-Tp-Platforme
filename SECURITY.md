# Security

## Architecture
- Service membership genere les JWT apres authentification via `POST /api/v1/auth/login`.
- Services product et order valident les JWT (resource server) avec la cle publique RSA.
- Tous les services restent stateless (pas de stockage serveur des tokens).

## Authentication flow (sequence)
```
Client -> POST /api/v1/auth/login (ms-membership)
ms-membership -> verifie email/password, signe JWT (cle privee RSA)
Client -> GET /api/v1/products/** (ms-product) avec Authorization: Bearer <token>
ms-product -> verifie signature, expiration, claims
Client -> POST /api/v1/orders/** (ms-order) avec Authorization: Bearer <token>
ms-order -> verifie signature, expiration, claims
```

## JWT format
Header (RS256):
```json
{"alg":"RS256","typ":"JWT"}
```

Payload (exemple):
```json
{
  "sub": "12",
  "userId": 12,
  "email": "jean.dupont@example.com",
  "roles": ["ROLE_USER"],
  "iss": "ms-membership",
  "iat": 1736622000,
  "exp": 1736625600
}
```

Signature:
- Calculee avec la cle privee RSA.
- Validee avec la cle publique RSA.

## RSA keys (generation + distribution)
Fichiers attendus:
- `secrets/private_key.pem`
- `secrets/public_key.pem`

Montage en conteneur (Docker secrets):
- Private key: `/run/secrets/private_key.pem`
- Public key: `/run/secrets/public_key.pem`

Variables d'environnement:
- `JWT_PRIVATE_KEY_PATH` (ms-membership)
- `JWT_PUBLIC_KEY_PATH` (tous les services)
- `JWT_EXPIRATION_SECONDS` (default 3600)

Generation des cles (RSA 2048):
```bash
openssl genpkey -algorithm RSA -out secrets/private_key.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in secrets/private_key.pem -out secrets/public_key.pem
```

## Error handling (401/403)
- 401 Unauthorized:
  - Identifiants invalides (ms-membership `/api/v1/auth/login`)
  - Token absent ou invalide (ms-product, ms-order)
- 403 Forbidden:
  - Token expire (ms-product, ms-order)

## Public endpoints
- `POST /api/v1/auth/login` (login)
- `POST /api/v1/users` (creation de compte)
- `/actuator/**` et swagger (health/docs)

## Inter-service calls
- ms-order propage le header `Authorization: Bearer <token>` vers ms-product et ms-membership.
