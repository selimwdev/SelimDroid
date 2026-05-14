Java.perform(function() {
    console.log("\n[*] Active Downgrade Attack Test Started...");

    var isTestTriggered = false;
    var targetPackage = "com.inisev.followit"; 

    var PackageManager = Java.use("android.app.ApplicationPackageManager");

    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
        
        var info = this.getPackageInfo(pname, flags);

        if (pname === targetPackage && !isTestTriggered) {
            console.log("\n[!] TARGET_DETECTED: " + pname);
            console.log("-----------------------------------------");
            
            
            console.log("[BEFORE] Real VersionCode: " + info.versionCode.value);
            console.log("[BEFORE] Real VersionName: " + info.versionName.value);
            console.log("-----------------------------------------");

            
            
            info.versionCode.value = 1; 
            info.versionName.value = "1.0-VULNERABLE-TEST";
            
            console.log("[AFTER] Injected VersionCode: " + info.versionCode.value);
            console.log("[AFTER] Injected VersionName: " + info.versionName.value);
            console.log("-----------------------------------------");
            console.log("[*] Waiting 10 seconds to observe app behavior...\n");
            
            isTestTriggered = true; 
        }
        return info;
    };

    
    setTimeout(function() {
        console.log("--------------------------------------------------");
        console.log("[FINAL_RESULT] Observation Period Ended:");
        console.log("-> If app is STILL OPEN: [!] VULNERABLE (No Force Update detected).");
        console.log("-> If app CLOSED/REDIRECTED: [✓] SECURE (Force Update is working).");
        console.log("--------------------------------------------------");
    }, 12000); 
});