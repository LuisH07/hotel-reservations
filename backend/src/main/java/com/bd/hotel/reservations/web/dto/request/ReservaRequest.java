package com.bd.hotel.reservations.web.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservaRequest {

    @NotNull(message = "A data de check-in é obrigatória")
    @FutureOrPresent(message = "A data de check-in não pode ser no passado")
    private LocalDate dataCheckinPrevisto;

    @NotNull(message = "A data de check-out é obrigatória")
    private LocalDate dataCheckoutPrevisto;

    @NotEmpty(message = "Selecione pelo menos um quarto para a reserva")
    private Set<Long> quartoIds;

    private Set<Long> servicoIds;
}