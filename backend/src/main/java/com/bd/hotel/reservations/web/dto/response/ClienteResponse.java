package com.bd.hotel.reservations.web.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ClienteResponse {
    private Long id;
    private Long userId;
    private String nome;
    private String cpf;
    private String telefone;
    private LocalDate dataNascimento;
    private String email;
}
