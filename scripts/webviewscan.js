Java.perform(function () {
    console.log("\n[*] WebView Security Auditor Started...");
    console.log("[*] Monitoring WebView configurations for vulnerabilities...");
    console.log("------------------------------------------------------------");

    var WebView = Java.use('android.webkit.WebView');
    var WebSettings = Java.use('android.webkit.WebSettings');

    
    WebSettings.setJavaScriptEnabled.implementation = function (enabled) {
        console.log("\n[!] WebView Configuration Detected:");
        if (enabled) {
            console.log(" |- [!!!] JavaScript: ENABLED (Potential XSS Risk)");
        } else {
            console.log(" |- [+] JavaScript: DISABLED (Secure)");
        }
        return this.setJavaScriptEnabled(enabled);
    };

    
    WebSettings.setAllowFileAccess.implementation = function (allowed) {
        if (allowed) {
            console.log(" |- [!!!] File Access: ENABLED (Potential Local File Leakage)");
        } else {
            console.log(" |- [+] File Access: DISABLED (Secure)");
        }
        return this.setAllowFileAccess(allowed);
    };

    
    WebView.loadUrl.overload('java.lang.String').implementation = function (url) {
        console.log("\n[!] WebView loading URL: " + url);
        
        
        if (url.startsWith("http://")) {
            console.log(" |- [!!!] WARNING: Cleartext (HTTP) traffic detected!");
        } else if (url.startsWith("file://")) {
            console.log(" |- [!!!] WARNING: Loading local file in WebView!");
        }
        
        this.loadUrl(url);
    };

    
    WebView.addJavascriptInterface.implementation = function (object, name) {
        console.log("\n[!!!] EXPOSED INTERFACE FOUND: " + name);
        console.log(" |- Object: " + object.getClass().getName());
        console.log(" |- Risk: JS code can now call Native Java methods via '" + name + "'");
        this.addJavascriptInterface(object, name);
    };
});