package com.bd.hotel.reservations.application.service;

import com.bd.hotel.reservations.exception.business.CpfAlreadyRegisteredException;
import com.bd.hotel.reservations.exception.business.EmailAlreadyRegisteredException;
import com.bd.hotel.reservations.exception.business.InvalidCredentialsException;
import com.bd.hotel.reservations.persistence.enums.Role;
import com.bd.hotel.reservations.persistence.entity.User;
import com.bd.hotel.reservations.persistence.repository.ClienteRepository;
import com.bd.hotel.reservations.persistence.repository.UserRepository;
import com.bd.hotel.reservations.security.AuthUserDetails;
import com.bd.hotel.reservations.security.JwtService;
import com.bd.hotel.reservations.web.dto.request.LoginRequest;
import com.bd.hotel.reservations.web.dto.request.ClienteRegisterRequest;
import com.bd.hotel.reservations.web.dto.response.LoginResponse;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;

    private final ClienteRepository clienteRepository;
    private final ClienteService clienteService;

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public void register(ClienteRegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyRegisteredException(request.email());
        }

        if (clienteRepository.existsByCpf(request.cpf())) {
            throw new CpfAlreadyRegisteredException(request.cpf());
        }

        User user = userService.criarUsuario(
                request.email(),
                request.password(),
                Role.CLIENTE
        );

        clienteService.criarPerfil(
                user,
                request.nome(),
                request.cpf(),
                request.telefone(),
                request.dataNascimento()
        );
    }

    public LoginResponse login(LoginRequest request) {

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (AuthenticationException authenticationException) {
            throw new InvalidCredentialsException();
        }

        Object principalObject = authentication.getPrincipal();

        if (!(principalObject instanceof AuthUserDetails principal)) {
            throw new IllegalStateException("Unexpected authentication principal type");
        }

        Role role = principal.getRole();
        String token = jwtService.generateToken(defaultClaims(role), principal);

        return new LoginResponse(
                token,
                "Bearer",
                jwtService.getExpirationSeconds()
        );
    }

    private Map<String, Object> defaultClaims(Role role) {
        return Map.of("role", role.name());
    }
}
