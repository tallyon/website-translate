# Website translation tool

This tool can be used to create various language version of a website when every language has it's translated texts in separate xml file and html file instead of having actual texts in some language has identifiers for language files keys in format _[index] where index is a number identifying text in language files.

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
