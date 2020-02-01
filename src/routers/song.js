const express = require('express')
const multer  = require('multer')
const Song = require('../models/song')
const auth = require('../middleware/auth')


const router = new express.Router()


// Render Upload form
router.get('/upload', auth, (req, res) => {
    res.render('upload', {
        loggedIn: req.session.isLoggedIn
    })
})

// Upload A Song
const upload = multer({
    limits: {
        fileSize: 5000000
    },
    fileFilter(req, file, cb){

        if(!file.originalname.endsWith('.mp3')){
            return cb(new Error('File must be of the "MP3"'))
        }

        cb(null, true)
    }
})

router.post('/upload/song', auth, upload.single('upload'), async (req, res) => {
    const file = req.file;
    try{
        // console.log(file.originalname, file.buffer)
        const song = new Song({
            name: req.body.name || file.originalname.replace('.mp3', ''),
            source: file.buffer,
            artist: req.user
        })

        await song.save();
        res.render('upload', {
            loggedIn: req.session.isLoggedIn
        })

    } catch(err){
        res.status(400).send();
    }
})


// Prepare song URL
router.get('/music/:id', async (req, res) => {

    try{
        const song = await Song.findById(req.params.id);

        if(!song){
            throw new Error('Sorry we didn\'t find the song')
        }

        res.set('Content-Type', 'audio/mpeg')

        res.send(song.source)

    } catch(err){
        res.status(404).send({error: err.message})
    }
})


// Get Song Info URL
router.get('/music/getInfo/:id', async (req, res) => {

    try{
        const song = await Song.findById(req.params.id);

        if(!song){
            throw new Error('Sorry we didn\'t find the song')
        }

        await song.populate('artist').execPopulate()
        
        const artistName = song.artist.name

        res.send({
            name: song.name,
            artist: artistName,
            loggedIn: req.session.isLoggedIn
        })

    } catch(err){
        res.status(404).send({error: err.message})
    }
})


// listen to a song
router.get('/music/listen/:id', async (req, res) => {
    try{

        const song = await Song.findById(req.params.id)

        if(!song){
            throw new Error('Sorry we didn\'t find the song')
        }

        const {songs, count} = await Song.findSimilarSongs(song, parseInt(req.query.skip))

        await song.populate('artist').execPopulate()
        
        const artistName = song.artist.name
        
        res.render('song', {
            id: req.params.id,
            name: song.name,
            artist: artistName,
            loggedIn: req.session.isLoggedIn,
            heading: 'FOR THE SAME UPLOADER',
            songs,
            count
        })

    } catch(err) {
        res.status(404).render('404', {
            error: err.message
        })
    }
})

// Main Home
// listen to a song
router.get('/', async (req, res) => {
    try{
        const {songs, count} = await Song.findSongs(parseInt(req.query.skip))
        
        res.render('index', {
            songs,
            loggedIn: req.session.isLoggedIn,
            count,
            heading: 'YOU MAY LIKE'
        })

    } catch(err) {
        res.status(404).render('404', {
            error: err.message
        })
    }
})




module.exports = router;