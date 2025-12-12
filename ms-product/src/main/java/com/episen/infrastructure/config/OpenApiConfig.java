package com.episen.infrastructure.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Product API",
                version = "1.0",
                description = "API de gestion des produits de la plateforme e-commerce",
                contact = @Contact(name = "EPI E-commerce", email = "support@episen.com"),
                license = @License(name = "Apache 2.0")
        ),
        servers = {
                @Server(url = "/", description = "Serveur local")
        }
)
public class OpenApiConfig {

    @Bean
    public OpenAPI productOpenAPI() {
        return new OpenAPI()
                .externalDocs(new ExternalDocumentation()
                        .description("Documentation du projet")
                        .url("https://example.com/docs"));
    }
}
