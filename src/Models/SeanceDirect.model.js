const mongoose = require('mongoose');

const seanceDirectSchema = new mongoose.Schema({
  date: Date,
  heure: String,
  cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Cours' }
},{
    timestamps:true
});
module.exports = mongoose.model('SeanceDirect', seanceDirectSchema);
