package com.bd.hotel.reservations.application.service;

import com.bd.hotel.reservations.exception.business.EmailAlreadyRegisteredException;
import com.bd.hotel.reservations.exception.notfound.FuncionarioNotFoundException;
import com.bd.hotel.reservations.persistence.entity.Funcionario;
import com.bd.hotel.reservations.persistence.entity.Hotel;
import com.bd.hotel.reservations.persistence.entity.User;
import com.bd.hotel.reservations.persistence.enums.CargoFuncionario;
import com.bd.hotel.reservations.persistence.repository.FuncionarioRepository;
import com.bd.hotel.reservations.persistence.repository.UserRepository;
import com.bd.hotel.reservations.web.dto.request.FuncionarioUpdateRequest;
import com.bd.hotel.reservations.web.dto.response.FuncionarioResponse;
import com.bd.hotel.reservations.web.mapper.FuncionarioMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;
    private final UserRepository userRepository;
    private final FuncionarioMapper funcionarioMapper;

    @Transactional
    public void criarPerfil(User user,
                            String nome,
                            Hotel hotel,
                            CargoFuncionario cargo,
                            BigDecimal salario,
                            String cpf) {

        Funcionario funcionario = funcionarioMapper.toEntity(user, nome, hotel, cargo, salario, cpf);
        funcionarioRepository.save(funcionario);
    }

    @Transactional(readOnly = true)
    public FuncionarioResponse buscarPorUserId(Long userId) {
        Funcionario funcionario = buscarEntidadePorUserId(userId);
        return funcionarioMapper.toResponse(funcionario);
    }

    public Funcionario buscarEntidadePorUserId(Long userId) {
        return funcionarioRepository.findByUserId(userId)
                .orElseThrow(() -> new FuncionarioNotFoundException(userId));
    }

    @Transactional
    public FuncionarioResponse atualizarPerfil(Long userId, FuncionarioUpdateRequest request) {
        Funcionario funcionario = buscarEntidadePorUserId(userId);
        User user = funcionario.getUser();

        if (!user.getEmail().equals(request.email())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new EmailAlreadyRegisteredException(request.email());
            }
            user.updateEmail(request.email());
        }

        funcionario.setNome(request.nome());

        return funcionarioMapper.toResponse(funcionarioRepository.save(funcionario));
    }
}