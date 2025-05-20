import db from "../db/db.js";

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
