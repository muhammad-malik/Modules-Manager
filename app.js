// dependencies
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoConnect = require('./util/database').mongoConnect;

const databaseURL = 'mongodb+srv://musama:Usama123@aicspec-9ubkp.mongodb.net/app?retryWrites=true';
const serverPort = 3000;


// routes for the application
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const userRoutes = require('./routes/user');

// setting up the application. Using EJS as the web 
// rendering engine.
const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(userRoutes);
app.use(staffRoutes);
app.use(adminRoutes);


// 404 route, No page found error route.
app.get((req, res, next) => {
    const isUserAdmin = req.get('Cookie').split('=')[1] === "admin";
    res.status(404).render('404', {
        pageTitle: 'Page Not Found',
        path: '',
        isAdmin: isUserAdmin
    });
});

// 500 route, when technical error occurs.
app.use((error, req, res, next) => {
    const isUserAdmin = req.get('Cookie').split('=')[1] === "admin";
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAdmin: isUserAdmin
    });
});


// Connecting to database and starting.
mongoConnect(databaseURL, () => {
    app.listen(serverPort);
});