'use strict';

var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    nock = require('nock'),
    Yodlee = require('../');

var yodleeAPI = Yodlee({
    username: 'sbCobcraigrich',
    password: '96d621ec-793a-4664-b2fa-17ba6796b116'
});

nock('http://www.google.com')
    .get('/')
    .reply(200, 'Hello from Google whats up!');

yodleeAPI.google()
    .then(function(res) {
        console.log('it worked');
        console.log(res);
    }).catch(function(e) {
        console.log('fail');
        console.log(e);
    });

// yodleeAPI.getAccessToken({
//     username: 'sbMemcraigrich2',
//     password: 'sbMemcraigrich2#123'
// })
//     .then(function(accessToken) {
//         console.log('found access token');
//         console.log(accessToken);
//         return yodleeAPI.getTransactions(accessToken);
//     })
//     .then(function(res) {
//         console.log('found accounts');
//         console.log(res);        
//     })
//     .catch(function(e) {
//         console.log('something fucked up');
//         console.log(e);
//     });



// var yodleeAPI = Yodlee({
//     username: 'sbCobcraigrich',
//     password: '96d621ec-793a-4664-b2fa-17ba6796b116'
// });

// yodleeAPI.getAccessToken({
//     username: 'sbMemcraigrich2',
//     password: 'sbMemcraigrich2#123'
// }).then(function(res){
//     console.log('it worked');
//     console.log(res);
// }).catch(function(e){
//     console.log('fail');
//     console.log(e);
// });


// yodleeAPI.getAccessToken({
//     username: 'sbMemcraigrich2',
//     password: 'sbMemcraigrich2#123'
// })
//     .then(function(accessToken) {
//         console.log('found access token');
//         console.log(accessToken);
//         return yodleeAPI.getTransactions(accessToken);
//     })
//     .then(function(res) {
//         console.log('found accounts');
//         console.log(res);        
//     })
//     .catch(function(e) {
//         console.log('something fucked up');
//         console.log(e);
//     });