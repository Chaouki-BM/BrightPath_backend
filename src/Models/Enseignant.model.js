const mongoose = require('mongoose');

const enseignantSchema = new mongoose.Schema({
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  specificfiled: String 
},{
    timestamps:true
});

module.exports = mongoose.model('Enseignant', enseignantSchema);