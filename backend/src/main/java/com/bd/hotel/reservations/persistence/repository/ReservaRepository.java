package com.bd.hotel.reservations.persistence.repository;

import com.bd.hotel.reservations.persistence.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    
    List<Reserva> findByClienteId(Long clienteId);

    @Query("SELECT r FROM Reserva r JOIN FETCH r.quarto JOIN FETCH r.cliente c JOIN FETCH c.user WHERE c.user.email = :email")
    List<Reserva> findByClienteEmail(@Param("email") String email);
}