
/*
 * Simple function to convert cookies from request into 
 * https://stackoverflow.com/questions/3393854/get-and-set-a-single-cookie-with-node-js-http-server
 */


function parseCookies (req) {
    var list = {},
        rc = req.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}


module.exports = parseCookies;
