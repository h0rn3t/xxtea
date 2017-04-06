# xxtea

[![npm download](https://img.shields.io/npm/dm/xxtea.svg)](https://www.npmjs.com/package/xxtea)
[![npm version](https://img.shields.io/npm/v/xxtea.svg)](https://www.npmjs.com/package/xxtea)
[![License](https://img.shields.io/npm/l/xxtea-node.svg)](http://opensource.org/licenses/MIT)


Pure javascript xxtea encryption algorithm for Node.js.

## Install

```bash
  npm install xxtea
```

## Usage

```javascript
var xxtea = require('xxtea');
var pass  = 'password';
// to encrypt
var encrypted = xxtea.encrypt('data to encrypt', pass);

// to decrypt
var decrypted = xxtea.decrypt(encrypted, pass);
```

## API

`xxtea`

* `decrypt(string, password)`
  * string - required - the data to be decrypted.
  * password - required - the password to be used in decryption.
* `encrypt(string, password)`
  * string - required - the data to be encrypted.
  * password - required - the password to be used in encryption.
