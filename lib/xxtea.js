//this is copied from https://github.com/h0rn3t/xxtea,
// then modified accordingly to accommodate buffer

"use strict"
const delta = 0x9E3779B9;


//data is of Uint32Array
function longArrayToBytes(data, includeLength) {
    let length = data.length
        , n = length << 2;
    if (includeLength) {
        length--;
        let m = data[length];
        // console.log("m:" + m + " n:" + n);
        n = m;
        if (n & 3) length--;
    }
    // console.log("long array:" + length + " " + includeLength + " to bytes:" + n);
    var bytes = Buffer.alloc(n); //new Uint8Array(n);
    let i = 0, i4 = 0;
    for (; i < length; i++) {
        var d = data[i];
        bytes[i4++] = d & 0xff;
        bytes[i4++] = d >>> 8 & 0xff;
        bytes[i4++] = d >>> 16 & 0xff;
        bytes[i4++] = d >>> 24 & 0xff;
        //TODO: use bytes.writeUIntBE(d,i4,4) or LE?
    }
    if (i4 < n) {
        var d = data[i];
        for (var s = 0; i4 < n; s += 8) {
            bytes[i4++] = (d >>> s) & 0xff;
        }
    }
    return bytes;
}

//string is a buffer(uint8)
function bytesToLongArray(string, includeLength) {
    let length = string.length;
    let n = length >> 2;
    if ((length & 3) != 0) n++;
    if (includeLength) n++;
    // console.log("bytes:" + length + " " + includeLength + "to int:" + n);
    let result = new Uint32Array(n);
    let i = 0;
    for (; i + 4 <= length; i += 4) {
        result[i >> 2] = string[i] |
            string[i + 1] << 8 |
            string[i + 2] << 16 |
            string[i + 3] << 24;
    }
    if (i < length) {
        var v = 0;
        for (var s = 0; i < length; s += 8)
            v |= string[i++] << s;
        result[i >> 2] = v;
    }
    if (includeLength) {
        result[result.length - 1] = length;
    }
    return result;
}

function extendKey(key) {
    if (typeof key == "string")
        throw new Error("key should be a Buffer. you can turn string into Buffer easily as Buffer.from(key)");
    if (key.length < 16) {
        var k = new Uint8Array(16);
        var i = 0;
        for (; i < key.length; i++) {
            k[i] = key[i];
        }
        for (; i < k.length; i++) {
            k[i] = 0;
        }
        return k;
    }
    return key;
}
function checkDataType(data) {
    if (typeof data == "string")
        throw new Error("The operand should be a Buffer. you can turn a string into a Buffer easily as Buffer.from(key), and turn the returned Buffer into string as result.toString('hex') or result.toString('base64')");
}

function encrypt(string, key) {
    checkDataType(string);
    key = extendKey(key);
    let v = bytesToLongArray(string, true)
        , k = bytesToLongArray(key, false)
        , n = v.length - 1
        , z = v[n]
        , y = v[0]
        , mx, e, p
        , q = Math.floor(6 + 52 / (n + 1))
        , sum = 0;
    if (k.length < 4) {
        throw "this should not happend:" + k.length;
    }

    while (0 <= --q) {
        sum = sum + delta & 0xffffffff;
        e = sum >>> 2 & 3;
        for (p = 0; p < n; ++p) {
            y = v[p + 1];
            mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
            z = v[p] = v[p] + mx & 0xffffffff;
        }
        y = v[0];
        mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
        z = v[n] = v[n] + mx & 0xffffffff;
    }
    return longArrayToBytes(v, false);
}


function decrypt(string, key) {
    checkDataType(string);
    key = extendKey(key);
    let v = bytesToLongArray(string, false);
    let k = bytesToLongArray(key, false);
    if (k.length < 4) { //each one is of 4 bytes
        throw "this should not happend:" + k.length;
    }
    let n = v.length - 1;

    let z = v[n - 1], y = v[0];
    let mx, e, p, q = Math.floor(6 + 52 / (n + 1)), sum = q * delta & 0xffffffff;
    while (sum !== 0) {
        e = sum >>> 2 & 3;
        for (p = n; p > 0; --p) {
            z = v[p - 1];
            mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
            y = v[p] = v[p] - mx & 0xffffffff;
        }
        z = v[n];
        mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
        y = v[0] = v[0] - mx & 0xffffffff;
        sum = sum - delta & 0xffffffff;
    }
    // console.log("decrypt done");
    return longArrayToBytes(v, true);
}

exports.encrypt = encrypt;
exports.decrypt = decrypt;

