Java.perform(function() {
    console.log("\n[*] Starting Code Tampering Vulnerability Test...");

    
    
    var PackageManager = Java.use("android.app.ApplicationPackageManager");
    var Signature = Java.use("android.content.pm.Signature");

    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
        var info = this.getPackageInfo(pname, flags);
        
        
        if ((flags & 64) !== 0 && pname === "com.inisev.followit") {
            console.log("\n[!] TEST_TRIGGERED: App is checking signatures.");
            
            
            var fakeSignature = Signature.$new("00000000"); 
            if (info.signatures.value) {
                info.signatures.value[0] = fakeSignature;
                console.log("[STATUS] | Spossing signature to: 00000000 (Simulating Repackaging)");
            }
        }
        return info;
    };

    
    
    var MessageDigest = Java.use("java.security.MessageDigest");
    MessageDigest.digest.overload().implementation = function() {
        var realHash = this.digest();
        
        realHash[0] = 0x42; 
        console.log("[STATUS] | Corrupting Hash result (Simulating Bytecode Tampering)");
        return realHash;
    };

    
    
    setTimeout(function() {
        console.log("\n--- TEST RESULT ---");
        console.log("If the app is STILL RUNNING, it is VULNERABLE to Repackaging/Tampering.");
        console.log("If it crashed or showed error, it has proper Integrity Protection.");
        console.log("-------------------\n");
    }, 5000);
});