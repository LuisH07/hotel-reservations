package com.bd.hotel.reservations.application.service;

import com.bd.hotel.reservations.persistence.entity.*;
import com.bd.hotel.reservations.persistence.repository.*;
import com.bd.hotel.reservations.web.dto.request.HospedagemRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class HospedagemService {

    private final HospedagemRepository hospedagemRepo;
    private final ReservaRepository reservaRepo;
    private final ClienteRepository clienteRepo;
    private final QuartoRepository quartoRepo;

    @Transactional
    public Hospedagem salvarHospedagem(HospedagemRequest dto) {
        
        Cliente cliente = clienteRepo.findByCpf(dto.clienteCpf())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com CPF: " + dto.clienteCpf()));

        Quarto quarto = quartoRepo.findById(dto.quartoId())
                .orElseThrow(() -> new RuntimeException("Quarto não encontrado com ID: " + dto.quartoId()));

        Reserva reserva = null;
        if (dto.reservaId() != null) {
            reserva = reservaRepo.findById(dto.reservaId())
                    .orElseThrow(() -> new RuntimeException("Reserva não encontrada com ID: " + dto.reservaId()));
            
            if (reserva.getHospedagem() != null) {
                throw new RuntimeException("Já existe uma hospedagem registrada para esta reserva.");
            }
        }

        Hospedagem hospedagem = new Hospedagem();
        hospedagem.setReserva(reserva);
        hospedagem.setCliente(cliente);
        hospedagem.setQuarto(quarto);
        hospedagem.setDataCheckinReal(Instant.now()); 
        
        Pagamento pagamento = new Pagamento();
        pagamento.setHospedagem(hospedagem);
        pagamento.setValorTotal(dto.pagamento().valorTotal());
        pagamento.setMetodoPagamento(dto.pagamento().metodoPagamento());
        pagamento.setStatusPagamento(dto.pagamento().status());
        
        pagamento.setDataPagamento(dto.pagamento().dataPagamento() != null 
                ? dto.pagamento().dataPagamento() 
                : Instant.now());

        hospedagem.getPagamentos().add(pagamento);

        if (reserva != null) {
            reserva.setHospedagem(hospedagem);
        }

        return hospedagemRepo.save(hospedagem);
    }
}