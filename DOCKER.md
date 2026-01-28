# Docker

## Commands used

### RSA key generation (RSA 2048)
```bash
openssl genpkey -algorithm RSA -out secrets/private_key.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in secrets/private_key.pem -out secrets/public_key.pem
```

### Build images (docker build)
```bash
docker build -t e-commerce-tp-platforme-ms-membership ./ms-membership
docker build -t e-commerce-tp-platforme-ms-product ./ms-product
docker build -t e-commerce-tp-platforme-ms-order ./ms-order
```

### Tag images
```bash
docker tag e-commerce-tp-platforme-ms-membership:latest micheleloka/e-commerce-tp-platforme-ms-membership:latest
docker tag e-commerce-tp-platforme-ms-product:latest micheleloka/e-commerce-tp-platforme-ms-product:latest
docker tag e-commerce-tp-platforme-ms-order:latest micheleloka/e-commerce-tp-platforme-ms-order:latest
```

### Push to Docker Hub
```bash
docker push micheleloka/e-commerce-tp-platforme-ms-membership:latest
docker push micheleloka/e-commerce-tp-platforme-ms-product:latest
docker push micheleloka/e-commerce-tp-platforme-ms-order:latest
```

### Pull from Docker Hub
```bash
docker pull micheleloka/e-commerce-tp-platforme-ms-membership:latest
docker pull micheleloka/e-commerce-tp-platforme-ms-product:latest
docker pull micheleloka/e-commerce-tp-platforme-ms-order:latest
```

### Run (docker compose)
```bash
docker compose up -d --build
```

## Recreate the platform from scratch
1) Generate RSA keys in `secrets/` (see commands above).
2) Build images locally or pull them from Docker Hub.
3) Start the stack:
```bash
docker compose up -d --build
```
4) Check containers:
```bash
docker compose ps
```

## Docker Hub (private repository)
- Create private repositories in Docker Hub for each image:
  - `e-commerce-tp-platforme-ms-membership`
  - `e-commerce-tp-platforme-ms-product`
  - `e-commerce-tp-platforme-ms-order`
- Login:
```bash
docker login
```
- Use your namespace in tags (or override in scripts):
```bash
export DOCKERHUB_NAMESPACE="micheleloka"
export TAG="latest"
```

## Scripts (docker/)
- `docker/build-all.sh`: build Maven artifacts + Docker images for the 3 backend services.
- `docker/publish-all.sh`: tag + push images to Docker Hub (defaults to namespace `micheleloka` if not set).
- `docker/deploy.sh`: pull images from Docker Hub, retag locally, then `docker compose up -d --no-build`.
