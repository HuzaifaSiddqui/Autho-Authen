const express = require('express');
const app = express();
const User = require('./models/user');
const port = 4000;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

mongoose.connect('mongodb://localhost:27017/Autho-Authen', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });

app.set('view engine', 'ejs');
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }))
app.use(session({secret: 'notagood'}));

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { password, username } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.send('Invalid Password or Username');
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
        req.session.user_id = user._id;
        res.redirect('/');
    } else {
        res.send('Invalid Password or Username');
    }
});

app.post('/register', async (req, res) => {
    const { password, username } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const user = new User({
        username: username, 
        password: hash
    }) 
    console.log(user);
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/login');
})

app.post('/logout', async (req, res) => {
    req.session.user_id = null;
    // req.session.destroy(); in case if you have more data about the user to get rid off when you logout
    res.redirect('/login');
})
 
app.get('/', (req, res) => { 
    res.send('Welcome to the home page');
})

app.get('/checkSessionId', (req, res) => { 
    if(!req.session.user_id) {
       return res.redirect('/login');
    }
    res.render('sessionCheck');
})

app.listen(port, () => { 
    console.log('Server is running on port 4000');
});
