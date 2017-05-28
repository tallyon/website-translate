var fs = require("fs");
var path = require("path");
var async = require("async");
var lib = require("./lib.js");

// State object
let projectState = {
    htmlSourceFilename: null,
    htmlContents: null, // Contains entire html file source code
    languages: [],      // Contains language codes
    translations: null
};

console.log("Looking for website directory...");
const workspaceDir = path.join(__dirname, "website");
// Make sure workspace directory exists
try {
    fs.accessSync(workspaceDir);
}
catch(err) {
    console.error("There is no directory", workspaceDir, "nothing to do! (See Usage instructions in README)");
    process.exit(1);
}

console.log("Creating output directory webiste/wwwroot");
// Output directory should be "wwwroot" directory in workspace
const outputDir = path.join(workspaceDir, "wwwroot");
// Make sure output directory exists
try {
    fs.accessSync(outputDir);
}
catch(err) {
    fs.mkdirSync(outputDir);
}
let files = fs.readdirSync(workspaceDir);

for(var i = 0; i < files.length; i++) {
    let file = files[i];
    // File extension
    let fileExtension = path.extname(file);
    // Base file name without extension
    let fileName = path.basename(file, fileExtension);
    console.log(fileName, fileExtension);

    if(fileExtension == ".xml") {
        console.log("Found xml file for language", fileName);
        // Add language to project state
        projectState.languages.push(fileName);
    }
    else if(fileExtension == ".html") {
        // This is index.html file
        console.log("Found index.html source file");
        projectState.htmlSourceFilename = file;
        // Read entire source code of html file
        projectState.htmlContents = fs.readFileSync(path.join(workspaceDir, file), "utf-8");
    }
}

// Check if there are html contents and languages detected
if(projectState.htmlContents == null || projectState.htmlContents.length < 1) {
    console.error("Invalid html contents!");
    process.exit(1);
}

if(projectState.languages.length < 1) {
    console.error("No langauges detected!");
    process.exit(1);
}

// Summary of detection
console.log("Html source has length:", projectState.htmlContents.length, "languages detected:");
for(var i = 0; i < projectState.languages.length; i++) {
    console.log(projectState.languages[i]);
}

// Main flow
async.waterfall([
    // Create directories for detected languages
    (callback) => {
        lib.createLanguageDirectories(outputDir, projectState.languages, (err) => {
            if(err) {
                console.error("error while creating language directories:", err);
                return callback(err);
            }
            console.log("Done creating language directories");
            return callback(null);
        });
    },
    // Translate source HTML with each langauge XML file
    (callback) => {
        let completedTranslations = 0;
        for(let i = 0; i < projectState.languages.length; i++) {
            lib.translateSource(projectState.htmlContents,
            path.join(workspaceDir, (projectState.languages[i] + ".xml")),
            path.join(outputDir, projectState.languages[i], projectState.htmlSourceFilename), (err) => {
                completedTranslations++;
                console.log("Parsed", completedTranslations, "out of", projectState.languages.length);

                if(completedTranslations >= projectState.languages.length) {
                    return callback(null, projectState);
                }
            });
        }
    }
], (err, result) => {
    if(err) {
        console.error("Translation ended with error:", err);
        process.exit(1);
    }
    else {
        console.log("Translation successfull! Translated to", result.languages.length, "languages");
    }
});
