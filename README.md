#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coverage-image]][coverage-url] [![Climate Status][climate-image]][climate-url]  [![Dependency Status][daviddm-image]][daviddm-url]

> Yodlee API wrapper for node.


## Installation

```sh
$ npm install --save yodlee
```

## Usage

```js
var yodlee = require('yodlee');
```


## Authentication using Cobrand Credentials
Yodlee requires a cobSessionToken before we can access the API. Get your credentials [here](https://devnow.yodlee.com).

```js
yodlee.use({
  username: 'sbCobExampleAdminUser',
    password: '96d621ec-2323-4664-b2fa-17ba6796b116'
});

```

## OAuth Requests
Yodlee uses the standard oauth authentication flow in order to allow apps to act on a user's behalf. Therefore, the API provides a convenience methods to help you authenticate your users. 

```js
yodlee.getAccessToken({
    username: 'sbMemsomeuser',
    password: 'sbMemsomeuser#123'
})
  .then(function(accessToken) {})
  .catch(function(error) {}); 

```

## Using the API
### GET User Accounts
Returns the information related to the specified accounts aggregated by the User: [Yodlee Docs](https://developer.yodlee.com/Aggregation_API/Aggregation_Services_Guide/Aggregation_REST_API_Reference/getSiteAccounts)


```js
yodleeAPI.getAccounts(accessToken)
  .then(function(accessToken) {})
  .catch(function(error) {}); 

```

### GET User Transactions
Executes a transaction search and returns the first page result: [Yodlee Docs](https://developer.yodlee.com/Aggregation_API/Aggregation_Services_Guide/Aggregation_REST_API_Reference/executeUserSearchRequest)

```js
yodleeAPI.getTransactions(accessToken, {
  containerType: 'All',
  higherFetchLimit: 500,
  lowerFetchLimit: 1,
  resultRangeEndNumber: 60,
  resultRangeStartNumber: 1,
  searchFilterCurrencyCode: 'GBP',
  ignoreUserInput: true
})
  .then(function(accessToken) {})
  .catch(function(error) {}); 

```

## License

MIT © [Craig Richardson](craigrich.me)


[npm-image]: https://badge.fury.io/js/yodlee.svg
[npm-url]: https://npmjs.org/package/yodlee
[travis-image]: https://travis-ci.org/craigrich/yodlee.svg?branch=master
[travis-url]: https://travis-ci.org/craigrich/yodlee
[daviddm-image]: https://david-dm.org/craigrich/yodlee.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/craigrich/yodlee
[coverage-image]: https://coveralls.io/repos/craigrich/yodlee/badge.svg?branch=master
[coverage-url]: https://coveralls.io/r/craigrich/yodlee?branch=master
[climate-image]: https://codeclimate.com/repos/550ff64ee30ba02368004065/badges/1fa6b3345204d5b51cfe/gpa.svg
[climate-url]: https://codeclimate.com/repos/550ff64ee30ba02368004065/feed