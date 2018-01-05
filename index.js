var pairing = require("pairing");
var bookmark = require("bookmark");

var set_key = pairing.set_key
var bookmark = function() {
    console.log("Running scrape");
    pairing.do_bookmark();
}
