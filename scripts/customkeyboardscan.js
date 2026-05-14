Java.perform(function () {
    console.log("\n[*] Keyboard Trust Auditor Started... (Fixed Version)");
    console.log("------------------------------------------------------------");

    var EditText = Java.use('android.widget.EditText');
    var TextView = Java.use('android.widget.TextView');

    
    EditText.onCheckIsTextEditor.implementation = function () {
        var isEditor = this.onCheckIsTextEditor();
        
        if (isEditor) {
            try {
                var inputType = this.getInputType();
                
                var viewId = this.getId();
                var resName = "unknown_id";
                try {
                    resName = this.getResources().getResourceEntryName(viewId);
                } catch (e) { resName = "dynamic_view_" + viewId; }

                console.log("\n[!] Input Field Detected: " + resName);
                
                
                if ((inputType & 128) !== 0 || (inputType & 16) !== 0) {
                    console.log(" |- Field Type: SENSITIVE (Password/PIN)");
                } else {
                    console.log(" |- Field Type: NORMAL TEXT");
                }
            } catch (err) {
                
            }
        }
        return isEditor;
    };

    
    TextView.onCreateInputConnection.implementation = function (editorInfo) {
        var ic = this.onCreateInputConnection(editorInfo);
        
        if (editorInfo !== null) {
            try {
                
                var imeflags = editorInfo.imeOptions.value;
                
                
                if ((imeflags & 33554432) !== 0) {
                    console.log(" [+] RESULT: SECURE (Personalized learning is DISABLED)");
                } else {
                    console.log(" [!!!] RESULT: VULNERABLE (Keyboard can 'learn' this input)");
                    console.log(" |- Tip: Malicious keyboards can log this data via dictionary cache.");
                }
            } catch (err) {
                console.log(" [-] Error checking flags: " + err.message);
            }
        }
        return ic;
    };
});