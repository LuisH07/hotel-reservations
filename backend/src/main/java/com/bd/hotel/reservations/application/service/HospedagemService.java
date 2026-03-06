package com.bd.hotel.reservations.application.service;

import com.bd.hotel.reservations.persistence.entity.*;
import com.bd.hotel.reservations.persistence.repository.*;
import com.bd.hotel.reservations.web.dto.request.HospedagemRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HospedagemService {

    private final HospedagemRepository hospedagemRepo;
    private final ReservaRepository reservaRepo;
    private final ClienteRepository clienteRepo;
    private final ServicoAdicionalRepository servicoRepo;

    @Transactional
    public Hospedagem salvarHospedagem(HospedagemRequest dto) {
        Reserva reserva = reservaRepo.findById(dto.reservaId())
                .orElseThrow(() -> new RuntimeException("Reserva não encontrada"));

        Cliente cliente = clienteRepo.findByCpf(dto.cpfCliente())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com CPF: " + dto.cpfCliente()));

        Hospedagem hospedagem = new Hospedagem();
        hospedagem.setReserva(reserva);
        hospedagem.setCliente(cliente);
        hospedagem.setQuarto(reserva.getQuarto()); 
        hospedagem.setDataCheckinReal(Instant.now());

        Pagamento pagamento = new Pagamento();
        pagamento.setHospedagem(hospedagem);
        pagamento.setReserva(reserva);
        pagamento.setValorTotal(dto.pagamento().valorTotal());
        pagamento.setMetodoPagamento(dto.pagamento().metodoPagamento());
        pagamento.setStatusPagamento(dto.pagamento().statusPagamento());
        pagamento.setDataPagamento(Instant.now());

        hospedagem.getPagamentos().add(pagamento);

        if (dto.servicosAdicionaisIds() != null && !dto.servicosAdicionaisIds().isEmpty()) {
            List<ServicoAdicional> servicosEncontrados = servicoRepo.findAllById(dto.servicosAdicionaisIds());
            
            for (ServicoAdicional servico : servicosEncontrados) {
                HospedagemServico hs = new HospedagemServico(hospedagem, servico, null);
                hospedagem.getServicos().add(hs);
            }
        }

        reserva.setHospedagem(hospedagem);

        return hospedagemRepo.save(hospedagem);
    }
}