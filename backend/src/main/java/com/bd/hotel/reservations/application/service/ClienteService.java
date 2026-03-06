package com.bd.hotel.reservations.application.service;

import com.bd.hotel.reservations.persistence.entity.Cliente;
import com.bd.hotel.reservations.persistence.entity.User;
import com.bd.hotel.reservations.persistence.repository.ClienteRepository;
import com.bd.hotel.reservations.web.mapper.ClienteMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.Objects;

import com.bd.hotel.reservations.web.dto.response.ClienteResponse;
import com.bd.hotel.reservations.exception.notfound.ClienteNotFoundException;
import com.bd.hotel.reservations.web.dto.request.ClienteUpdateRequest;

@Service
@RequiredArgsConstructor
public class ClienteService {
    private final ClienteRepository clienteRepository;
    private final ClienteMapper clienteMapper;

    @Transactional
    public ClienteResponse buscarPorIdUsuario(Long userId) {
        Cliente cliente = buscarClientePorId(userId);

        return clienteMapper.toResponse(cliente);
    }

    public Cliente buscarClientePorId(Long userId) {
        return clienteRepository.findByUserId(userId)
                .orElseThrow(() -> new ClienteNotFoundException(userId));
    }

    public Cliente buscarClienteLogado() {
        String emailLogado = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        return buscarClientePorEmail(emailLogado);
    }

    private Cliente buscarClientePorEmail(String email) {
        return clienteRepository.findByUserEmail(email)
                .orElseThrow(() -> new ClienteNotFoundException(email));
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

        clienteRepository.save(cliente);
    }

    @Transactional
    public ClienteResponse atualizarPerfil(Long userId, ClienteUpdateRequest request) {
        Cliente cliente = buscarClientePorId(userId);
        
        // Atualiza dados do cliente
        cliente.updateProfile(request.getNome(), request.getTelefone(), request.getDataNascimento(), request.getCpf());
        
        // Atualiza email do usuário
        cliente.getUser().updateEmail(request.getEmail());

        return toResponse(clienteRepository.save(cliente));
    }
}