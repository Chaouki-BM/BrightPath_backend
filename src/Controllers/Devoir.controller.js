const Devoir = require('../Models/Devoir.model');
const Cours = require('../Models/Cours.model');
const Utilisateur = require('../Models/Utilisateur.model');
const CompteRendu = require('../Models/CompteRendu.model');
const fs = require('fs');
const path = require('path');

// Fonction utilitaire pour vérifier si l'utilisateur est l'enseignant du cours
const estEnseignantDuCours = async (enseignantId, coursId) => {
    const cours = await Cours.findById(coursId);
    return cours && cours.enseignant.toString() === enseignantId.toString();
  };

  exports.creerDevoir = async (req, res) => {
    try {
      const { coursId, date_fin,title } = req.body;
      const enseignantId = req.userId; 
        
      const utilisateur = await Utilisateur.findById(enseignantId);
    if (!utilisateur || utilisateur.role !== 'enseignant') {
      return res.status(403).json({
        success: false,
        message: "Seuls les enseignants peuvent créer des devoirs"
      });
    }
      // Vérifier que l'enseignant est associé au cours
      if (!await estEnseignantDuCours(enseignantId, coursId)) {
        return res.status(403).json({
          success: false,
          message: "Vous n'êtes pas autorisé à ajouter un devoir à ce cours"
        });
      }
  
      if (!title || !date_fin || !coursId) {
      return res.status(400).json({
        success: false,
        message: 'Title, date_fin, and cours are required'
      });
    }
      
  
      const nouveauDevoir = new Devoir({
        title:title,
        date_fin: new Date(date_fin),
        cours: coursId
      });
  
      await nouveauDevoir.save();
  
      res.status(201).json({
        success: true,
        data: nouveauDevoir,
        message: "Devoir ajouté avec succès"
      });
    } catch (erreur) {
      console.error("Erreur lors de la création du devoir:", erreur);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création du devoir",
        error: erreur.message
      });
    }
  };
exports.supprimerDevoir = async (req, res) => {
  try {
    const { idDevoir } = req.params;
   const enseignantId = req.userId;

       // Vérifier que l'utilisateur est un enseignant
    const utilisateur = await Utilisateur.findById(enseignantId);
    if (!utilisateur || utilisateur.role !== 'enseignant') {
      return res.status(403).json({
        success: false,
        message: "Seuls les enseignants peuvent modifier des devoirs"
      });
    }
      
      const devoir = await Devoir.findById(idDevoir);
      
      if (!devoir) {
        return res.status(404).json({
          success: false,
          message: "Devoir non trouvé"
        });
      }
      
      
      if (!await estEnseignantDuCours(enseignantId, devoir.cours)) {
        return res.status(403).json({
          success: false,
          message: "Vous n'êtes pas autorisé à modifier ce devoir"
        });
      }
    const deletedDevoir = await Devoir.findByIdAndDelete(idDevoir);

    if (!deletedDevoir) {
      return res.status(404).json({
        success: false,
        message: 'Devoir not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Devoir deleted successfully',
      data: deletedDevoir
    });

  } catch (error) {
    console.error('Error deleting devoir:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
//lenna ta3tih l id mt3 l cours w ijiblk devoirat lkoll mt3 l cours haka 
  exports.obtenirDevoirsParCours = async (req, res) => {
  try {
    const { coursId } = req.params;
    
    const devoirs = await Devoir.find({ cours: coursId })
      .sort({ date_fin: 1 });

    res.status(200).json({
      success: true,
      count: devoirs.length,
      data: devoirs
    });
  } catch (erreur) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des devoirs du cours",
      error: erreur.message
    });
  }
};

  
  exports.mettreAJourDevoir = async (req, res) => {
    try {
      const { date_fin,title,idDevoir } = req.body;
      const enseignantId = req.userId;

       // Vérifier que l'utilisateur est un enseignant
    const utilisateur = await Utilisateur.findById(enseignantId);
    if (!utilisateur || utilisateur.role !== 'enseignant') {
      return res.status(403).json({
        success: false,
        message: "Seuls les enseignants peuvent modifier des devoirs"
      });
    }
      
      const devoir = await Devoir.findById(idDevoir);
      
      if (!devoir) {
        return res.status(404).json({
          success: false,
          message: "Devoir non trouvé"
        });
      }
      
      
      if (!await estEnseignantDuCours(enseignantId, devoir.cours)) {
        return res.status(403).json({
          success: false,
          message: "Vous n'êtes pas autorisé à modifier ce devoir"
        });
      }
  
      
    const updateData = {};
    if (title) updateData.title = title;
    if (date_fin) updateData.date_fin = new Date(date_fin);

    
    const updatedDevoir = await Devoir.findByIdAndUpdate(
      idDevoir,
      updateData,
      { new: true }
    );

    if (!updatedDevoir) {
      return res.status(404).json({
        success: false,
        message: 'Devoir not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Devoir updated successfully',
      data: updatedDevoir
    });

  } catch (error) {
    console.error('Error updating devoir:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
  };

  
  // lel étudiants bch yraj3  compte rendu mizalt faha mochkla ta nrk7ha 
exports.soumettreCompteRendu = async (req, res) => {
    try {
      const { devoirId } = req.params;
      const etudiantId = req.userId; 
       
    const utilisateur = await Utilisateur.findById(etudiantId);
    if (!utilisateur || utilisateur.role !== 'étudiant') {
      return res.status(403).json({
        success: false,
        message: "Seuls les étudiants peuvent soumettre des comptes rendus"
      });
    }
      
      const devoir = await Devoir.findById(devoirId);
      
      if (!devoir) {
        return res.status(404).json({
          success: false,
          message: "Devoir non trouvé"
        });
      }
      
      
      if (new Date() > new Date(devoir.date_fin)) {
        return res.status(400).json({
          success: false,
          message: "La date limite de soumission est dépassée"
        });
      }
      
      
      const soumissionExistante = await CompteRendu.findOne({
        devoir: devoirId,
        etudiant: etudiantId
      });
      
      if (soumissionExistante) {
        
        const cheminFichier = path.join(__dirname, '../uploads', soumissionExistante.file);
        if (fs.existsSync(cheminFichier)) {
          fs.unlinkSync(cheminFichier);
        }
        
        
        if (req.file) {
          soumissionExistante.file = req.file.path;
          soumissionExistante.dateSubmission = new Date();
          await soumissionExistante.save();
          
          return res.status(200).json({
            success: true,
            data: soumissionExistante,
            message: "Compte rendu mis à jour avec succès"
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Veuillez télécharger un fichier pour le compte rendu"
          });
        }
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Veuillez télécharger un fichier pour le compte rendu"
        });
      }
      
      
      const nouveauCompteRendu = new CompteRendu({
        file: req.file.path,
        dateSubmission: new Date(),
        devoir: devoirId,
        etudiant: etudiantId
      });
      
      await nouveauCompteRendu.save();
      
      res.status(201).json({
        success: true,
        data: nouveauCompteRendu,
        message: "Compte rendu soumis avec succès"
      });
    } catch (erreur) {
      console.error("Erreur lors de la soumission du compte rendu:", erreur);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la soumission du compte rendu",
        error: erreur.message
      });
    }
  };


exports.GetAllDevoir = async (req, res) => {
    try {
    const { CoursId } = req.params;
    const enseignantId =  req.userId;

    // Vérifier que l'utilisateur est un enseignant
    const utilisateur = await Utilisateur.findById(enseignantId);
    if (!utilisateur || utilisateur.role !== 'enseignant') {
      return res.status(403).json({
        success: false,
        message: "Seuls les enseignants peuvent consulter les comptes rendus"
      });
    }

    
    const cours = await Cours.findById(CoursId);
    
    
    if (!cours) {
      return res.status(404).json({
        success: false,
        message: "Cours non trouvé"
      });
    }

    if (cours.enseignant.toString() !== enseignantId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à accéder à ce cours"
      });
    }

    
    const devoirs = await Devoir.find({ cours: CoursId }).lean();
    
   
    const devoirsAvecComptesRendus = await Promise.all(
      devoirs.map(async (devoir) => {
        const comptesRendus = await CompteRendu.find({ devoir: devoir._id })
          .populate('etudiant', 'nom prenom')
          .sort({ createdAt: -1 }) 
          .lean();

        return {
          ...devoir,
          comptesRendus
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: devoirsAvecComptesRendus.length,
      data: devoirsAvecComptesRendus
    });

  } catch (erreur) {
    console.error('Erreur:', erreur);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des comptes rendus",
      error: erreur.message
    });
  }
  };