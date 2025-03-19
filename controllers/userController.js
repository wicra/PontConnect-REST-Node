import db from '../models/db.js';

` ╔══════════════════════════════════════════════════╗
  ║ FONCTION POUR RÉCUPÉRER LES CRÉNEAUX DISPONIBLES ║
  ╚══════════════════════════════════════════════════╝
`
export const GetAllAvailabilities = async (req, res) => {
  
    // VÉRIFICATION DU PARAMÈTRE DATE
    if (!req.query.date || req.query.date === '') {
        return res.status(400).json({
        success: false,
        message: "Paramètre 'date' manquant"
        });
    }

    // RÉCUPÉRATION DE LA DATE
    const date = req.query.date;  // Format 'YYYY-MM-DD'

    try {
        // FORMATAGE DE LA DATE POUR LA REQUÊTE SQL
        const dateObj = new Date(date);
        const formattedDate = dateObj.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'

        // DÉTERMINATION DE LA PÉRIODE
        const dateMonth = dateObj.getMonth() + 1; 
        const periode = (dateMonth >= 4 && dateMonth <= 10) ? 'Été' : 'Hiver';

        // REQUÊTE SQL POUR RÉCUPÉRER LES CRÉNEAUX DISPONIBLES
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
            ) AS reservations_confirmees
        FROM HORAIRES_CRENEAUX hc
        JOIN PERIODE_CRENEAU pc ON hc.PERIODE_ID = pc.PERIODE_ID
        JOIN DIRECTION_CRENEAU dc ON hc.DIRECTION_CRENEAU_ID = dc.DIRECTION_CRENEAU_ID
        WHERE UPPER(REPLACE(pc.LIBELLE_PERIODE, 'é', 'e')) = UPPER(REPLACE(?, 'é', 'e'))
        ORDER BY hc.HORAIRE_DEPART
        `;

        // EXÉCUTION DE LA REQUÊTE
        const [creneaux] = await db.execute(query, [formattedDate, periode]);

        // ENVOI DE LA RÉPONSE SUCCESS ET DES DONNÉES
        return res.status(200).json({
        success: true,
        creneaux: creneaux,
        debug: {
            date: formattedDate,
            periode: periode
        }
        });
        
    } catch (error) {
        // GESTION DES ERREURS
        console.error("Erreur SQL: " + error.message);
        return res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des créneaux : " + error.message
        });
    }
};

` ╔══════════════════════════════════════════════════╗
  ║ FONCTION POUR RÉCUPÉRER LES VALEURS DES CAPTEURS ║
  ╚══════════════════════════════════════════════════╝
`
export const GetSensorValues = async (req, res) => {
    try {

      // REQUÊTE POUR RÉCUPÉRER LES VALEURS COMMUNES DES PONTS
      const queryGlobal = `
        SELECT CAPTEUR_ID, LIBELLE_CAPTEUR, VALEUR_CAPTEUR 
        FROM CAPTEURS 
        WHERE CAPTEUR_ID IN (1, 2)
      `; // 1: TEMPERATURE, 2: HUMIDITE
      
      const [globalSensors] = await db.query(queryGlobal);
      
      // CRÉATION D'UN OBJET POUR STOCKER LES VALEURS GLOBALES
      const global = {};
      globalSensors.forEach(sensor => {
        global[sensor.CAPTEUR_ID] = sensor.VALEUR_CAPTEUR;
      });
      
      // REQUÊTE POUR RÉCUPÉRER LES PONTS AVEC LEURS VALEURS DE CAPTEURS ASSOCIÉS
      const queryPonts = `
        SELECT 
          p.PONT_ID, 
          p.LIBELLE_PONT, 
          (SELECT c.VALEUR_CAPTEUR FROM CAPTEURS c WHERE c.CAPTEUR_ID = p.CAPTEUR_ID) AS NIVEAU_EAU,
          (SELECT c.DATE_AJOUT FROM CAPTEURS c WHERE c.CAPTEUR_ID = p.CAPTEUR_ID) AS DATE_AJOUT
        FROM PONTS p
        ORDER BY p.PONT_ID
      `;
      
      const [ponts] = await db.query(queryPonts);
      
      // AJOUT DES VALEURS GLOBALES AUX PONTS
      ponts.forEach(p => {
        p.HUMIDITE = global[1] || null;
        p.TEMPERATURE = global[2] || null;
      });
      
      // ENVOI DE LA RÉPONSE DE SUCCÈS AVEC LES DONNÉES
      return res.status(200).json({
        success: true,
        ponts: ponts
      });
      
    } catch (error) {
      console.error("Erreur lors de la récupération des capteurs:", error.message);
      return res.status(500).json({
        success: false,
        message: "Erreur: " + error.message
      });
    }
};

` ╔══════════════════════════════════════════════════╗
  ║       FONCTION POUR AJOUTER UN NOUVEAU BATEAU    ║
  ╚══════════════════════════════════════════════════╝
`
export const addBoat = async (req, res) => {

    try {
      // RECUPERATION DES DONNEES DU CORPS DE LA REQUETE
      const { user_id, nom, immatriculation, hauteur_max } = req.body;

      // VERIFICATION DES CHAMPS OBLIGATOIRES
      if (
        !user_id || 
        !nom || 
        !immatriculation || 
        !hauteur_max ||
        nom.trim() === '' ||
        immatriculation.trim() === '' ||
        hauteur_max.trim() === '' ||
        (typeof hauteur_max === 'string' && hauteur_max.trim() === '')
      ) {
        return res.status(400).json({
          success: false,
          message: "Les paramètres user_id, nom, immatriculation et hauteur_mat sont requis et ne doivent pas être vides"
        });
      }
  
      // TRAITEMENT DES DONNEES
      const userId = parseInt(user_id);
      const boatName = nom.trim();
      const registration = immatriculation.trim();
      
      // CONVERSION DE LA HAUTEUR (GESTION DES VIRGULES)
      const hauteurInput = hauteur_max.toString().replace(',', '.');
      const hauteur = parseFloat(hauteurInput);
  
      // VERIFICATION DE LA VALIDITE DE LA HAUTEUR
      if (hauteur <= 0) {
        return res.status(400).json({
          success: false,
          message: "La hauteur doit être un nombre positif"
        });
      }
  
      // DIRECTION DU BATEAU ACTUELLEMENT PAR DEFAUT (1 : NEUTRE)
      const direction = 1;
  
      // REQUETE SQL POUR AJOUTER LE BATEAU
      const query = `
        INSERT INTO bateaux (USER_ID, DIRECTION_CRENEAU_ID, LIBELLE_BATEAU, IMMATRICULATION, HAUTEUR_MAX, CREATED_AT) 
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      
      await db.execute(query, [userId, direction, boatName, registration, hauteur]);
  
      // REPONSE DE SUCCES
      return res.status(201).json({
        success: true,
        message: "Bateau ajouté avec succès"
      });
      
    } catch (error) {
      console.error("Erreur lors de l'ajout du bateau:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur technique lors de l'ajout du bateau",
        error: error.message
      });
    }
};

` ╔════════════════════════════════════════════════════════╗
  ║  FONCTION POUR SUPPRIMER UN BATEAU ET SES RÉSERVATIONS ║
  ╚════════════════════════════════════════════════════════╝
`
export const deleteBoat = async (req, res) => {
  try {
    // VÉRIFICATION DE L'EXISTENCE DES PARAMÈTRES BATEAU_ID ET USER_ID
    const { bateau_id, user_id } = req.query;
    if (!bateau_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: "Les paramètres bateau_id et user_id sont requis"
      });
    }

    // CONVERSION DES IDENTIFIANTS EN NOMBRES ENTIERS
    const boatId = parseInt(bateau_id);
    const userId = parseInt(user_id);

    // DÉMARRAGE DE LA TRANSACTION 
    await db.query('START TRANSACTION');

    try {
      // REQUÊTE SQL POUR SUPPRIMER LES RÉSERVATIONS ASSOCIÉES AU BATEAU
      await db.execute(
        "DELETE FROM reservation WHERE BATEAU_ID = ?", 
        [boatId]
      );

      // REQUÊTE SQL POUR SUPPRIMER LE BATEAU AVEC VÉRIFICATION DE L'UTILISATEUR
      const [result] = await db.execute(
        "DELETE FROM bateaux WHERE BATEAU_ID = ? AND USER_ID = ?", 
        [boatId, userId]
      );

      // VÉRIFICATION SI UN BATEAU A ÉTÉ SUPPRIMÉ
      if (result.affectedRows === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: "Bateau non trouvé ou vous n'êtes pas autorisé à le supprimer"
        });
      }

      // VALIDATION DE LA TRANSACTION
      await db.query('COMMIT'); 

      // RÉPONSE DE SUCCÈS
      return res.status(200).json({
        success: true,
        message: "Bateau et ses réservations associées supprimés avec succès"
      });

    } catch (error) {
      // ANNULATION DE LA TRANSACTION EN CAS D'ERREUR
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error("Erreur lors de la suppression du bateau:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression : " + error.message
    });
  }
};

` ╔══════════════════════════════════════════════════════╗
  ║ FONCTION POUR RÉCUPÉRER LES BATEAUX D'UN UTILISATEUR ║
  ╚══════════════════════════════════════════════════════╝
`
export const getUserBateaux = async (req, res) => {

    try {
      // VERIFICATION DU PARAMÈTRE USER_ID
      if (!req.query.user_id || req.query.user_id === '') {
        return res.status(400).json({
          success: false,
          message: "Paramètre 'user_id' manquant"
        });
      }
  
      const user_id = req.query.user_id;
  
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
      const formatted_bateaux = bateaux.map(bateau => ({
        bateau_id: bateau.BATEAU_ID,
        nom: bateau.LIBELLE_BATEAU,
        immatriculation: bateau.IMMATRICULATION,
        hauteur_max: bateau.HAUTEUR_MAX,
        created_at: bateau.CREATED_AT
      }));
      
      // ENVOI DE LA RÉPONSE DE SUCCÈS
      return res.status(200).json({
        success: true,
        bateaux: formatted_bateaux
      });
    } catch (error) {
      // ERREUR - JOURNALISER ET RETOURNER UN MESSAGE D'ERREUR
      console.error("Erreur SQL dans getUserBateaux:", error.message);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des bateaux: " + error.message
      });
    }
};

` ╔═══════════════════════════════════════════════════════════╗
  ║ FONCTION POUR RÉCUPÉRER LES RÉSERVATIONS D'UN UTILISATEUR ║
  ╚═══════════════════════════════════════════════════════════╝
`
export const getUserReservations = async (req, res) => {

  try {
    // VÉRIFICATION DES PARAMÈTRES
    if (!req.query.user_id || req.query.user_id === '') {
      return res.status(400).json({
        success: false,
        message: "Paramètre 'user_id' manquant"
      });
    }

    const user_id = req.query.user_id;

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
    const formatted_reservations = reservations.map(res => ({
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
      bateau_id: res.BATEAU_ID
    }));
    
    // SUCCÈS - RETOURNER LES RÉSERVATIONS AU FORMAT JSON
    return res.status(200).json({
      success: true,
      reservations: formatted_reservations
    });
    
  } catch (error) {
    // ERREUR - JOURNALISER ET RETOURNER UN MESSAGE D'ERREUR
    console.error("Erreur SQL dans getUserReservations:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des réservations: " + error.message
    });
  }
};

` ╔══════════════════════════════════════════════════════════╗
  ║  FONCTION POUR METTRE À JOUR LE STATUT D'UNE RÉSERVATION ║
  ╚══════════════════════════════════════════════════════════╝
`
export const updateReservationStatus = async (req, res) => {
  try {
    const data = req.body;
    // VERIFIER LA PRÉSENCE DES PARAMÈTRES OBLIGATOIRES
    if (!data.reservation_id || !data.new_status) {
      return res.status(400).json({
        success: false,
        message: "Les paramètres 'reservation_id' et 'new_status' sont requis"
      });
    }

    // RÉCUPÉRER LES DONNÉES
    let reservation_id = data.reservation_id;
    const actual_id = data.actual_id; // ID RÉEL DE LA RÉSERVATION
    const new_status = data.new_status.toLowerCase();
    
    // PARAMÈTRES EN PLUS POUR L'IDENTIFICATION DE LA RÉSERVATION
    const date_reservation = data.date_reservation || null;
    const horaires_id = data.horaires_id || null;
    const user_id_param = data.user_id || null;
    const bateau_id_param = data.bateau_id || null;

    // MAPPAGE DES STATUTS
    const status_mapping = {
      'confirmé': 1,
      'en attente': 2,
      'annulé': 3
    };

    if (!status_mapping[new_status]) {
      return res.status(400).json({
        success: false,
        message: `Statut non reconnu: ${new_status}`
      });
    }

    const new_status_id = status_mapping[new_status];

    // GÉRER LA REQUÊTE 
    let userInfo;
    
    // ETAPE 1: RECHERCHER PAR ID RÉEL SI FOURNI
    if (actual_id && !isNaN(parseInt(actual_id))) {
      const real_id = parseInt(actual_id);
      const [reservations] = await db.execute(
        `SELECT * FROM RESERVATION WHERE RESERVATION_ID = ?`,
        [real_id]
      );

      if (reservations.length > 0) {
        userInfo = reservations[0];
        reservation_id = real_id;
        console.log("Réservation trouvée avec l'ID réel:", reservation_id);
      }
    }
    
    // ETAPE 2: RECHERCHER PAR ID COMPOSITE SI ID REEL NON FOURNI
    if (!userInfo && reservation_id.includes('_')) {
      const id_parts = reservation_id.split('_');
      if (id_parts.length >= 4) {
        const userId = parseInt(id_parts[0]);
        const pontId = parseInt(id_parts[1]);
        const bateauId = parseInt(id_parts[2]);
        
        let query = `SELECT * FROM RESERVATION WHERE USER_ID = ? AND PONT_ID = ? AND BATEAU_ID = ?`;
        let params = [userId, pontId, bateauId];
        
        if (date_reservation) {
          query += ` AND DATE(DATE_RESERVATION) = ?`;
          params.push(date_reservation);
        }
        
        if (horaires_id) {
          query += ` AND HORAIRES_ID = ?`;
          params.push(horaires_id);
        }
        
        // LIMITER À LA DERNIÈRE RÉSERVATION
        query += ` ORDER BY RESERVATION_ID DESC LIMIT 1`;
        
        const [reservations] = await db.execute(query, params);
        if (reservations.length > 0) {
          userInfo = reservations[0];
          reservation_id = userInfo.RESERVATION_ID;
          console.log("Réservation trouvée avec critères:", reservation_id);
        }
      }
    }
    
    // ETAPE 3: RECHERCHER PAR USER_ID ET BATEAU_ID SI AUCUNE RÉSERVATION TROUVÉE
    if (!userInfo && user_id_param && bateau_id_param) {
      let query = `SELECT * FROM RESERVATION WHERE USER_ID = ? AND BATEAU_ID = ?`;
      let params = [user_id_param, bateau_id_param];
      
      if (date_reservation) {
        query += ` AND DATE(DATE_RESERVATION) = ?`;
        params.push(date_reservation);
      }
      
      if (horaires_id) {
        query += ` AND HORAIRES_ID = ?`;
        params.push(horaires_id);
      }
      
      query += ` ORDER BY RESERVATION_ID DESC LIMIT 1`;
      
      const [reservations] = await db.execute(query, params);
      if (reservations.length > 0) {
        userInfo = reservations[0];
        reservation_id = userInfo.RESERVATION_ID;
        console.log("Réservation trouvée avec paramètres individuels:", reservation_id);
      }
    }
    
    // SI AUCUNE RÉSERVATION TROUVÉE
    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: "Aucune réservation trouvée"
      });
    }

    // SI LE STATUT EST DÉJÀ À JOUR NE RI ENVOYER
    if (userInfo.STATUS_ID === new_status_id) {
      return res.status(200).json({
        success: true,
        message: "Le statut est déjà à jour"
      });
    }

    // VERIFIER LA CAPACITÉ MAXIMALE SI PEUT ENCORE CONFIRMER DES RÉSERVATIONS
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
          message: `Impossible de confirmer cette réservation : capacité maximale atteinte (${capacityCheck[0].confirmed_count}/${userInfo.CAPACITE_MAX})`
        });
      }
    }

    console.log("Mise à jour de la réservation:", reservation_id, "avec statut:", new_status_id);

    // METTRE À JOUR LE STATUT DE LA RÉSERVATION
    const [result] = await db.execute(
      `UPDATE RESERVATION SET STATUS_ID = ? WHERE RESERVATION_ID = ?`,
      [new_status_id, reservation_id]
    );

    if (result.affectedRows > 0) {
      // COMPOSER UN NOUVEAU ID DE RÉSERVATION
      const new_composite_id = `${userInfo.USER_ID}_${userInfo.PONT_ID}_${userInfo.BATEAU_ID}_${new_status_id}`;
      
      return res.status(200).json({
        success: true,
        message: "Statut mis à jour avec succès",
        old_status: userInfo.STATUS_ID,
        new_status: new_status_id,
        old_reservation_id: data.reservation_id,
        new_reservation_id: new_composite_id,
        actual_reservation_id: reservation_id,
        date_reservation: userInfo.DATE_RESERVATION
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Aucune réservation n'a été modifiée"
      });
    }
  } catch (error) {
    console.error("Exception dans updateReservationStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur technique: " + error.message
    });
  }
};

` ╔════════════════════════════════════════════════════════════╗
  ║  FONCTION POUR RÉCUPÉRER LES CRÉNEAUX DISPONIBLES PAR DATE ║
  ╚════════════════════════════════════════════════════════════╝
`
export const getCreneaux = async (req, res) => {

  try {
    // VERIFIER LA PRÉSENCE DU PARAMÈTRE DATE
    if (!req.query.date || req.query.date === '') {
      return res.status(400).json({
        success: false,
        message: "Paramètre 'date' manquant"
      });
    }

    // RECUPÉRER LA DATE DE LA REQUÊTE
    const date = req.query.date; // Format attendu: 'YYYY-MM-DD'
    const dateObj = new Date(date);
    const date_formatted = dateObj.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const month = dateObj.getMonth() + 1;

    // DETERMINER LA PÉRIODE EN FONCTION DU MOIS (Avril à Octobre = Été, Novembre à Mars = Hiver)
    const periode = (month >= 4 && month <= 10) ? 'Été' : 'Hiver';
    const periode_id = (month >= 4 && month <= 10) ? 1 : 2; // 1 pour Été, 2 pour Hiver

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
    const formatted_creneaux = creneaux.map(creneau => {
      // CONVERTIR LES HEURES EN FORMAT 'HH:MM'
      const heure_debut = creneau.HORAIRE_DEPART.toString().substring(0, 5);
      const heure_fin = creneau.heure_fin ? creneau.heure_fin.toString().substring(0, 5) : '';
      
      return {
        creneau_id: creneau.HORAIRES_ID,
        periode: creneau.LIBELLE_PERIODE,
        direction: creneau.LIBELLE_DIRECTION_CRENEAU,
        heure_debut: heure_debut,
        heure_fin: heure_fin,
        reservations_confirmees: creneau.reservations_count,
        capacite_max: 5
      };
    });
    
    // ENVOYER LA RÉPONSE DE SUCCÈS
    return res.status(200).json({
      success: true,
      creneaux: formatted_creneaux,
      debug: {
        date: date_formatted,
        periode: periode,
        periode_id: periode_id
      }
    });
    
  } catch (error) {
    // ERREUR - JOURNALISER ET RETOURNER UN MESSAGE D'ERREUR
    console.error("Erreur SQL dans getCreneaux:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des créneaux: " + error.message
    });
  }
};

` ╔══════════════════════════════════════════════════╗
  ║          FONCTION POUR RÉSERVER UN CRÉNEAU       ║
  ╚══════════════════════════════════════════════════╝
`
export const reserveCreneau = async (req, res) => {

  try {
    const data = req.body;

    // VÉRIFIER LA PRÉSENCE DES PARAMÈTRES OBLIGATOIRES
    if (!data.user_id || !data.creneau_id || !data.bateau_id || !data.reservation_date) {
      return res.status(400).json({
        success: false,
        message: "Paramètres manquants dans la requête"
      });
    }

    // RECUPÉRER LES DONNÉES DE LA REQUÊTE
    const user_id = data.user_id;
    const creneau_id = data.creneau_id;
    const bateau_id = data.bateau_id;
    const reservation_date = data.reservation_date; // Format attendu: YYYY-MM-DD
    const pont_id = 1;       // Valeur fixe pour simplifier
    const status_id = 2;     // En attente (ID 2)
    const capacite_max = 5;  // Valeur fixe
    
    // ETAPE 1: VÉRIFIER SI UNE RÉSERVATION IDENTIQUE EXISTE
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
        message: "Une réservation identique existe déjà"
      });
    }

    // ETAPE 2: VÉRIFIER SI LE BATEAU N'EST PAS DÉJÀ RÉSERVÉ SUR CE CRÉNEAU ET CETTE DATE
    const [checkBoatResults] = await db.execute(
      `SELECT RESERVATION_ID
       FROM RESERVATION 
       WHERE BATEAU_ID = ? 
         AND HORAIRES_ID = ? 
         AND DATE(DATE_RESERVATION) = ?`,
      [bateau_id, creneau_id, reservation_date]
    );

    if (checkBoatResults.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ce bateau a déjà une réservation pour ce créneau à cette date"
      });
    }

    // ETAPE 3: VÉRIFIER LA CAPACITÉ MAXIMALE
    const [checkCapacityResults] = await db.execute(
      `SELECT COUNT(*) AS total 
       FROM RESERVATION 
       WHERE HORAIRES_ID = ? 
         AND DATE(DATE_RESERVATION) = ?
         AND STATUS_ID IN (1, 2)`,
      [creneau_id, reservation_date]
    );

    if (checkCapacityResults[0].total >= capacite_max) {
      return res.status(400).json({
        success: false,
        message: "Ce créneau est complet pour cette date (maximum 5 bateaux)"
      });
    }

    // ETAPE 4: INSÉRER LA NOUVELLE RÉSERVATION
    const [result] = await db.execute(
      `INSERT INTO RESERVATION 
       (USER_ID, PONT_ID, BATEAU_ID, STATUS_ID, HORAIRES_ID, DATE_RESERVATION, CAPACITE_MAX) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, pont_id, bateau_id, status_id, creneau_id, reservation_date, capacite_max]
    );

    // VÉRIFIER SI L'INSERTION A RÉUSSI
    if (result.affectedRows > 0) {
      return res.status(201).json({
        success: true,
        message: "Réservation enregistrée avec succès",
        reservation_id: result.insertId
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Erreur lors de l'insertion"
      });
    }
  } catch (error) {
    console.error("Exception dans reserveCreneau:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur technique: " + error.message
    });
  }
};