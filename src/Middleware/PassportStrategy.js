const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Utilisateur = require('../Models/Utilisateur.model');
const crypto = require('crypto');
const bcrypt=require('bcrypt')
console.log("hello");

passport.use(new GoogleStrategy({
    clientID: process.env.Client_ID_Google_Auth,
    clientSecret: process.env.Code_Secret_Google_Auth,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      console.log("stratygy",email);
      
      let user = await Utilisateur.findOne({ email });

      if (!user) {
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(crypto.randomBytes(4).toString('hex'), salt);
        user = await Utilisateur.create({
          nom: profile.name.familyName || "Nom",
          prenom: profile.name.givenName || "Prénom",
          email: email,
          password: hashedPassword,
          avatar: profile.photos[0]?.value || "null",
          role: "étudiant",
          verificationCode: "google_oauth",
          isVerified: true
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

