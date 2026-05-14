Java.perform(function() {
    console.log("\n[!] Targeted Sniffer Active...");
    console.log("[!] Filters: Valid Email Pattern & Long Tokens (>25 chars).\n");

    var Log = Java.use("android.util.Log");
    var logMethods = ["v", "d", "i", "w", "e"];

    var emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    var tokenKeywords = ["jwt", "bearer", "auth_key"];

    logMethods.forEach(function(method) {
        Log[method].overload('java.lang.String', 'java.lang.String').implementation = function(tag, message) {
            var foundSomething = false;
            var output = "";

            var emails = message.match(emailRegex);
            if (emails) {
                output += "\n[EMAIL_FOUND] -> " + emails.join(", ");
                foundSomething = true;
            }

            var msgLower = message.toLowerCase();
            tokenKeywords.forEach(function(key) {
                if (msgLower.includes(key)) {
                    if (message.length > 25) { 
                        output += "\n[POTENTIAL_TOKEN] -> " + message.trim();
                        foundSomething = true;
                    }
                }
            });

            if (foundSomething) {
                console.log("\x1b[42m\x1b[30m[MATCH_FOUND]\x1b[0m Tag: " + tag + output);
                console.log("--------------------------------------------------");
            }

            return this[method](tag, message);
        };
    });
});