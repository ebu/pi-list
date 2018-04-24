const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    username: {
        type: String,
        unique: false,
        required: false,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    facebookID: {
        type: String,
        default: null
    },
    photoURL: {
        type: String,
        default: null
    }
});

/**
 * This will hash the user password before saving it to the database
 */
UserSchema.pre('save', function (next) {
    const user = this;

    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
});

UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, user) => {
        delete user.password;
        delete user._id;
    }
});

module.exports = mongoose.model('User', UserSchema);
