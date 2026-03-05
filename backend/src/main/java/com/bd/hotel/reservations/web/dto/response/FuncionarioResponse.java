package com.bd.hotel.reservations.web.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class FuncionarioResponse {
    private Long id;
    private Long userId;
    private String nome;
    private String cpf;
    private String email;
    private String cargo;
    private BigDecimal salario;
    private String hotelNome;
}
