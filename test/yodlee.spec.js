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

        after(function() {
            yodlee.use({
                username: 'sbCobExampleUser',
                password: '96d621ec-2323-4664-b2fa-17ba6796b116'
            });
        });

        it('Should set username and password to this when given a username and password', function() {
            yodlee.username.should.equal('sbCobExampleUser');
            yodlee.password.should.equal('96d621ec-2323-4664-b2fa-17ba6796b116');
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