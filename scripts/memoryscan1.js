rpc.exports = {

    scanmemory: function() {

        Java.perform(function() {

            console.log("\n" + "=".repeat(50));

            console.log("[*] TARGET LOCATED! STARTING FINAL EXTRACTION...");

            console.log("=".repeat(50));

            

            

            var targetEmail = "@yahoo.com"; 



            function stringToHex(str) {

                return str.split('').map(function(c) {

                    return c.charCodeAt(0).toString(16).padStart(2, '0');

                }).join(' ');

            }



            function stringToUtf16Hex(str) {

                return str.split('').map(function(c) {

                    return c.charCodeAt(0).toString(16).padStart(2, '0') + " 00";

                }).join(' ');

            }



            var utf8Pattern = stringToHex(targetEmail);

            var utf16Pattern = stringToUtf16Hex(targetEmail);



            var ranges = Process.enumerateRanges('r--');



            ranges.forEach(function(range) {

                

                Memory.scan(range.base, range.size, utf8Pattern, {

                    onMatch: function(address, size) {

                        console.log("\n\x1b[42m\x1b[30m[!] CONFIRMED: FOUND UTF-8 ENTRY\x1b[0m at " + address);

                        try {

                            

                            console.log(hexdump(address, {

                                offset: 0,

                                length: 64,

                                header: true,

                                ansi: true

                            }));

                        } catch(e) { console.log("Dump error: " + e); }

                    },

                    onComplete: function() {}

                });



                

                Memory.scan(range.base, range.size, utf16Pattern, {

                    onMatch: function(address, size) {

                        console.log("\n\x1b[44m\x1b[37m[!] CONFIRMED: FOUND UTF-16 ENTRY\x1b[0m at " + address);

                        try {

                            console.log(hexdump(address, {

                                offset: 0,

                                length: 64,

                                header: true,

                                ansi: true

                            }));

                        } catch(e) { console.log("Dump error: " + e); }

                    },

                    onComplete: function() {}

                });

            });

        });

    }

};



setTimeout(rpc.exports.scanmemory, 1000); 

