package com.bd.hotel.reservations.application.service;

import com.bd.hotel.reservations.persistence.entity.Cliente;
import com.bd.hotel.reservations.persistence.entity.Quarto;
import com.bd.hotel.reservations.persistence.entity.Reserva;
import com.bd.hotel.reservations.persistence.repository.*;
import com.bd.hotel.reservations.web.dto.request.ReservaRequest;
import com.bd.hotel.reservations.web.dto.response.ReservaResponse;
import com.bd.hotel.reservations.web.dto.response.ReservasDetalhadasResponse;
import com.bd.hotel.reservations.web.mapper.ReservaDetalhadaMapper;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservasDetalhadasViewRepository viewRepo;
    private final ClienteRepository clienteRepo;
    private final ReservaRepository reservaRepo; 
    private final QuartoRepository quartoRepo;   
    private final ReservaDetalhadaMapper mapper;

    @Transactional(readOnly = true)
    public List<ReservasDetalhadasResponse> listarReservasDetalhadas() {
        List<ReservasDetalhadasViewRowDto> rows = viewRepo.listarTudo();
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }

        List<Long> clienteIds = rows.stream()
                .map(ReservasDetalhadasViewRowDto::clienteId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, String> emailPorClienteId = new HashMap<>();

        if (!clienteIds.isEmpty()) {
            List<Cliente> clientes = clienteRepo.findAllByIdIn(clienteIds);
            for (Cliente c : clientes) {
                if (c.getUser() != null && c.getUser().getEmail() != null) {
                    emailPorClienteId.put(c.getId(), c.getUser().getEmail());
                }
            }
        }

        List<ReservasDetalhadasResponse> out = new ArrayList<>(rows.size());
        for (ReservasDetalhadasViewRowDto row : rows) {
            String clientEmail = emailPorClienteId.get(row.clienteId());
            out.add(mapper.toResponse(row, clientEmail));
        }
        return out;
    }

    @Transactional(readOnly = true)
    public List<ReservasDetalhadasResponse> buscarPorEmail(String email) {
        List<Reserva> reservas = reservaRepo.findByClienteEmail(email);

        return reservas.stream().map(reserva -> {
            var cliente = reserva.getCliente();
            var quarto = reserva.getQuartos().stream().findFirst().orElse(null);
            var categoria = (quarto != null) ? quarto.getCategoria() : null;

            long dias = ChronoUnit.DAYS.between(reserva.getDataCheckinPrevisto(), reserva.getDataCheckoutPrevisto());

            return new ReservasDetalhadasResponse(
                    reserva.getId().toString(),
                    reserva.getStatusReserva().name(),
                    cliente.getNome(),
                    cliente.getUser().getEmail(),
                    cliente.getCpf(),
                    cliente.getTelefone(),
                    (quarto != null) ? quarto.getNumero() : "N/A",
                    (categoria != null) ? categoria.getNome() : "N/A",
                    (categoria != null) ? categoria.getCapacidade() : 0,
                    (categoria != null) ? categoria.getPrecoDiaria() : BigDecimal.ZERO,
                    (categoria != null) ? categoria.getPrecoDiaria().multiply(BigDecimal.valueOf(dias)) : BigDecimal.ZERO,
                    dias + " noites",
                    reserva.getDataCheckinPrevisto().toString(),
                    reserva.getDataCheckoutPrevisto().toString()
            );
        }).toList();
    }

    @Transactional
    public ReservaResponse salvar(ReservaRequest dto) {
        validarDatas(dto.getDataCheckinPrevisto(), dto.getDataCheckoutPrevisto());

        Reserva reserva = new Reserva();
        
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();

        Cliente cliente = clienteRepo.findByUserEmail(emailLogado)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado para o usuário: " + emailLogado));
        
        reserva.setCliente(cliente);

        List<Quarto> quartos = quartoRepo.findAllById(dto.getQuartoIds());
        if (quartos.isEmpty()) {
            throw new RuntimeException("Pelo menos um quarto deve ser selecionado");
        }

        reserva.setDataCheckinPrevisto(dto.getDataCheckinPrevisto());
        reserva.setDataCheckoutPrevisto(dto.getDataCheckoutPrevisto());
        reserva.setQuartos(new HashSet<>(quartos));

        Reserva reservaSalva = reservaRepo.save(reserva);

        return new ReservaResponse(
                reservaSalva.getId(),
                reservaSalva.getCliente().getId(),
                reservaSalva.getDataCheckinPrevisto(),
                reservaSalva.getDataCheckoutPrevisto(),
                dto.getQuartoIds(),
                dto.getServicoIds()
        );
    }

    @Transactional
    public Reserva atualizar(Long id, ReservaRequest dto) {
        Reserva reserva = reservaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva não encontrada"));

        validarDatas(dto.getDataCheckinPrevisto(), dto.getDataCheckoutPrevisto());

        List<Quarto> quartos = quartoRepo.findAllById(dto.getQuartoIds());
        
        reserva.setDataCheckinPrevisto(dto.getDataCheckinPrevisto());
        reserva.setDataCheckoutPrevisto(dto.getDataCheckoutPrevisto());
        reserva.setQuartos(new HashSet<>(quartos));

        return reservaRepo.save(reserva);
    }

    @Transactional
    public void deletar(Long id) {
        if (!reservaRepo.existsById(id)) {
            throw new RuntimeException("Reserva não encontrada");
        }
        reservaRepo.deleteById(id);
    }

    private void validarDatas(LocalDate checkin, LocalDate checkout) {
        LocalDate hoje = LocalDate.now();
        if (checkin.isBefore(hoje)) {
            throw new RuntimeException("Check-in não pode ser no passado");
        }
        if (checkout.isBefore(checkin) || checkout.isEqual(checkin)) {
            throw new RuntimeException("Check-out deve ser após o check-in");
        }
    }
}