const mongoose = require('mongoose');
const db = require('../managers/database')('list');
const { v1: uuid } = require('uuid');

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

    news: {
        last_consulted_ts: {
            type: Number,
        },
    },
});

const UserSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            default: uuid(),
        },
        username: {
            type: String,
            required: true,
            index: { unique: true, sparse: true },
        },
        salt: {
            type: String,
        },
        password: {
            type: String,
        },
        is_read_only: {
            type: Boolean,
            default: false,
        },
        preferences: PreferencesSchema,
    },
    {
        versionKey: false,
    }
);

UserSchema.set('toJSON', {
    transform: (doc, user) => {
        user._id = undefined;
    },
});

module.exports = db.model('User', UserSchema);
