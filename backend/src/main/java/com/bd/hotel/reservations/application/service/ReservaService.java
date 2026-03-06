package com.bd.hotel.reservations.application.service;

import com.bd.hotel.reservations.exception.business.InvalidDateException;
import com.bd.hotel.reservations.exception.notfound.ReservaNotFoundException;
import com.bd.hotel.reservations.persistence.entity.Cliente;
import com.bd.hotel.reservations.persistence.entity.Quarto;
import com.bd.hotel.reservations.persistence.entity.Reserva;
import com.bd.hotel.reservations.persistence.enums.StatusReserva;
import com.bd.hotel.reservations.persistence.repository.ReservaRepository;
import com.bd.hotel.reservations.persistence.repository.ReservasDetalhadasViewRepository;
import com.bd.hotel.reservations.web.dto.request.ReservaRequest;
import com.bd.hotel.reservations.web.dto.request.ReservasDetalhadasViewRowDto;
import com.bd.hotel.reservations.web.dto.response.ReservaResponse;
import com.bd.hotel.reservations.web.dto.response.ReservasDetalhadasResponse;
import com.bd.hotel.reservations.web.mapper.ReservaDetalhadaMapper;
import com.bd.hotel.reservations.web.mapper.ReservaMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ClienteService clienteService;
    private final QuartoService quartoService;
    private final ReservaRepository reservaRepository;
    private final ReservasDetalhadasViewRepository reservasDetalhadasViewRepository;
    private final ReservaMapper reservaMapper;
    private final ReservaDetalhadaMapper reservaDetalhadaMapper;

    @Transactional(readOnly = true)
    public List<ReservasDetalhadasResponse> listarReservasDetalhadas() {
        List<ReservasDetalhadasViewRowDto> rows = reservasDetalhadasViewRepository.listarTudo();
        return mapDetalhadasRows(rows);
    }

    @Transactional(readOnly = true)
    public List<ReservasDetalhadasResponse> buscarPorEmail(String email) {
        List<ReservasDetalhadasViewRowDto> rows = reservasDetalhadasViewRepository.buscarPorEmail(email);
        return mapDetalhadasRows(rows);
    }

    @Transactional
    public ReservaResponse salvar(ReservaRequest request) {
        validarDatas(request.dataCheckinPrevisto(), request.dataCheckoutPrevisto());

        Cliente cliente = clienteService.buscarClienteLogado();
        Quarto quarto = quartoService.buscarEntidadePorId(request.quartoId());

        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setQuarto(quarto);
        reserva.setDataCheckinPrevisto(request.dataCheckinPrevisto());
        reserva.setDataCheckoutPrevisto(request.dataCheckoutPrevisto());
        reserva.setStatusReserva(StatusReserva.CONFIRMADA);

        return reservaMapper.toResponse(reservaRepository.save(reserva));
    }

    @Transactional
    public ReservaResponse atualizar(Long id, ReservaRequest request) {
        Reserva reserva = buscarEntidadePorId(id);

        validarDatas(request.dataCheckinPrevisto(), request.dataCheckoutPrevisto());

        Quarto quarto = quartoService.buscarEntidadePorId(request.quartoId());

        reserva.setQuarto(quarto);
        reserva.setDataCheckinPrevisto(request.dataCheckinPrevisto());
        reserva.setDataCheckoutPrevisto(request.dataCheckoutPrevisto());

        return reservaMapper.toResponse(reservaRepository.save(reserva));
    }

    @Transactional
    public void deletar(Long id) {
        Reserva reserva = buscarEntidadePorId(id);

        if (reserva.getHospedagem() != null) {
            reserva.setHospedagem(null);
        }

        reservaRepository.delete(reserva);
    }

    @Transactional
    public void cancelar(Long id) {
        Reserva reserva = buscarEntidadePorId(id);

        if (reserva.getStatusReserva() == StatusReserva.CANCELADA) {
            throw new IllegalStateException("Reserva já está cancelada.");
        }

        reserva.setStatusReserva(StatusReserva.CANCELADA);
        reservaRepository.save(reserva);
    }

    @Transactional
    public void concluir(Long id) {
        Reserva reserva = buscarEntidadePorId(id);
        reserva.setStatusReserva(StatusReserva.CONCLUIDA);
        reservaRepository.save(reserva);
    }

    public Reserva buscarEntidadePorId(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new ReservaNotFoundException(id));
    }

    private List<ReservasDetalhadasResponse> mapDetalhadasRows(List<ReservasDetalhadasViewRowDto> rows) {
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }

        List<Long> clienteIds = rows.stream()
                .map(ReservasDetalhadasViewRowDto::clienteId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, String> emailsPorClienteId = carregarEmailsPorClienteId(clienteIds);

        return rows.stream()
                .map(row -> reservaDetalhadaMapper.toResponse(row, emailsPorClienteId.get(row.clienteId())))
                .toList();
    }

    private Map<Long, String> carregarEmailsPorClienteId(List<Long> clienteIds) {
        if (clienteIds == null || clienteIds.isEmpty()) {
            return Map.of();
        }

        return clienteService.buscarTodosPorIds(clienteIds).stream()
                .filter(cliente -> cliente.getUser() != null)
                .filter(cliente -> cliente.getUser().getEmail() != null)
                .collect(Collectors.toMap(
                        Cliente::getId,
                        cliente -> cliente.getUser().getEmail()
                ));
    }

    private void validarDatas(LocalDate checkin, LocalDate checkout) {
        LocalDate hoje = LocalDate.now();

        if (checkin.isBefore(hoje)) {
            throw new InvalidDateException("Data de check-in não pode ser no passado: " + checkin);
        }

        if (!checkout.isAfter(checkin)) {
            throw new InvalidDateException("Data de check-out deve ser após o check-in: " + checkout);
        }
    }
}