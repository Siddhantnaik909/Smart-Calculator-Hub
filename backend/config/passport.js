const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        const newUser = {
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value
        };

        try {
            // Check if user already exists with this Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                return done(null, user);
            }

            // If not, check if a user exists with that email address
            user = await User.findOne({ email: newUser.email });
            if (user) {
                // If user exists but without googleId, link the account
                user.googleId = profile.id;
                await user.save();
                return done(null, user);
            } else {
                // If user doesn't exist at all, create a new one
                user = await User.create(newUser);
                return done(null, user);
            }
        } catch (err) {
            console.error(err);
            return done(err, null);
        }
    }));

    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/api/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'emails']
    },
    async (accessToken, refreshToken, profile, done) => {
        const newUser = {
            facebookId: profile.id,
            name: profile.displayName,
            email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null
        };

        // Facebook may not return an email, so we need to handle that.
        if (!newUser.email) {
            return done(new Error('Facebook did not return an email address. Please try another authentication method.'), null);
        }

        try {
            let user = await User.findOne({ facebookId: profile.id });

            if (user) {
                return done(null, user);
            }

            user = await User.findOne({ email: newUser.email });
            if (user) {
                user.facebookId = profile.id;
                await user.save();
                return done(null, user);
            } else {
                user = await User.create(newUser);
                return done(null, user);
            }
        } catch (err) {
            console.error(err);
            return done(err, null);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};
