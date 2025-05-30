const Utilisateur=require('../Models/Utilisateur.model')
const axios = require('axios');
const SeanceDirect = require('../Models/SeanceDirect.model');
const Cours = require('../Models/Cours.model');
const Abonnement = require('../Models/Abonnement.model');
const getAuthHeaders = () => {
  const credentials = `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`;
  const base64Credentials = Buffer.from(credentials).toString('base64');
  
  return {
    Authorization: `Basic ${base64Credentials}`,
    'Content-Type': 'application/json',
  };
};

// Generate Zoom OAuth access token
const generateAccessToken = async () => {
  try {
    const response = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      {}, // Zoom expects an empty body
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error generating access token:', error.response?.data || error.message);
    throw new Error('Access token generation failed');
  }
};

// Create Zoom meeting
exports.createMeeting = async (req, res) => {
  try {
    const accessToken = await generateAccessToken(); // Await the token

    const { topic, duration } = req.body;

    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        agenda: 'BrightPath Meeting',
        topic,
        type: 2, // Instant meeting
        duration,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(response)
    res.status(201).json({
      starturl: response.data.start_url,
      meetingId: response.data.id,
      joinUrl: response.data.join_url,
      password: response.data.password,
    });

  } catch (error) {
    console.error('Error creating meeting:', error.response?.data || error.message);
    res.status(500).json({ error: 'Meeting creation failed' });
  }
};

exports.createSeance = async (req, res) => {
  try {
    const { date, heure, cours } = req.body;
    
    const newSeance = new SeanceDirect({
      date,
      heure,
      cours
    });
    
    const savedSeance = await newSeance.save();
    await savedSeance.populate('cours', 'titre niveau_etude prix');
    
    res.status(201).json({
      success: true,
      message: 'Seance created successfully',
      data: savedSeance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating seance',
      error: error.message
    });
  }
};

exports.deleteSeance = async (req, res) => {
  try {
    const { idSeance } = req.params;
    
    const deletedSeance = await SeanceDirect.findByIdAndDelete(idSeance);
    
    if (!deletedSeance) {
      return res.status(404).json({
        success: false,
        message: 'Seance not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Seance deleted successfully',
      data: deletedSeance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting seance',
      error: error.message
    });
  }
};

exports.getSeancesForEnseignant = async (req, res) => {
  try {
    const { enseignantId } = req.userId;
    
    
    const enseignant = await Utilisateur.findById(enseignantId);
    if (!enseignant || enseignant.role !== 'enseignant') {
      return res.status(403).json({
        success: false,
        message: 'User is not an enseignant'
      });
    }

    
    const courses = await Cours.find({ enseignant: enseignantId });
    const courseIds = courses.map(course => course._id);

    
    const seances = await SeanceDirect.find({ 
      cours: { $in: courseIds } 
    })
    .populate({
      path: 'cours',
      select: 'titre niveau_etude prix rating'
    })
    .sort({ date: 1, heure: 1 });

    res.status(200).json({
      success: true,
      count: seances.length,
      enseignant: {
        nom: enseignant.nom,
        prenom: enseignant.prenom
      },
      data: seances
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching seances for enseignant',
      error: error.message
    });
  }
};

exports.getTodaySeancesForEnseignant = async (req, res) => {
  try {
    const { enseignantId } = req.userId;
    
    const enseignant = await Utilisateur.findById(enseignantId);
    if (!enseignant || enseignant.role !== 'enseignant') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User is not an enseignant'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const courses = await Cours.find({ enseignant: enseignantId });
    const courseIds = courses.map(course => course._id);

    const seances = await SeanceDirect.find({ 
      cours: { $in: courseIds },
      date: { $gte: today, $lt: tomorrow }
    })
    .populate('cours', 'titre niveau_etude')
    .sort({ heure: 1 });

    res.status(200).json({
      success: true,
      count: seances.length,
      message: `Today's seances for ${enseignant.prenom} ${enseignant.nom}`,
      data: seances
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s seances',
      error: error.message
    });
  }
};

exports.getSeancesForEtudiant = async (req, res) => {
  try {
    const { etudiantId } = req.userId;
    
    
    const etudiant = await Utilisateur.findById(etudiantId);
    if (!etudiant || etudiant.role !== 'étudiant') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User is not an étudiant'
      });
    }

    const abonnements = await Abonnement.find({ 
      etudiant: etudiantId,
      etat: 'active' 
    }).populate('cours');

    const courseIds = abonnements.map(abonnement => abonnement.cours._id);

    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No active subscriptions found',
        etudiant: {
          nom: etudiant.nom,
          prenom: etudiant.prenom
        },
        data: []
      });
    }
    const seances = await SeanceDirect.find({ 
      cours: { $in: courseIds } 
    })
    .populate({
      path: 'cours',
      select: 'titre niveau_etude prix rating',
      populate: {
        path: 'enseignant',
        select: 'nom prenom avatar'
      }
    })
    .sort({ date: 1, heure: 1 });

    res.status(200).json({
      success: true,
      count: seances.length,
      etudiant: {
        nom: etudiant.nom,
        prenom: etudiant.prenom
      },
      subscriptions: abonnements.length,
      data: seances
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching seances for étudiant',
      error: error.message
    });
  }
};