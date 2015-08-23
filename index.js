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

var Q = require('q'),
    request = require('request');

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
 * Use the specified Cobrand details to sign requests
 * @param {object} opt Cobrand username and password
 * @throws Error if options is empty
 */
Yodlee.prototype.use = function use(opt) {

    if (!opt.username || !opt.password) {
        throw new Error('Invalid Cobrand Credentials: Empty ' + (!(opt.username) ? 'username' : 'password'));
    }

    this.username = opt.username;
    this.password = opt.password;

};

/**
 * Retrieves app token, determined by Cobrand details.
 * @private
 */
Yodlee.prototype.getAppToken = function getAppToken() {

    var deferred = Q.defer();

    request.post({
        url: 'https://rest.developer.yodlee.com/services/srest/restserver/v1.0/authenticate/coblogin',
        form: {
            cobrandLogin: this.username,
            cobrandPassword: this.password
        }
    }, function(err, response, body) {
        if (err || JSON.parse(body).Error) {
            deferred.reject(err || JSON.parse(body).Error[0].errorDetail);
        } else {
            deferred.resolve(JSON.parse(body).cobrandConversationCredentials.sessionToken);
        }
    });


    return deferred.promise;

};

/**
 * Retrieves access token for the given user
 * @param {object} opt User username and password
 */
Yodlee.prototype.getAccessToken = function getAccessToken(opt) {

    var deferred = Q.defer();

    if (!opt.username || !opt.password) {
        deferred.reject('Invalid User Credentials: Empty ' + (!(opt.username) ? 'username' : 'password'));
    }

    this.getAppToken().then(function(appSessionToken) {

        request.post({
                url: 'https://rest.developer.yodlee.com/services/srest/restserver/v1.0/authenticate/login',
                form: {
                    login: opt.username,
                    password: opt.password,
                    cobSessionToken: appSessionToken
                }
            },

            function(err, response, body) {
                if (err || JSON.parse(body).Error) {
                    deferred.reject(err || JSON.parse(body).Error[0].errorDetail);
                } else {
                    deferred.resolve(JSON.parse(body).userContext.conversationCredentials.sessionToken);
                }
            });
    })
        .catch(function(e) {
            deferred.reject(e);
        });

    return deferred.promise;

};

/**
 * Retrieves all bank accounts for the given user
 * @param {string} accessToken  User access token
 */
Yodlee.prototype.getAccounts = function getAccounts(accessToken) {

    var deferred = Q.defer();

    if (!accessToken) {
        deferred.reject('Invalid Access Token: Empty Access Token!');
    }

    this.getAppToken().then(function(appSessionToken) {

        request
            .post({
                    url: 'https://rest.developer.yodlee.com/services/srest/restserver/v1.0/jsonsdk/SiteAccountManagement/getSiteAccounts',
                    form: {
                        'cobSessionToken': appSessionToken,
                        'userSessionToken': accessToken
                    }
                },
                function(err, response, body) {

                    if (err || JSON.parse(body).Error) {
                        deferred.reject(err || JSON.parse(body).Error[0].errorDetail);
                    } else {
                        deferred.resolve(body);
                    }
                });
    })
        .catch(function(e) {
            deferred.reject(e);
        });

    return deferred.promise;

};


/**
 * Retrieves all bank transactions for the given user
 *
 * @param {string} accessToken The user access token
 * @param {object} opt Optional args to call transaction
 */
Yodlee.prototype.getTransactions = function getTransactions(accessToken, opt) {

    var deferred = Q.defer();

    opt = opt || {};

    if (!accessToken) {
        deferred.reject('Invalid Access Token: Empty!');
    }

    this.getAppToken()
        .then(function(appSessionToken) {
            
            request
                .post({
                        url: 'https://rest.developer.yodlee.com/services/srest/restserver/v1.0/jsonsdk/TransactionSearchService/executeUserSearchRequest',
                        form: {
                            'cobSessionToken': appSessionToken,
                            'userSessionToken': accessToken,
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
                            deferred.resolve(body);
                        }
                    });
        })

        .catch(function(e) {
            deferred.reject(e);
        });

    return deferred.promise;

};


module.exports = Yodlee();