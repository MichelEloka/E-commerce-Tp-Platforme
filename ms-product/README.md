# ms-product

Service « produit » de la plateforme e-commerce.

## Technologies
- Java 21, Spring Boot
- Spring Web, Spring Data JPA (H2 en mémoire)
- Spring Validation
- SpringDoc OpenAPI (swagger-ui)
- Spring Boot Actuator + Micrometer Prometheus
- Docker/Docker Compose pour le run local

## URLs (par défaut)
- API : `http://localhost:8082`
- Swagger UI : `http://localhost:8082/swagger-ui.html` (ou `/swagger-ui/index.html`)
- OpenAPI JSON : `http://localhost:8082/v3/api-docs`
- Actuator health : `http://localhost:8082/actuator/health`
- Actuator Prometheus : `http://localhost:8082/actuator/prometheus`
