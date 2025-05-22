const mongoose = require('mongoose');

const CompteRenduSchema = new mongoose.Schema({
  file: String,
  description: String,
  dateSubmission:Date,
  devoir: { type: mongoose.Schema.Types.ObjectId, ref: 'Devoir' },
  etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' }
},{
    timestamps:true
});

module.exports = mongoose.model('CompteRendu', CompteRenduSchema);
