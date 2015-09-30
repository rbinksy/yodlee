'use strict';

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var sinon = require('sinon');

require('sinon-as-promised');
chai.use(chaiAsPromised);
chai.should();

describe('yodlee node module', function() {

    var request = require('request');
    var yodlee = require('../');

    var postStub;
    var cobSessionTokenStub;
    var userSessionTokenStub;
    var bothSessionTokensStub;
    var cobLoginStub;
    var loginStub;

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

        before(function() {
            cobLoginStub = sinon.stub(yodlee, 'cobLogin');
        });

        beforeEach(function() {
            cobLoginStub.resolves({ });
        });

        after(function() {
            cobLoginStub = yodlee.cobLogin.restore();
        });

        it('Should throw an error given an empty cobrand username', function() {

            return yodlee.use({
                username: '',
                password: '96d621ec-793a-4664-b2fa-17ba6796b116'
            }).should.be.rejectedWith("Invalid Cobrand Credentials: Empty username");

        });

        it('Should throw an error given an empty cobrand username', function() {

            return yodlee.use({
                username: 'sbCobcraigrich',
                password: ''
            }).should.be.rejectedWith("Invalid Cobrand Credentials: Empty password");

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

        it('should return an error when token override is incomplete', function() {

            return yodlee.use({
                username: 'sbCobcraigrich',
                password: '96d621ec-2323-4664-b2fa-17ba6796b116',
                sandbox: true,
                cobSessionToken: '1234-5678'
            }).should.be.rejectedWith("When providing session tokens both tokens and accompanying expiration timestamps are required.");

        });

        it('Should set session keys directly when override is complete', function() {

            return yodlee.use({
                username: 'sbCobcraigrich',
                password: '96d621ec-2323-4664-b2fa-17ba6796b116',
                sandbox: true,
                cobSessionToken: '1234-5678',
                userSessionToken: '1234-5678',
                cobSessionExpires: 10000000,
                userSessionExpires: 10000000
            }).should.eventually.be.a("object");

        });

        it('Should call cobLogin when session keys are not provided', function() {

            return yodlee.use({
                username: 'sbCobcraigrich',
                password: '96d621ec-2323-4664-b2fa-17ba6796b116',
                sandbox: true
            }).should.eventually.be.a("object");

        });

        it('should return an error when cobLogin fails', function() {

            cobLoginStub.rejects('Error');

            return yodlee.use({
                username: 'sbCobcraigrich',
                password: '96d621ec-2323-4664-b2fa-17ba6796b116',
                sandbox: true
            }).should.eventually.be.rejected;

        });

    });

    describe('cobLogin()', function() {

        beforeEach(function(){
            postStub.yields(null, null, JSON.stringify({
                cobrandConversationCredentials: {
                    sessionToken: "1234-5678"
                }
            }));
        });
        
        it('should return an error with missing username', function() {

            yodlee.username = null;

            return yodlee
                    .cobLogin()
                    .should
                    .be.rejectedWith("Invalid Cobrand Login: Empty username");

        });
        
        it('should return an error with missing password', function() {

            yodlee.username = "sandboxuser";
            yodlee.password = null;

            return yodlee
                    .cobLogin()
                    .should
                    .be.rejectedWith("Invalid Cobrand Login: Empty password");

        });
        
        it('Should set cobSessionToken and cobSessionExpires', function() {

            yodlee.username = "sandboxuser";
            yodlee.password = "password@123";

            var state = yodlee
                    .cobLogin()
                    .should
                    .eventually.be.a("object");

            yodlee.sessionTokens.cobSessionToken.token.should.equal("1234-5678");
            yodlee.sessionTokens.cobSessionToken.expires.should.be.a("number");

            return state;

        });

        it('should return an error on an invalid response from Request', function() {
            postStub.yields('error', null, null);
            return yodlee.cobLogin().should.be.rejected;
        });


        it('should return an error on an invalid response from Yodlee API', function() {

            postStub.yields(null, null, JSON.stringify({
                Error: [{
                    errorMessage: "Error"
                }]
            }));

            return yodlee.cobLogin().should.be.rejected;

        });

    });

    describe('login()', function() {

        before(function() {
            cobSessionTokenStub = sinon.stub(yodlee, 'getCobSessionToken');
        });

        beforeEach(function(){

            postStub.yields(null, null, JSON.stringify({
                userContext: {
                    conversationCredentials: {
                        sessionToken: "1234-5678"
                    }
                }
            }));

            cobSessionTokenStub.resolves("1234-5678");

        });

        after(function() {
            cobSessionTokenStub = yodlee.getCobSessionToken.restore();
        });

        it('should return an error with missing username', function() {
            return yodlee.login({
                username: '',
                password: 'password@123'
            }).should.be.rejectedWith("Invalid User Credentials: Empty username");
        });

        it('should return an error with missing password', function() {
            return yodlee.login({
                username: 'yodleeuser',
                password: ''
            }).should.be.rejectedWith("Invalid User Credentials: Empty password");
        });

        it('Should set userSessionToken and userSessionExpires', function() {

            var state = yodlee
                        .login({
                            username: 'yodleeuser',
                            password: 'password@123'
                        })
                        .should
                        .eventually.be.a("object");

            yodlee.sessionTokens.userSessionToken.token.should.equal("1234-5678");
            yodlee.sessionTokens.userSessionToken.expires.should.be.a("number");

            return state;

        });

        it('should return an error when getCobSessionToken fails', function() {
            
            cobSessionTokenStub.rejects('Error');

            return yodlee.login({
                username: 'yodleeuser',
                password: 'password@123'
            }).should.be.rejected;

        });

        it('should return an error on an invalid response from Request', function() {
            postStub.yields('error', null, null);
            return yodlee.login({
                username: 'yodleeuser',
                password: 'password@123'
            }).should.be.rejected;
        });

        it('should return an error on an invalid response from Yodlee API', function() {

            postStub.yields(null, null, JSON.stringify({
                Error: [{
                    errorMessage: "Error"
                }]
            }));

            return yodlee.login({
                username: 'yodleeuser',
                password: 'password@123'
            }).should.be.rejected;

        });
        
    });

    describe('getCobSessionToken()', function() {
        
        before(function() {
            cobLoginStub = sinon.stub(yodlee, 'cobLogin');
        });

        after(function() {
            yodlee.cobLogin.restore();
        });

        it('should return session token from memory when set and not expired', function(){

            yodlee.sessionTokens.cobSessionToken.token = "1234-0000";
            yodlee.sessionTokens.cobSessionToken.expires = (new Date()).setMinutes((new Date()).getMinutes() + 25);

            var state = yodlee.getCobSessionToken().should.eventually.be.a("string");

            yodlee.sessionTokens.cobSessionToken.token.should.equal('1234-0000');

            return state;

        });
        
        it('should return session token from cobLogin when not set', function(){

            cobLoginStub.resolves({
                cobrandConversationCredentials: {
                    sessionToken: "1234-9999"
                }
            });

            yodlee.sessionTokens.cobSessionToken.token = null;
            yodlee.sessionTokens.cobSessionToken.expires = null;

            return yodlee.getCobSessionToken().should.eventually.be.a("string");

        });
        
        it('should return session token from cobLogin when expired', function(){

            yodlee.sessionTokens.cobSessionToken.token = "1234-8888";
            yodlee.sessionTokens.cobSessionToken.expires = (new Date()).setMinutes((new Date()).getMinutes() - 25);

            return yodlee.getCobSessionToken().should.eventually.be.a("string");

        });
        
        it('should return an error when cobLogin fails and session token not set', function(){

            cobLoginStub.rejects('Error');

            yodlee.sessionTokens.cobSessionToken.token = null;
            yodlee.sessionTokens.cobSessionToken.expires = null;

            return yodlee.getCobSessionToken().should.eventually.be.rejected;

        });

    });

    describe('getUserSessionToken()', function() {
        
        before(function() {
            loginStub = sinon.stub(yodlee, 'login');
        });

        after(function() {
            yodlee.login.restore();
        });

        it('should return session token from memory when set and not expired', function(){

            yodlee.sessionTokens.userSessionToken.token = "1234-0000";
            yodlee.sessionTokens.userSessionToken.expires = (new Date()).setMinutes((new Date()).getMinutes() + 25);

            var state = yodlee.getUserSessionToken().should.eventually.be.a("string");

            yodlee.sessionTokens.userSessionToken.token.should.equal('1234-0000');

            return state;

        });
        
        it('should return session token from login when not set', function(){

            loginStub.resolves({
                userContext: {
                    conversationCredentials: {
                        sessionToken: "1234-9999"
                    }
                }
            });

            yodlee.sessionTokens.userSessionToken.token = null;
            yodlee.sessionTokens.userSessionToken.expires = null;

            return yodlee.getUserSessionToken({
                username: 'sandboxuser',
                password: 'password@123'
            }).should.eventually.be.a("string");

        });
        
        it('should return session token from login when expired', function(){

            yodlee.sessionTokens.userSessionToken.token = "1234-8888";
            yodlee.sessionTokens.userSessionToken.expires = (new Date()).setMinutes((new Date()).getMinutes() - 25);

            return yodlee.getUserSessionToken({
                username: 'sandboxuser',
                password: 'password@123'
            }).should.eventually.be.a("string"); 

        });
        
        it('should return an error when login fails and session token not set', function(){

            loginStub.rejects('Error');

            yodlee.sessionTokens.userSessionToken.token = null;
            yodlee.sessionTokens.userSessionToken.expires = null;

            return yodlee.getUserSessionToken({
                username: 'sandboxuser',
                password: 'password@123'
            }).should.eventually.be.rejected;

        });
        
        it('should return an error when username not provided and login required', function(){

            yodlee.sessionTokens.userSessionToken.token = null;
            yodlee.sessionTokens.userSessionToken.expires = null;

            return yodlee.getUserSessionToken({
                username: '',
                password: 'password@123'
            }).should.eventually.be.rejectedWith("User Session expired, user credentials required: Empty username");

        });
        
        it('should return an error when password not provided and login required', function(){

            yodlee.sessionTokens.userSessionToken.token = null;
            yodlee.sessionTokens.userSessionToken.expires = null;

            return yodlee.getUserSessionToken({
                username: 'sandboxuser',
                password: ''
            }).should.eventually.be.rejectedWith("User Session expired, user credentials required: Empty password");

        });
        
    });

    describe('getBothSessionTokens()', function() {

        before(function() {
            cobSessionTokenStub = sinon.stub(yodlee, 'getCobSessionToken');
            userSessionTokenStub = sinon.stub(yodlee, 'getUserSessionToken');
        });

        beforeEach(function() {
            cobSessionTokenStub.resolves('1234-5678');
            userSessionTokenStub.resolves('1234-5678');
        });

        after(function() {
            yodlee.getCobSessionToken.restore();
            yodlee.getUserSessionToken.restore();
        });
        
        it('should return both session tokens as objects', function(){
            return yodlee.getBothSessionTokens().should.eventually.be.a("object");
        });
        
        it('should return an error when getCobSessionToken fails', function(){
            cobSessionTokenStub.rejects('Error');
            return yodlee.getBothSessionTokens().should.eventually.be.rejected;
        });
        
        it('should return an error when getUserSessionToken fails', function(){
            userSessionTokenStub.rejects('Error');
            return yodlee.getBothSessionTokens().should.eventually.be.rejected;
        });

    });

    describe('getAllSiteAccounts()', function() {

        before(function() {
            bothSessionTokensStub = sinon.stub(yodlee, 'getBothSessionTokens');
        });

        beforeEach(function() {
            bothSessionTokensStub.resolves({
                cobSessionToken: '1234-5678',
                userSessionToken: '1234-5678'
            });
        });

        after(function() {
            yodlee.getBothSessionTokens.restore();
        });
        
        it('should return an error when fails to fetch session keys', function(){

            bothSessionTokensStub.rejects('Error');

            return yodlee.getAllSiteAccounts().should.be.rejectedWith("Error");

        });
        
        it('should return all site accounts when session keys are successfully retrieved', function(){

            postStub.yields(null, null, JSON.stringify({
                accounts: []
            }));

            return yodlee.getAllSiteAccounts().should.eventually.be.a("object");

        });
        
        it('should return an error on an invalid response from Request', function() {
            postStub.yields('error', null, null);
            return yodlee.getAllSiteAccounts().should.be.rejected;
        });

        it('should return an error on an invalid response from Yodlee API', function() {

            postStub.yields(null, null, JSON.stringify({
                Error: [{
                    errorMessage: "Error"
                }]
            }));

            return yodlee.getAllSiteAccounts().should.be.rejected;

        });

    });

    describe('executeUserSearch()', function() {

        before(function() {
            bothSessionTokensStub = sinon.stub(yodlee, 'getBothSessionTokens');
        });

        beforeEach(function() {
            bothSessionTokensStub.resolves({
                cobSessionToken: '1234-5678',
                userSessionToken: '1234-5678'
            });
        });

        after(function() {
            yodlee.getBothSessionTokens.restore();
        });
        
        it('should return an error when fails to fetch session keys', function(){

            bothSessionTokensStub.rejects('Error');

            return yodlee.executeUserSearch().should.be.rejectedWith("Error");

        });
        
        it('should return user search when session keys are successfully retrieved', function(){

            postStub.yields(null, null, JSON.stringify({
                transactions: []
            }));

            return yodlee.executeUserSearch().should.eventually.be.a("object");

        });
        
        it('should return an error on an invalid response from Request', function() {
            postStub.yields('error', null, null);
            return yodlee.executeUserSearch().should.be.rejected;
        });

        it('should return an error on an invalid response from Yodlee API', function() {

            postStub.yields(null, null, JSON.stringify({
                Error: [{
                    errorMessage: "Error"
                }]
            }));

            return yodlee.executeUserSearch().should.be.rejected;

        });

    });

    describe('getSiteLoginForm()', function() {
        
        before(function() {
            cobSessionTokenStub = sinon.stub(yodlee, 'getCobSessionToken');
        });

        beforeEach(function() {
            cobSessionTokenStub.resolves('1234-5678');
        });

        after(function() {
            yodlee.getCobSessionToken.restore();
        });

        it('should return an error when fails to fetch cob session key', function(){

            cobSessionTokenStub.rejects('Error');

            return yodlee.getSiteLoginForm({
                siteId: 123
            }).should.be.rejectedWith("Error");

        });
        
        it('should return login form when cob session key is successfully retrieved', function(){

            postStub.yields(null, null, JSON.stringify({
                loginForm: []
            }));

            return yodlee.getSiteLoginForm({
                siteId: 123
            }).should.eventually.be.a("object");

        });

        it('should return an error when site ID is not provided', function() {

            return yodlee.getSiteLoginForm().should.be.rejectedWith("Invalid Site ID: Empty!");

        });
        
        it('should return an error on an invalid response from Request', function() {
            postStub.yields('error', null, null);
            return yodlee.getSiteLoginForm({
                siteId: 123
            }).should.be.rejected;
        });
        
        it('should return an error on an invalid response from Yodlee API', function() {

            postStub.yields(null, null, JSON.stringify({
                Error: [{
                    errorMessage: "Error"
                }]
            }));

            return yodlee.getSiteLoginForm({
                siteId: 123
            }).should.be.rejected;

        });

    });

    describe('register()', function() {
        
        before(function() {
            cobSessionTokenStub = sinon.stub(yodlee, 'getCobSessionToken');
        });

        beforeEach(function() {
            cobSessionTokenStub.resolves('1234-5678');
        });

        after(function() {
            yodlee.getCobSessionToken.restore();
        });

        it('should return an error when fails to fetch cob session key', function(){

            cobSessionTokenStub.rejects('Error');

            return yodlee.register({
                username: 'user123',
                password: 'password@123',
                emailAddress: 'email@domain.com'
            }).should.be.rejectedWith("Error");

        });
        
        it('should return an error when username is empty', function(){

            return yodlee.register({
                username: '',
                password: 'password@123',
                emailAddress: 'email@domain.com'
            }).should.be.rejectedWith("Cannot register user: Empty username");

        });
        
        it('should return an error when password is empty', function(){

            return yodlee.register({
                username: 'user123',
                password: '',
                emailAddress: 'email@domain.com'
            }).should.be.rejectedWith("Cannot register user: Empty password");

        });
        
        it('should return an error when emailAddress is empty', function(){

            return yodlee.register({
                username: 'user123',
                password: 'password@123',
                emailAddress: ''
            }).should.be.rejectedWith("Cannot register user: Empty emailAddress");

        });
        
        it('should return registration object when cob session key is successfully retrieved', function(){

            postStub.yields(null, null, JSON.stringify({ }));

            return yodlee.register({
                username: 'user123',
                password: 'password@123',
                emailAddress: 'email@domain.com'
            }).should.eventually.be.a("object");

        });
        
        it('should return an error on an invalid response from Request', function() {
            postStub.yields('error', null, null);
            return yodlee.register({
                username: 'user123',
                password: 'password@123',
                emailAddress: 'email@domain.com'
            }).should.be.rejected;
        });
        
        it('should return an error on an invalid response from Yodlee API', function() {

            postStub.yields(null, null, JSON.stringify({
                Error: [{
                    errorMessage: "Error"
                }]
            }));

            return yodlee.register({
                username: 'user123',
                password: 'password@123',
                emailAddress: 'email@domain.com'
            }).should.be.rejected;

        });

    });

    describe('searchSite()', function() {
        
        before(function() {
            bothSessionTokensStub = sinon.stub(yodlee, 'getBothSessionTokens');
        });

        beforeEach(function() {
            bothSessionTokensStub.resolves({
                cobSessionToken: '1234-5678',
                userSessionToken: '1234-5678'
            });
        });

        after(function() {
            yodlee.getBothSessionTokens.restore();
        });

        it('should return an error when fails to fetch session keys', function(){

            bothSessionTokensStub.rejects('Error');

            return yodlee.searchSite("halifax").should.be.rejectedWith("Error");

        });

        it('should return an error when search term is not provided', function(){

            bothSessionTokensStub.rejects('Error');

            return yodlee.searchSite().should.be.rejectedWith("Cannot search for sites with empty searchTerm");

        });
        
        it('should return sites when session keys are successfully retrieved', function(){

            postStub.yields(null, null, JSON.stringify({
                accounts: []
            }));

            return yodlee.searchSite("halifax").should.eventually.be.a("object");

        });
        
        it('should return an error on an invalid response from Request', function() {
            postStub.yields('error', null, null);
            return yodlee.searchSite("halifax").should.be.rejected;
        });

        it('should return an error on an invalid response from Yodlee API', function() {

            postStub.yields(null, null, JSON.stringify({
                Error: [{
                    errorMessage: "Error"
                }]
            }));

            return yodlee.searchSite("halifax").should.be.rejected;

        });

    });

    describe('unregister()', function() {
    
        before(function() {
            bothSessionTokensStub = sinon.stub(yodlee, 'getBothSessionTokens');
        });

        beforeEach(function() {
            bothSessionTokensStub.resolves({
                cobSessionToken: '1234-5678',
                userSessionToken: '1234-5678'
            });
        });

        after(function() {
            yodlee.getBothSessionTokens.restore();
        });
    
    });

    describe('validateUser()', function() {
    
    });

    describe('addSiteAccounts()', function() {
    
        before(function() {
            bothSessionTokensStub = sinon.stub(yodlee, 'getBothSessionTokens');
        });

        beforeEach(function() {
            bothSessionTokensStub.resolves({
                cobSessionToken: '1234-5678',
                userSessionToken: '1234-5678'
            });
        });

        after(function() {
            yodlee.getBothSessionTokens.restore();
        });

    });

    describe('getSiteInfo()', function() {
    
    });

    describe('getItemSummariesForSite()', function() {
    
        before(function() {
            bothSessionTokensStub = sinon.stub(yodlee, 'getBothSessionTokens');
        });

        beforeEach(function() {
            bothSessionTokensStub.resolves({
                cobSessionToken: '1234-5678',
                userSessionToken: '1234-5678'
            });
        });

        after(function() {
            yodlee.getBothSessionTokens.restore();
        });

    });

});