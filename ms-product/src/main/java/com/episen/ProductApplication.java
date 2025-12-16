package com.episen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Application Spring Boot qui expose le service produit.
 * Initialise le contexte et les composants necessaires au microservice.
 */
@SpringBootApplication
public class ProductApplication {

    /**
     * Constructeur par defaut explicite pour la documentation.
     */
    public ProductApplication() {
        // Aucun traitement specifique
    }

    /**
     * Point d'entree principal du microservice produit.
     * Initialise et demarre l'application Spring Boot.
     *
     * @param args arguments de ligne de commande
     */
    public static void main(String[] args) {
        SpringApplication.run(ProductApplication.class, args);
    }
}
