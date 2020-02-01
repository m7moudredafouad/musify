const express = require('express')
const User = require('../models/user')
const session = require('express-session')
const auth = require('../middleware/auth')
const notAuth = require('../middleware/notAuth')

const router = new express.Router();


// Sign up Form
router.get('/signup', notAuth, (req, res) => {
    res.render('signup', {
        loggedIn: req.session.isLoggedIn
    })
})

// Sign up
router.post('/users', notAuth, async (req, res) => {
    
    const user = new User(req.body)

    try{
        const token = await user.genJWT()

        await user.save();

        req.session.token = `Bearer ${token}`;
        req.session.isLoggedIn = true;

        res.redirect('/')

    } catch (err) {
        res.status(400).send({err})
    }

})


// Login Form
router.get('/login', notAuth, (req, res) => {
    res.render('login', {
        loggedIn: req.session.isLoggedIn
    })
})

// Login
router.post('/users/login', notAuth, async (req, res) => {
    try{
        const user = await User.findByInfo(req.body.email, req.body.password)
        const token = await user.genJWT();

        req.session.token = `Bearer ${token}`;
        req.session.isLoggedIn = true;


        res.redirect('/')

    } catch(err){
        res.status(400).send({err});
    }
})

// Logout
router.post('/users/me/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })

        req.session.token = ``;
        req.session.isLoggedIn = false;

        await req.user.save();
        res.redirect('/')
    } catch(err){
        res.status(500).send()
    }
})



// // Get my profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})


// // Delete A User
router.delete('/users/me', auth, async (req, res) => {
    try{
        await req.user.remove();
        sendGoodbyeEmail(req.user.email, req.user.name)
        res.send(req.user);
    }catch(err){
        res.status(500).send();
    }
})

module.exports = router;