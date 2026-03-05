package com.bd.hotel.reservations.exception.notfound;

import com.bd.hotel.reservations.exception.ApiException;
import org.springframework.http.HttpStatus;

public class FuncionarioNotFoundException extends ApiException {
    public FuncionarioNotFoundException(String message) {
        super(
                "FUNCIONARIO_NOT_FOUND",
                HttpStatus.NOT_FOUND,
                "Funcionário não encontrado",
                message
        );
    }
}
