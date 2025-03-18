-- Données pour la base PontConnect

START TRANSACTION;

-- Déchargement des données de la table `DIRECTION_CRENEAU`
INSERT INTO `DIRECTION_CRENEAU` (`DIRECTION_CRENEAU_ID`, `LIBELLE_DIRECTION_CRENEAU`) VALUES
(1, 'entre'),
(2, 'sortie');
-- Déchargement des données de la table `CAPTEURS`
INSERT INTO `CAPTEURS` (`CAPTEUR_ID`, `LIBELLE_CAPTEUR`, `VALEUR_CAPTEUR`, `DATE_AJOUT`) VALUES
(1, 'Capteur temperature', '20', '2025-03-05 17:34:40'),
(2, 'Capteur humidite', '70', '2025-03-05 17:34:40'),
(3, 'Capteur niveau d\'eau', '0', '2025-03-05 17:34:40'),
(4, 'Capteur niveau d\'eau', '9', '2025-03-05 17:34:40');

-- Déchargement des données de la table `PERIODE_CRENEAU`
INSERT INTO `PERIODE_CRENEAU` (`PERIODE_ID`, `LIBELLE_PERIODE`) VALUES
(1, 'Ete'),
(2, 'Hiver');

-- Déchargement des données de la table `TYPE_USER`
INSERT INTO `TYPE_USER` (`TYPE_USER_ID`, `LIBELLE_TYPE_USER`) VALUES
(1, 'Administrateur'),
(2, 'Utilisateur');

-- Déchargement des données de la table `STATUS`
INSERT INTO `STATUS` (`STATUS_ID`, `LIBELLE_STATUS`) VALUES
(1, 'Confirme'),
(2, 'En attente'),
(3, 'Annule');

-- Déchargement des données de la table `USERS`
INSERT INTO `USERS` (`USER_ID`, `TYPE_USER_ID`, `USER_NAME`, `EMAIL`, `PASSWORD`, `CREATED_AT`, `LAST_SIGN`) VALUES
(1, 1, 'admin', 'admin@gmail.com', '6ed645ef0e1abea1bf1e4e935ff04f9e18d39812387f63cda3415b46240f0405', '2025-03-07 16:49:48', '2025-03-17 21:25:16'),

-- Déchargement des données de la table `PONTS`
INSERT INTO `PONTS` (`PONT_ID`, `CAPTEUR_ID`, `LIBELLE_PONT`, `ADRESSE`) VALUES
(1, 3, 'Pont de Dunkerque', 'Quai des Hollandais'),
(2, 4, 'Pont de Lille', 'Rue du Pont');

-- Déchargement des données de la table `BATEAUX`
INSERT INTO `BATEAUX` (`BATEAU_ID`, `DIRECTION_CRENEAU_ID`, `USER_ID`, `LIBELLE_BATEAU`, `IMMATRICULATION`, `HAUTEUR_MAX`, `CREATED_AT`) VALUES
(1, 1, 2, 'Le Voyageur', 'DK-123-ABC', '5.20', '2025-03-05 17:34:40'),
(7, 1, 6, 'jw', 'wb', '79.00', '2025-03-17 22:01:25'),
(8, 1, 6, 'js', 'bs', '79.00', '2025-03-17 22:20:29');

-- Déchargement des données de la table `HORAIRES_CRENEAUX`
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