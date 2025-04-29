const Utilisateur = require('../models/Utilisateur');

module.exports = async (req, res, next) => {
  try {
    // Vérifier que l'utilisateur existe et est un enseignant
    const utilisateur = await Utilisateur.findById(req.userId);
    
    if (!utilisateur || utilisateur.role !== 'enseignant') {
      return res.status(403).json({ 
        message: 'Accès refusé. Cette fonctionnalité est réservée aux enseignants.' 
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};