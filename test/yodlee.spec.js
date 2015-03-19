'use strict';

var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    sinon = require('sinon'),
    sinonAsPromised = require('sinon-as-promised'),
    should = chai.should(),
    Yodlee = require('../'),
    request = require('request');


describe('yodlee node module', function() {

    chai.use(chaiAsPromised);

    var yodleeAPI = Yodlee({
        username: 'sbCobcraigrich',
        password: '96d621ec-793a-4664-b2fa-17ba6796b116'
    }); 

    it('Should create a new instance of Yodlee when given a username and password', function() {
        yodleeAPI.should.be.instanceOf(Yodlee);
    });

    it('Should set username and password to this when given a username and password', function() {
        yodleeAPI.username.should.equal('sbCobcraigrich');
        yodleeAPI.password.should.equal('96d621ec-793a-4664-b2fa-17ba6796b116');
    });


    describe('Mock Tests', function() {

        beforeEach(function() {
            sinon.stub(request, 'get').yields(null, 'resp', 'body');
        });

        it('should return a correct response', function() {
            return yodleeAPI.google().should.eventually.be.a('string');
        });

    });

    describe('getAppToken()', function() {

        afterEach(function() {
            request.post.restore();
        });

        it('should return the AppToken when called', function() {

            sinon.stub(request, 'post').yields(null, null, JSON.stringify({
                cobrandConversationCredentials: {
                    sessionToken: "token"
                }
            }));

            return yodleeAPI.getAppToken().should.eventually.be.a('string');

        });

        it('should return an error on an invalid response from the API', function() {

            sinon.stub(request, 'post').yields('error', null, JSON.stringify({
                error: [{
                    errorMessage: "Error"
                }]
            }));

            return yodleeAPI.getAppToken().should.be.rejected;

        });

    });
});