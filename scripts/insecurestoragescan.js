setTimeout(function() {
    Java.perform(function() {
        console.log("\n[*] Deep Scan Initiated. Filtering Emails by TLD Whitelist...");

        var currentContext = null;
        var ActivityThread = Java.use("android.app.ActivityThread");
        var app = ActivityThread.currentApplication();

        if (app != null) {
            currentContext = app.getApplicationContext();
        } else {
            Java.choose("android.app.Application", {
                onMatch: function(instance) {
                    currentContext = instance.getApplicationContext();
                    return "stop";
                },
                onComplete: function() {}
            });
        }

        if (currentContext) {
            var appDataDir = currentContext.getApplicationInfo().dataDir.value;
            console.log("[+] Target Directory: " + appDataDir);

            var File = Java.use("java.io.File");
            var FileInputStream = Java.use("java.io.FileInputStream");
            var BufferedReader = Java.use("java.io.BufferedReader");
            var InputStreamReader = Java.use("java.io.InputStreamReader");

            
            var emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
            
            
            var allowedTlds = [".com", ".net", ".org", ".io", ".info", ".me", ".co", ".biz"];

            function scanDirectory(dirPath) {
                var directory = File.$new(dirPath);
                var files = directory.listFiles();
                if (files !== null) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        if (file.isDirectory()) {
                            scanDirectory(file.getAbsolutePath());
                        } else {
                            checkFile(file.getAbsolutePath());
                        }
                    }
                }
            }

            function checkFile(filePath) {
                try {
                    
                    var skip = [".so", ".dex", ".apk", ".cache"];
                    if (skip.some(ext => filePath.toLowerCase().endsWith(ext))) return;

                    var reader = BufferedReader.$new(InputStreamReader.$new(FileInputStream.$new(filePath)));
                    var line;
                    while ((line = reader.readLine()) !== null) {
                        var matches = line.match(emailRegex);
                        if (matches) {
                            matches.forEach(function(email) {
                                var lowerEmail = email.toLowerCase();
                                
                                
                                var isWhitelisted = allowedTlds.some(tld => lowerEmail.endsWith(tld));

                                if (isWhitelisted) {
                                    
                                    if (!lowerEmail.includes("google") && !lowerEmail.includes("firebase")) {
                                        console.log("\x1b[42m\x1b[30m[MATCH]\x1b[0m \x1b[32m" + email + "\x1b[0m in \x1b[33m" + filePath + "\x1b[0m");
                                    }
                                }
                            });
                        }
                    }
                    reader.close();
                } catch (e) {}
            }

            scanDirectory(appDataDir);

            console.log("\n\x1b[44m\x1b[37m ############################################ \x1b[0m");
            console.log("\x1b[44m\x1b[37m ##  SCAN FINISHED: EMAIL WHITELIST APPLIED ## \x1b[0m");
            console.log("\x1b[44m\x1b[37m ############################################ \x1b[0m\n");

        } else {
            console.log("[!] Error: Context not found.");
        }
    });
}, 5000);