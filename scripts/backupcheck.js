Java.perform(function() {
    console.log("\n[*] Checking for AllowBackup Status... \n");

    var isLogged = false;

    var ContextWrapper = Java.use("android.content.ContextWrapper");

    ContextWrapper.getApplicationInfo.implementation = function() {
        var info = this.getApplicationInfo();
        
        if (!isLogged) {
            var flags = info.flags.value;
            var isBackupAllowed = (flags & 32768) !== 0;

            console.log("-----------------------------------------");
            console.log("[FLAG] | Type: Backup Configuration");
            console.log("[FLAG] | Status: " + (isBackupAllowed ? "ENABLED (Potential Vulnerability)" : "DISABLED (Secure)"));
            console.log("[FLAG] | Package: " + info.packageName.value);
            console.log("-----------------------------------------");
            
            if (isBackupAllowed) {
                console.log("[TIP] | Vulnerability: An attacker can use 'adb backup' to steal app data.");
            }

            isLogged = true; 
        }
        
        return info;
    };
});