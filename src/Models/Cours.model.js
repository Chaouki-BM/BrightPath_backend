const mongoose = require('mongoose');
const coursSchema = new mongoose.Schema({
  titre: String,
  niveau_etude: String,
  prix: Number,
  rating:{type:Number,default:0},
  enseignant: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' }
},{
    timestamps:true
});

module.exports = mongoose.model('Cours', coursSchema);