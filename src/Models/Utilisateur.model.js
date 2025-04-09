const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: {type:String,default:'null'},
  role: { type: String, enum: ['enseignant', 'étudiant'], required: true },
  isVerified:{type:Boolean,default:false}
});

module.exports = mongoose.model('Utilisateur', utilisateurSchema);