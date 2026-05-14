Java.perform(function() {
    console.log("\n[*] Checking for Debuggable Status (One-Shot Monitoring)... \n");

    var isLogged = false; 

    var ApplicationInfo = Java.use("android.content.pm.ApplicationInfo");
    var ContextWrapper = Java.use("android.content.ContextWrapper");

    
    ContextWrapper.getApplicationInfo.implementation = function() {
        var info = this.getApplicationInfo();
        
        
        if (!isLogged) {
            var flags = info.flags.value;
            
            var isDebuggable = (flags & 2) !== 0;

            console.log("-----------------------------------------");
            console.log("[FLAG] | Status: " + (isDebuggable ? "DEBUGGABLE (Vulnerable)" : "RELEASE (Secure)"));
            console.log("[FLAG] | Package: " + info.packageName.value);
            console.log("-----------------------------------------");
            
            isLogged = true; 
        }
        
        return info;
    };
});