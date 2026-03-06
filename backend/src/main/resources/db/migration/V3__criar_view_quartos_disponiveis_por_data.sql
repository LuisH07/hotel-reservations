CREATE OR REPLACE VIEW vw_quartos_disponiveis_por_data AS
WITH calendario AS (
    SELECT generate_series(current_date, current_date + 365, interval '1 day')::date AS dia
),
     reservas_ativas AS (
         SELECT
             r.quarto_id,
             r.data_checkin_previsto,
             r.data_checkout_previsto
         FROM reserva r
         WHERE r.status_reserva IN ('PENDENTE', 'CONFIRMADA')
     )
SELECT
    cal.dia,
    q.id AS quarto_id,
    q.numero,
    q.status AS status_quarto,
    q.area,
    h.id AS hotel_id,
    h.nome AS hotel_nome,
    cat.id AS categoria_id,
    cat.nome AS categoria_nome,
    cat.capacidade,
    cat.preco_diaria
FROM calendario cal
         CROSS JOIN quarto q
         JOIN hotel h ON h.id = q.hotel_id
         JOIN categoria cat ON cat.id = q.categoria_id
WHERE q.status = 'DISPONIVEL'
  AND NOT EXISTS (
    SELECT 1
    FROM reservas_ativas ra
    WHERE ra.quarto_id = q.id
      AND cal.dia >= ra.data_checkin_previsto
      AND cal.dia <  ra.data_checkout_previsto
);