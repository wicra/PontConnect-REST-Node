import db from '../models/db.js';

// FONCTION POUR RÉCUPÉRER LES CRÉNEAUX DISPONIBLES
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

// FONCTION POUR RÉCUPÉRER LES VALEURS DES CAPTEURS
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

