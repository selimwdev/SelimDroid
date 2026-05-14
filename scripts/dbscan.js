setTimeout(function() {
    Java.perform(function() {
        console.log("\n" + "=".repeat(50));
        console.log("[*] STARTING PARANOID DB & WAL AUDIT...");
        console.log("=".repeat(50));

        var File = Java.use("java.io.File");
        var FileInputStream = Java.use("java.io.FileInputStream");
        var BufferedReader = Java.use("java.io.BufferedReader");
        var InputStreamReader = Java.use("java.io.InputStreamReader");

        var keywords = [
            "password", "passwd", "token", "secret", "key", "auth", 
            "session", "login", "credential", "bearer", "api_key"
        ];

        var emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

        function auditFile(filePath) {
            try {
                var file = File.$new(filePath);
                if (file.isDirectory() || file.length() == 0) return;

                var fileName = filePath.split('/').pop();
                console.log("\n[+] Scanning: " + fileName + " (" + file.length() + " bytes)");

                var fis = FileInputStream.$new(file);
                var header = Java.array('byte', [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
                fis.read(header);
                fis.close();
                
                var headerStr = "";
                for(var i=0; i<15; i++) headerStr += String.fromCharCode(header[i]);

                if (headerStr.indexOf("SQLite format 3") !== -1) {
                    console.log("    \x1b[31m[!] ALERT: Raw SQLite detected (NO ENCRYPTION)\x1b[0m");
                }

                var fis2 = FileInputStream.$new(file);
                var reader = BufferedReader.$new(InputStreamReader.$new(fis2, "UTF-8"));
                var line;
                var leakCount = 0;

                while ((line = reader.readLine()) !== null) {
                    var emails = line.match(emailRegex);
                    if (emails) {
                        emails.forEach(function(e) {
                            if(!e.includes("google") && !e.includes("firebase")) {
                                console.log("    \x1b[41m[VULNERABLE EMAIL]\x1b[0m " + e);
                                leakCount++;
                            }
                        });
                    }

                    keywords.forEach(function(kw) {
                        if (line.toLowerCase().indexOf(kw) !== -1) {
                            
                            var snippet = line.substring(line.toLowerCase().indexOf(kw), line.toLowerCase().indexOf(kw) + 50);
                            console.log("    \x1b[33m[SENSITIVE KEYWORD]\x1b[0m Found '" + kw + "' near: " + snippet.trim());
                            leakCount++;
                        }
                    });
                    
                    if (leakCount > 20) break; 
                }
                fis2.close();

            } catch (e) {  }
        }

        var currentContext = Java.use("android.app.ActivityThread").currentApplication().getApplicationContext();
        var dbPath = currentContext.getApplicationInfo().dataDir.value + "/databases";
        var dbFolder = File.$new(dbPath);

        if (dbFolder.exists()) {
            var files = dbFolder.listFiles();
            if (files) {
                for (var i = 0; i < files.length; i++) {
                    auditFile(files[i].getAbsolutePath());
                }
            }
        }
        console.log("\n[*] SCAN COMPLETE.");
    });
}, 5000);