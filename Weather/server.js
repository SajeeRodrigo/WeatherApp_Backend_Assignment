const myJson = require('./cities.json');

const express = require('express');
const { auth , requiresAuth } = require('express-openid-connect');
const bodyParser = require("body-parser");
const request = require("request");
const { response } = require('express');
const NodeCache = require('node-cache');
require("dotenv").config();

const localCache = new NodeCache({ stdTTL: 300 });

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASEURL,
  clientID: process.env.CLIENTID,
  issuerBaseURL: process.env.ISSUER,
};

const app = express();

const apiKey = `${process.env.API_KEY}`;

app.use(auth(config));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


var data = myJson.List;
//var data = JSON.parse(JSON.stringify(myJson.List))

var citycodeArray = Object.keys(data).map((key) => data[key].CityCode);
id = citycodeArray.join();

// // data
// var result = [];
// // // var data = [];
// for (var i in data){
//     console.log(data[i].CityCode);
//    }

var weatherData, Data;
app.get('/', requiresAuth(), (req, res) => {
    // res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
    // console.log(req.oidc.isAuthenticated());

    if(req.oidc.isAuthenticated()){
        var url = `http://api.openweathermap.org/data/2.5/group?id=${id}&units=metric&appid=${process.env.API_KEY}`
        if (localCache.has('weatherdata')) {
            var Data = getData(weatherData);
            console.log('cache')
            return res.render('dashboard', { Data });
        } else {
            request(url, function (err, response, body) { 
            if (err) {
                res.render('dashboard', { weather: null, error: 'ERROR! Please Try Again' });
            } else {
                weatherData = JSON.parse(body);
                // console.log(weatherData);
                console.log(getData(weatherData));
            }
            Data = getData(weatherData);
            localCache.set('weatherdata', Data);
            console.log('api')
                
            return res.send('dashboard', {Data}, {isAuthenticated: req.oidc.isAuthenticated(), user: req.oidc.user});
            })
        }
    } else {
        res.send('logout')
    }
})

app.use('/logout', (req, res) => {
    res.send('logout');
})

function getData(weatherInfo) {
    var list = JSON.parse(JSON.stringify(weatherInfo.list));
    var responseData = Object.keys(list).map((key)=> [ list[key].id, list[key].name, list[key].main.temp, list[key].weather[0].description ])
    return responseData;
    console.log(responseData);
}

app.listen(process.env.PORT, () => console.info('Server is up and running'));






 