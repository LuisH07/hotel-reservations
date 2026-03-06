package com.bd.hotel.reservations.persistence.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "categoria")
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "preco_diaria", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoDiaria;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private Integer capacidade;

    public void atualizar(BigDecimal precoDiaria, String nome, Integer capacidade) {
        this.precoDiaria = precoDiaria;
        this.nome = nome;
        this.capacidade = capacidade;
    }
}