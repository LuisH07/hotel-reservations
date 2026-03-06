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
    private final QuartoRepository quartoRepo; // Necessário adicionar este repository

    @Transactional
    public Hospedagem salvarHospedagem(HospedagemRequest dto) {
        
        // 1. Buscar o Cliente pelo CPF
        Cliente cliente = clienteRepo.findByCpf(dto.clienteCpf())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com CPF: " + dto.clienteCpf()));

        // 2. Buscar o Quarto explicitamente pelo ID enviado no payload
        Quarto quarto = quartoRepo.findById(dto.quartoId())
                .orElseThrow(() -> new RuntimeException("Quarto não encontrado com ID: " + dto.quartoId()));

        // 3. Buscar a Reserva apenas se o ID foi informado (pode ser null)
        Reserva reserva = null;
        if (dto.reservaId() != null) {
            reserva = reservaRepo.findById(dto.reservaId())
                    .orElseThrow(() -> new RuntimeException("Reserva não encontrada com ID: " + dto.reservaId()));
            
            // Validação de segurança para não duplicar hospedagem
            if (reserva.getHospedagem() != null) {
                throw new RuntimeException("Já existe uma hospedagem registrada para esta reserva.");
            }
        }

        // 4. Criar a Hospedagem
        Hospedagem hospedagem = new Hospedagem();
        hospedagem.setReserva(reserva);
        hospedagem.setCliente(cliente);
        hospedagem.setQuarto(quarto);
        hospedagem.setDataCheckinReal(Instant.now()); 
        
        // Opcional: Se a sua entidade tiver algum campo para guardar a previsão de saída vinda do payload
        // hospedagem.setDataCheckoutPrevisto(dto.dataSaida()); 

        // 5. Criar o Pagamento
        Pagamento pagamento = new Pagamento();
        pagamento.setHospedagem(hospedagem);
        pagamento.setValorTotal(dto.pagamento().valorTotal());
        pagamento.setMetodoPagamento(dto.pagamento().metodoPagamento());
        pagamento.setStatusPagamento(dto.pagamento().status());
        
        // Pega a data que veio do front, se for nula, usa o momento atual
        pagamento.setDataPagamento(dto.pagamento().dataPagamento() != null 
                ? dto.pagamento().dataPagamento() 
                : Instant.now());

        hospedagem.getPagamentos().add(pagamento);

        // 6. Atualizar a reserva bidirecionalmente, se ela existir
        if (reserva != null) {
            reserva.setHospedagem(hospedagem);
        }

        return hospedagemRepo.save(hospedagem);
    }
}