package com.bd.hotel.reservations.exception.notfound;

import com.bd.hotel.reservations.exception.ApiException;
import org.springframework.http.HttpStatus;

public class ClienteNotFoundException extends ApiException {
    public ClienteNotFoundException(String message) {
        super(
                "CLIENTE_NOT_FOUND",
                HttpStatus.NOT_FOUND,
                "Cliente não encontrado",
                message
        );
    }
}
