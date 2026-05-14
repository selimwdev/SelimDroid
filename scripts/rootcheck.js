Java.perform(function () {
    var rootPatterns = ["su", "magisk", "busybox", "supersu", "daemonsu", "superuser"];

    var File = Java.use("java.io.File");
    File.exists.implementation = function () {
        var filename = this.getAbsolutePath().toLowerCase();
        for (var i = 0; i < rootPatterns.length; i++) {
            if (filename.indexOf(rootPatterns[i]) !== -1) {
                console.log("ROOT_CHECK_EVENT:FILE|" + filename);
            }
        }
        return this.exists();
    };

    var Runtime = Java.use("java.lang.Runtime");
    Runtime.exec.overload('java.lang.String').implementation = function (cmd) {
        var command = cmd.toLowerCase();
        if (command.includes("su") || command.includes("which")) {
            console.log("ROOT_CHECK_EVENT:CMD|" + cmd);
        }
        return this.exec(cmd);
    };
});