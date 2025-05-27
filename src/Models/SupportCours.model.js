const mongoose = require('mongoose');

const supportCoursSchema = new mongoose.Schema({
  titre: String,
  file: String,
  date_de_publication: String,
  description: String,
  cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Cours' }
},{
    timestamps:true
});

module.exports = mongoose.model('SupportCours', supportCoursSchema);