package com.bd.hotel.reservations.exception.notfound;

import com.bd.hotel.reservations.exception.ApiException;
import org.springframework.http.HttpStatus;

public class FuncionarioNotFoundException extends ApiException {
    public FuncionarioNotFoundException(Long userId) {
        super(
                "FUNCIONARIO_NOT_FOUND",
                HttpStatus.NOT_FOUND,
                "Funcionário não encontrado",
                "Funcionário não encontrado com id: " + userId
        );
    }
}
