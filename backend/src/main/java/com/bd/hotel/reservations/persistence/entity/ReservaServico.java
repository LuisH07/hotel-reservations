package com.bd.hotel.reservations.persistence.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "reserva_servico")
public class ReservaServico {
    @EmbeddedId
    private ReservaServicoId id;

    @MapsId("reservaId")
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id", nullable = false)
    private Reserva reserva;

    @MapsId("servicoAdicionalId")
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_adicional_id", nullable = false)
    private ServicoAdicional servicoAdicional;

    @Column(nullable = false)
    private Long quantidade = 1L;

    public ReservaServico(Reserva reserva, ServicoAdicional servicoAdicional, Long quantidade) {
        this.reserva = reserva;
        this.servicoAdicional = servicoAdicional;
        this.quantidade = quantidade != null ? quantidade : 1L;
        this.id = new ReservaServicoId(
                reserva != null ? reserva.getId() : null,
                servicoAdicional != null ? servicoAdicional.getId() : null
        );
    }
}
