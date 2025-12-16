package com.episen.infrastructure.exception;

/**
 * Exception metier indique qu'une ressource demandee est introuvable.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Construit l'exception avec un message explicite.
     *
     * @param message detail de l'erreur
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Construit un message standardise a partir du nom de ressource et du champ recherche.
     *
     * @param resourceName nom de la ressource
     * @param fieldName    champ utilise pour la recherche
     * @param fieldValue   valeur ayant conduit a l'absence
     */
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s non trouve avec %s : '%s'", resourceName, fieldName, fieldValue));
    }
}
