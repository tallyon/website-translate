# Website translation tool

This tool can be used to create various language version of a website when every language has it's translated texts in separate xml file and html file instead of having actual texts in some language has identifiers for language files keys in format _[index] where index is a number identifying text in language files.

It is important that all the resources the website uses should be outside it's directory. If you have, for example a css file that you link in your HTML like so:

```html
<link href="css.css" rel="stylesheet" type="text/css">
```

You will brake this link because now your HTML file will be in deeper directory, /en/index.html or /es/index.html, so you should prepare all resource links to be relative to this kind of directory tree, eg.:

- /resources
- /en
    - index.html
- /es
    - index.html

And in your index.html file use css file mentioned above like so:

```html
<link href="../resources/css.css" rel="stylesheet" type="text/css">
```

Or use absolute paths everywhere.

Valid index.html will look like this:

```html
<html>
    <head>
        <title>_[0]</title>
    </head>
    <body>
        <h1>_[1]</h1>
        <p>_[2]</p>
        <p>_[3]</p>
    </body>
</html>
```

Whereas valid language file will look like this

```xml
<?xml version="1.0" encoding="UTF-8"?>
<contents>
    <0>This is title of the page</0>
    <1>This is heading of the page</1>
    <2>This is first paragraph</2>
    <3>This is second paragraph</3>
</contents>
```

Every language file's name will create directory with the same name where generated html file (with the same name as source html file) will be put. Make sure to have clear and sane names, eg. en.xml, es.xml, pl.xml, etc.

Directory tree before running:
- index.html (source html file with identifiers in places of texts)
- en.xml (language xml file containing translated texts for each identifier)
- pl.xml
- es.xml

Directory tree after running:
- index.html
- en.xml
- pl.xml
- es.xml
- wwwroot (new directory where all translated outputs are stored in)
    - en (directory containing html file with translated texts)
        - index.html (html file containing translated texts)
    - pl
        - index.html
    - es
        - index.html

### Usage

Place your HTML file and XML language files inside website directory. Directory website should be in the same directory as index.js, otherwise detection won't be successful.
First HTML file deteceted will be used as srouce file - it is not intended to work on multiple HTML files.
All XML files will be registered as language files and name of each one will be used to create directory in which it's translation will be joined with HTML source file.

```bash
node index.js
```
