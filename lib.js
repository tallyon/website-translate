var fs = require("fs");
var path = require("path");
var async = require("async");
var parseString = require("xml2js").parseString;

/**
 * Creates directories for each language in languages array
 * 
 * @param {string} workspaceDir Directory of project workspace to create langauge dirs in
 * @param {string[]} languages Array of strings
 * @param {Error} callback Returns error
 * @returns {void}
 */
function createLanguageDirectories(workspaceDir, languages, callback) {
    // Return error if workspace directory is invalid
    if(workspaceDir == null) {
        return callback(new Error("invalid workspace directory"));
    }

    // Return error if langauges array is invalid
    if(languages == null || languages.length < 1) {
        return callback(new Error("invalid langauges array provided"));
    }

    let createdDirs = 0;
    for(let i = 0; i < languages.length; i++) {
        let dirPath = path.join(workspaceDir, languages[i]);
        fs.access(dirPath, (err) => {
            if(err) {
                fs.mkdir(dirPath, (err) => {
                    createdDirs++;
                    if(createdDirs >= languages.length) {
                        return callback(null);
                    }
                });
            }
        });
    }
}

/**
 * Change all text identifiers in sourceHtml with text from languageXMLPath file and save output in outputPath file
 * 
 * @param {string} sourceHtml Source HTML file string contents in which identifiers will be replaced with translated text
 * @param {string} languageXMLPath Path to XML file with translations
 * @param {string} outputPath Path to translated HTML file which has to be created. Replaces existing file
 * @param {Error} callback Returns error
 * @returns {void}
 */
function translateSource(sourceHtml, languageXMLPath, outputPath, callback) {
    console.log("Translating source with", languageXMLPath, "to", outputPath);

    async.waterfall([
        // Parse XML language file
        (callback) => {
            console.log("Parsing XML file");
            parseXMLLanguageFile(languageXMLPath, (err, xml) => {
                if(err) {
                    console.error(err);
                    return callback(err);
                }
                else {
                    return callback(null, xml);
                }
            });
        },
        // Replace all identifiers with text from parsed xml file
        (xml, callback) => {
            console.log("Replacing contents with identifiers text");
            replaceHTMLIdentifiersWithXML(sourceHtml, xml, (err, replacedHTML) => {
                return callback(err, replacedHTML);
            });
        },
        // Save replaced HTML to outputPath
        (replacedHTML, callback) => {
            fs.writeFile(outputPath, replacedHTML, { encoding: "utf8" }, (err) => {
                if(err) {
                    console.error("error while saving translated HTML output:", err);
                }
                
                return callback(err);
            });
        }
    ], (err) => {
        return callback(err);
    });
}

/**
 * Parse xml file specified in languageXMLPath
 * 
 * @param {string} languageXMLPath Path to XML language file
 * @param {Error, xml} callback Returns error and parsed xml object
 * @return {void}
 */
function parseXMLLanguageFile(languageXMLPath, callback) {

    // Open and read langauge xml file
    fs.open(languageXMLPath, 'r', (err, fd) => {
        if(err) {
            if(err.code === "ENOENT") {
                console.error(languageXMLPath, "does not exist");
                return callback(err, null);
            }
        }

        fs.readFile(languageXMLPath, { encoding: "utf8" }, (err, data) => {
            if(err) {
                return callback(err, null);
            }
            else {
                // Parse xml
                parseString(data, (err, result) => {
                    if(err) {
                        fs.close(fd, (errClose) => {
                            return callback(err, null);
                        });
                    }
                    else {
                        // Close file
                        fs.close(fd, (err) => {
                            return callback(err, result);
                        });
                    }
                });
            }
        });
    });
}

/**
 * Replace all identifiers in html to text associated with identifier in xml file.
 * 
 * @param {string} html HTML file contents
 * @param {xml} xml Parsed xml file
 * @param {Error, string} callback Returns error and html contents replaced with identifiers from xml file
 * @returns void
 */
function replaceHTMLIdentifiersWithXML(html, xml, callback) {
    // Identifiers in XML file are specified as follows:
    // idINDEX, where INDEX is number
    // Idenfitiers in HTML file are specified as follows:
    // _[INDEX] where INDEX is number

    // Look for each identifier in html contents specified in xml file
    for(let p in xml.contents) {
        let identifierHTML = "_[" + p.substring(2) + "]";
        let textToReplaceWith = xml.contents[p];
        // Replace identifier in html contents
        html = html.replace(identifierHTML, textToReplaceWith);
    }

    return callback(null, html);
}

module.exports = {
    createLanguageDirectories: createLanguageDirectories,
    translateSource: translateSource
};
