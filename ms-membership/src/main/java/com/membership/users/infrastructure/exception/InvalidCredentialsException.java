package com.membership.users.infrastructure.exception;

/**
 * Exception pour identifiants invalides.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
