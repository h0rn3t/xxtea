/**
 * Created by eugenehornet on 06.04.17.
 */
// with English
var xxtea = require('./lib/xxtea.js');

data = xxtea.encrypt('Hi!', 'hello');
console.log(xxtea.decrypt(data, 'hello')); // =>"Hi!"

// with Russian
data = xxtea.encrypt('Привет!', 'hello');
console.log(xxtea.decrypt(data, 'hello')); // =>"�D<65F%"