# WiFi Password Viewer for MMRL

An inspired project from [veez21](https://github.com/veez21)'s [wpd gist](https://gist.github.com/veez21/4f2541d271809864411e3ffbbe8e3df9), ported to MMRL.
This project is also a example to show how powerful MMRL's ModConf feature is.

Using `DOMParser` to extract local saved wifi passwords

> [!IMPORTANT]
> This project requires MMRL above 2.14.10!

```js
const wifiXmlParser = new DOMParser();
```

> This module does not extract passwords from unauthorized wifi's

