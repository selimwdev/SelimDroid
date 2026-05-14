







'use strict';

var initialFiles = {};
var currentPackage = "";
var initialized = false;





function getPackageName() {

    var pkg = "";

    Java.perform(function () {

        try {

            var ActivityThread = Java.use(
                "android.app.ActivityThread"
            );

            var app = ActivityThread.currentApplication();

            if (app) {
                pkg = app.getPackageName();
            }

        } catch (e) {}

    });

    return pkg;
}





function captureInitialState() {

    Java.perform(function () {

        try {

            currentPackage = getPackageName();

            if (!currentPackage) {

                console.log(
                    "[!] PACKAGE NOT DETECTED YET"
                );

                return;
            }

            var dbPath =
                "/data/data/" +
                currentPackage +
                "/databases/";

            console.log("\n" + "=".repeat(60));

            console.log(
                "[*] TARGET: " + currentPackage
            );

            console.log(
                "[*] PHASE 1: CAPTURING INITIAL DATABASE STATE"
            );

            console.log("=".repeat(60));

            var File = Java.use("java.io.File");

            var databaseDir = File.$new(dbPath);

            if (!databaseDir.exists()) {

                console.log(
                    "[!] DATABASE DIRECTORY NOT FOUND"
                );

                return;
            }

            var filesList = databaseDir.listFiles();

            if (!filesList) {

                console.log(
                    "[!] NO DATABASE FILES FOUND"
                );

                return;
            }

            for (var i = 0; i < filesList.length; i++) {

                try {

                    var file = filesList[i];

                    var name = file.getName().trim();

                    var size = parseInt(
                        file.length()
                    );

                    initialFiles[name] = size;

                    console.log(
                        "[BEFORE] " +
                        name.padEnd(35) +
                        " | Size: " +
                        size
                    );

                } catch (e) {}
            }

            console.log(
                "\n[+] INITIAL SNAPSHOT CAPTURED"
            );

            initialized = true;

        } catch (e) {

            console.log(
                "[!] CAPTURE ERROR: " + e
            );
        }
    });
}





function searchRegexInFile(path, regex) {

    var matches = [];

    Java.perform(function () {

        try {

            var File = Java.use(
                "java.io.File"
            );

            var FileInputStream = Java.use(
                "java.io.FileInputStream"
            );

            var file = File.$new(path);

            if (
                !file.exists() ||
                file.length() === 0
            ) {
                return;
            }

            var stream =
                FileInputStream.$new(file);

            var fileSize = parseInt(
                file.length()
            );

            var maxRead =
                fileSize > 1000000
                ? 1000000
                : fileSize;

            var buffer = Java.array(
                'byte',
                Array(maxRead).fill(0)
            );

            var bytesRead =
                stream.read(buffer);

            stream.close();

            var content = "";

            for (var i = 0; i < bytesRead; i++) {

                var b = buffer[i] & 0xFF;

                if (b >= 32 && b <= 126) {

                    content +=
                        String.fromCharCode(b);

                } else {

                    content += " ";
                }
            }

            var result = content.match(regex);

            if (result) {
                matches = result;
            }

        } catch (e) {}
    });

    return matches;
}





function analyzeAfterLogout() {

    Java.perform(function () {

        try {

            if (!initialized) {

                console.log(
                    "[!] INITIAL STATE NOT CAPTURED"
                );

                return;
            }

            if (!currentPackage) {
                currentPackage =
                    getPackageName();
            }

            var dbPath =
                "/data/data/" +
                currentPackage +
                "/databases/";

            var emailRegex =
                /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

            console.log(
                "\n" + "=".repeat(70)
            );

            console.log(
                "[*] PHASE 2: POST-LOGOUT ANALYSIS"
            );

            console.log(
                "=".repeat(70)
            );

            var File = Java.use(
                "java.io.File"
            );

            var databaseDir =
                File.$new(dbPath);

            if (!databaseDir.exists()) {

                console.log(
                    "[!] DATABASE DIRECTORY MISSING"
                );

                return;
            }

            var filesList =
                databaseDir.listFiles();

            if (!filesList) {

                console.log(
                    "[!] NO DATABASE FILES FOUND"
                );

                return;
            }

            for (var i = 0; i < filesList.length; i++) {

                try {

                    var file = filesList[i];

                    var name =
                        file.getName().trim();

                    var afterSize =
                        parseInt(file.length());

                    var beforeSize =
                        initialFiles[name];

                    var status = "";

                    if (
                        beforeSize !== undefined
                    ) {

                        if (
                            afterSize === beforeSize
                        ) {

                            status =
                                "STATIC (POSSIBLE VULN)";

                        } else if (
                            afterSize < beforeSize
                        ) {

                            status = "DECREASED";

                        } else {

                            status = "CHANGED";
                        }

                    } else {

                        status = "NEW FILE";

                        beforeSize = 0;
                    }

                    console.log(

                        name.padEnd(30) +

                        " | " +

                        beforeSize
                            .toString()
                            .padEnd(10) +

                        " | " +

                        afterSize
                            .toString()
                            .padEnd(10) +

                        " | " +

                        status
                    );

                    
                    var matches =
                        searchRegexInFile(
                            file.getAbsolutePath(),
                            emailRegex
                        );

                    if (matches.length > 0) {

                        var uniqueMatches =
                            [...new Set(matches)];

                        console.log(
                            "   [LEAK] " +
                            uniqueMatches
                                .slice(0, 3)
                                .join(", ")
                        );
                    }

                } catch (e) {}
            }

            console.log(
                "=".repeat(70)
            );

            console.log(
                "[+] ANALYSIS FINISHED"
            );

        } catch (e) {

            console.log(
                "[!] ANALYSIS ERROR: " + e
            );
        }
    });
}





rpc.exports = {

    done: function () {

        analyzeAfterLogout();

        return "DONE";
    }
};





setTimeout(function () {

    Java.perform(function () {

        captureInitialState();

    });

}, 2000);