const mongoose = require('mongoose');

const etudiantSchema = new mongoose.Schema({
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  specificfiled: String 
},{
    timestamps:true
});

module.exports = mongoose.model('Etudiant', etudiantSchema);