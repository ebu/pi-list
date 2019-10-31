const mongoose = require('mongoose');
const db = require('../managers/database')('list');

const GuiPreferencesSchema = new mongoose.Schema({
    language: {
        type: String,
    },
    theme: {
        type: String,
    },
});

const PreferencesSchema = new mongoose.Schema({
    gui: GuiPreferencesSchema,

    analysis: {
        type: mongoose.Schema.Types.Mixed,
    },
});

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    preferences: PreferencesSchema,
});

UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, user) => {
        delete user.password;
        delete user._id;
    },
});

module.exports = db.model('User', UserSchema);
