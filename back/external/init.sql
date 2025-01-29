-- PLAYERS SETUP (prevent players duplicate)
DELIMITER $$

CREATE TRIGGER before_insert_players
BEFORE INSERT ON players
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM players WHERE name = NEW.name) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Duplicate entry for player name, insert skipped';
    END IF;
END $$

DELIMITER ;

-- CELLS SETUP (prevent cells duplicate)
DELIMITER $$

CREATE TRIGGER before_insert_cells
BEFORE INSERT ON cells
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM cells WHERE `text` = NEW.text) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Duplicate entry for cell text, insert skipped';
    END IF;
END $$

DELIMITER ;