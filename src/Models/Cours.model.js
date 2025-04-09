const mongoose = require('mongoose');

const coursSchema = new mongoose.Schema({
  titre: String,
  niveau_etude: String,
  prix: Number,
  enseignant: { type: mongoose.Schema.Types.ObjectId, ref: 'Enseignant' }
},{
    timestamps:true
});

module.exports = mongoose.model('Cours', coursSchema);