/**
 * Created by eugenehornet on 06.04.17.
 */
// with English
var xxtea = require('./lib/xxtea.js');

// with Eng
data = xxtea.encrypt('Hi!', 'cryptkey');
console.log(data);
console.log(xxtea.decrypt(data, 'cryptkey')); // => "Hi!"

// with Russian
data = xxtea.encrypt('Привет!', 'cryptkey');
console.log(data);
console.log(xxtea.decrypt(data, 'cryptkey')); // => "Привет!"

// with Russian + Eng
data = xxtea.encrypt('олололо http://русскийтекст', 'cryptkey');
console.log(data);
console.log(xxtea.decrypt(data, 'cryptkey')); // => "Hi!"