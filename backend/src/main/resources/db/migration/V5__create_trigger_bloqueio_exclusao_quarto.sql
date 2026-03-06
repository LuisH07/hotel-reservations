-- Função que impede a exclusão de quartos com reservas 'CONFIRMADA'
-- Garante a integridade do sistema bloqueando a remoção de quartos com compromissos ativos
CREATE OR REPLACE FUNCTION check_reservas_ativas_before_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM reserva 
        WHERE quarto_id = OLD.id 
          AND status_reserva = 'CONFIRMADA'
    ) THEN
        RAISE EXCEPTION 'Não é possível excluir o quarto %. Ele possui reservas ativas (CONFIRMADA).', OLD.numero;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Gatilho que ativa a função acima
CREATE TRIGGER trg_bloqueio_exclusao_quarto
BEFORE DELETE ON quarto
FOR EACH ROW
EXECUTE FUNCTION check_reservas_ativas_before_delete();