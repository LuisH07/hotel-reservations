package com.bd.hotel.reservations.web.mapper;

import com.bd.hotel.reservations.persistence.entity.Funcionario;
import com.bd.hotel.reservations.persistence.entity.Hotel;
import com.bd.hotel.reservations.persistence.entity.User;
import com.bd.hotel.reservations.persistence.enums.CargoFuncionario;
import com.bd.hotel.reservations.web.dto.response.FuncionarioResponse;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.List;

@Component
public class FuncionarioMapper {

    public Funcionario toEntity(User user,
                                String nome,
                                Hotel hotel,
                                CargoFuncionario cargo,
                                BigDecimal salario,
                                String cpf) {

        return Funcionario.builder()
                .user(user)
                .nome(nome)
                .hotel(hotel)
                .cargo(cargo)
                .salario(salario)
                .cpf(cpf)
                .build();
    }

    public FuncionarioResponse toResponse(Funcionario funcionario) {
        return new FuncionarioResponse(
                funcionario.getId(),
                funcionario.getUser().getId(),
                funcionario.getNome(),
                funcionario.getCpf(),
                funcionario.getUser().getEmail(),
                funcionario.getCargo().name(),
                funcionario.getSalario(),
                funcionario.getHotel().getNome()
        );
    }

    public List<FuncionarioResponse> toResponseList(List<Funcionario> funcionarios) {
        return funcionarios.stream()
                .map(this::toResponse)
                .toList();
    }
}