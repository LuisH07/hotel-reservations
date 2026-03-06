package com.bd.hotel.reservations.persistence.repository;

import com.bd.hotel.reservations.web.dto.request.RelatorioRowDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class RelatorioRepository {

    private final JdbcTemplate jdbc;

    public RelatorioRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public RelatorioRowDto obterRelatorio(Long hotelId) {

        return jdbc.queryForObject("""
            WITH
            total_reservas AS (
                SELECT COUNT(*)::bigint AS total
                FROM reserva r
                WHERE r.status_reserva <> 'CANCELADA'
            ),
            reservas_ativas_hoje AS (
                SELECT COUNT(*)::bigint AS total
                FROM hospedagem h
                WHERE h.data_checkout_real IS NULL
                  AND h.data_checkin_real::date <= current_date
                  AND (
                      ? IS NULL OR EXISTS (
                          SELECT 1
                          FROM quarto q 
                          WHERE q.id = h.quarto_id
                            AND q.hotel_id = ?
                      )
                  )
            ),
            receita_estimada_total AS (
                SELECT COALESCE(SUM(
                    (r.data_checkout_previsto - r.data_checkin_previsto) * cat.preco_diaria
                ), 0)::numeric(12,2) AS total
                FROM reserva r
                JOIN quarto q ON q.id = r.quarto_id
                JOIN categoria cat ON cat.id = q.categoria_id
                WHERE r.status_reserva <> 'CANCELADA'
                  AND (? IS NULL OR q.hotel_id = ?)
            ),
            receita_mes_atual AS (
                SELECT COALESCE(SUM(
                    (r.data_checkout_previsto - r.data_checkin_previsto) * cat.preco_diaria
                ), 0)::numeric(12,2) AS total
                FROM reserva r
                JOIN quarto q ON q.id = r.quarto_id
                JOIN categoria cat ON cat.id = q.categoria_id
                WHERE r.status_reserva <> 'CANCELADA'
                  AND date_trunc('month', r.data_checkin_previsto) = date_trunc('month', current_date)
                  AND (? IS NULL OR q.hotel_id = ?)
            ),
            ocupacao_hoje AS (
                SELECT
                    COALESCE(ROUND(
                        CASE
                            WHEN COUNT(q.id) = 0 THEN 0
                            ELSE (
                                COUNT(DISTINCT h.quarto_id)::numeric
                                / COUNT(q.id)::numeric
                            ) * 100
                        END
                    , 1), 0)::numeric(5,1) AS taxa
                FROM quarto q
                LEFT JOIN hospedagem h ON h.quarto_id = q.id
                    AND h.data_checkout_real IS NULL
                    AND h.data_checkin_real::date <= current_date
                WHERE (? IS NULL OR q.hotel_id = ?)
            ),
            
            taxa_cancelamento_mes AS (
                SELECT COALESCE(ROUND(
                    CASE WHEN COUNT(r.id) = 0 THEN 0
                    ELSE (SUM(CASE WHEN r.status_reserva = 'CANCELADA' THEN 1 ELSE 0 END)::numeric / COUNT(r.id)::numeric) * 100
                    END, 2), 0)::numeric(5,2) AS taxa
                FROM reserva r
                WHERE date_trunc('month', r.data_checkin_previsto) = date_trunc('month', current_date)
                  AND (? IS NULL OR EXISTS (
                      SELECT 1 FROM quarto q 
                      WHERE q.id = r.quarto_id AND q.hotel_id = ?
                  ))
            ),
            media_permanencia_mes AS (
                SELECT COALESCE(ROUND(
                    AVG((r.data_checkout_previsto - r.data_checkin_previsto)::numeric), 1
                ), 0)::numeric(5,1) AS dias
                FROM reserva r
                WHERE r.status_reserva <> 'CANCELADA'
                  AND date_trunc('month', r.data_checkin_previsto) = date_trunc('month', current_date)
                  AND (? IS NULL OR EXISTS (
                      SELECT 1 FROM quarto q 
                      WHERE q.id = r.quarto_id AND q.hotel_id = ?
                  ))
            ),
            valor_perdido_cancelamentos_mes AS (
                SELECT COALESCE(SUM(
                    (r.data_checkout_previsto - r.data_checkin_previsto) * cat.preco_diaria
                ), 0)::numeric(12,2) AS total
                FROM reserva r
                JOIN quarto q ON q.id = r.quarto_id
                JOIN categoria cat ON cat.id = q.categoria_id
                WHERE r.status_reserva = 'CANCELADA'
                  AND date_trunc('month', r.data_checkin_previsto) = date_trunc('month', current_date)
                  AND (? IS NULL OR q.hotel_id = ?)
            ),
            ticket_medio_cliente_mes AS (
                SELECT COALESCE(ROUND(
                    CASE WHEN COUNT(DISTINCT r.cliente_id) = 0 THEN 0
                    ELSE SUM((r.data_checkout_previsto - r.data_checkin_previsto) * cat.preco_diaria) / COUNT(DISTINCT r.cliente_id)
                    END, 2), 0)::numeric(12,2) AS valor
                FROM reserva r
                JOIN quarto q ON q.id = r.quarto_id
                JOIN categoria cat ON cat.id = q.categoria_id
                WHERE r.status_reserva <> 'CANCELADA'
                  AND date_trunc('month', r.data_checkin_previsto) = date_trunc('month', current_date)
                  AND (? IS NULL OR q.hotel_id = ?)
            )
            
            SELECT
              tr.total  AS totalReservas,
              rah.total AS reservasAtivasHoje,
              ret.total AS receitaEstimadaTotal,
              rma.total AS receitaMesAtual,
              oh.taxa   AS taxaOcupacaoHoje,
              tcm.taxa  AS taxaCancelamentoMesPct,
              mpm.dias  AS mediaPermanenciaMesDias,
              vpc.total AS valorPerdidoCancelamentosMes,
              tmc.valor AS ticketMedioClienteMes
            FROM total_reservas tr
            CROSS JOIN reservas_ativas_hoje rah
            CROSS JOIN receita_estimada_total ret
            CROSS JOIN receita_mes_atual rma
            CROSS JOIN ocupacao_hoje oh
            CROSS JOIN taxa_cancelamento_mes tcm
            CROSS JOIN media_permanencia_mes mpm
            CROSS JOIN valor_perdido_cancelamentos_mes vpc
            CROSS JOIN ticket_medio_cliente_mes tmc
        """,
            (rs, i) -> new RelatorioRowDto(
                    rs.getLong("totalReservas"),
                    rs.getLong("reservasAtivasHoje"),
                    rs.getBigDecimal("receitaEstimadaTotal"),
                    rs.getBigDecimal("receitaMesAtual"),
                    rs.getBigDecimal("taxaOcupacaoHoje"),
                    rs.getBigDecimal("taxaCancelamentoMesPct"),
                    rs.getBigDecimal("mediaPermanenciaMesDias"),
                    rs.getBigDecimal("valorPerdidoCancelamentosMes"),
                    rs.getBigDecimal("ticketMedioClienteMes")
            ),
            hotelId, hotelId,
            hotelId, hotelId,
            hotelId, hotelId,
            hotelId, hotelId,
            hotelId, hotelId,
            hotelId, hotelId,
            hotelId, hotelId,
            hotelId, hotelId 
        );
    }
}