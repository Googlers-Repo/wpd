# WiFi Password Viewer for MMRL

An inspired project from [veez21](https://github.com/veez21)'s [wpd gist](https://gist.github.com/veez21/4f2541d271809864411e3ffbbe8e3df9), ported to MMRL.
This project is also a example to show how powerful MMRL's ModConf feature is.

<a href="https://mmrl.dergoogler.com/?module=mmrl_wpd"><img height="45px" alt="Get it on MMRL" src="https://raw.githubusercontent.com/DerGoogler/MMRL/master/www/assets/MMRL-Badge.svg"></a>

Using `DOMParser` to extract local saved wifi passwords

> [!IMPORTANT]
> This project requires MMRL above 2.19.18!

```js
const wifiXmlParser = new DOMParser();
```

> This module does not extract passwords from unauthorized wifi's. This module is for education purpose only

