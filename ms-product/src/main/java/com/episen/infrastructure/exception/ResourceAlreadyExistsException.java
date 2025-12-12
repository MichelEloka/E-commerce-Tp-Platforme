package com.episen.infrastructure.exception;

public class ResourceAlreadyExistsException extends RuntimeException {

    public ResourceAlreadyExistsException(String message) {
        super(message);
    }

    public ResourceAlreadyExistsException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s existe deja avec %s : '%s'", resourceName, fieldName, fieldValue));
    }
}
