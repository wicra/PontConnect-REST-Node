-- DONNEES DE TEST
START TRANSACTION;

-- `DIRECTION_CRENEAU`
INSERT INTO `DIRECTION_CRENEAU` (`DIRECTION_CRENEAU_ID`, `LIBELLE_DIRECTION_CRENEAU`) VALUES
(1, 'entre'),
(2, 'sortie');

-- CAPTEURS
INSERT INTO `CAPTEURS` (`CAPTEUR_ID`, `TYPE_CAPTEUR`, `LIBELLE_CAPTEUR`, `UNITE_MESURE`, `EMPLACEMENT`, `STATUS`) VALUES
(1, 'temperature', 'Capteur temperature', '°C', 'Pont de Dunkerque', 'actif'),
(2, 'turbinite', 'Capteur turbinite', 'ppm', 'Pont de Dunkerque', 'actif'),
(3, 'profondeur', 'Capteur niveau d\'eau', 'cm', 'Pont de Dunkerque', 'actif'),
(4, 'humidite', 'Capteur humidite', '%', 'Pont de Dunkerque', 'actif'),

(5, 'temperature', 'Capteur temperature', '°C', 'Pont de Lille', 'actif'),
(6, 'turbinite', 'Capteur humidite', 'ppm', 'Pont de Lille', 'actif'),
(7, 'profondeur', 'Capteur niveau d\'eau', 'cm', 'Pont de Lille', 'actif'),
(8, 'humidite', 'Capteur humidite', '%', 'Pont de Lille', 'actif'),

(9, 'temperature', 'Capteur temperature', '°C', 'Pont de Paris', 'actif'),
(10, 'turbinite', 'Capteur humidite', 'ppm', 'Pont de Paris', 'actif'),
(11, 'profondeur', 'Capteur niveau d\'eau', 'cm', 'Pont de Paris', 'actif'),
(12, 'humidite', 'Capteur humidite', '%', 'Pont de Paris', 'actif');

-- `MESURES_CAPTEURS`
INSERT INTO `MESURES_CAPTEURS` (`CAPTEUR_ID`, `VALEUR`, `DATE_MESURE`) VALUES
(1, 18.50, '2025-03-04 12:00:00'),
(2, 19.25, '2025-03-04 18:00:00'),
(3, 20.00, '2025-03-05 17:34:40');

-- `PERIODE_CRENEAU`
INSERT INTO `PERIODE_CRENEAU` (`PERIODE_ID`, `LIBELLE_PERIODE`) VALUES
(1, 'Ete'),
(2, 'Hiver');

-- `TYPE_USER`
INSERT INTO `TYPE_USER` (`TYPE_USER_ID`, `LIBELLE_TYPE_USER`) VALUES
(1, 'Administrateur'),
(2, 'Utilisateur');

-- `STATUS`
INSERT INTO `STATUS` (`STATUS_ID`, `LIBELLE_STATUS`) VALUES
(1, 'Confirme'),
(2, 'En attente'),
(3, 'Annule');

-- `USERS`
INSERT INTO `USERS` (`USER_ID`, `TYPE_USER_ID`, `USER_NAME`, `EMAIL`, `PASSWORD`, `CREATED_AT`, `LAST_SIGN`) VALUES
(1, 1, 'admin', 'admin@gmail.com', '6ed645ef0e1abea1bf1e4e935ff04f9e18d39812387f63cda3415b46240f0405', '2025-03-07 16:49:48', '2025-03-17 21:25:16');

-- `PONTS`
INSERT INTO `PONTS` (`PONT_ID`, `CAPTEUR_ID`, `LIBELLE_PONT`, `ADRESSE`, `STATUS_PONT`) VALUES
(1, 1, 'Pont de Dunkerque', 'Quai des Hollandais', 'ferme'),
(2, 2, 'Pont de Lille', 'Rue du Pont', 'ferme'),
(3, 3, 'Pont de Paris', 'Rue du Pont', 'stop');

-- `HORAIRES_CRENEAUX`
INSERT INTO `HORAIRES_CRENEAUX` (`HORAIRES_ID`, `PERIODE_ID`, `DIRECTION_CRENEAU_ID`, `HORAIRE_DEPART`, `HORAIRE_PASSAGE1`, `HORAIRE_PASSAGE2`, `HORAIRE_PASSAGE3`) VALUES
(35, 1, 1, '09:30:00', '09:30:00', '09:40:00', '09:50:00'),
(36, 1, 1, '14:30:00', '14:30:00', '14:40:00', '14:50:00'),
(37, 1, 2, '10:20:00', '10:50:00', '11:00:00', '11:10:00'),
(38, 1, 2, '15:30:00', '16:00:00', '16:10:00', '16:30:00'),
(39, 2, 1, '09:00:00', '09:00:00', '09:10:00', '09:20:00'),
(40, 2, 1, '11:00:00', '11:00:00', '11:10:00', '11:20:00'),
(41, 2, 1, '18:30:00', '18:30:00', '18:40:00', '18:50:00'),
(42, 2, 2, '10:20:00', '10:50:00', '11:00:00', '11:10:00'),
(43, 2, 2, '15:30:00', '16:00:00', '16:10:00', '16:30:00'),
(44, 2, 2, '18:30:00', '19:00:00', '19:10:00', '19:20:00'),
(47, 2, 1, '00:23:00', '03:23:00', '03:23:00', '04:23:00'),
(49, 2, 1, '16:31:00', '16:31:00', '16:31:00', '16:31:00');

COMMIT;