import db from "../models/db.js";
import { sendReservationStatusEmail } from "../utils/mailer.js";

` ╔══════════════════════════════════════════════════╗
  ║ FONCTION POUR RÉCUPÉRER LES CRÉNEAUX DISPONIBLES ║
  ╚══════════════════════════════════════════════════╝
`;
export const GetAllAvailabilities = async (req, res) => {
  // VÉRIFICATION DES PARAMÈTRES
  if (!req.query.date || req.query.date === "") {
    return res.status(400).json({
      success: false,
      message: "Paramètre 'date' manquant",
    });
  }
  if (!req.query.pont_id || req.query.pont_id === "") {
    return res.status(400).json({
      success: false,
      message: "Paramètre 'pont_id' manquant",
    });
  }

  // RÉCUPÉRATION DES PARAMÈTRES
  const date = req.query.date; // Format 'YYYY-MM-DD'
  const pontId = req.query.pont_id;

  try {
    // FORMATAGE DE LA DATE POUR LA REQUÊTE SQL
    const dateObj = new Date(date);
    const formattedDate = dateObj.toISOString().split("T")[0]; // Format 'YYYY-MM-DD'

    // DÉTERMINATION DE LA PÉRIODE
    const dateMonth = dateObj.getMonth() + 1;
    const periode = dateMonth >= 4 && dateMonth <= 10 ? "Été" : "Hiver";

    // REQUÊTE SQL POUR RÉCUPÉRER LES CRÉNEAUX ET LE NOMBRE DE RÉSERVATIONS POUR CE PONT
    const query = `
            SELECT 
                hc.HORAIRES_ID AS creneau_id,
                pc.LIBELLE_PERIODE AS periode,
                dc.LIBELLE_DIRECTION_CRENEAU AS direction,
                hc.HORAIRE_DEPART AS heure_debut,
                COALESCE(hc.HORAIRE_PASSAGE1, '') AS passage1,
                COALESCE(hc.HORAIRE_PASSAGE2, '') AS passage2,
                COALESCE(hc.HORAIRE_PASSAGE3, '') AS heure_fin,
                5 AS capacite_max,
                (
                    SELECT COUNT(*) 
                    FROM RESERVATION r
                    WHERE r.HORAIRES_ID = hc.HORAIRES_ID
                      AND DATE(r.DATE_RESERVATION) = ?
                      AND r.STATUS_ID = 1
                      AND r.PONT_ID = ?
                ) AS reservations_confirmees
            FROM HORAIRES_CRENEAUX hc
            JOIN PERIODE_CRENEAU pc ON hc.PERIODE_ID = pc.PERIODE_ID
            JOIN DIRECTION_CRENEAU dc ON hc.DIRECTION_CRENEAU_ID = dc.DIRECTION_CRENEAU_ID
            WHERE UPPER(REPLACE(pc.LIBELLE_PERIODE, 'é', 'e')) = UPPER(REPLACE(?, 'é', 'e'))
            ORDER BY hc.HORAIRE_DEPART
        `;

    // EXÉCUTION DE LA REQUÊTE
    const [creneaux] = await db.execute(query, [
      formattedDate,
      pontId,
      periode,
    ]);

    // ENVOI DE LA RÉPONSE SUCCESS ET DES DONNÉES
    return res.status(200).json({
      success: true,
      creneaux: creneaux,
      debug: {
        date: formattedDate,
        periode: periode,
        pont_id: pontId,
      },
    });
  } catch (error) {
    // GESTION DES ERREURS
    console.error("Erreur SQL: " + error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des créneaux : " + error.message,
    });
  }
};

` ╔══════════════════════════════════════════════════╗
  ║       FONCTION POUR AJOUTER UN NOUVEAU BATEAU    ║
  ╚══════════════════════════════════════════════════╝
`;
export const addBoat = async (req, res) => {
  try {
    // UTILISATION DE L'ID DU TOKEN
    const userId = req.user.id;

    // RECUPERATION DES DONNEES DU CORPS DE LA REQUETE
    const { nom, immatriculation, hauteur_max } = req.body;

    // VERIFICATION DES CHAMPS OBLIGATOIRES
    if (
      !nom ||
      !immatriculation ||
      !hauteur_max ||
      nom.trim() === "" ||
      immatriculation.trim() === "" ||
      hauteur_max.toString().trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Les paramètres nom, immatriculation et hauteur_max sont requis et ne doivent pas être vides",
      });
    }

    // TRAITEMENT DES DONNEES
    const boatName = nom.trim();
    const registration = immatriculation.trim();

    // CONVERSION DE LA HAUTEUR (GESTION DES VIRGULES)
    const hauteurInput = hauteur_max.toString().replace(",", ".");
    const hauteur = parseFloat(hauteurInput);

    // VERIFICATION DE LA VALIDITE DE LA HAUTEUR
    if (hauteur <= 0) {
      return res.status(400).json({
        success: false,
        message: "La hauteur doit être un nombre positif",
      });
    }

    // DIRECTION DU BATEAU ACTUELLEMENT PAR DEFAUT (1 : NEUTRE)
    const direction = 1;

    // REQUETE SQL POUR AJOUTER LE BATEAU
    const query = `
        INSERT INTO BATEAUX (USER_ID, DIRECTION_CRENEAU_ID, LIBELLE_BATEAU, IMMATRICULATION, HAUTEUR_MAX, CREATED_AT) 
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

    await db.execute(query, [
      userId,
      direction,
      boatName,
      registration,
      hauteur,
    ]);

    // REPONSE DE SUCCES
    return res.status(201).json({
      success: true,
      message: "Bateau ajouté avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du bateau:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur technique lors de l'ajout du bateau",
      error: error.message,
    });
  }
};

` ╔════════════════════════════════════════════════════════╗
  ║  FONCTION POUR SUPPRIMER UN BATEAU ET SES RÉSERVATIONS ║
  ╚════════════════════════════════════════════════════════╝
`;
export const deleteBoat = async (req, res) => {
  try {
    const { bateau_id } = req.query;
    const userId = req.user.id;
    if (!bateau_id) {
      return res.status(400).json({
        success: false,
        message: "Le paramètre bateau_id est requis",
      });
    }

    // DÉMARRAGE DE LA TRANSACTION
    await db.query("START TRANSACTION");

    try {
      // REQUÊTE SQL POUR SUPPRIMER LES RÉSERVATIONS ASSOCIÉES AU BATEAU
      await db.execute("DELETE FROM RESERVATION WHERE BATEAU_ID = ?", [
        bateau_id,
      ]);

      // REQUÊTE SQL POUR SUPPRIMER LE BATEAU AVEC VÉRIFICATION DE L'UTILISATEUR
      const [result] = await db.execute(
        "DELETE FROM BATEAUX WHERE BATEAU_ID = ? AND USER_ID = ?",
        [bateau_id, userId]
      );

      // VÉRIFICATION SI UN BATEAU A ÉTÉ SUPPRIMÉ
      if (result.affectedRows === 0) {
        await db.query("ROLLBACK");
        return res.status(404).json({
          success: false,
          message:
            "Bateau non trouvé ou vous n'êtes pas autorisé à le supprimer",
        });
      }

      // VALIDATION DE LA TRANSACTION
      await db.query("COMMIT");

      // RÉPONSE DE SUCCÈS
      return res.status(200).json({
        success: true,
        message: "Bateau et ses réservations associées supprimés avec succès",
      });
    } catch (error) {
      // ANNULATION DE LA TRANSACTION EN CAS D'ERREUR
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du bateau:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression : " + error.message,
    });
  }
};

` ╔══════════════════════════════════════════════════════╗
  ║ FONCTION POUR RÉCUPÉRER LES BATEAUX D'UN UTILISATEUR ║
  ╚══════════════════════════════════════════════════════╝
`;
export const getUserBateaux = async (req, res) => {
  try {
    const user_id = req.user.id;

    // REQUÊTE SQL POUR RÉCUPÉRER TOUS LES BATEAUX DE L'UTILISATEUR
    const query = `
        SELECT 
          BATEAU_ID,
          LIBELLE_BATEAU,
          IMMATRICULATION,
          HAUTEUR_MAX,
          CREATED_AT
        FROM 
          BATEAUX
        WHERE 
          USER_ID = ?
      `;

    const [bateaux] = await db.execute(query, [user_id]);

    // TRAITEMENT DES DONNÉES POUR CORRESPONDRE À CE QU'ATTEND L'APPLICATION FLUTTER
    const formatted_bateaux = bateaux.map((bateau) => ({
      bateau_id: bateau.BATEAU_ID,
      nom: bateau.LIBELLE_BATEAU,
      immatriculation: bateau.IMMATRICULATION,
      hauteur_max: bateau.HAUTEUR_MAX,
      created_at: bateau.CREATED_AT,
    }));

    // ENVOI DE LA RÉPONSE DE SUCCÈS
    return res.status(200).json({
      success: true,
      bateaux: formatted_bateaux,
    });
  } catch (error) {
    // ERREUR - JOURNALISER ET RETOURNER UN MESSAGE D'ERREUR
    console.error("Erreur SQL dans getUserBateaux:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des bateaux: " + error.message,
    });
  }
};

` ╔═══════════════════════════════════════════════════════════╗
  ║ FONCTION POUR RÉCUPÉRER LES RÉSERVATIONS D'UN UTILISATEUR ║
  ╚═══════════════════════════════════════════════════════════╝
`;
export const getUserReservations = async (req, res) => {
  try {
    const user_id = req.user.id;

    // REQUÊTE SQL POUR RÉCUPÉRER TOUTES LES RÉSERVATIONS DE L'UTILISATEUR AVEC LEURS DÉTAILS
    const query = `
      SELECT 
          r.RESERVATION_ID,
          CONCAT(r.USER_ID, '_', r.PONT_ID, '_', r.BATEAU_ID, '_', r.STATUS_ID) AS composite_id,
          p.LIBELLE_PONT AS pont_name,
          b.LIBELLE_BATEAU AS bateau_name,
          s.LIBELLE_STATUS AS statut,
          DATE_FORMAT(r.DATE_RESERVATION, '%Y-%m-%d') AS reservation_date,
          CONCAT(
              pc.LIBELLE_PERIODE, ' - ', 
              dc.LIBELLE_DIRECTION_CRENEAU, ' : ', 
              TIME_FORMAT(hc.HORAIRE_DEPART, '%H:%i'), ' - ',
              TIME_FORMAT(IFNULL(hc.HORAIRE_PASSAGE3, hc.HORAIRE_PASSAGE1), '%H:%i')
          ) AS creneau,
          hc.HORAIRES_ID,
          r.STATUS_ID,
          r.USER_ID,
          r.PONT_ID,
          r.BATEAU_ID
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
      WHERE 
          r.USER_ID = ?
      ORDER BY 
          r.DATE_RESERVATION DESC
    `;

    const [reservations] = await db.execute(query, [user_id]);

    // FORMATER LES DONNÉES POUR CORRESPONDRE À CE QU'ATTEND L'APPLICATION FLUTTER
    const formatted_reservations = reservations.map((res) => ({
      reservation_id: res.composite_id,
      actual_id: res.RESERVATION_ID,
      pont_name: res.pont_name,
      bateau_name: res.bateau_name,
      statut: res.statut.toUpperCase(),
      reservation_date: res.reservation_date, // YYYY-MM-DD
      creneau: res.creneau,
      horaires_id: res.HORAIRES_ID,
      status_id: res.STATUS_ID,
      user_id: res.USER_ID,
      pont_id: res.PONT_ID,
      bateau_id: res.BATEAU_ID,
    }));

    // SUCCÈS - RETOURNER LES RÉSERVATIONS AU FORMAT JSON
    return res.status(200).json({
      success: true,
      reservations: formatted_reservations,
    });
  } catch (error) {
    // ERREUR - JOURNALISER ET RETOURNER UN MESSAGE D'ERREUR
    console.error("Erreur SQL dans getUserReservations:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des réservations: " + error.message,
    });
  }
};

` ╔══════════════════════════════════════════════════════════╗
  ║  FONCTION POUR METTRE À JOUR LE STATUT D'UNE RÉSERVATION ║
  ╚══════════════════════════════════════════════════════════╝
`;
export const updateReservationStatus = async (req, res) => {
  try {
    const data = req.body;

    // VÉRIFIER LES PARAMÈTRES OBLIGATOIRES
    if (!data.new_status) {
      return res.status(400).json({
        success: false,
        message: "Le paramètre 'new_status' est requis",
      });
    }

    // MAPPAGE DES STATUTS
    const status_mapping = {
      confirmé: 1,
      "en attente": 2,
      annulé: 3,
    };

    const new_status = data.new_status.toLowerCase();
    if (!status_mapping[new_status]) {
      return res.status(400).json({
        success: false,
        message: `Statut non reconnu: ${new_status}`,
      });
    }

    const new_status_id = status_mapping[new_status];

    // RÉCUPÉRER LA RÉSERVATION
    let userInfo = null;
    let reservation_id = null;

    // PRIORITÉ 1: UTILISER L'ID RÉEL SI FOURNI (MÉTHODE PRÉFÉRÉE)
    if (data.actual_id && !isNaN(parseInt(data.actual_id))) {
      reservation_id = parseInt(data.actual_id);
      const [reservations] = await db.execute(
        `SELECT * FROM RESERVATION WHERE RESERVATION_ID = ?`,
        [reservation_id]
      );

      if (reservations.length > 0) {
        userInfo = reservations[0];
      }
    }
    // PRIORITÉ 2: RECHERCHE PAR CRITÈRES COMPLETS
    else if (
      data.user_id &&
      data.bateau_id &&
      data.horaires_id &&
      data.date_reservation
    ) {
      const [reservations] = await db.execute(
        `SELECT * FROM RESERVATION 
         WHERE USER_ID = ? 
         AND BATEAU_ID = ? 
         AND HORAIRES_ID = ? 
         AND DATE(DATE_RESERVATION) = ?
         ORDER BY RESERVATION_ID DESC 
         LIMIT 1`,
        [data.user_id, data.bateau_id, data.horaires_id, data.date_reservation]
      );

      if (reservations.length > 0) {
        userInfo = reservations[0];
        reservation_id = userInfo.RESERVATION_ID;
      }
    }
    // PRIORITÉ 3: RECHERCHE PAR ID COMPOSITE
    else if (data.reservation_id && data.reservation_id.includes("_")) {
      const id_parts = data.reservation_id.split("_");
      if (id_parts.length >= 4) {
        const userId = parseInt(id_parts[0]);
        const pontId = parseInt(id_parts[1]);
        const bateauId = parseInt(id_parts[2]);
        const statusId = parseInt(id_parts[3]);

        // VÉRIFIER QUE LES VALEURS SONT NUMÉRIQUES
        if (
          isNaN(userId) ||
          isNaN(pontId) ||
          isNaN(bateauId) ||
          isNaN(statusId)
        ) {
          return res.status(400).json({
            success: false,
            message: "ID composite contient des valeurs non numériques",
          });
        }

        const [reservations] = await db.execute(
          `SELECT * FROM RESERVATION 
           WHERE USER_ID = ? 
           AND PONT_ID = ? 
           AND BATEAU_ID = ? 
           AND STATUS_ID = ?
           ORDER BY RESERVATION_ID DESC 
           LIMIT 1`,
          [userId, pontId, bateauId, statusId]
        );

        if (reservations.length > 0) {
          userInfo = reservations[0];
          reservation_id = userInfo.RESERVATION_ID;
        }
      }
    }

    // VÉRIFIER SI LA RÉSERVATION A ÉTÉ TROUVÉE
    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: "Aucune réservation trouvée avec les critères fournis",
      });
    }

    // SI LE STATUT EST DÉJÀ À JOUR
    if (userInfo.STATUS_ID === new_status_id) {
      return res.status(200).json({
        success: true,
        message: "Le statut est déjà à jour",
      });
    }

    // VÉRIFIER LA CAPACITÉ POUR LES CONFIRMATIONS
    if (new_status_id === 1) {
      const [capacityCheck] = await db.execute(
        `SELECT COUNT(*) AS confirmed_count
         FROM RESERVATION
         WHERE HORAIRES_ID = ?
         AND DATE(DATE_RESERVATION) = DATE(?)
         AND STATUS_ID = 1`,
        [userInfo.HORAIRES_ID, userInfo.DATE_RESERVATION]
      );

      if (capacityCheck[0].confirmed_count >= userInfo.CAPACITE_MAX) {
        return res.status(400).json({
          success: false,
          message: `Impossible de confirmer cette réservation : capacité maximale atteinte (${capacityCheck[0].confirmed_count}/${userInfo.CAPACITE_MAX})`,
        });
      }
    }

    // MISE À JOUR DU STATUT
    const [updateResult] = await db.execute(
      `UPDATE RESERVATION SET STATUS_ID = ? WHERE RESERVATION_ID = ?`,
      [new_status_id, reservation_id]
    );

    // --------------------------------------------------------------------------- //

    ` ╔═════════════════════╗
      ║  NOTIFICATIONS MAIL ║
      ╚═════════════════════╝
    `;
    if (updateResult.affectedRows > 0) {
      // RÉCUPÉRER LES INFORMATIONS COMPLÈTES POUR L'EMAIL
      const [reservationDetails] = await db.execute(
        `
        SELECT 
            r.*,
            u.EMAIL,
            u.USER_NAME,
            p.LIBELLE_PONT AS pont_name,
            dc.LIBELLE_DIRECTION_CRENEAU AS direction,
            b.LIBELLE_BATEAU AS bateau_name,
            b.IMMATRICULATION AS bateau_immatriculation,
            s.LIBELLE_STATUS AS statut,
            pc.LIBELLE_PERIODE AS libelle,
            TIME_FORMAT(hc.HORAIRE_DEPART, '%H:%i') AS heure_debut,
            TIME_FORMAT(IFNULL(hc.HORAIRE_PASSAGE3, hc.HORAIRE_PASSAGE1), '%H:%i') AS heure_fin
        FROM 
            RESERVATION r
        JOIN 
            USERS u ON r.USER_ID = u.USER_ID
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
        WHERE 
            r.RESERVATION_ID = ?
      `,
        [reservation_id]
      );

      // ENVOYER L'EMAIL DE NOTIFICATION
      if (reservationDetails && reservationDetails.length > 0) {
        const details = reservationDetails[0];
        const reservationInfo = {
          date_reservation: details.DATE_RESERVATION,
          pont_name: details.pont_name,
          direction: details.direction,
          bateau_name: details.bateau_name,
          bateau_immatriculation: details.bateau_immatriculation,
          heure_debut: details.heure_debut,
          heure_fin: details.heure_fin,
        };

        try {
          await sendReservationStatusEmail(
            details.EMAIL,
            details.USER_NAME,
            reservationInfo,
            new_status
          );
        } catch (emailError) {
          console.error("Erreur lors de l'envoi de l'email:", emailError);
          // Ne pas bloquer la réponse si l'email échoue
        }
      }
      // -------------------------------------------------------------------------- //

      // RÉPONSE RÉUSSIE
      const new_composite_id = `${userInfo.USER_ID}_${userInfo.PONT_ID}_${userInfo.BATEAU_ID}_${new_status_id}`;

      return res.status(200).json({
        success: true,
        message: "Statut mis à jour avec succès",
        old_status: userInfo.STATUS_ID,
        new_status: new_status_id,
        old_reservation_id:
          data.reservation_id ||
          `${userInfo.USER_ID}_${userInfo.PONT_ID}_${userInfo.BATEAU_ID}_${userInfo.STATUS_ID}`,
        new_reservation_id: new_composite_id,
        actual_reservation_id: reservation_id,
        date_reservation: userInfo.DATE_RESERVATION,
        email_sent: true,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Aucune réservation n'a été modifiée",
      });
    }
  } catch (error) {
    console.error("EXCEPTION DANS UPDATERESERVATIONSTATUS:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur technique: " + error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

` ╔════════════════════════════════════════════════════════════╗
  ║  FONCTION POUR RÉCUPÉRER LES CRÉNEAUX DISPONIBLES PAR DATE ║
  ╚════════════════════════════════════════════════════════════╝
`;
export const getCreneaux = async (req, res) => {
  try {
    // VERIFIER LA PRÉSENCE DU PARAMÈTRE DATE
    if (!req.query.date || req.query.date === "") {
      return res.status(400).json({
        success: false,
        message: "Paramètre 'date' manquant",
      });
    }

    // RECUPÉRER LA DATE DE LA REQUÊTE
    const date = req.query.date; // Format attendu: 'YYYY-MM-DD'
    const dateObj = new Date(date);
    const date_formatted = dateObj.toISOString().split("T")[0]; // 'YYYY-MM-DD'
    const month = dateObj.getMonth() + 1;

    // DETERMINER LA PÉRIODE EN FONCTION DU MOIS (Avril à Octobre = Été, Novembre à Mars = Hiver)
    const periode = month >= 4 && month <= 10 ? "Été" : "Hiver";
    const periode_id = month >= 4 && month <= 10 ? 1 : 2; // 1 pour Été, 2 pour Hiver

    // REQUÊTE SQL POUR RÉCUPÉRER LES CRÉNEAUX DISPONIBLES
    const query = `
      SELECT 
          h.HORAIRES_ID,
          p.LIBELLE_PERIODE,
          d.LIBELLE_DIRECTION_CRENEAU,
          h.HORAIRE_DEPART,
          h.HORAIRE_PASSAGE1,
          COALESCE(h.HORAIRE_PASSAGE3, '') AS heure_fin,
          COUNT(r.USER_ID) AS reservations_count
      FROM 
          HORAIRES_CRENEAUX h
      JOIN 
          PERIODE_CRENEAU p ON h.PERIODE_ID = p.PERIODE_ID
      JOIN 
          DIRECTION_CRENEAU d ON h.DIRECTION_CRENEAU_ID = d.DIRECTION_CRENEAU_ID
      LEFT JOIN 
          RESERVATION r ON h.HORAIRES_ID = r.HORAIRES_ID AND DATE(r.DATE_RESERVATION) = ? AND r.STATUS_ID IN (1, 2)
      WHERE 
          h.PERIODE_ID = ?
      GROUP BY 
          h.HORAIRES_ID, p.LIBELLE_PERIODE, d.LIBELLE_DIRECTION_CRENEAU, h.HORAIRE_DEPART, h.HORAIRE_PASSAGE1, h.HORAIRE_PASSAGE3
      ORDER BY 
          h.HORAIRE_DEPART
    `;

    const [creneaux] = await db.execute(query, [date_formatted, periode_id]);

    // FORMATER LES CRÉNEAUX POUR L'APPLICATION FLUTTER
    const formatted_creneaux = creneaux.map((creneau) => {
      // CONVERTIR LES HEURES EN FORMAT 'HH:MM'
      const heure_debut = creneau.HORAIRE_DEPART.toString().substring(0, 5);
      const heure_fin = creneau.heure_fin
        ? creneau.heure_fin.toString().substring(0, 5)
        : "";

      return {
        creneau_id: creneau.HORAIRES_ID,
        periode: creneau.LIBELLE_PERIODE,
        direction: creneau.LIBELLE_DIRECTION_CRENEAU,
        heure_debut: heure_debut,
        heure_fin: heure_fin,
        reservations_confirmees: creneau.reservations_count,
        capacite_max: 5,
      };
    });

    // ENVOYER LA RÉPONSE DE SUCCÈS
    return res.status(200).json({
      success: true,
      creneaux: formatted_creneaux,
      debug: {
        date: date_formatted,
        periode: periode,
        periode_id: periode_id,
      },
    });
  } catch (error) {
    // ERREUR - JOURNALISER ET RETOURNER UN MESSAGE D'ERREUR
    console.error("Erreur SQL dans getCreneaux:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des créneaux: " + error.message,
    });
  }
};

` ╔══════════════════════════════════════════════════╗
  ║          FONCTION POUR RÉSERVER UN CRÉNEAU       ║
  ╚══════════════════════════════════════════════════╝
`;
export const reserveCreneau = async (req, res) => {
  try {
    // RÉCUPÉRATION DE L'ID UTILISATEUR DEPUIS LE TOKEN
    const user_id = req.user.id;

    // RÉCUPÉRATION DES PARAMÈTRES DE LA REQUÊTE
    const { creneau_id, bateau_id, reservation_date, pont_id } = req.body;

    // VÉRIFICATION DES PARAMÈTRES OBLIGATOIRES
    if (!creneau_id || !bateau_id || !reservation_date || !pont_id) {
      return res.status(400).json({
        success: false,
        message: "Paramètres manquants dans la requête (creneau_id, bateau_id, reservation_date, pont_id)",
      });
    }

    const status_id = 2; // Statut "en attente" par défaut (ID 2)
    const capacite_max = 5; // Capacité maximale par créneau

    // 1. VÉRIFIER SI UNE RÉSERVATION IDENTIQUE EXISTE DÉJÀ
    const [duplicateCheck] = await db.execute(
      `SELECT RESERVATION_ID
       FROM RESERVATION 
       WHERE USER_ID = ? 
         AND PONT_ID = ? 
         AND BATEAU_ID = ? 
         AND STATUS_ID = ? 
         AND HORAIRES_ID = ? 
         AND DATE(DATE_RESERVATION) = ?`,
      [user_id, pont_id, bateau_id, status_id, creneau_id, reservation_date]
    );

    if (duplicateCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Une réservation identique existe déjà",
      });
    }

    // 2. VÉRIFIER SI LE BATEAU N'EST PAS DÉJÀ RÉSERVÉ SUR CE CRÉNEAU, CETTE DATE ET CE PONT
    const [checkBoatResults] = await db.execute(
      `SELECT RESERVATION_ID
       FROM RESERVATION 
       WHERE BATEAU_ID = ? 
         AND HORAIRES_ID = ? 
         AND DATE(DATE_RESERVATION) = ?
         AND PONT_ID = ?`,
      [bateau_id, creneau_id, reservation_date, pont_id]
    );

    if (checkBoatResults.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ce bateau a déjà une réservation pour ce créneau à cette date sur ce pont",
      });
    }

    // 3. VÉRIFIER LA CAPACITÉ MAXIMALE POUR CE CRÉNEAU, CETTE DATE ET CE PONT
    const [checkCapacityResults] = await db.execute(
      `SELECT COUNT(*) AS total 
       FROM RESERVATION 
       WHERE HORAIRES_ID = ? 
         AND DATE(DATE_RESERVATION) = ?
         AND PONT_ID = ?
         AND STATUS_ID IN (1, 2)`,
      [creneau_id, reservation_date, pont_id]
    );

    if (checkCapacityResults[0].total >= capacite_max) {
      return res.status(400).json({
        success: false,
        message: "Ce créneau est complet pour cette date et ce pont (maximum 5 bateaux)",
      });
    }

    // 4. INSÉRER LA NOUVELLE RÉSERVATION
    const [result] = await db.execute(
      `INSERT INTO RESERVATION 
       (USER_ID, PONT_ID, BATEAU_ID, STATUS_ID, HORAIRES_ID, DATE_RESERVATION, CAPACITE_MAX) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        pont_id,
        bateau_id,
        status_id,
        creneau_id,
        reservation_date,
        capacite_max,
      ]
    );

    // 5. VÉRIFIER SI L'INSERTION A RÉUSSI
    if (result.affectedRows > 0) {
      return res.status(201).json({
        success: true,
        message: "Réservation enregistrée avec succès",
        reservation_id: result.insertId,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Erreur lors de l'insertion",
      });
    }
  } catch (error) {
    // GESTION DES ERREURS TECHNIQUES
    console.error("Exception dans reserveCreneau:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur technique: " + error.message,
    });
  }
};
