




'use strict';

var initialFiles = {};
var currentPackage = "";
var initialized = false;





function getPackageName() {
    var pkg = "";

    Java.perform(function () {
        try {
            var ActivityThread = Java.use("android.app.ActivityThread");
            var app = ActivityThread.currentApplication();
            if (app) {
                pkg = app.getPackageName();
            }
        } catch (e) {}
    });

    return pkg;
}





function checkBefore() {

    Java.perform(function () {

        try {

            currentPackage = getPackageName();

            if (!currentPackage) {
                console.log("[!] PACKAGE NOT FOUND");
                return;
            }

            var spPath = "/data/data/" + currentPackage + "/shared_prefs/";

            console.log("\n" + "=".repeat(60));
            console.log("[*] TARGET: " + currentPackage);
            console.log("[*] MODE: SHARED PREFERENCES SCAN");
            console.log("[*] PHASE 1: BEFORE STATE");
            console.log("=".repeat(60));

            var File = Java.use("java.io.File");
            var dir = File.$new(spPath);

            if (!dir.exists()) {
                console.log("[!] SHARED PREFS NOT FOUND");
                return;
            }

            var files = dir.listFiles();

            if (!files) return;

            for (var i = 0; i < files.length; i++) {

                try {

                    var f = files[i];
                    var name = f.getName().trim();
                    var size = parseInt(f.length());

                    initialFiles[name] = size;

                    console.log(
                        "[BEFORE] " +
                        name.padEnd(35) +
                        " | " +
                        size
                    );

                } catch (e) {}
            }

            initialized = true;

        } catch (e) {
            console.log("[!] BEFORE ERROR: " + e);
        }
    });
}





function checkAfter() {

    Java.perform(function () {

        try {

            if (!initialized) {
                console.log("[!] RUN BEFORE FIRST");
                return;
            }

            if (!currentPackage) {
                currentPackage = getPackageName();
            }

            var spPath = "/data/data/" + currentPackage + "/shared_prefs/";

            var leakRegex =
                /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

            console.log("\n" + "=".repeat(80));
            console.log("[*] PHASE 2: AFTER STATE ANALYSIS");
            console.log("=".repeat(80));

            var File = Java.use("java.io.File");
            var dir = File.$new(spPath);

            if (!dir.exists()) {
                console.log("[!] SHARED PREFS NOT FOUND");
                return;
            }

            var files = dir.listFiles();

            if (!files) return;

            for (var i = 0; i < files.length; i++) {

                try {

                    var f = files[i];
                    var name = f.getName().trim();
                    var afterSize = parseInt(f.length());
                    var beforeSize = initialFiles[name];

                    var status = "";

                    if (beforeSize !== undefined) {

                        if (afterSize === beforeSize) {
                            status = "STATIC (RISK)";
                        } else if (afterSize < beforeSize) {
                            status = "DECREASED";
                        } else {
                            status = "CHANGED";
                        }

                    } else {
                        status = "NEW FILE";
                        beforeSize = 0;
                    }

                    console.log(
                        name.padEnd(35) +
                        " | " +
                        beforeSize.toString().padEnd(10) +
                        " | " +
                        afterSize.toString().padEnd(10) +
                        " | " +
                        status
                    );

                    
                    var matches = searchRegexInFile(
                        f.getAbsolutePath(),
                        leakRegex
                    );

                    if (matches.length > 0) {

                        var uniq = [...new Set(matches)];

                        console.log(
                            "   [LEAK] " +
                            uniq.slice(0, 5).join(", ")
                        );
                    }

                } catch (e) {}
            }

            console.log("=".repeat(80));

        } catch (e) {
            console.log("[!] AFTER ERROR: " + e);
        }
    });
}





function searchRegexInFile(path, regex) {

    var result = [];

    Java.perform(function () {

        try {

            var File = Java.use("java.io.File");
            var FIS = Java.use("java.io.FileInputStream");

            var file = File.$new(path);

            if (!file.exists() || file.length() === 0)
                return;

            var stream = FIS.$new(file);

            var size = parseInt(file.length());
            var max = size > 1000000 ? 1000000 : size;

            var buffer = Java.array(
                'byte',
                Array(max).fill(0)
            );

            var read = stream.read(buffer);
            stream.close();

            var content = "";

            for (var i = 0; i < read; i++) {

                var b = buffer[i] & 0xff;

                if (b >= 32 && b <= 126)
                    content += String.fromCharCode(b);
                else
                    content += " ";
            }

            var m = content.match(regex);

            if (m) result = m;

        } catch (e) {}

    });

    return result;
}





rpc.exports = {

    checkbefore: function () {
        checkBefore();
        return "BEFORE_DONE";
    },

    done: function () {
        checkAfter();
        return "AFTER_DONE";
    }
};





setTimeout(function () {
    Java.perform(function () {
        checkBefore();
    });
}, 2000);