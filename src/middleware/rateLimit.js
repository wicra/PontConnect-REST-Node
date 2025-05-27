import rateLimit from 'express-rate-limit';

` ╔══════════════════════════════════════╗
  ║    LIMITEUR DE TÂCHES UTILISATEUR    ║
  ╚══════════════════════════════════════╝
`
// 15MIN / 100 REQUÊTES
export const rateLimitUser = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "VOUS AVEZ ATTEINT LA LIMITE DE REQUÊTES, VEUILLEZ RÉESSAYER PLUS TARD.",
  }
});

` ╔═══════════════════════════════════╗
  ║    LIMITEUR D'AJOUT DE BATEAUX    ║
  ╚═══════════════════════════════════╝
`
// 1MIN / 2 REQUÊTES
export const rateLimitAddBoat = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "VOUS AVEZ ATTEINT LA LIMITE D'AJOUT DE BATEAUX, VEUILLEZ RÉESSAYER PLUS TARD.",
  }
});

` ╔══════════════════════════════════════╗
  ║    LIMITEUR D'AJOUT DE RÉSERVATIONS  ║
  ╚══════════════════════════════════════╝
`
// 24H / 3 REQUÊTES
export const rateLimitAddReservation = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "VOUS AVEZ ATTEINT LA LIMITE D'AJOUT DE RÉSERVATIONS, VEUILLEZ RÉESSAYER PLUS TARD.",
  }
});

` ╔═══════════════════════════════╗
  ║    LIMITEUR DE CONNEXION      ║
  ╚═══════════════════════════════╝
`
// 1MIN / 5 REQUÊTES
export const rateLimitLogin = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "VOUS AVEZ ATTEINT LA LIMITE DE CONNEXION, VEUILLEZ RÉESSAYER PLUS TARD.",
  }
});

` ╔══════════════════════════════╗
  ║    LIMITEUR D'INSCRIPTION    ║
  ╚══════════════════════════════╝
`
// 2MIN / 1 REQUÊTE
export const rateLimitRegister = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "VOUS AVEZ ATTEINT LA LIMITE D'INSCRIPTION, VEUILLEZ RÉESSAYER PLUS TARD.",
  }
});

` ╔══════════════════════════════════════════╗
  ║   LIMITEUR D'AJOUT DE VALEURS CAPTEURS   ║
  ╚══════════════════════════════════════════╝
`
// 20s / 4 REQUÊTE
export const rateLimitaAddMesureSensor = rateLimit({
  windowMs: 20 * 1000,
  max: 4,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "VOUS AVEZ ATTEINT LA LIMITE D'AJOUT DE VALEURS CAPTEURS, VEUILLEZ RÉESSAYER PLUS TARD.",
  }
});