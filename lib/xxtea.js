var delta = 0x9E3779B9;


function longArrayToString(data, includeLength) {
    var length = data.length
        , n = (length - 1) << 2;
    if (includeLength) {
        var m = data[length - 1];
        if ((m < n - 3) || (m > n)) return null;
        n = m;
    }
    for (var i = 0; i < length; ++i) {
        data[i] = String.fromCharCode(
            data[i] & 0xff,
            data[i] >>> 8 & 0xff,
            data[i] >>> 16 & 0xff,
            data[i] >>> 24 & 0xff
        );
    }
    if (includeLength) {
        return data.join("").substring(0, n);
    }
    else {
        return data.join("");
    }
}

function stringToLongArray(string, includeLength) {
    var length = string.length;
    var result = [];
    for (var i = 0; i < length; i += 4) {
        result[i >> 2] = string.charCodeAt(i) |
            string.charCodeAt(i + 1) << 8 |
            string.charCodeAt(i + 2) << 16 |
            string.charCodeAt(i + 3) << 24;
    }
    if (includeLength) {
        result[result.length] = length;
    }
    return result;
}

function encrypt(string, key) {
    if (string == "") {
        return "";
    }
    string = new Buffer(string).toString('base64');
    var v = stringToLongArray(string, true)
        , k = stringToLongArray(key, false)
        , n = v.length - 1
        , z = v[n]
        , y = v[0]
        , mx, e, p
        , q = Math.floor(6 + 52 / (n + 1))
        , sum = 0;
    if (k.length < 4) {
        k.length = 4;
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
    return longArrayToString(v, false);
}


function decrypt(string, key) {
    if (string == "") {
        return "";
    }
    var v = stringToLongArray(string, false);
    var k = stringToLongArray(key, false);
    if (k.length < 4) {
        k.length = 4;
    }
    var n = v.length - 1;

    var z = v[n - 1], y = v[0];
    var mx, e, p, q = Math.floor(6 + 52 / (n + 1)), sum = q * delta & 0xffffffff;
    while (sum != 0) {
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
    return new Buffer(longArrayToString(v, true), 'base64').toString()
}

exports.encrypt  =  encrypt
exports.decrypt = decrypt

