const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
  cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Cours' },
  date: { type: Date, default: Date.now },
  message: { type: String, required: true },
},{
    timestamps:true
});
module.exports = mongoose.model('Notification', notificationSchema);
