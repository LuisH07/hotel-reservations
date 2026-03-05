package com.bd.hotel.reservations.persistence.entity;

import com.bd.hotel.reservations.persistence.enums.CargoFuncionario;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name="funcionario")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Funcionario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional=false)
    @JoinColumn(name="user_id", nullable=false, unique=true)
    private User user;

    @Column(nullable=false)
    private String nome;

    @Column(unique = true, nullable = false, length = 11)
    private String cpf;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "hotelId", nullable = false,
            foreignKey = @ForeignKey(name = "fk_funcionario_hotel"))
    private Hotel hotel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CargoFuncionario cargo;

    @Column(precision = 10, scale = 2)
    private BigDecimal salario;
}