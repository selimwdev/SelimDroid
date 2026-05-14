Java.perform(function () {
    console.log("\n[*] Screen Capture Policy Scanner Started...");
    console.log("[*] Monitoring FLAG_SECURE status on all Activities...");
    console.log("------------------------------------------------------------");

    var Activity = Java.use('android.app.Activity');
    var WindowManager = Java.use('android.view.WindowManager$LayoutParams');

    
    var FLAG_SECURE = 0x00002000;

    Activity.onResume.implementation = function () {
        this.onResume();
        
        var activityName = this.getClass().getName();
        var window = this.getWindow();
        var attributes = window.getAttributes();
        var flags = attributes.flags.value;

        console.log("\n[!] Activity Detected: " + activityName);

        
        if ((flags & FLAG_SECURE) !== 0) {
            console.log("[+] RESULT: SECURE");
            console.log(" |- FLAG_SECURE is ENABLED. Screenshots are blocked.");
        } else {
            console.log("[!!!] RESULT: VULNERABLE");
            console.log(" |- FLAG_SECURE is DISABLED. Screenshots/Screen Recording are POSSIBLE.");
            console.log(" |- Risk: Sensitive data can be leaked via screen capture.");
        }
        console.log("------------------------------------------------------------");
    };
});