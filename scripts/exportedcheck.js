Java.perform(function () {
    Java.scheduleOnMainThread(function () {
        try {
            var ActivityThread = Java.use('android.app.ActivityThread');
            var PackageManager = Java.use('android.content.pm.PackageManager');
            
            var app = ActivityThread.currentApplication();
            if (app === null) {
                console.log("[-] App context is null. Please interact with the app or wait.");
                return;
            }

            var context = app.getApplicationContext();
            var packageName = context.getPackageName();
            var pm = context.getPackageManager();

            var flags = PackageManager.GET_ACTIVITIES.value | 
                        PackageManager.GET_RECEIVERS.value | 
                        PackageManager.GET_PROVIDERS.value |
                        PackageManager.GET_SERVICES.value;

            var packageInfo = pm.getPackageInfo(packageName, flags);

            console.log("\n[+] Target Package: " + packageName);
            console.log("==========================================");

            var checkComponent = function(components, type) {
                if (components) {
                    console.log("\n[*] Checking " + type + "...");
                    for (var i = 0; i < components.length; i++) {
                        var item = components[i];
                        
                        if (item.exported.value === true) {
                            var permission = item.permission ? item.permission.value : null;
                            
                            var readPerm = item.readPermission ? item.readPermission.value : null;
                            var writePerm = item.writePermission ? item.writePermission.value : null;

                            console.log("  [!] EXPORTED: " + item.name.value);

                            if (type === "Providers") {
                                console.log("      - Read Permission: " + (readPerm ? readPerm : "NULL (Open)"));
                                console.log("      - Write Permission: " + (writePerm ? writePerm : "NULL (Open)"));
                            } else {
                                console.log("      - Permission: " + (permission ? permission : "NULL (Open)"));
                            }

                            if (!permission && !readPerm && !writePerm) {
                                console.log("      [!!!] RISK: Accessible by ANY app on the device.");
                            }
                            console.log("------------------------------------------");
                        }
                    }
                }
            };

            checkComponent(packageInfo.activities.value, "Activities");
            checkComponent(packageInfo.receivers.value, "Receivers");
            checkComponent(packageInfo.providers.value, "Providers");
            checkComponent(packageInfo.services.value, "Services");

            console.log("\n[+] Scan finished. Look for 'NULL' permissions for quick wins.");

        } catch (err) {
            console.log("[-] Error: " + err.stack);
        }
    });
});