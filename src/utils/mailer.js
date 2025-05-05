import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// CHARGEMENT DES VARIABLES D'ENVIRONNEMENT
dotenv.config("../../.env");

// CONFIGURATION DU TRANSPORTEUR D'EMAIL
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
    },
});

/**
     * ENVOIE D'UN EMAIL DE STATUT DE RESERVATION
     * @param {string} email - DESTINATAIRE DE L'EMAIL
     * @param {string} username - NOM D'UTILISATEUR
     * @param {Object} reservation - DONNEES DE LA RESERVATION
     * @param {string} status - NOUVEAU STATUT DE LA RESERVATION
     * @returns {Promise} - RESULTAT DE L'ENVOI DE L'EMAIL
*/

export const sendReservationStatusEmail = async (email, username, reservation, status) => {
  
    // CONFIGURATION DES VARIABLES D'EMAIL
    let subject = 'Mise à jour de votre réservation - PontConnect';
    let statusText = 'mise à jour';
    let statusColor = '#3498db';
    
    if (status === 'confirmé') {
        statusText = 'confirmée';
        statusColor = '#2ecc71';
        subject = 'Confirmation de votre réservation - PontConnect';
    } else if (status === 'refusé') {
        statusText = 'refusée';
        statusColor = '#e74c3c';
        subject = 'Refus de votre réservation - PontConnect';
    } else if (status === 'annulé') {
        statusText = 'annulée';
        statusColor = '#f39c12';
        subject = 'Annulation de votre réservation - PontConnect';
    }

    const date = new Date(reservation.reservation_date).toLocaleDateString('fr-FR', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    });

    // CONTENU HTML DE L'EMAIL
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0056b3; color: white; padding: 20px; text-align: center;">
            <h1>PontConnect</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <p>Bonjour ${username},</p>
            <p>Votre réservation a été <strong style="color: ${statusColor};">${statusText}</strong>.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Détails de la réservation :</h3>
            <p><strong>Date :</strong> ${date}</p>
            <p><strong>Pont :</strong> ${reservation.pont_name}</p>
            <p><strong>Direction :</strong> ${reservation.direction}</p>
            <p><strong>Bateau :</strong> ${reservation.bateau_name} (${reservation.bateau_immatriculation})</p>
            <p><strong>Horaire :</strong> ${reservation.heure_debut} - ${reservation.heure_fin}</p>
            <p><strong>Statut :</strong> <span style="color: ${statusColor};">${status.toUpperCase()}</span></p>
            </div>
            
            <p>Pour plus d'informations, connectez-vous à votre compte PontConnect.</p>
            <p>Merci de votre confiance.</p>
            <p>L'équipe PontConnect</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 10px; text-align: center; color: #666; font-size: 12px;">
            <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
        </div>
        </div>
    `;

    try {
        const info = await transporter.sendMail({
        from: `"PontConnect" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
        to: email,
        subject: subject,
        html: htmlContent,
        });
        console.log(`Email envoyé à ${email}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'email à ${email}:`, error);
        return false;
    }
};