#!/usr/bin/env node
/*
 Automatically grade files for the presence of specified HTML tags/attributes.
 Uses commander.js and cheerio. Teaches coomand line application development
 and basic DOM parsing.

 References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - https://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjtolowaychuk.com/post/9103188408/commander-js-nodejs-commander-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
 */

var fs = require("fs");
var util = require('util');
var program = require("commander");
var cheerio = require("cheerio");
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var CURL_HTML_FILE_DEFAULT = "curl.html";
var URL_DEFAULT = "";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)){
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); //http://nodejs.com/api/process#process_process_exit_code
    }
    return instr;
};

var responseToFile = function(url) {
    rest.get(util.format(url)).on('complete', function(result, response){
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
        } else {
            fs.writeFileSync(CURL_HTML_FILE_DEFAULT, result);
        }
    });
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlUrl = function(url, checksfile) {
    $ = cheerioHtmlFile(CURL_HTML_FILE_DEFAULT);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
}

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <file_url>', 'URL to check', clone(responseToFile), URL_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .parse(process.argv);

    if(program.url == URL_DEFAULT) {
      var checkJson = checkHtmlFile(program.file, program.checks);
    } else {
      var checkJson = checkHtmlUrl(program.url, program.checks);
    }
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}

