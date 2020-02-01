const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Song = require('./song')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim:true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        required: true,
        type: String,
        minlength: 6,
        trim: true,
        validate(value) {
            if(value.toLowerCase().includes('password'))
            throw new Error("Password can't be password")
        },
        select:false
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
}, {
    timestamps: true
})

userSchema.virtual('songs', {
    ref: 'Song',
    localField: '_id',
    foreignField: 'artist'
})


userSchema.statics.findByInfo = async (email, password) => {
    const user = await User.findOne({email}).select('+password');

    if(!user) {
        throw new Error(`There is no account with this email: ${email}`)
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        throw new Error(`Unable to login`)
    }

    return user;
}


// Generating JSON Web Tokens
userSchema.methods.genJWT = async function() {

    const token = jwt.sign({_id: this._id.toString()}, process.env.JWT_SECRET, { expiresIn: '1d' })

    this.tokens = this.tokens.concat({token});
    
    await this.save()

    return token;
}

userSchema.pre('save', async function(next) {
    
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }

    next();
})


const User = mongoose.model('User', userSchema)
module.exports = User