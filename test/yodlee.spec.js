'use strict';

var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    sinon = require('sinon');

require('sinon-as-promised');
chai.use(chaiAsPromised);
chai.should();

describe('yodlee node module', function() {

    var request = require('request');
    var yodlee = require('../');

    var postStub,
        appTokenStub;

    before(function() {

        yodlee.use({
            username: 'sbCobExampleUser',
            password: '96d621ec-2323-4664-b2fa-17ba6796b116'
        });

        postStub = sinon.stub(request, 'post');

    });

    after(function() {
        request.post.restore();
    });


    describe('use()', function() {

        it('Should throw an error given an empty cobrand username', function() {
            (function() {
                yodlee.use({
                    username: '',
                    password: '96d621ec-793a-4664-b2fa-17ba6796b116'
                });
            }).should.throw(Error);
        });

        it('Should throw an error given an empty cobrand username', function() {
            (function() {
                yodlee.use({
                    username: '',
                    password: '96d621ec-793a-4664-b2fa-17ba6796b116'
                });
            }).should.throw(Error);
        });

        it('Should throw an error given an empty cobrand username', function() {
            (function() {
                yodlee.use({
                    username: 'sbCobcraigrich',
                    password: ''
                });
            }).should.throw(Error);
        });

        it('Should set sandbox to true and baseUrl to sandboxUrl', function() {

            yodlee.use({
                username: 'sandboxuser',
                password: 'password@123',
                sandbox: true
            });

            yodlee.username.should.equal('sandboxuser');
            yodlee.password.should.equal('password@123');
            yodlee.sandbox.should.equal(true);
            yodlee.baseUrl.should.equal('https://yisandbox.yodleeinteractive.com/services/srest/private-sandboxuser/v1.0/');

        });

        it('Should set sandbox to false and baseUrl to liveUrl - empty sandbox state', function() {
            
            yodlee.use({
                username: 'sbCobExampleUser',
                password: '96d621ec-2323-4664-b2fa-17ba6796b116'
            });

            yodlee.username.should.equal('sbCobExampleUser');
            yodlee.password.should.equal('96d621ec-2323-4664-b2fa-17ba6796b116');
            yodlee.sandbox.should.equal(false);
            yodlee.baseUrl.should.equal('https://rest.developer.yodlee.com/services/srest/restserver/v1.0/');

        });

        it('Should set sandbox to false and baseUrl to liveUrl', function() {

            yodlee.use({
                username: 'sbCobExampleUser',
                password: '96d621ec-2323-4664-b2fa-17ba6796b116',
                sandbox: false
            });

            yodlee.username.should.equal('sbCobExampleUser');
            yodlee.password.should.equal('96d621ec-2323-4664-b2fa-17ba6796b116');
            yodlee.sandbox.should.equal(false);
            yodlee.baseUrl.should.equal('https://rest.developer.yodlee.com/services/srest/restserver/v1.0/');

        });

    });


    describe('getAppToken()', function() {

        it('should return the AppToken when called', function() {

            postStub.yields(null, null, JSON.stringify({
                cobrandConversationCredentials: {
                    sessionToken: "token"
                }
            }));

            return yodlee.getAppToken().should.eventually.be.a('string');

        });

        it('should return an error on an invalid response from Request', function() {
            postStub.yields('error', null, null);
            return yodlee.getAppToken().should.be.rejected;
        });


        it('should return an error on an invalid response from Yodlee API', function() {

            postStub.yields(null, null, JSON.stringify({
                Error: [{
                    errorMessage: "Error"
                }]
            }));

            return yodlee.getAppToken().should.be.rejected;

        });

    });

    describe('getAccessToken()', function() {

        before(function() {
            appTokenStub = sinon.stub(yodlee, 'getAppToken');
        });

        beforeEach(function() {
            appTokenStub.resolves('appToken');
        });

        after(function() {
            appTokenStub = yodlee.getAppToken.restore();
        });

        // .userContext.conversationCredentials.sessionToken);
        it('should return the AppToken when given a username and password', function() {

            postStub.yields(null, null, JSON.stringify({
                userContext: {
                    conversationCredentials: {
                        sessionToken: "token"
                    }
                }
            }));

            return yodlee.getAccessToken({
                username: 'sbMemcraigrich2',
                password: 'sbMemcraigrich2#123'
            }).should.eventually.be.a('string');

        });

        it('should return an error on an invalid response from the API', function() {

            postStub.yields(null, null, JSON.stringify({
                Error: [{
                    errorMessage: "Error"
                }]
            }));

            return yodlee.getAccessToken({
                username: 'sbMemcraigrich2',
                password: 'sbMemcraigrich2#123'
            }).should.eventually.be.rejected;

        });

        it('should return an error given an incorrect AppToken', function() {
            appTokenStub.rejects('Invalid App Token');
            return yodlee.getAccessToken({
                username: 'user',
                password: null
            }).should.eventually.be.rejected;
        });

        it('should return an error when given no username', function() {
            return yodlee.getAccessToken({
                username: null,
                password: 'pass'
            }).should.eventually.be.rejected;
        });

        it('should return an error when given no password', function() {
            return yodlee.getAccessToken({
                username: 'user',
                password: null
            }).should.eventually.be.rejected;
        });

        it('should return an error on an invalid response from Request', function() {
            postStub.yields('error', null, null);
            return yodlee.getAccessToken({
                username: 'sbMemcraigrich2',
                password: 'sbMemcraigrich2#123'
            }).should.eventually.be.rejected;
        });

    });


    describe('getAccounts()', function() {

        var accessToken = '12345';

        before(function() {
            appTokenStub = sinon.stub(yodlee, 'getAppToken');
        });

        beforeEach(function() {
            appTokenStub.resolves('appToken');
        });

        after(function() {
            appTokenStub = yodlee.getAppToken.restore();
        });

        it('should return user bank accounts when given a valid access token', function() {
            postStub.yields(null, null, JSON.stringify({
                data: 'Account Data'
            }));
            return yodlee.getAccounts(accessToken).should.eventually.be.a('string');
        });

        it('should return an error on an invalid response from the API', function() {
            postStub.yields(null, null, JSON.stringify({
                Error: [{
                    errorMessage: "Error"
                }]
            }));
            return yodlee.getAccounts(accessToken).should.eventually.be.rejected;
        });

        it('should return an error when called with no access token', function() {
            return yodlee.getAccounts().should.eventually.be.rejected;
        });

        it('should return an error given an incorrect AppToken', function() {
            appTokenStub.rejects('Invalid App Token');
            return yodlee.getAccounts(accessToken).should.eventually.be.rejected;
        });

    });

    describe('getTransactions()', function() {

        var accessToken = '12345';

        before(function() {
            appTokenStub = sinon.stub(yodlee, 'getAppToken');
        });

        beforeEach(function() {
            appTokenStub.resolves('appToken');
        });

        after(function() {
            appTokenStub = yodlee.getAppToken.restore();
        });

        it('should return user recent transactions when given a valid access token', function() {
            postStub.yields(null, null, JSON.stringify({
                data: 'Account Data'
            }));
            return yodlee.getTransactions(accessToken).should.eventually.be.a('string');
        });

        it('should return an error on an invalid response from the API', function() {
            postStub.yields(null, null, JSON.stringify({
                errorOccurred: true,
                message: 'error'

            }));
            return yodlee.getTransactions(accessToken).should.eventually.be.rejected;
        });

        it('should return an error when called with no access token', function() {
            return yodlee.getTransactions().should.eventually.be.rejected;
        });

        it('should return an error given an incorrect AppToken', function() {
            appTokenStub.rejects('Invalid App Token');
            return yodlee.getTransactions(accessToken).should.eventually.be.rejected;
        });

    });



});