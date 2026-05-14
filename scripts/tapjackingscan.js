Java.perform(function () {
    console.log("\n[*] Hardcore Tapjacking Scanner Started...");
    
    var Activity = Java.use('android.app.Activity');

    Activity.onResume.implementation = function () {
        this.onResume();
        var activityName = this.getClass().getName();
        console.log("\n[!] Scanning Activity: " + activityName);

        var window = this.getWindow();
        var view = window.getDecorView();

        var isProtected = view.getFilterTouchesWhenObscured();

        if (isProtected) {
            console.log("    [+] RESULT: SECURE (Activity is filtering obscured touches)");
        } else {
            console.log("    [!!!] RESULT: VULNERABLE (Activity ignores obscured touches)");
            console.log("    [i] Any overlay can hijack touches on this screen.");
        }
    };
});