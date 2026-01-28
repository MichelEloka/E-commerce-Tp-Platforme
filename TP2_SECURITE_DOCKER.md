# TP 2 - Sécurisation JWT & Dockerisation

## Contexte

Suite au TP précédent, vous devez maintenant **sécuriser** la plateforme e-commerce et la **containeriser** pour un déploiement en environnement réel.

**Durée estimée** : 3 semaines, date limite d'envoi le lundi 12 janvier à minuit    
**Travail** : En binôme ou trinôme  
**Email-Receiver**:  rkarra.okad@gmail.com

---

## Objectifs

### 1️) Sécurisation JWT 

Implémenter une authentification complète avec tokens JWT et chiffrement asymétrique (RSA).

#### data Flow de sécurité

```
Client → [POST /auth/login] → Service Membership → JWT Token (signé RSA)
                                                          
Client → [GET /products/***] → Service Product ← Validation JWT (clé publique)

Client → [POST /orders/***] → Service Order ← Validation JWT (clé publique)
```

#### Travail demandé

**A. Service Membership - Génération JWT**

- Créer endpoint `POST /api/v1/auth/login` (email + password)
- Générer paire de clés RSA (2048 bits minimum)
  - Clé privée : pour signer les JWT (garde secrète)
  - Clé publique : pour valider les JWT (partagée aux autres services)
- JWT contenant : userId, email, roles, exp (expiration 1h)
- Retourner : `{ "token": "eyJhbGc...", "expiresIn": 3600 }`

**B. Services Product & Order - Validation JWT**

- Configurer Spring Security sur chaque service
- Créer un filtre JWT qui :
  - Extrait le token du header `Authorization: Bearer <token>`
  - Valide la signature avec la clé publique RSA
  - Vérifie l'expiration
  - Extrait les informations utilisateur (userId, roles)
- Protéger TOUS les endpoints (sauf /actuator .... /actuator/health)
- Retourner `401 Unauthorized` si token invalide/absent
- Retourner `403 Forbidden` si token expiré

**C. Communication inter-services sécurisée**

- Quand Order appelle Product ou User :
  - Propager le JWT dans le header Authorization
  - Gérer l'erreur 401 si le service cible rejette le token

#### Contraintes techniques

- Chiffrement asymétrique RSA obligatoire (pas de clé symétrique)
- Algorithme JWT : RS256
- Clés stockées dans les fichiers : `private_key.pem` et `public_key.pem`
- Expiration token : 1 heure
- Pas de base de données pour stocker les tokens (stateless)

---

### 2️) Dockerisation complète

Containeriser l'ensemble de la plateforme et publier sur Docker Hub privé.

#### Travail demandé

**A. Création des Dockerfiles**

Créer un `Dockerfile` pour **chaque microservice** :
- Image de base : exemple `openjdk:21`
- Exposer le port du service
- Copier le JAR compilé
- Point d'entrée : exécution du JAR

**B. Docker Compose**

Créer un fichier `docker-compose.yml` orchestrant :
- Les 3 microservices (membership:8081, product:8082, order:8083)
- Prometheus (9090)
- Grafana (3000)
- Network interne pour la communication
- Volumes pour la persistance Grafana/Prometheus

**C. Publication Docker Hub**

- Créer un repository **privé** sur Docker Hub pour chaque service :
  - `votre-username/ecommerce-membership:1.0`
  - `votre-username/ecommerce-product:1.0`
  - `votre-username/ecommerce-order:1.0`
- Publier les 3 images
- Partager l'accès avec l'enseignant

**D. Scripts de build et déploiement**

Créer les scripts suivants dans un dossier `docker/` :
- `build-all.sh` : Compile les 3 services et build les images Docker
- `publish-all.sh` : Tag et push les images vers Docker Hub
- `deploy.sh` : Pull les images depuis Docker Hub et lance docker-compose

---

## Livrables

### 1. Code source modifié

```
ecommerce-platform/
... le code source java des diff modules
└── docker/
    ├── docker-compose.yml
    ├── build-all.sh
    ├── publish-all.sh
    └── deploy.sh
```

### 2. Documentation

**Fichier : `SECURITY.md`**
- Explication de l'architecture de sécurité
- Diagramme de séquence de l'authentification
- Format du JWT (header, payload, signature)
- Gestion des clés RSA (génération, distribution)
- Gestion des erreurs (401, 403)

**Fichier : `DOCKER.md`**
- Liste des commandes Docker utilisées :
  - Génération des clés RSA
  - Build des images : `docker build`
  - Tag des images : `docker tag`
  - Push vers Docker Hub : `docker push`
  - Pull depuis Docker Hub : `docker pull`
  - Exécution : `docker-compose up`
- Instructions pour recréer la plateforme depuis zéro
- Configuration Docker Hub (repository privé)

### 3. Collection Postman mise à jour

**Fichier : `postman/platform-secured.json`**

Scénarios de test incluant :
1. Login → Récupération du token
2. Appel Product avec token → 200 OK
3. Appel Product sans token → 401 Unauthorized
4. Appel Order avec token expiré → 403 Forbidden
5. Création commande complète (avec token valide)
