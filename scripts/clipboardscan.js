Java.perform(function () {
    console.log("\n[*] Clipboard Security Auditor Started...");
    console.log("[*] Monitoring for sensitive data leakage via Clipboard...");
    console.log("------------------------------------------------------------");

    var ClipboardManager = Java.use('android.content.ClipboardManager');
    var ClipData = Java.use('android.content.ClipData');


    ClipboardManager.setPrimaryClip.implementation = function (clipData) {
        console.log("\n[!!!] CLIPBOARD COPY DETECTED!");
        
        if (clipData) {
            var item = clipData.getItemAt(0);
            var text = item.getText();
            if (text) {
                console.log(" |- Data Copied: " + text.toString());
                console.log(" |- Risk: This data is now accessible to ANY app on the device.");
                
                var secretPattern = /^[0-9\-+]{10,20}$/;
                if (secretPattern.test(text.toString())) {
                    console.log(" |- [!] WARNING: Likely sensitive numeric data (PII/Card)!");
                }
            }
        }
        return this.setPrimaryClip(clipData);
    };

    var TextView = Java.use('android.widget.TextView');
    TextView.setImeOptions.implementation = function (imeOptions) {
        if ((imeOptions & 33554432) !== 0) {
            console.log("\n[+] Keyboard Privacy: ENABLED (No Personalized Learning)");
        } else {
            console.log("\n[!] Keyboard Privacy: DISABLED (Keyboard might learn/cache this input)");
        }
        return this.setImeOptions(imeOptions);
    };
});