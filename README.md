#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coverage-image]][coverage-url] [![Dependency Status][daviddm-image]][daviddm-url]


> Yodlee API wrapper for node. Forked from Craig Richardson's original repository: https://github.com/craigrich/yodlee


## Installation

```sh
$ npm install --save yodlee
```

## Usage

```js
var yodlee = require('yodlee');
```


## Authentication using Cobrand Credentials & User Login
Yodlee requires a cobSessionToken before we can access the API. Get your credentials [here](https://devnow.yodlee.com).
You can specify whether you wish to use the Sandbox API or the Live API when setting the Cobrand Credentials.

Yodlee uses the standard oauth authentication flow in order to allow apps to act on a user's behalf. Perform a login request to use the Yodlee API on behalf of a specific user after the Cobrand login step completes.

```js
yodlee.use({
    username: 'sbCobExampleAdminUser',
    password: '96d621ec-2323-4664-b2fa-17ba6796b116',
    sandbox: true
}).then(function() {
  
  yodlee.login({
    username: 'app.user',
    password: 'password@123#'
  }).then(function(login) {
    // Access the tokens via the login object passed to this function
  }).catch(function(error) {});
  
}).catch(function(error) {});

```

## Accessing authentication tokens
The authentication tokens are cached in the application memory for 20 minutes after authentication by the steps above. The tokens should be accessed by the helper methods below. These methods will determine whether or not a new token is required based on the expiration timestamp stored in memory.

After performing a login you can access the session tokens using the helper methods below.

```js
yodlee.getCobSessionToken().then(function(cobSessionToken) {
  // The cobSessionToken is returned as a String
}).catch(function(error) {}); 

```

```js
yodlee.getUserSessionToken({
  username: 'app.user',
  password: 'password@123#'
}).then(function(userSessionToken) {
  // The userSessionToken is returned as a String
}).catch(function(error) {}); 

```

```js
yodlee.getBothSessionTokens({
  username: 'app.user',
  password: 'password@123#'
}).then(function(tokens) {
  // The tokens are returned in an Object
  // tokens.cobSessionToken
  // tokens.userSessionToken
}).catch(function(error) {}); 

```

Note: When calling `getBothSessionTokens` & `getUserSessionToken` the method will only require the username and password for the user if a new `userSessionToken` is required. This is because a new login request will be performed against the Yodlee API.

## Using the API

Once a user has successfully authenticated against the API the following methods can be used. Each method will determine which access tokens are required and only go to the Yodlee Auth API for new tokens when they have expired. Therefore, in most scenarios, a simple call to `use` and `login` methods is required and the Yodlee Node library will take care of all other authentication decisions. The helper methods for access tokens above are only really useful if you wish to perform your own caching of the tokens in your application and need to access them for persistence purposes, or something similar.

### GET All Site Accounts
Returns the information related to the specified accounts aggregated by the User: [Yodlee Docs](https://developer.yodlee.com/Aggregation_API/Aggregation_Services_Guide/Aggregation_REST_API_Reference/getAllSiteAccounts)


```js
yodlee.getAllSiteAccounts().then(function(accounts) {
  // The JSON response from the Yodlee API is passed into this function (see link above for details)
}).catch(function(error) {}); 

```

### GET User Transactions
Executes a transaction search and returns the first page result: [Yodlee Docs](https://developer.yodlee.com/Aggregation_API/Aggregation_Services_Guide/Aggregation_REST_API_Reference/executeUserSearchRequest)

```js
yodlee.getTransactions({
  containerType: 'All',
  higherFetchLimit: 500,
  lowerFetchLimit: 1,
  resultRangeEndNumber: 60,
  resultRangeStartNumber: 1,
  searchFilterCurrencyCode: 'GBP',
  ignoreUserInput: true
}).then(function(transactions) {
  // The JSON response from the Yodlee API is passed into this function (see link above for details)
}).catch(function(error) {}); 

```

### GET Site Login Form
Returns the login form structure for a given Yodlee Site ID: [Yodlee Docs](https://developer.yodlee.com/Aggregation_API/Aggregation_Services_Guide/Aggregation_REST_API_Reference/getSiteLoginForm)

```js
yodlee.getSiteLoginForm({
  siteId: 3970
}).then(function(loginForm) {
  // The JSON response from the Yodlee API is passed into this function (see link above for details)
}).catch(function(error) {}); 

```

## Contributing

##### Unit tests
Unit test are written in [Mocha](http://visionmedia.github.io/mocha/). Please add a unit test for every new feature or bug fix. `npm test` to run the test suite.  

##### Documentation
Add documentation for every API change. Feel free to send corrections or better docs!  

##### Pull Requests
Send _fixes_ PR on the `master` branch.

## License
MIT © [Craig Richardson](https://www.linkedin.com/in/craigalanrichardson)

[npm-image]: https://badge.fury.io/js/yodlee.svg
[npm-url]: https://npmjs.org/package/yodlee
[travis-image]: https://travis-ci.org/craigrich/yodlee.svg?branch=master
[travis-url]: https://travis-ci.org/craigrich/yodlee
[daviddm-image]: https://david-dm.org/craigrich/yodlee.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/craigrich/yodlee
[coverage-image]: https://coveralls.io/repos/craigrich/yodlee/badge.svg?branch=master
[coverage-url]: https://coveralls.io/r/craigrich/yodlee?branch=master
