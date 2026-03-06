package com.bd.hotel.reservations.exception.notfound;

import com.bd.hotel.reservations.exception.ApiException;
import org.springframework.http.HttpStatus;

public class CategoriaNotFoundException extends ApiException {
    public CategoriaNotFoundException(Long id) {
        super(
                "CATEGORIA_NOT_FOUND",
                HttpStatus.NOT_FOUND,
                "Recurso não encontrado",
                "Categoria não encontrada com o ID: " + id
        );
    }
}