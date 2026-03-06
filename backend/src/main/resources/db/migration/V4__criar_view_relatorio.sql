CREATE OR REPLACE VIEW vw_relatorio_reservas AS
WITH
-- total de reservas no sistema
total_reservas AS (
    SELECT COUNT(*)::bigint AS total
    FROM reserva r
    WHERE r.status_reserva <> 'CANCELADA'
),

-- reservas "ativas hoje"
reservas_ativas_hoje AS (
    SELECT COUNT(*)::bigint AS total
    FROM hospedagem h
    WHERE h.data_checkout_real IS NULL
      AND h.data_checkin_real::date <= current_date
),

-- receita estimada total
receita_estimada_total AS (
    SELECT COALESCE(SUM(
                            (r.data_checkout_previsto - r.data_checkin_previsto) * cat.preco_diaria
                    ), 0)::numeric(12,2) AS total
    FROM reserva r
             JOIN quarto q ON q.id = r.quarto_id
             JOIN categoria cat ON cat.id = q.categoria_id
    WHERE r.status_reserva <> 'CANCELADA'
),

-- receita estimada do mês atual
receita_mes_atual AS (
    SELECT COALESCE(SUM(
                            (r.data_checkout_previsto - r.data_checkin_previsto) * cat.preco_diaria
                    ), 0)::numeric(12,2) AS total
    FROM reserva r
             JOIN quarto q ON q.id = r.quarto_id
             JOIN categoria cat ON cat.id = q.categoria_id
    WHERE r.status_reserva <> 'CANCELADA'
      AND date_trunc('month', r.data_checkin_previsto) = date_trunc('month', current_date)
),

-- ocupacao_hoje
ocupacao_hoje AS (
    SELECT
        COALESCE(ROUND(
                         CASE
                             WHEN COUNT(q.id) = 0 THEN 0
                             ELSE (COUNT(DISTINCT h.quarto_id)::numeric / COUNT(q.id)::numeric) * 100
                             END
                     , 1), 0)::numeric(5,1) AS taxa
    FROM quarto q
             LEFT JOIN hospedagem h ON h.quarto_id = q.id
        AND h.data_checkout_real IS NULL
        AND h.data_checkin_real::date <= current_date
),

-- taxa de cancelamento no mês
taxa_cancelamento_mes AS (
    SELECT COALESCE(ROUND(
        CASE WHEN COUNT(*) = 0 THEN 0
        ELSE (SUM(CASE WHEN status_reserva = 'CANCELADA' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100
        END, 2), 0)::numeric(5,2) AS taxa
    FROM reserva
    WHERE date_trunc('month', data_checkin_previsto) = date_trunc('month', current_date)
),

-- média de permanência no mês
media_permanencia_mes AS (
    SELECT COALESCE(ROUND(
        AVG((data_checkout_previsto - data_checkin_previsto)::numeric), 1
    ), 0)::numeric(5,1) AS dias
    FROM reserva
    WHERE status_reserva <> 'CANCELADA'
      AND date_trunc('month', data_checkin_previsto) = date_trunc('month', current_date)
),

-- valor perdido por cancelamentos no mês
valor_perdido_cancelamentos_mes AS (
    SELECT COALESCE(SUM(
        (r.data_checkout_previsto - r.data_checkin_previsto) * cat.preco_diaria
    ), 0)::numeric(12,2) AS total
    FROM reserva r
    JOIN quarto q ON q.id = r.quarto_id
    JOIN categoria cat ON cat.id = q.categoria_id
    WHERE r.status_reserva = 'CANCELADA'
      AND date_trunc('month', r.data_checkin_previsto) = date_trunc('month', current_date)
),

-- ticket médio por cliente no mês
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
)

SELECT
    tr.total                   AS total_reservas,
    rah.total                  AS reservas_ativas_hoje,
    ret.total                  AS receita_estimada_total,
    rma.total                  AS receita_mes_atual,
    oh.taxa                    AS taxa_ocupacao_hoje,
    tcm.taxa                   AS taxa_cancelamento_mes_pct,
    mpm.dias                   AS media_permanencia_mes_dias,
    vpc.total                  AS valor_perdido_cancelamentos_mes,
    tmc.valor                  AS ticket_medio_cliente_mes
FROM total_reservas tr
         CROSS JOIN reservas_ativas_hoje rah
         CROSS JOIN receita_estimada_total ret
         CROSS JOIN receita_mes_atual rma
         CROSS JOIN ocupacao_hoje oh
         CROSS JOIN taxa_cancelamento_mes tcm
         CROSS JOIN media_permanencia_mes mpm
         CROSS JOIN valor_perdido_cancelamentos_mes vpc
         CROSS JOIN ticket_medio_cliente_mes tmc;