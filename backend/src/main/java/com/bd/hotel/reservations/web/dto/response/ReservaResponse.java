package com.bd.hotel.reservations.web.dto.response;

import java.time.LocalDate;
import java.util.Set;

public record ReservaResponse(
        Long id,
        Long clienteId,
        LocalDate dataCheckinPrevisto,
        LocalDate dataCheckoutPrevisto,
        Long quartoId,
        Set<Long> servicoIds
) {}