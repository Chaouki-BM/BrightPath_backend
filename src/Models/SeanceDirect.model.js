const mongoose = require('mongoose');

const seanceDirectSchema = new mongoose.Schema({
  titre: String,
  date: String,
  heure: String,
  link:{ type:String, default: null },
  cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Cours' }
},{
    timestamps:true
});
module.exports = mongoose.model('SeanceDirect', seanceDirectSchema);
