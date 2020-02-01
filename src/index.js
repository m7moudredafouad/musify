const express = require('express')
const path = require('path')
const hbs = require('hbs')
const bodyParser = require('body-parser')   // without it req.body was empty
const session = require('express-session')
require('./db/mongoose')

const songRouter = require('./routers/song')
const userRouter = require('./routers/user')

// Paths
const publicPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

const app = express();
const port = process.env.PORT

// Setup hbs engine
app.set('view engine', 'hbs');
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

app.use(express.static(publicPath))
app.use(session({secret: process.env.JWT_SECRET, resave: false, saveUninitialized:false}))

app.use(bodyParser.urlencoded({
    extended: true
  }));

app.use(express.json())
app.use(userRouter)
app.use(songRouter)


app.get('*', (req, res) => {
    res.render('404')
})


app.listen(port, () => {
    console.log(`Server is up on ${port}`)
})



// const Song = require('./models/song')

// const main = async () => {
//     const song = await Song.findById('5e3494ad468bfe129cf951c4');
//     await song.populate('artist').execPopulate()
//     console.log(song.artist.name)
// }
// main();