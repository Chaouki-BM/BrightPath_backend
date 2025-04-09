const mongoose = require('mongoose');

const devoirSchema = new mongoose.Schema({
  file: String,
  date_fin: Date,
  cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Cours' }
},{
    timestamps:true
});

module.exports = mongoose.model('Devoir', devoirSchema);