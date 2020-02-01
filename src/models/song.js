const mongoose = require('mongoose')

const songSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
        minlength: 4,
        trim: true
    },
    artist: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    },
    source:{
        required: true,
        type: Buffer,
    }

}, {
    timestamps: true
})

songSchema.statics.findSimilarSongs = async (song, skip) => {
    const songss = await Song.find({artist: song.artist}, null, {limit: 10, skip, sort:{createdAt: -1}});

    const songs = songss.map((song) => {
        const newSongObject = song.toObject()
        delete newSongObject.source;
        return newSongObject
    })

    const count = await Song.countDocuments()

    return {songs, count}
}


songSchema.statics.findSongs = async (skip) => {
    const songss = await Song.find({},null, {limit: 10, skip, sort:{createdAt: -1}});

    const songs = songss.map((song) => {
        const newSongObject = song.toObject()
        delete newSongObject.source;
        return newSongObject
    })

    const count = await Song.countDocuments()

    return {songs, count}
}


const Song = mongoose.model('Song', songSchema)

module.exports = Song