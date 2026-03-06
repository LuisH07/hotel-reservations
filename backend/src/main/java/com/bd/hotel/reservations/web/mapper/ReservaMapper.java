package com.bd.hotel.reservations.web.mapper;

import com.bd.hotel.reservations.persistence.entity.Reserva;
import com.bd.hotel.reservations.persistence.entity.ReservaServico;
import com.bd.hotel.reservations.web.dto.response.ReservaResponse;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ReservaMapper {

    public ReservaResponse toResponse(Reserva reserva) {
        Long quartoId = reserva.getQuarto() != null
                ? reserva.getQuarto().getId()
                : null;

        Set<Long> servicoIds = reserva.getServicos() == null
                ? Set.of()
                : reserva.getServicos().stream()
                .map(ReservaServico::getServicoAdicional)
                .filter(servico -> servico != null)
                .map(servico -> servico.getId())
                .collect(Collectors.toSet());

        return new ReservaResponse(
                reserva.getId(),
                reserva.getCliente().getId(),
                reserva.getDataCheckinPrevisto(),
                reserva.getDataCheckoutPrevisto(),
                quartoId,
                servicoIds
        );
    }
}