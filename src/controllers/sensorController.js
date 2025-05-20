import e from "express";
import db from "../models/db.js";

` ╔═════════════════════════════════════════════╗
  ║     FONCTIONS AJOUT DE MESURE CAPTEUR       ║
  ╚═════════════════════════════════════════════╝
`;
export const addMesureSensor = async (req, res) => {
  // ASSURER QUE LA REQUETE SOIT DE TYPE POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Méthode non autorisée",
    });
  }

  // VERIFIER QUE L'UTILISATEUR EST AUTHENTIFIÉ
  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: "Utilisateur non authentifié",
    });
  }

  const data = req.body;

  // VERIFIER QUE TOUTES LES DONNEES SONT PRESENTES
  if (!data.capteur_id || data.valeur === undefined) {
    return res.status(400).json({
      success: false,
      message: "Données incomplètes: capteur_id et valeur sont requis",
    });
  }

  try {
    // DEMARRER UNE TRANSACTION
    await db.query("START TRANSACTION");

    // VERIFIER QUE LE CAPTEUR EXISTE
    const [capteurs] = await db.query(
      "SELECT * FROM CAPTEURS WHERE CAPTEUR_ID = ?",
      [data.capteur_id]
    );

    if (capteurs.length === 0) {
      await db.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Capteur non trouvé",
      });
    }

    // INSERTION DE LA MESURE
    const query = `
            INSERT INTO MESURES_CAPTEURS (CAPTEUR_ID, VALEUR, DATE_MESURE)
            VALUES (?, ?, NOW())
        `;

    const [result] = await db.query(query, [data.capteur_id, data.valeur]);

    if (result.affectedRows === 0) {
      await db.query("ROLLBACK");
      return res.status(500).json({
        success: false,
        message: "Erreur lors de l'insertion de la mesure",
      });
    }

    // VALIDER LA TRANSACTION
    await db.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Mesure ajoutée avec succès",
      mesure_id: result.insertId,
    });
  } catch (error) {
    // ANNULER LA TRANSACTION EN CAS D'ERREUR
    try {
      await db.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Erreur lors du rollback:", rollbackError);
    }

    console.error("Erreur dans ajouterMesureCapteur:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur: " + error.message,
    });
  }
};

` ╔══════════════════════════════════════════════════╗
  ║ FONCTION POUR RÉCUPÉRER LES VALEURS DES CAPTEURS ║
  ╚══════════════════════════════════════════════════╝
`;
export const GetSensorValues = async (req, res) => {
  try {
    // 1. RÉCUPÉRER TOUS LES PONTS
    const [ponts] = await db.query(`
      SELECT 
        p.PONT_ID, 
        p.LIBELLE_PONT, 
        p.ADRESSE
      FROM 
        PONTS p
      ORDER BY 
        p.PONT_ID
    `);

    // Si aucun pont n'est trouvé
    if (ponts.length === 0) {
      return res.status(200).json({
        success: true,
        ponts: [],
      });
    }

    // 2. RÉCUPÉRER ET TRAITER LES DONNÉES DE CHAQUE PONT
    const pontsAvecCapteurs = [];

    // Traiter chaque pont individuellement
    for (const pont of ponts) {
      // Récupérer tous les capteurs associés à ce pont par son nom
      const [capteursPont] = await db.query(
        `
        SELECT 
          c.CAPTEUR_ID, 
          c.TYPE_CAPTEUR,
          c.LIBELLE_CAPTEUR, 
          c.UNITE_MESURE
        FROM 
          CAPTEURS c
        WHERE 
          c.EMPLACEMENT = ?
      `,
        [pont.LIBELLE_PONT]
      );

      // Préparer les objets pour stocker les données des capteurs
      let capteurTemperature = null;
      let capteurTDS = null;
      let capteurProfondeur = null;

      // Classer les capteurs par type
      capteursPont.forEach((capteur) => {
        if (capteur.TYPE_CAPTEUR === "temperature") {
          capteurTemperature = capteur;
        } else if (capteur.TYPE_CAPTEUR === "tds") {
          capteurTDS = capteur;
        } else if (capteur.TYPE_CAPTEUR === "profondeur") {
          capteurProfondeur = capteur;
        }
      });

      // Récupérer les dernières mesures pour chaque capteur trouvé
      let mesureTemperature = null;
      let mesureTDS = null;
      let mesureProfondeur = null;

      if (capteurTemperature) {
        const [tempMesures] = await db.query(
          `
          SELECT VALEUR, DATE_MESURE
          FROM MESURES_CAPTEURS
          WHERE CAPTEUR_ID = ?
          ORDER BY DATE_MESURE DESC
          LIMIT 1
        `,
          [capteurTemperature.CAPTEUR_ID]
        );

        if (tempMesures.length > 0) {
          mesureTemperature = {
            valeur: tempMesures[0].VALEUR,
            date_mesure: tempMesures[0].DATE_MESURE,
            unite: capteurTemperature.UNITE_MESURE,
          };
        }
      }

      if (capteurTDS) {
        const [tdsMesures] = await db.query(
          `
          SELECT VALEUR, DATE_MESURE
          FROM MESURES_CAPTEURS
          WHERE CAPTEUR_ID = ?
          ORDER BY DATE_MESURE DESC
          LIMIT 1
        `,
          [capteurTDS.CAPTEUR_ID]
        );

        if (tdsMesures.length > 0) {
          mesureTDS = {
            valeur: tdsMesures[0].VALEUR,
            date_mesure: tdsMesures[0].DATE_MESURE,
            unite: capteurTDS.UNITE_MESURE,
          };
        }
      }

      if (capteurProfondeur) {
        const [profondeurMesures] = await db.query(
          `
          SELECT VALEUR, DATE_MESURE
          FROM MESURES_CAPTEURS
          WHERE CAPTEUR_ID = ?
          ORDER BY DATE_MESURE DESC
          LIMIT 1
        `,
          [capteurProfondeur.CAPTEUR_ID]
        );

        if (profondeurMesures.length > 0) {
          mesureProfondeur = {
            valeur: profondeurMesures[0].VALEUR,
            date_mesure: profondeurMesures[0].DATE_MESURE,
            unite: capteurProfondeur.UNITE_MESURE,
          };
        }
      }

      // Déterminer la date de mesure la plus récente parmi tous les capteurs
      let dateMesurePlusRecente = null;

      if (mesureTemperature?.date_mesure) {
        dateMesurePlusRecente = mesureTemperature.date_mesure;
      }

      if (
        mesureTDS?.date_mesure &&
        (!dateMesurePlusRecente ||
          new Date(mesureTDS.date_mesure) > new Date(dateMesurePlusRecente))
      ) {
        dateMesurePlusRecente = mesureTDS.date_mesure;
      }

      if (
        mesureProfondeur?.date_mesure &&
        (!dateMesurePlusRecente ||
          new Date(mesureProfondeur.date_mesure) >
            new Date(dateMesurePlusRecente))
      ) {
        dateMesurePlusRecente = mesureProfondeur.date_mesure;
      }

      // Créer l'objet pont avec ses capteurs
      pontsAvecCapteurs.push({
        pont_id: pont.PONT_ID,
        libelle_pont: pont.LIBELLE_PONT,
        adresse: pont.ADRESSE,

        temperature: mesureTemperature ? mesureTemperature.valeur : null,
        unite_temperature: mesureTemperature ? mesureTemperature.unite : "°C",

        humidite: mesureTDS ? mesureTDS.valeur : null,
        unite_humidite: mesureTDS ? mesureTDS.unite : "ppm",

        niveau_eau: mesureProfondeur ? mesureProfondeur.valeur : null,
        unite_niveau: mesureProfondeur ? mesureProfondeur.unite : "cm",

        date_mesure: dateMesurePlusRecente,
      });
    }

    // 3. ENVOYER LA RÉPONSE
    return res.status(200).json({
      success: true,
      ponts: pontsAvecCapteurs,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des capteurs:",
      error.message
    );
    return res.status(500).json({
      success: false,
      message: "Erreur: " + error.message,
    });
  }
};
