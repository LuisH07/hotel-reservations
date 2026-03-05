package com.bd.hotel.reservations.application.service;

import com.bd.hotel.reservations.persistence.entity.Funcionario;
import com.bd.hotel.reservations.persistence.entity.Hotel;
import com.bd.hotel.reservations.persistence.entity.User;
import com.bd.hotel.reservations.persistence.enums.CargoFuncionario;
import com.bd.hotel.reservations.persistence.repository.FuncionarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class FuncionarioService {
    private final FuncionarioRepository funcionarioRepository;
    private final com.bd.hotel.reservations.persistence.repository.UserRepository userRepository;

    @Transactional
    public void criarPerfil(User user,
                                   String nome,
                                   Hotel hotel,
                                   CargoFuncionario cargo,
                                   BigDecimal salario, String cpf) {

        Funcionario funcionario = Funcionario.builder()
                .user(user)
                .nome(nome)
                .hotel(hotel)
                .cargo(cargo)
                .salario(salario)
                .cpf(cpf)
                .build();

        funcionarioRepository.save(funcionario);
    }

    @Transactional
    public com.bd.hotel.reservations.web.dto.response.FuncionarioResponse atualizarPerfil(Long userId, com.bd.hotel.reservations.web.dto.request.FuncionarioUpdateRequest request) {
        Funcionario funcionario = funcionarioRepository.findByUserId(userId)
                .orElseThrow(() -> new com.bd.hotel.reservations.exception.notfound.FuncionarioNotFoundException("Funcionário não encontrado para o usuário: " + userId));

        User user = funcionario.getUser();

        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new com.bd.hotel.reservations.exception.business.EmailAlreadyRegisteredException(request.getEmail());
            }
            user.updateEmail(request.getEmail());
            userRepository.save(user);
        }

        funcionario.setNome(request.getNome());
        
        funcionarioRepository.save(funcionario);

        return buscarPorIdUsuario(userId);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public com.bd.hotel.reservations.web.dto.response.FuncionarioResponse buscarPorIdUsuario(Long userId) {
        Funcionario funcionario = funcionarioRepository.findByUserId(userId)
                .orElseThrow(() -> new com.bd.hotel.reservations.exception.notfound.FuncionarioNotFoundException("Funcionário não encontrado para o usuário: " + userId));

        return com.bd.hotel.reservations.web.dto.response.FuncionarioResponse.builder()
                .id(funcionario.getId())
                .userId(funcionario.getUser().getId())
                .nome(funcionario.getNome())
                .cpf(funcionario.getCpf())
                .email(funcionario.getUser().getEmail())
                .cargo(funcionario.getCargo().name())
                .salario(funcionario.getSalario())
                .hotelNome(funcionario.getHotel().getNome())
                .build();
    }
}