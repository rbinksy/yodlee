// Copyright Craig Richardson. and other Contributors
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var Q = require('q');
var request = require('request');

/**
 * Yodlee API driver for NodeJS
 * Sets the Cobrand credentials for API calls
 *
 * @module Yodlee
 * @constructor
 */
function Yodlee() {
    if (!(this instanceof Yodlee)) {
        return new Yodlee();
    }
}

/**
* Base URL for sandbox
* @private
*/
Yodlee.prototype.sandboxUrl = "https://yisandbox.yodleeinteractive.com/services/srest/private-{{sandboxuser}}/v1.0/";

/**
* Base URL for live
* @private
*/
Yodlee.prototype.liveUrl = "https://rest.developer.yodlee.com/services/srest/restserver/v1.0/";

/**
* Session tokens for Yodlee
* @private
*/
Yodlee.prototype.sessionTokens = {
    cobSessionToken: {
        token: null,
        expires: null
    },
    userSessionToken: {
        token: null,
        expires: null
    }
};

/**
 * Use the specified Cobrand details to sign requests
 * @param {object} opt Cobrand username and password
 * @throws Error if options is empty
 */
Yodlee.prototype.init = function init(opt) {

    var deferred = Q.defer();

    if (!opt.username || !opt.password) {
        throw new Error('Invalid Cobrand Credentials: Empty ' + (!(opt.username) ? 'username' : 'password'));
    }

    this.sandbox = (opt.sandbox === true);
    this.username = opt.username;
    this.password = opt.password;

    if(opt.sandbox) {
        this.baseUrl = this.sandboxUrl.replace("{{sandboxuser}}", this.username);
    } else {
        this.baseUrl = this.liveUrl;
    }

    // User can overrride tokens up front if they have cached valid tokens
    if(opt.cobSessionToken && opt.userSessionToken && opt.cobSessionExpires && opt.userSessionExpires) {
        this.sessionTokens.cobSessionToken.token = opt.cobSessionToken;
        this.sessionTokens.cobSessionToken.expires = opt.cobSessionExpires;
        this.sessionTokens.userSessionToken.token = opt.userSessionToken;
        this.sessionTokens.userSessionToken.expires = opt.userSessionExpires;
        deferred.resolve();
    } else if(opt.cobSessionToken || opt.userSessionToken || opt.cobSessionExpires || opt.userSessionExpires) {
        throw new Error('When providing session tokens both tokens and accompanying expiration timestamps are required.');
    } else {
        // cobLogin only required when tokens are not provided
        this.cobLogin().then(function(cobLogin){
            deferred.resolve();
        }).catch(function(e){
            deferred.reject(e);
        });
    }

    return deferred.promise;

};

/**
 * Fetch the cobLogin object and save cobSessionToken in memory
 * @throws Error if username and password for cobLogin have not been set
 */
Yodlee.prototype.cobLogin = function() {

    var deferred = Q.defer();

    if (!this.username || !this.password) {
        throw new Error('Invalid Username and Password: Empty ' + (!(this.username) ? 'username' : 'password'));
    }

    request.post({
        url: this.baseUrl + 'authenticate/coblogin',
        form: {
            cobrandLogin: this.username,
            cobrandPassword: this.password
        }
    }, function(err, response, body) {
        if (err || JSON.parse(body).Error) {
            deferred.reject(err || JSON.parse(body).Error[0].errorDetail);
        } else {
            var expires = new Date();
            this.sessionTokens.cobSessionToken.token = JSON.parse(body).cobrandConversationCredentials.sessionToken;
            this.sessionTokens.cobSessionToken.expires = expires.setMinutes(expires.getMinutes() + 20);
            deferred.resolve(JSON.parse(body));
        }
    }.bind(this));

    return deferred.promise;

 };

/**
 * Retrieves login object for the given user
 * @param {object} opt User username and password
 */
Yodlee.prototype.login = function login(opt) {

    var deferred = Q.defer();

    if (!opt.username || !opt.password) {
        deferred.reject('Invalid User Credentials: Empty ' + (!(opt.username) ? 'username' : 'password'));
    }

    this.getCobSessionToken().then(function(cobSessionToken){

        request.post({
            url: this.baseUrl + 'authenticate/login',
            form: {
                login: opt.username,
                password: opt.password,
                cobSessionToken: cobSessionToken
            }
        }, function(err, response, body) {
            if (err || JSON.parse(body).Error) {
                deferred.reject(err || JSON.parse(body).Error[0].errorDetail);
            } else {
                var expires = new Date();
                this.sessionTokens.userSessionToken.token = JSON.parse(body).userContext.conversationCredentials.sessionToken;
                this.sessionTokens.userSessionToken.expires = expires.setMinutes(expires.getMinutes() + 20);
                deferred.resolve(JSON.parse(body));
            }
        }.bind(this));

    }.bind(this)).catch(function(e){
        deferred.reject(e);
    });

    return deferred.promise;

};

/**
 * Retrieves cobSessionToken from memory or cobLogin if expired / not set
 * @private
 */
Yodlee.prototype.getCobSessionToken = function getCobSessionToken() {

    var deferred = Q.defer();

    var date = new Date();

    if(this.sessionTokens.cobSessionToken.token != null && this.sessionTokens.cobSessionToken.expires > date.getTime()) {
        deferred.resolve(this.sessionTokens.cobSessionToken.token);
    } else {
        this.cobLogin().then(function(cobLogin) {
            deferred.resolve(cobLogin.cobrandConversationCredentials.sessionToken);
        }).catch(function(e) {
            deferred.reject(e);
        });
    }

    return deferred.promise;

};

/**
 * Retrieves userSessionToken from memory or login if expired / not set
 * @private
 */
Yodlee.prototype.getUserSessionToken = function getUserSessionToken() {

    var deferred = Q.defer();

    var date = new Date();

    if(this.sessionTokens.userSessionToken.token != null && this.sessionTokens.userSessionToken.expires > date.getTime()) {
        deferred.resolve(this.sessionTokens.userSessionToken.token);
    } else {
        this.cobLogin().then(function(login) {
            deferred.resolve(login.userContext.conversationCredentials.sessionToken);
        }).catch(function(e) {
            deferred.reject(e);
        });
    }

    return deferred.promise;


};

/**
 * Retrieves both the userSessionToken and cobSessionToken from memory / fetches them from API if expired
 * @private
 */
Yodlee.prototype.getBothSessionTokens = function getBothSessionTokens() {

    var deferred = Q.defer();

    this.getCobSessionToken().then(function(cobSessionToken){
        this.getUserSessionToken().then(function(userSessionToken){
            deferred.resolve({
                cobSessionToken: cobSessionToken,
                userSessionToken: userSessionToken
            });
        }).catch(function(e){
            deferred.reject(e);
        });
    }.bind(this)).catch(function(e){
        deferred.reject(e);
    });

    return deferred.promise;

};

/**
 * Retrieves all site accounts for the authenticated user
 */
Yodlee.prototype.getAllSiteAccounts = function getAllSiteAccounts() {

    var deferred = Q.defer();

    this.getBothSessionTokens().then(function(tokens){
        request.post({
            url: this.baseUrl + 'jsonsdk/SiteAccountManagement/getAllSiteAccounts',
            form: {
                'cobSessionToken': tokens.cobSessionToken,
                'userSessionToken': tokens.userSessionToken
            }
        },
        function(err, response, body) {
            if (err || JSON.parse(body).Error) {
                deferred.reject(err || JSON.parse(body).Error[0].errorDetail);
            } else {
                deferred.resolve(JSON.parse(body));
            }
        });
    }.bind(this)).catch(function(e){
        deferred.reject(e);
    });

    return deferred.promise;

};

/**
 * Retrieves all bank transactions for the authenticated user
 * @param {object} opt Optional args to call transaction
 */
Yodlee.prototype.getTransactions = function getTransactions(opt) {

    var deferred = Q.defer();

    opt = opt || {};

    this.getBothSessionTokens().then(function(tokens) {
            
        request.post({
            url: this.baseUrl + 'jsonsdk/TransactionSearchService/executeUserSearchRequest',
            form: {
                'cobSessionToken': tokens.cobSessionToken,
                'userSessionToken': tokens.userSessionToken,
                "transactionSearchRequest.containerType": opt.containerType || "All",
                "transactionSearchRequest.higherFetchLimit": opt.higherFetchLimit || "500",
                "transactionSearchRequest.lowerFetchLimit": opt.lowerFetchLimit || "1",
                "transactionSearchRequest.resultRange.endNumber": opt.endNumber || 5,
                "transactionSearchRequest.resultRange.startNumber": opt.startNumber || 1,
                "transactionSearchRequest.searchFilter.currencyCode": opt.currencyCode || "USD",
                "transactionSearchRequest.ignoreUserInput": opt.ignoreUserInput || "true"
            }
        },
        function(err, response, body) {
            if (err || JSON.parse(body).errorOccurred) {
                deferred.reject(err || JSON.parse(body).message);
            } else {
                deferred.resolve(JSON.parse(body));
            }
        });

    }.bind(this)).catch(function(e) {
        deferred.reject(e);
    });

    return deferred.promise;

};

/**
 * Gets the login form for a given Yodlee site ID
 * @param {object} opt args to get login form
 */
Yodlee.prototype.getSiteLoginForm = function getSiteLoginForm(opt) {

    var deferred = Q.defer();

    if (!opt.siteId) {
        deferred.reject('Invalid Site ID: Empty!');
    }

    this.getCobSessionToken().then(function(cobSessionToken) {

        request.post({
            url: this.baseUrl + 'jsonsdk/SiteAccountManagement/getSiteLoginForm',
            form: {
                'cobSessionToken': cobSessionToken,
                'siteId': opt.siteId
            }
        },
        function(err, response, body) {
            if (err || JSON.parse(body).Error) {
                deferred.reject(err || JSON.parse(body).message);
            } else {
                deferred.resolve(JSON.parse(body));
            }
        });

    }.bind(this)).catch(function(e) {
        deferred.reject(e);
    });

    return deferred.promise;

}

module.exports = Yodlee();