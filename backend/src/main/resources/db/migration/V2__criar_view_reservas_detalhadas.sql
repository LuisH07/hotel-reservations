CREATE OR REPLACE VIEW vw_reservas_detalhadas AS
WITH quartos_por_reserva AS (
    SELECT
        r.id AS reserva_id,
        1 AS qtd_quartos,
        jsonb_agg(
                jsonb_build_object(
                        'quarto_id', q.id,
                        'numero', q.numero,
                        'status', q.status,
                        'area', q.area,
                        'hotel_id', h.id,
                        'hotel_nome', h.nome,
                        'categoria_id', cat.id,
                        'categoria_nome', cat.nome,
                        'capacidade', cat.capacidade,
                        'preco_diaria', cat.preco_diaria
                )
        ) AS quartos
    FROM reserva r
             JOIN quarto q ON q.id = r.quarto_id
             JOIN hotel h ON h.id = q.hotel_id
             JOIN categoria cat ON cat.id = q.categoria_id
    GROUP BY r.id
),
     servicos_por_reserva AS (
         SELECT
             rs.reserva_id,
             jsonb_agg(
                     jsonb_build_object(
                             'servico_adicional_id', sa.id,
                             'nome_servico', sa.nome_servico,
                             'preco', sa.preco,
                             'quantidade', rs.quantidade
                     )
                     ORDER BY sa.nome_servico
             ) AS servicos
         FROM reserva_servico rs
                  JOIN servico_adicional sa ON sa.id = rs.servico_adicional_id
         GROUP BY rs.reserva_id
     )
SELECT
    r.id AS reserva_id,
    r.data_reserva,
    r.data_checkin_previsto,
    r.data_checkout_previsto,
    r.status_reserva,

    c.id AS cliente_id,
    c.nome AS cliente_nome,
    c.cpf  AS cliente_cpf,
    c.telefone AS cliente_telefone,

    COALESCE(qr.qtd_quartos, 0) AS qtd_quartos,
    COALESCE(qr.quartos, '[]'::jsonb) AS quartos,
    COALESCE(sr.servicos, '[]'::jsonb) AS servicos
FROM reserva r
         JOIN cliente c ON c.id = r.cliente_id
         LEFT JOIN quartos_por_reserva qr ON qr.reserva_id = r.id
         LEFT JOIN servicos_por_reserva sr ON sr.reserva_id = r.id;