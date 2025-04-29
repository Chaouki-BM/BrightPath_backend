const SupportCours = require('../models/SupportCours');
const Cours = require('../models/Cours');
const Utilisateur = require('../models/Utilisateur');

// Vérifier si l'utilisateur est l'enseignant du cours
const verifierEnseignantCours = async (userId, coursId) => {
    const cours = await Cours.findById(coursId);
    if (!cours) {
      return { success: false, message: 'Cours non trouvé' };
    }
    
    if (cours.enseignant.toString() !== userId) {
      return { success: false, message: 'Vous n\'êtes pas l\'enseignant de ce cours' };
    }
    
    return { success: true, cours };
  };
  
  // Créer un support de cours
  exports.creerSupportCours = async (req, res) => {
    try {
      const { coursId } = req.params;
      const { file, description } = req.body;
      
      // Vérifier que l'utilisateur est l'enseignant du cours
      const verification = await verifierEnseignantCours(req.userId, coursId);
      if (!verification.success) {
        return res.status(403).json({ message: verification.message });
      }
      
      // Créer le support de cours
      const nouveauSupport = new SupportCours({
        file,
        description,
        cours: coursId
      });
      
      const supportSauvegarde = await nouveauSupport.save();
      
      res.status(201).json(supportSauvegarde);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

 // Supprimer un support de cours
exports.supprimerSupportCours = async (req, res) => {
    try {
      const { supportId } = req.params;
      
      // Récupérer le support
      const support = await SupportCours.findById(supportId);
      if (!support) {
        return res.status(404).json({ message: 'Support de cours non trouvé' });
      }
      
      // Vérifier que l'utilisateur est l'enseignant du cours associé
      const verification = await verifierEnseignantCours(req.userId, support.cours);
      if (!verification.success) {
        return res.status(403).json({ message: verification.message });
      }
      
      // Supprimer le support
      await SupportCours.deleteOne({ _id: supportId });
      
      res.json({ message: 'Support de cours supprimé avec succès' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  exports.getSupportsCours = async (req, res) => {
    try {
      const { coursId } = req.params;
      
      // Vérifier que le cours existe
      const cours = await Cours.findById(coursId);
      if (!cours) {
        return res.status(404).json({ message: 'Cours non trouvé' });
      }
      
      // Récupérer tous les supports associés à ce cours
      const supports = await SupportCours.find({ cours: coursId }).sort({ createdAt: -1 });
      
      res.json(supports);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
   