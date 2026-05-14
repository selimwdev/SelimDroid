Java.perform(function() {
    console.log("\n[*] Integrity Radar Active - High-Confidence Tracking...\n");

    
    try {
        var ZipFile = Java.use("java.util.zip.ZipFile");
        
        ZipFile.getEntry.overload('java.lang.String').implementation = function(name) {
            if (name.indexOf(".dex") !== -1) {
                console.log("[FLAG] | Type: Asset_Access | Detail: App is reading " + name);
            }
            return this.getEntry(name);
        };
    } catch (e) {
        console.log("[!] ZipFile Hook Skip: " + e.message);
    }

    
    
    try {
        var MessageDigest = Java.use("java.security.MessageDigest");
        MessageDigest.isEqual.implementation = function(digesta, digestb) {
            var result = this.isEqual(digesta, digestb);
            console.log("[CRITICAL_FLAG] | Type: Integrity_Comparison | Match: " + result);
            return result;
        };
    } catch (e) {}

    
    try {
        var StringClass = Java.use("java.lang.String");
        StringClass.contains.implementation = function(str) {
            var content = this.toString().toLowerCase();
            if (str != null) {
                var searchStr = str.toString().toLowerCase();
                var suspects = ["frida", "magisk", "xposed", "gum-js"];
                
                for (var i = 0; i < suspects.length; i++) {
                    if (searchStr.indexOf(suspects[i]) !== -1 || content.indexOf(suspects[i]) !== -1) {
                        console.log("[CONFIRMED_FLAG] | Type: Memory_Scan | Searching_For: " + suspects[i]);
                    }
                }
            }
            return this.contains(str);
        };
    } catch (e) {}

    
    try {
        var Thread = Java.use("java.lang.Thread");
        Thread.getStackTrace.implementation = function() {
            var stack = this.getStackTrace();
            
            return stack;
        };
    } catch (e) {}
});