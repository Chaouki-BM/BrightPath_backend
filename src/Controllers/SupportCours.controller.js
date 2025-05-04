const SupportCours = require('../Models/SupportCours.model');
const Cours = require('../Models/Cours.model');
const Utilisateur = require('../Models/Utilisateur.model');
const fs = require('fs').promises;
const path = require('path');
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
      const { description } = req.body;
      
      // Vérifier que l'utilisateur est l'enseignant du cours
      const verification = await verifierEnseignantCours(req.userId, coursId);
      if (!verification.success) {
        return res.status(403).json({ message: verification.message });
      }
      
      // Créer le support de cours
      const nouveauSupport = new SupportCours({
        file:req.file.path,
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
      console.log(support.file);
      if (!support) {
        return res.status(404).json({ message: 'Support de cours non trouvé' });
      }
      
      const verification = await verifierEnseignantCours(req.userId, support.cours);
      if (!verification.success) {
        return res.status(403).json({ message: verification.message });
      }
      
    
      const filePath = path.resolve(__dirname, '..', support.file); 
        try {
            await fs.unlink(filePath);
        } catch (fileError) {
            if (fileError.code !== 'ENOENT') { 
                throw fileError;
            }
            console.warn('Fichier déjà supprimé:', filePath);
        }
        await SupportCours.deleteOne({ _id: supportId });
        res.json({ message: 'Support supprimé avec succès' });
    } catch (error) {
      res.status(500).json({message: error.message });
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
   