import mongoose from "mongoose";
const {Schema,model} = mongoose;
const userSchema = new Schema({
    username:{
        type: String,
        required: function(this: any) {
            return this.hasSetUsername;  
        },
        unique: true,
        sparse: true,  
        minLength: [3, 'Username must be at least 3 characters long'],
        maxLength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
        immutable: function(this: any) {
            return this.hasSetUsername;  
        }
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function (this: { provider: string }) {
            return this.provider === 'credentials';
        }
    },
    provider: {
        type: String,
        required: true,
        default: 'credentials'
    },
    profilepic:{
        type: String,
        default: '/default-avatar.png'
    },
    bio: {
        type: String,
        maxLength: 500
    },
    interests: [{
        type: String
    }],
    hasSetUsername: {
        type: Boolean,
        default: false
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String
    },
    twoFactorQRCode: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    fcmToken: {
        type: String
    },
    notificationPreferences: {
        newFollower: {
            type: Boolean,
            default: true
        },
        followingPost: {
            type: Boolean,
            default: true
        }
    },
    createdAt:{
        type: Date, 
        default: Date.now,
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
   
})

const userModel = mongoose.models.User || model("User", userSchema); 
export default userModel;