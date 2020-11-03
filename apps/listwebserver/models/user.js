const mongoose = require('mongoose');
const db = require('../managers/database')('list');
const uuidv1 = require('uuid/v1');

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
    gdprData: {
        gdprAccepted : {
            type: Boolean,
        },
        collectMetrics : {
            type: Boolean,
        }
    },
    news: {
        last_consulted_ts: {
            type: Number,
        },
    }
});

const UserSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            default: uuidv1(),
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
