package com.episen.infrastructure.exception;

/**
 * Exception metier indique qu'une ressource existe deja avec les criteres fournis.
 */
public class ResourceAlreadyExistsException extends RuntimeException {

    /**
     * Construit l'exception avec un message specifique.
     *
     * @param message detail de l'erreur
     */
    public ResourceAlreadyExistsException(String message) {
        super(message);
    }

    /**
     * Construit un message standardise a partir du nom de ressource et du champ concerne.
     *
     * @param resourceName nom de la ressource
     * @param fieldName    champ unique
     * @param fieldValue   valeur en doublon
     */
    public ResourceAlreadyExistsException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s existe deja avec %s : '%s'", resourceName, fieldName, fieldValue));
    }
}
