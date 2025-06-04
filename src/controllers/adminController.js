import db from '../models/db.js';

` ╔═════════════════════════════════════════════╗
  ║ FONCTION POUR AJOUTER UNE NOUVELLE CRENEAU  ║
  ╚═════════════════════════════════════════════╝
`
export const adminAddHoraireCreneau = async (req, res) => {

    // ASSURER QUE LA REQUETE SOIT DE TYPE POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: "Méthode non autorisée"
        });
    }

    // VERIFIER QUE L'UTILISATEUR EST ADMINISTRATEUR
    if (!req.user || req.user.type_user_id !== 1) {
        return res.status(403).json({
            success: false,
            message: "Accès réservé aux administrateurs"
        });
    }

    const data = req.body;

    // VERIFIER QUE TOUTES LES DONNEES SONT PRESENTES
    if (!data.periode_id || !data.direction_id || !data.horaire_depart || 
        !data.horaire_passage1 || !data.horaire_passage2 || !data.horaire_passage3) {
        return res.status(400).json({
            success: false,
            message: "Tous les champs sont obligatoires"
        });
    }

    try {
        // DEMARRER UNE TRANSACTION
        await db.query('START TRANSACTION');

        // REQUETE D'INSERTION
        const query = `
            INSERT INTO HORAIRES_CRENEAUX 
                (PERIODE_ID, DIRECTION_CRENEAU_ID, HORAIRE_DEPART, 
                 HORAIRE_PASSAGE1, HORAIRE_PASSAGE2, HORAIRE_PASSAGE3) 
            VALUES 
                (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.periode_id,
            data.direction_id,
            data.horaire_depart,
            data.horaire_passage1,
            data.horaire_passage2,
            data.horaire_passage3
        ];

        const [result] = await db.execute(query, params);

        if (!result) {
            throw new Error("Erreur lors de l'ajout du créneau");
        }

        const creneauId = result.insertId;
        
        // VALIDER LA TRANSACTION
        await db.query('COMMIT');
        
        return res.json({
            success: true,
            message: "Créneau ajouté avec succès",
            creneauId: creneauId
        });

    } catch (error) {
        // ANNULER LA TRANSACTION EN CAS D'ERREUR
        try {
            await db.query('ROLLBACK');
        } catch (rollbackError) {
            console.error("Erreur lors du rollback :", rollbackError.message);
        }
        console.error("Erreur dans adminAddHoraireCreneau :", error.message);
        return res.status(500).json({
            success: false,
            message: "Erreur de base de données: " + error.message
        });
    }
};

` ╔═════════════════════════════════════════════╗
  ║      FONCTION POUR SUPPRIMER UN CRENEAU     ║
  ╚═════════════════════════════════════════════╝
`
export const adminDeleteHoraireCreneau = async (req, res) => {

    // ASSURER QUE LA REQUETE SOIT DE TYPE POST
    if (req.method !== 'DELETE') {
        return res.status(405).json({
            success: false,
            message: "Méthode non autorisée"
        });
    }

    // VERIFIER QUE L'UTILISATEUR EST ADMINISTRATEUR
    if (!req.user || req.user.type_user_id !== 1) {
        return res.status(403).json({
            success: false,
            message: "Accès réservé aux administrateurs"
        });
    }

    const horaires_id = req.query.horaires_id;

    // VERIFIER QUE L'ID DU CRENEAU EST PRESENT
    if (!horaires_id) {
        return res.status(400).json({
            success: false,
            message: "ID de créneau manquant"
        });
    }

    try {
        // DEMARER UNE TRANSACTION
        await db.query('START TRANSACTION');

        // VERIFIER SI LE CRENEAU A DES RESERVATIONS
        const checkQuery = "SELECT COUNT(*) as count FROM RESERVATION WHERE HORAIRES_ID = ?";
        const [checkResult] = await db.execute(checkQuery, [horaires_id]);
        const reservationCount = checkResult[0].count;

        // SI LE CRENEAU A DES RESERVATIONS, NE PAS LE SUPPRIMER
        if (reservationCount > 0) {
            await db.query('ROLLBACK');
            return res.json({
                success: false,
                message: `Ce créneau possède ${reservationCount} réservation(s) et ne peut pas être supprimé`
            });
        }

        // REQUETE DE SUPPRESSION
        const deleteQuery = "DELETE FROM HORAIRES_CRENEAUX WHERE HORAIRES_ID = ?";
        const [deleteResult] = await db.execute(deleteQuery, [horaires_id]);

        // VERIFIER SI LA SUPPRESSION A ETE EFFECTUEE
        if (deleteResult.affectedRows === 0) {
            await db.query('ROLLBACK');
            return res.json({
                success: false,
                message: "Créneau non trouvé"
            });
        }

        // VALIDER LA TRANSACTION
        await db.query('COMMIT');

        // RETOURNER UNE REPONSE DE SUCCES
        return res.json({
            success: true,
            message: "Créneau supprimé avec succès"
        });
    } catch (error) {
        // ANNULER LA TRANSACTION EN CAS D'ERREUR
        try {
            await db.query('ROLLBACK');
        } catch (rollbackError) {
            console.error("Erreur lors du rollback :", rollbackError.message);
        }
        console.error("Erreur dans adminDeleteHoraireCreneau :", error.message);
        return res.status(500).json({
            success: false,
            message: "Erreur de base de données: " + error.message
        });
    }
};

` ╔════════════════════════════════════════════════════╗
  ║   FONCTION POUR OBTENIR LES DONNEES DU FORMULAIRE  ║
  ╚════════════════════════════════════════════════════╝
`
export const adminGetFormDataHorairesCreneaux = async (req, res) => {
    
    // TRAITER LES REQUETES OPTIONS (CORS)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    // VERIFIER QUE L'UTILISATEUR EST ADMINISTRATEUR    
if (!req.user || req.user.type_user_id !== 1) {
        return res.status(403).json({
            success: false,
            message: "Accès réservé aux administrateurs"
        });
    }
    
    try {
        // RECUPERER TOUTES LES PERIODES
        const periodesQuery = "SELECT PERIODE_ID, LIBELLE_PERIODE FROM PERIODE_CRENEAU ORDER BY LIBELLE_PERIODE ASC";
        const [periodes] = await db.query(periodesQuery);
        
        // RECUPERER TOUTES LES DIRECTIONS
        const directionsQuery = `
            SELECT DIRECTION_CRENEAU_ID, LIBELLE_DIRECTION_CRENEAU as LIBELLE_DIRECTION
            FROM DIRECTION_CRENEAU 
            ORDER BY DIRECTION_CRENEAU_ID ASC
        `;
        const [directions] = await db.query(directionsQuery);
        
        // RETOURNER LES DONNEES
        return res.json({
            success: true,
            periodes: periodes,
            directions: directions
        });
        
    } catch (error) {
        console.error("Erreur dans adminGetFormDataHorairesCreneaux :", error.message);
        return res.status(500).json({
            success: false,
            message: "Erreur de base de données: " + error.message
        });
    }
};

` ╔═════════════════════════════════════════════╗
  ║ FONCTION POUR OBTENIR LA LISTE DES CRENEAUX ║
  ╚═════════════════════════════════════════════╝
`
export const adminGetHorairesCreneaux = async (req, res) => {

    // TRAITER LES REQUETES OPTIONS (CORS)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    // VERIFIER QUE L'UTILISATEUR EST ADMINISTRATEUR    
if (!req.user || req.user.type_user_id !== 1) {
        return res.status(403).json({
            success: false,
            message: "Accès réservé aux administrateurs"
        });
    }
    
    try {
        // REQUETE AVEC JOIN POUR OBTENIR LES CRENEAUX
        const query = `
            SELECT 
                h.HORAIRES_ID,
                h.PERIODE_ID,
                p.LIBELLE_PERIODE,
                h.DIRECTION_CRENEAU_ID,
                d.LIBELLE_DIRECTION_CRENEAU,
                CASE 
                    WHEN d.DIRECTION_CRENEAU_ID = 1 THEN 'Port → Océan'
                    WHEN d.DIRECTION_CRENEAU_ID = 2 THEN 'Océan → Port'
                    ELSE d.LIBELLE_DIRECTION_CRENEAU
                END AS DIRECTION_TRAJET,
                TIME_FORMAT(h.HORAIRE_DEPART, '%H:%i') AS HORAIRE_DEPART,
                TIME_FORMAT(h.HORAIRE_PASSAGE1, '%H:%i') AS HORAIRE_PASSAGE1,
                TIME_FORMAT(h.HORAIRE_PASSAGE2, '%H:%i') AS HORAIRE_PASSAGE2,
                TIME_FORMAT(h.HORAIRE_PASSAGE3, '%H:%i') AS HORAIRE_PASSAGE3
            FROM 
                HORAIRES_CRENEAUX h
            LEFT JOIN 
                PERIODE_CRENEAU p ON h.PERIODE_ID = p.PERIODE_ID
            LEFT JOIN 
                DIRECTION_CRENEAU d ON h.DIRECTION_CRENEAU_ID = d.DIRECTION_CRENEAU_ID
            ORDER BY 
                h.HORAIRE_DEPART
        `;
        
        const [creneaux] = await db.query(query);
        
        // SUCCESS
        return res.json({
            success: true, 
            creneaux: creneaux,
            count: creneaux.length
        });
        
    } catch (error) {
        console.error("Erreur dans adminGetHorairesCreneaux :", error.message);
        return res.status(500).json({
            success: false, 
            message: "Erreur de base de données: " + error.message
        });
    }
};

` ╔═════════════════════════════════════════════╗
  ║   FONCTION POUR METTRE A JOUR UN CRENEAU    ║
  ╚═════════════════════════════════════════════╝
`
// FONCTION POUR METTRE A JOUR UN CRENEAU
export const adminUpdateHoraireCreneau = async (req, res) => {
    
    // ASSURER QUE LA REQUETE SOIT DE TYPE POST
    if (req.method !== 'PATCH') {
        return res.status(405).json({
            success: false,
            message: "Méthode non autorisée"
        });
    }

    // VERIFIER QUE L'UTILISATEUR EST ADMINISTRATEUR
    if (!req.user || req.user.type_user_id !== 1) {
        return res.status(403).json({
            success: false,
            message: "Accès réservé aux administrateurs"
        });
    }

    const data = req.body;

    // VERIFIER QUE TOUTES LES DONNEES SONT PRESENTES
    if (!data.horaires_id || !data.periode_id || !data.direction_id || !data.horaire_depart) {
        return res.status(400).json({
            success: false,
            message: "Données incomplètes"
        });
    }

    try {
        // DEMARRER UNE TRANSACTION
        await db.query('START TRANSACTION');

        // REQUETE DE MISE A JOUR
        const query = `
            UPDATE HORAIRES_CRENEAUX 
            SET PERIODE_ID = ?, 
                DIRECTION_CRENEAU_ID = ?, 
                HORAIRE_DEPART = ?, 
                HORAIRE_PASSAGE1 = ?, 
                HORAIRE_PASSAGE2 = ?, 
                HORAIRE_PASSAGE3 = ?
            WHERE HORAIRES_ID = ?
        `;

        const params = [
            data.periode_id,
            data.direction_id,
            data.horaire_depart,
            (data.horaire_passage1 === undefined || data.horaire_passage1 === '') ? null : data.horaire_passage1,
            (data.horaire_passage2 === undefined || data.horaire_passage2 === '') ? null : data.horaire_passage2,
            (data.horaire_passage3 === undefined || data.horaire_passage3 === '') ? null : data.horaire_passage3,
            data.horaires_id
        ];

        const [result] = await db.execute(query, params);

        if (!result) {
            throw new Error("Erreur lors de la mise à jour du créneau");
        }

        // VALIDER LA TRANSACTION
        await db.query('COMMIT');

        // RETOURNER UNE REPONSE DE SUCCES
        return res.json({
            success: true, 
            message: "Créneau mis à jour avec succès"
        });
    } catch (error) {
        // AANNULER LA TRANSACTION EN CAS D'ERREUR
        try {
            await db.query('ROLLBACK');
        } catch (rollbackError) {
            console.error("Erreur lors du rollback :", rollbackError.message);
        }
        console.error("Erreur dans adminUpdateHoraireCreneau :", error.message);
        return res.status(500).json({
            success: false, 
            message: "Erreur de base de données: " + error.message
        });
    }
};

` ╔══════════════════════════════════════════════════════════════════════════════╗
  ║   FONCTION POUR OBTENIR LES RÉSERVATIONS EN ATTENTE SELON UN PONT DONNÉ    ║
  ╚══════════════════════════════════════════════════════════════════════════════╝
`
export const getPendingReservations = async (req, res) => {
    try {
        // VÉRIFIER QUE LE PARAMÈTRE pont_id EST PRÉSENT
        const pontId = req.query.pont_id;
        if (!pontId) {
            return res.status(400).json({
                success: false,
                message: "Paramètre 'pont_id' manquant"
            });
        }

        // REQUÊTE SQL POUR OBTENIR LES RÉSERVATIONS EN ATTENTE POUR CE PONT
        const query = `
            SELECT 
                CONCAT(r.USER_ID, '_', r.PONT_ID, '_', r.BATEAU_ID, '_', r.STATUS_ID) AS reservation_id,
                r.USER_ID,
                u.USER_NAME AS user_nom,
                r.PONT_ID, 
                p.LIBELLE_PONT AS pont_name,
                r.BATEAU_ID,
                b.LIBELLE_BATEAU AS bateau_name,
                b.IMMATRICULATION AS bateau_immatriculation,
                b.HAUTEUR_MAX AS bateau_hauteur,
                r.STATUS_ID,
                s.LIBELLE_STATUS AS statut,
                r.HORAIRES_ID, 
                pc.LIBELLE_PERIODE AS libelle,
                dc.LIBELLE_DIRECTION_CRENEAU AS direction,
                TIME_FORMAT(hc.HORAIRE_DEPART, '%H:%i') AS heure_debut,
                TIME_FORMAT(IFNULL(hc.HORAIRE_PASSAGE3, hc.HORAIRE_PASSAGE1), '%H:%i') AS heure_fin,
                r.DATE_RESERVATION,
                (
                    SELECT COUNT(*) 
                    FROM RESERVATION r2 
                    WHERE r2.HORAIRES_ID = r.HORAIRES_ID 
                      AND DATE(r2.DATE_RESERVATION) = DATE(r.DATE_RESERVATION) 
                      AND r2.STATUS_ID = 1
                      AND r2.PONT_ID = r.PONT_ID
                ) AS confirmed_count,
                r.CAPACITE_MAX AS capacite_max
            FROM 
                RESERVATION r
            JOIN 
                PONTS p ON r.PONT_ID = p.PONT_ID
            JOIN 
                BATEAUX b ON r.BATEAU_ID = b.BATEAU_ID
            JOIN 
                STATUS s ON r.STATUS_ID = s.STATUS_ID
            JOIN 
                HORAIRES_CRENEAUX hc ON r.HORAIRES_ID = hc.HORAIRES_ID
            JOIN 
                PERIODE_CRENEAU pc ON hc.PERIODE_ID = pc.PERIODE_ID
            JOIN
                DIRECTION_CRENEAU dc ON hc.DIRECTION_CRENEAU_ID = dc.DIRECTION_CRENEAU_ID
            JOIN
                USERS u ON r.USER_ID = u.USER_ID
            WHERE 
                r.STATUS_ID = 2
                AND r.DATE_RESERVATION >= CURDATE()
                AND r.PONT_ID = ?
            ORDER BY 
                r.DATE_RESERVATION ASC, hc.HORAIRE_DEPART ASC
        `;
        
        const [reservations] = await db.query(query, [pontId]);
        
        // FORMATER LES DONNÉES
        const formattedReservations = reservations.map(r => ({
            reservation_id: r.reservation_id,
            pont_id: r.PONT_ID,
            pont_name: r.pont_name,
            direction: r.direction,
            bateau_name: r.bateau_name,
            bateau_immatriculation: r.bateau_immatriculation,
            bateau_hauteur: r.bateau_hauteur,
            libelle: r.libelle,
            heure_debut: r.heure_debut,
            heure_fin: r.heure_fin,
            user_id: r.USER_ID,
            user_nom: r.user_nom,
            reservation_date: new Date(r.DATE_RESERVATION).toISOString().split('T')[0],
            statut: r.statut ? r.statut.toLowerCase() : '',
            confirmed_count: Number(r.confirmed_count),
            capacite_max: Number(r.capacite_max),
            horaires_id: r.HORAIRES_ID
        }));
        
        // RETOURNER LES DONNÉES
        return res.status(200).json({
            success: true,
            reservations: formattedReservations
        });
    } catch (error) {
        // GESTION DES ERREURS
        console.error("Erreur SQL dans getPendingReservations:", error.message);
        return res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des réservations en attente: " + error.message
        });
    }
};