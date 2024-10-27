import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function() {
            // The password is required only if the user doesn't have a Google ID (non-Google login)
            return !this.googleId;
        }
    },
    googleId: {
        type: String,
    },
    facebookId: {
        type: String,
    }

});

export default mongoose.model('User', UserSchema);