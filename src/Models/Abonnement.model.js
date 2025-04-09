const mongoose = require('mongoose');

const abonnementSchema = new mongoose.Schema({
  etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'Etudiant' },
  cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Cours' },
  etat: String,
  date_payement: Date,
  montant: Number
},{
    timestamps:true
});

module.exports = mongoose.model('Abonnement', abonnementSchema);
