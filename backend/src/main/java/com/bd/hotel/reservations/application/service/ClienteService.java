package com.bd.hotel.reservations.application.service;

import com.bd.hotel.reservations.persistence.entity.Cliente;
import com.bd.hotel.reservations.persistence.entity.User;
import com.bd.hotel.reservations.persistence.repository.ClienteRepository;
import com.bd.hotel.reservations.web.dto.request.ClienteRegisterRequest;
import com.bd.hotel.reservations.web.mapper.ClienteMapper;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
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
    public void criarPerfil(User user, ClienteRegisterRequest request) {
        Cliente cliente = clienteMapper.toEntity(request, user);
        clienteRepository.save(cliente);
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscarPorUserId(Long userId) {
        Cliente cliente = buscarEntidadePorUserId(userId);
        return clienteMapper.toResponse(cliente);
    }

    public Cliente buscarEntidadePorUserId(Long userId) {
        return clienteRepository.findByUserId(userId)
                .orElseThrow(() -> new ClienteNotFoundException(userId));
    }

    @Transactional(readOnly = true)
    public Cliente buscarClienteLogado() {
        String emailLogado = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        return buscarClientePorEmail(emailLogado);
    }

    private Cliente buscarClientePorEmail(String email) {
        return clienteRepository.findByUserEmail(email)
                .orElseThrow(() -> new ClienteNotFoundException(email));
    }

    @Transactional
    public ClienteResponse atualizarPerfil(Long userId, ClienteUpdateRequest request) {
        Cliente cliente = buscarEntidadePorUserId(userId);

        cliente.updateProfile(request.nome(), request.telefone(), request.dataNascimento());

        cliente.getUser().updateEmail(request.email());

        return clienteMapper.toResponse(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteResponse buscarPorCpf(String cpf) {
        Cliente cliente = buscarEntidadePorCpf(cpf);
        return clienteMapper.toResponse(cliente);
    }

    private Cliente buscarEntidadePorCpf(String cpf) {
        return clienteRepository.findByCpf(cpf)
                .orElseThrow(() -> new ClienteNotFoundException(cpf));
    }

    @Transactional(readOnly = true)
    public List<Cliente> buscarTodosPorIds(List<Long> ids) {
        return clienteRepository.findAllById(ids);
    }
}
