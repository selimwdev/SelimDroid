Java.perform(function () {
    console.log("\n[*] Runtime SSL Monitor Started... (No Proxy Needed)\n");

    
    function analyzeFailure(exception, context) {
        var message = exception.toString();
        if (message.includes("Certificatepinner") || message.includes("Pinning") || message.includes("Trust anchor")) {
            console.log("\n[!!!] SSL_PINNING_FAILURE_DETECTED [!!!]");
            console.log("-> Location: " + context);
            console.log("-> Reason: The app rejected the certificate (Pinning is Active).");
            console.log("-> Defense Method: The app uses hardcoded hashes to verify the server.");
        }
    }

    
    var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
    TrustManagerImpl.checkServerTrusted.overload('[Ljava.security.cert.X509Certificate;', 'java.lang.String', 'java.lang.String').implementation = function (certs, authType, host) {
        console.log("[RUNTIME_LOG] | TrustManager is checking host: " + host);
        try {
            return this.checkServerTrusted(certs, authType, host);
        } catch (e) {
            analyzeFailure(e, "TrustManagerImpl");
            throw e;
        }
    };

    
    try {
        var CertificatePinner = Java.use("okhttp3.CertificatePinner");
        CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function (hostname, peerCertificates) {
            console.log("[RUNTIME_LOG] | OkHttp Pinner is validating: " + hostname);
            try {
                return this.check(hostname, peerCertificates);
            } catch (e) {
                analyzeFailure(e, "OkHttp CertificatePinner");
                throw e; 
            }
        };
    } catch (err) {}

    
    var SSLContext = Java.use("javax.net.ssl.SSLContext");
    SSLContext.init.overload('[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom').implementation = function (km, tm, sr) {
        console.log("[RUNTIME_LOG] | SSLContext.init called. App is setting up secure communication.");
        return this.init(km, tm, sr);
    };
});