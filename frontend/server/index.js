const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(bodyparser.json());

const customerroutes = require("./routes/customer");
const routesroute = require("./routes/route");
const bookingroute = require("./routes/booking");
const communityroute = require("./routes/community");
const notificationroute = require("./routes/notification");
const reviewroute = require("./routes/review");


// Other routes
app.use(bookingroute);
app.use(routesroute);


// Customer routes
app.use("/customer", customerroutes);


// Community routes
app.use(communityroute);


// Notification routes
app.use(notificationroute);


// Review routes
app.use(reviewroute);


const DBURL = "mongodb+srv://admin:admin@tedbus.vqk1yid.mongodb.net/?retryWrites=true&w=majority&appName=tedbus";

mongoose.connect(DBURL)
    .then(() => console.log("Mongodb connected"))
    .catch(err => console.error("Mongodb connection error:", err));


// Test API
app.get('/', (req, res) => {
    res.send('Hello, Ted bus is working');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});