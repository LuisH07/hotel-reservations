package com.bd.hotel.reservations.persistence.repository;

import com.bd.hotel.reservations.persistence.entity.Quarto;
import com.bd.hotel.reservations.persistence.enums.StatusQuarto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuartoRepository extends JpaRepository<Quarto, Long> {

    /**
     * Busca todos os quartos que possuem um determinado status 
     */
    List<Quarto> findByStatus(StatusQuarto status);

    /**
     * Busca um quarto pelo número.
     */
    List<Quarto> findByNumero(String numero);

    /**
     * Busca todos os quartos pelo id do hotel
     */
    List<Quarto> findByHotelId(Long hotelId);
}