const mongoose = require('mongoose');

const supportCoursSchema = new mongoose.Schema({
  file: String,
  description: String,
  cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Cours' }
},{
    timestamps:true
});

module.exports = mongoose.model('SupportCours', supportCoursSchema);
