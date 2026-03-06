package com.bd.hotel.reservations.application.service;

import com.bd.hotel.reservations.exception.business.InvalidDateException;
import com.bd.hotel.reservations.exception.notfound.ReservaNotFoundException;
import com.bd.hotel.reservations.persistence.entity.Cliente;
import com.bd.hotel.reservations.persistence.entity.Quarto;
import com.bd.hotel.reservations.persistence.entity.Reserva;
import com.bd.hotel.reservations.persistence.enums.StatusReserva;
import com.bd.hotel.reservations.persistence.repository.*;
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
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReservaService {
    private final ClienteService clienteService;
    private final QuartoService quartoService;

    private final ReservaRepository reservaRepository;
    private final ReservaMapper reservaMapper;

    private final ReservasDetalhadasViewRepository viewRepository;
    private final ReservaDetalhadaMapper reservaDetalhadaMapper;

    @Transactional(readOnly = true)
    public List<ReservasDetalhadasResponse> listarReservasDetalhadas() {
        List<ReservasDetalhadasViewRowDto> rows = viewRepository.listarTudo();
        return mapDetalhadasRows(rows);
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

        Map<Long, String> emailPorClienteId = carregarEmailsPorClienteId(clienteIds);

        List<ReservasDetalhadasResponse> out = new ArrayList<>(rows.size());
        for (ReservasDetalhadasViewRowDto row : rows) {
            out.add(reservaDetalhadaMapper.toResponse(row, emailPorClienteId.get(row.clienteId())));
        }
        return out;
    }

    private Map<Long, String> carregarEmailsPorClienteId(List<Long> clienteIds) {
        if (clienteIds == null || clienteIds.isEmpty()) {
            return Map.of();
        }

        List<Cliente> clientes = clienteService.findAllByIdIn(clienteIds);
        Map<Long, String> map = new HashMap<>(clientes.size());

        for (Cliente c : clientes) {
            if (c.getUser() != null && c.getUser().getEmail() != null) {
                map.put(c.getId(), c.getUser().getEmail());
            }
        }
        return map;
    }

    @Transactional(readOnly = true)
    public List<ReservasDetalhadasResponse> buscarPorEmail(String email) {
        // Em vez de montar DTO manualmente (com regras de "pega primeiro quarto"),
        // usa a mesma fonte (view) e o mesmo mapper das reservas detalhadas.
        List<ReservasDetalhadasViewRowDto> rows = viewRepository.buscarPorEmail(email); // ajuste o nome se no repo for diferente
        return mapDetalhadasRows(rows);
    }

    @Transactional
    public ReservaResponse salvar(ReservaRequest dto) {
        validarDatas(dto.dataCheckinPrevisto(), dto.dataCheckoutPrevisto());

        Cliente cliente = buscarClienteLogado();

        List<Quarto> quartos = quartoRepository.findAllById(dto.quartoIds());
        validarQuartos(dto.quartoIds(), quartos);

        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setDataCheckinPrevisto(dto.dataCheckinPrevisto());
        reserva.setDataCheckoutPrevisto(dto.dataCheckoutPrevisto());
        reserva.setQuartos(new HashSet<>(quartos));

        Reserva reservaSalva = reservaRepository.save(reserva);
        return reservaMapper.toResponse(reservaSalva);
    }

    @Transactional
    public ReservaResponse salvar(ReservaRequest dto) {

        validarDatas(dto.dataCheckinPrevisto(), dto.dataCheckoutPrevisto());

        Reserva reserva = new Reserva();

        reserva.setCliente(cliente);

        Quarto quarto = quartoSer

        if (quartos.isEmpty()) {
            throw new RuntimeException("Pelo menos um quarto deve ser selecionado");
        }

        reserva.setDataCheckinPrevisto(dto.dataCheckinPrevisto());
        reserva.setDataCheckoutPrevisto(dto.dataCheckoutPrevisto());
        reserva.setQuartos(new HashSet<>(quartos));

        Reserva reservaSalva = reservaRepo.save(reserva);

        return reservaMapper.toResponse(reservaSalva);
    }

    @Transactional
    public ReservaResponse atualizar(Long id, ReservaRequest dto) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ReservaNotFoundException(id));

        validarDatas(dto.dataCheckinPrevisto(), dto.dataCheckoutPrevisto());

        List<Quarto> quartos = quartoRepository.findAllById(dto.quartoIds());
        validarQuartos(dto.quartoIds(), quartos);

        reserva.setDataCheckinPrevisto(dto.dataCheckinPrevisto());
        reserva.setDataCheckoutPrevisto(dto.dataCheckoutPrevisto());
        reserva.setQuartos(new HashSet<>(quartos));

        Reserva atualizada = reservaRepository.save(reserva);
        return reservaMapper.toResponse(atualizada);
    }

    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        if (!reservaRepository.existsById(id)) {
            throw new ReservaNotFoundException(id);
        }
        return true;
    }

    @Transactional
    public void deletar(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ReservaNotFoundException(id));

        // remove relação com quartos
        if (reserva.getQuartos() != null) {
            reserva.getQuartos().clear();
        }

        // remove hospedagem se existir
        if (reserva.getHospedagem() != null) {
            reserva.setHospedagem(null);
        }

        reservaRepository.delete(reserva);
    }

    @Transactional
    public void cancelar(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ReservaNotFoundException(id));

        if (reserva.getStatusReserva() == StatusReserva.CANCELADA) {
            throw new RuntimeException("Reserva já está cancelada");
        }

        reserva.setStatusReserva(StatusReserva.CANCELADA);
        reservaRepository.save(reserva);
    }

    private void validarDatas(LocalDate checkin, LocalDate checkout) {
        LocalDate hoje = LocalDate.now();
        if (checkin.isBefore(hoje)) {
            throw new InvalidDateException("Dat de Check-in não pode ser no passado: " + checkin);
        }
        if (checkout.isBefore(checkin) || checkout.isEqual(checkin)) {
            throw new RuntimeException("Data de Check-out deve ser após o check-in: " + checkout);
        }
    }
}







@Transactional
public Reserva atualizar(Long id, ReservaRequest dto) {
    Reserva reserva = reservaRepo.findById(id)
            .orElseThrow(() -> new RuntimeException());

    validarDatas(dto.getDataCheckinPrevisto(), dto.getDataCheckoutPrevisto());

    List<Quarto> quartos = quartoRepo.findAllById(dto.getQuartoIds());

    reserva.setDataCheckinPrevisto(dto.getDataCheckinPrevisto());
    reserva.setDataCheckoutPrevisto(dto.getDataCheckoutPrevisto());
    reserva.setQuartos(new HashSet<>(quartos));

    return reservaRepo.save(reserva);
}

public boolean existsById(Long id) {
    if (!reservaRepo.existsById(id)) {
        throw new ReservaNotFoundException(id);
    }
    return true;
}

@Transactional
public void deletar(Long id) {
    Reserva reserva = reservaRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Reserva não encontrada"));

    // remove relação com quartos
    reserva.getQuartos().clear();

    // remove hospedagem se existir
    if (reserva.getHospedagem() != null) {
        reserva.setHospedagem(null);
    }

    reservaRepo.delete(reserva);
}

@Transactional
public void cancelar(Long id) {
    Reserva reserva = reservaRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Reserva não encontrada"));

    if (reserva.getStatusReserva() == StatusReserva.CANCELADA) {
        throw new RuntimeException("Reserva já está cancelada");
    }

    reserva.setStatusReserva(StatusReserva.CANCELADA);
    reservaRepo.save(reserva);
}