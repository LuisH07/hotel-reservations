package com.bd.hotel.reservations.persistence.repository;

import com.bd.hotel.reservations.persistence.entity.Cliente;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByUserId(Long userId);

    boolean existsByCpf(String cpf);

    @EntityGraph(attributePaths = {"user"})
    List<Cliente> findAllByIdIn(List<Long> ids);

    @Query("SELECT c FROM Cliente c JOIN FETCH c.user u WHERE u.email = :email")
    Optional<Cliente> findByUserEmail(@Param("email") String email);
}
