package com.episen.order.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI orderOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Order Management API")
                        .description("API de gestion des commandes pour la plateforme e-commerce")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Order Team")
                                .email("support@episen.com")));
    }
}
