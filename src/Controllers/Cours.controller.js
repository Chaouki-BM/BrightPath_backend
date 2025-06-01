const Cours = require('../Models/Cours.model');
const Utilisateur = require('../Models/Utilisateur.model');
const Abonnement=require("../Models/Abonnement.model")
// Fonctions pour les enseignants
exports.creerCours = async (req, res) => {
    try {
      // Vérifier que l'utilisateur est un enseignant
      const utilisateur = await Utilisateur.findById(req.userId);
      if (!utilisateur || utilisateur.role !== 'enseignant') {
        return res.status(403).json({ message: 'Accès refusé. Seuls les enseignants peuvent créer des cours.' });
      }
      const nouveauCours = new Cours({
        titre: req.body.titre,
        niveau_etude: req.body.niveau_etude,
        prix: req.body.prix,
        enseignant: req.userId,
      });
      const coursSauvegarde = await nouveauCours.save();
      res.status(201).json(coursSauvegarde);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  exports.modifierCours = async (req, res) => {
    try {
      const cours = await Cours.findById(req.params.id);
      if (!cours) {
        return res.status(404).json({ message: 'Cours non trouvé' });
      }
  
      // Vérifier que l'utilisateur est bien l'enseignant du cours
      if (cours.enseignant.toString() !== req.userId) {
        return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres cours' });
      }
  
      // Mettre à jour les champs
      cours.titre = req.body.titre || cours.titre;
      cours.niveau_etude = req.body.niveau_etude || cours.niveau_etude;
      cours.prix = req.body.prix || cours.prix;
     
      const coursModifie = await cours.save();
      res.json(coursModifie);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  exports.supprimerCours = async (req, res) => {
    try {
      const cours = await Cours.findById(req.params.id);
      if (!cours) {
        return res.status(404).json({ message: 'Cours non trouvé' });
      }
  
      // Vérifier que l'utilisateur est bien l'enseignant du cours
      if (cours.enseignant.toString() !== req.userId) {
        return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres cours' });
      }
  
      await Cours.deleteOne({ _id: req.params.id });
      res.json({ message: 'Cours supprimé avec succès' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

exports.getMesCours = async (req, res) => {
  try {
    const cours = await Cours.find({ enseignant: req.userId })
      .populate('enseignant', 'nom avatar') // << inclure nom et avatar
      .sort({ dateCreation: -1 });

    res.json(cours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Fonctions pour tous les utilisateurs (étudiants)
  exports.getAllCours = async (req, res) => {
    try {
      const cours = await Cours.find()
        .populate('enseignant', 'nom avatar')
        .sort({ dateCreation: -1 });
      res.json(cours);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  exports.getCoursById = async (req, res) => {
    try {
      const cours = await Cours.findById(req.params.id)
        .populate('enseignant', 'nom prenom email avatar');
      
      if (!cours) {
        return res.status(404).json({ message: 'Cours non trouvé' });
      }
      
      res.json(cours);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Recherche de cours par enseignant
exports.getCoursParEnseignant = async (req, res) => {
    try {
      const cours = await Cours.find({ enseignant: req.params.enseignantId })
        .populate('enseignant', 'nom prenom')
        .sort({ dateCreation: -1 });
      res.json(cours);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
//hatha lel courat elli charihom l etudiant

// exports.getActiveStudentSubscriptions = async (req, res) => {
//     try {
//         const etudiantId =req.userId;
//         console.log(etudiantId);
        
//         if (!etudiantId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Student ID is required"
//             });
//         }
        
//         const activeAbonnements = await Abonnement.find({ 
//             etudiant: etudiantId,
//             etat: "paye" 
//         })
//         .populate('cours', 'titre  niveau_etude prix rating enseignant')
//         .populate('etudiant', 'nom prenom email')
//         .sort({ createdAt: -1 });
        
//         res.status(200).json({
//             success: true,
//             message: "Active subscriptions retrieved successfully",
//             count: activeAbonnements.length,
//             data: activeAbonnements
//         });
        
//     } catch (err) {
//         console.error('Get active subscriptions error:', err.message);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error"
//         });
//     }
// };
  //---> Get abonment cours 
 exports.getStudentSubscriptions = async (req, res) => {
    try {
        const etudiantId = req.userId;
        
        if (!etudiantId) {
            return res.status(400).json({
                success: false,
                message: "Student ID is required"
            });
        }
        
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const updateResult = await Abonnement.updateMany(
            {
                etudiant: etudiantId,
                etat: "paye",
                date_payement: { $lt: oneMonthAgo }
            },
            {
                $set: { etat: "impaye" }
            }
        );
        
        const abonnements = await Abonnement.find({
            etudiant: etudiantId,
            etat: "paye"
        })
         .populate({
            path: 'cours',
            select: 'titre niveau_etude prix rating enseignant',
            populate: {
                path: 'enseignant',
                select: 'nom prenom avatar'
            }
        })
        .populate('etudiant', 'nom prenom email')
        .sort({ createdAt: -1 })
        .lean(); 
        
        return res.status(200).json({
            success: true,
            message: abonnements.length > 0 
                ? "Student active subscriptions retrieved successfully"
                : "No active paid subscriptions found for this student",
            count: abonnements.length,
            expiredSubscriptionsUpdated: updateResult.modifiedCount,
            data: abonnements
        });
        
    } catch (err) {
        console.error('Get student subscriptions error:', err.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};