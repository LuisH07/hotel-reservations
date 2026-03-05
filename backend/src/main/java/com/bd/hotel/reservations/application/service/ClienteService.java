package com.bd.hotel.reservations.application.service;

import com.bd.hotel.reservations.persistence.entity.Cliente;
import com.bd.hotel.reservations.persistence.entity.User;
import com.bd.hotel.reservations.persistence.repository.ClienteRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

import com.bd.hotel.reservations.web.dto.response.ClienteResponse;
import com.bd.hotel.reservations.exception.notfound.ClienteNotFoundException;

import com.bd.hotel.reservations.web.dto.request.ClienteUpdateRequest;

@Service
@RequiredArgsConstructor
public class ClienteService {
    private final ClienteRepository clienteRepo;

    @Transactional
    public ClienteResponse buscarPorIdUsuario(Long userId) {
        Cliente cliente = buscarEntidadePorIdUsuario(userId);

        return toResponse(cliente);
    }

    @Transactional
    public ClienteResponse atualizarPerfil(Long userId, ClienteUpdateRequest request) {
        Cliente cliente = buscarEntidadePorIdUsuario(userId);
        
        // Atualiza dados do cliente
        cliente.updateProfile(request.getNome(), request.getTelefone(), request.getDataNascimento());
        
        // Atualiza email do usuário
        cliente.getUser().updateEmail(request.getEmail());

        return toResponse(clienteRepo.save(cliente));
    }

    private Cliente buscarEntidadePorIdUsuario(Long userId) {
        return clienteRepo.findByUserId(userId)
                .orElseThrow(() -> new ClienteNotFoundException("Cliente não encontrado para o usuário: " + userId));
    }

    private ClienteResponse toResponse(Cliente cliente) {
        return ClienteResponse.builder()
                .id(cliente.getId())
                .userId(cliente.getUser().getId())
                .nome(cliente.getNome())
                .cpf(cliente.getCpf())
                .telefone(cliente.getTelefone())
                .dataNascimento(cliente.getDataNascimento())
                .email(cliente.getUser().getEmail())
                .build();
    }

    @Transactional
    public void criarPerfil(User user, String nome, String cpf, String telefone, LocalDate dataNascimento) {
        Cliente cliente = Cliente.builder()
                .user(user)
                .nome(nome)
                .cpf(cpf)
                .telefone(telefone)
                .dataNascimento(dataNascimento)
                .build();

        clienteRepo.save(cliente);
    }
}