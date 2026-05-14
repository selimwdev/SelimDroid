import frida
import os
import subprocess
import time
import gc
import threading

# =========================
# SELIMDROID UI DESIGN COLORS
# =========================
class UI:
    RESET = "\033[0m"
    GREEN = "\033[38;5;82m"
    RED = "\033[38;5;196m"
    YELLOW = "\033[38;5;226m"
    BLUE = "\033[38;5;27m"
    CYAN = "\033[38;5;51m"
    MAGENTA = "\033[38;5;201m"
    BOLD = "\033[1m"

def show_logo():
    print(UI.CYAN + UI.BOLD)
    print(r"""
    ███████╗███████╗██╗     ██╗███╗   ███╗██████╗ ██████╗  ██████╗ ██╗██████╗ 
    ██╔════╝██╔════╝██║     ██║████╗ ████║██╔══██╗██╔══██╗██╔═══██╗██║██╔══██╗
    ███████╗█████╗  ██║     ██║██╔████╔██║██║  ██║██████╔╝██║   ██║██║██║  ██║
    ╚════██║██╔══╝  ██║     ██║██║╚██╔╝██║██║  ██║██╔══██╗██║   ██║██║██║  ██║
    ███████║███████╗███████╗██║██║ ╚═╝ ██║██████╔╝██║  ██║╚██████╔╝██║██████╔╝
    ╚══════╝╚══════╝╚══════╝╚═╝╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝╚═════╝
    """)
    print(f"    {UI.MAGENTA}{'>'*20} SECURITY ANALYSIS ENGINE {UI.MAGENTA}{'<'*20}{UI.RESET}\n")

# =========================
# SCRIPT NAMES MAPPING
# =========================
FRIENDLY_NAMES = {
    "backupcheck.js": "Android Backup Security Audit",
    "clipboardscan.js": "Clipboard Data Leakage Scan",
    "codetampering.js": "Binary Integrity Verification",
    "contentprovidercheck.js": "Content Provider Access Audit",
    "customkeyboardscan.js": "Input Method Hijacking Scan",
    "dbscan.js": "Local SQLite Database Audit",
    "debugcheck.js": "Runtime Debuggable State Check",
    "downgradescan.js": "App Version Downgrade Test",
    "exportedcheck.js": "Exported Components Exposure Scan",
    "insecurestoragescan.js": "Filesystem Permission Audit",
    "logcatcheck.js": "Sensitive Information Log Scan",
    "memoryscan.js": "Process Memory Secret Search (P1)",
    "memoryscan1.js": "Process Memory Secret Search (P2)",
    "memoryscan2.js": "Process Memory Secret Search (P3)",
    "rootcheck.js": "Advanced Root Detection Test",
    "rootdetectbypass.js": "Anti-Root Mechanism Bypass",
    "runtimeintegrity.js": "App Environment Integrity Check",
    "screenshotscan.js": "Screen Capture Protection Audit",
    "sslpinningscan.js": "SSL Pinning Enforcement Test",
    "tapjackingscan.js": "UI Tapjacking/Overlay Audit",
    "webviewscan.js": "WebView Secure Configuration Scan",
    "scanafterlogout.js": "Post-Logout Session Integrity",
    "scanafterlogout2.js": "Token Revocation Verification"
}

# =========================
# PATHS
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.join(BASE_DIR, "scripts")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

if not os.path.exists(REPORTS_DIR):
    os.makedirs(REPORTS_DIR)

# =========================
# GLOBALS
# =========================

device = None

# =========================
# KEEP DEVICE AWAKE
# =========================

def keep_device_awake():

    while True:

        try:

            subprocess.run(
                "adb shell input keyevent KEYCODE_WAKEUP",
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )

            subprocess.run(
                "adb shell wm dismiss-keyguard",
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )

        except:
            pass

        time.sleep(20)

# =========================
# DEVICE SETUP
# =========================

def setup_device():

    print(f"{UI.BLUE}[*] CONFIGURING DEVICE...{UI.RESET}")

    subprocess.run(
        "adb start-server",
        shell=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    subprocess.run(
        "adb shell settings put system screen_off_timeout 2147483647",
        shell=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    subprocess.run(
        "adb shell settings put global animator_duration_scale 0",
        shell=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    subprocess.run(
        "adb shell settings put global transition_animation_scale 0",
        shell=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    subprocess.run(
        "adb shell settings put global window_animation_scale 0",
        shell=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

# =========================
# CONNECT DEVICE
# =========================

def connect_device():

    global device

    for i in range(5):

        try:

            print(f"{UI.BLUE}[*] CONNECTING ({i+1}/5)...{UI.RESET}")

            subprocess.run(
                "adb start-server",
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )

            time.sleep(2)

            device = frida.get_usb_device(timeout=20)

            print(f"{UI.GREEN}[+] DEVICE CONNECTED{UI.RESET}")

            return True

        except Exception as e:

            print(f"{UI.RED}[!] CONNECTION FAILED: {e}{UI.RESET}")

            time.sleep(5)

    return False

# =========================
# RECONNECT
# =========================

def reconnect_device():

    global device

    try:

        subprocess.run(
            "adb start-server",
            shell=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

        time.sleep(2)

        device = frida.get_usb_device(timeout=15)

        return True

    except:
        return False

# =========================
# MESSAGE HANDLER
# =========================

def on_message(message, data, report_file, fname):

    try:

        if message["type"] == "send":

            report_file.write(
                f"[{fname}] {message['payload']}\n"
            )

            report_file.flush()

        elif message["type"] == "error":

            report_file.write(
                f"[{fname}] ERROR: {message}\n"
            )

            report_file.flush()

    except:
        pass

# =========================
# CLEANUP
# =========================

def cleanup(pkg, session=None):

    try:

        if session:
            session.detach()

    except:
        pass

    try:

        subprocess.run(
            f"adb shell am force-stop {pkg}",
            shell=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

    except:
        pass

    try:
        gc.collect()
    except:
        pass

# =========================
# RUN SCRIPT
# =========================

def run_script(pkg, fname, report, silent_wrapper, instructions):

    global device

    session = None

    script_path = os.path.join(
        SCRIPTS_DIR,
        fname
    )

    if not os.path.exists(script_path):

        print(f"    {UI.RED}[-] FILE NOT FOUND: {fname}{UI.RESET}")
        return False

    for retry in range(3):

        try:

            print(f"    {UI.YELLOW}[*] ATTEMPT {retry+1}/3{UI.RESET}")

            # =========================
            # WAKE DEVICE
            # =========================

            subprocess.run(
                "adb shell input keyevent KEYCODE_WAKEUP",
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )

            subprocess.run(
                "adb shell wm dismiss-keyguard",
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )

            # =========================
            # FORCE STOP
            # =========================

            subprocess.run(
                f"adb shell am force-stop {pkg}",
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )

            time.sleep(2)

            # =========================
            # RECONNECT DEVICE
            # =========================

            if not reconnect_device():
                raise Exception("DEVICE LOST")

            # =========================
            # SPAWN
            # =========================

            pid = device.spawn([pkg])

            # =========================
            # ATTACH
            # =========================

            session = device.attach(pid)

            # =========================
            # ENABLE JIT
            # =========================

            try:
                session.enable_jit()
            except:
                pass

            # =========================
            # LOAD JS
            # =========================

            with open(script_path, "r", encoding="utf-8") as sf:

                full_code = (
                    silent_wrapper +
                    sf.read()
                )

            script = session.create_script(full_code)

            script.on(
                "message",
                lambda msg, data, f=fname:
                on_message(msg, data, report, f)
            )

            script.load()

            # =========================
            # RESUME
            # =========================

            device.resume(pid)

            # =========================
            # WAIT
            # =========================

            if fname in instructions:

                print(
                    f"    {UI.MAGENTA}[ACTION] {instructions[fname]}{UI.RESET}"
                )

                input(
                    f"    {UI.YELLOW}[?] PRESS ENTER WHEN DONE... {UI.RESET}"
                )

            else:

                time.sleep(8)

            # =========================
            # UNLOAD SCRIPT
            # =========================

            try:
                script.unload()
            except:
                pass

            cleanup(pkg, session)

            print(f"    {UI.GREEN}[+] SUCCESS{UI.RESET}")

            return True

        except frida.TransportError as e:

            print(f"    {UI.RED}[!] TRANSPORT ERROR: {e}{UI.RESET}")

            cleanup(pkg, session)

            time.sleep(5)

        except frida.ServerNotRunningError as e:

            print(f"    {UI.RED}[!] FRIDA SERVER ERROR: {e}{UI.RESET}")

            cleanup(pkg, session)

            time.sleep(5)

        except Exception as e:

            print(f"    {UI.RED}[!] ERROR: {e}{UI.RESET}")

            cleanup(pkg, session)

            time.sleep(3)

    return False

# =========================
# LOGOUT PHASE
# =========================

def logout_phase(pkg, report, silent_wrapper):

    print("\n" + UI.BLUE + "="*60 + UI.RESET)
    print(f"        {UI.BOLD}{UI.CYAN}PHASE: ISOLATED LOGIN/LOGOUT SCAN (FIXED){UI.RESET}")
    print(UI.BLUE + "="*60 + UI.RESET)

    logout_scripts_sets = [
        ["scanafterlogout.js"],
        ["scanafterlogout2.js"]
    ]

    for scripts in logout_scripts_sets:
        # Get friendly name for the session display
        session_names = [FRIENDLY_NAMES.get(s, s) for s in scripts]
        print(f"\n{UI.BLUE}[*] NEW ISOLATED SESSION: {session_names}{UI.RESET}")

        input(f"{UI.YELLOW}[?] LOGIN NOW IN APP THEN PRESS ENTER... {UI.RESET}")

        session = None
        active_scripts = []

        try:
            if not reconnect_device():
                raise Exception("DEVICE LOST")

            subprocess.run(
                f"adb shell am force-stop {pkg}",
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )

            time.sleep(2)

            pid = device.spawn([pkg])
            session = device.attach(pid)

            try:
                session.enable_jit()
            except:
                pass

            # load ONLY current script set
            for f in scripts:

                path = os.path.join(SCRIPTS_DIR, f)

                if not os.path.exists(path):
                    print(f"{UI.RED}[!] MISSING: {f}{UI.RESET}")
                    continue

                with open(path, "r", encoding="utf-8") as sf:

                    script = session.create_script(
                        silent_wrapper + sf.read()
                    )

                    script.on(
                        "message",
                        lambda msg, data, ff=f:
                        on_message(msg, data, report, ff)
                    )

                    script.load()
                    active_scripts.append(script)

            device.resume(pid)

            input(f"{UI.YELLOW}[?] WAIT UNTIL SNAPSHOT READY THEN PRESS ENTER... {UI.RESET}")

            print(f"\n{UI.MAGENTA}[ACTION] NOW PERFORM LOGOUT{UI.RESET}")

            input(f"{UI.YELLOW}[?] PRESS ENTER AFTER LOGOUT... {UI.RESET}")

            print(f"\n{UI.BLUE}[*] RUNNING DONE() FOR THIS SESSION ONLY{UI.RESET}")

            for s in active_scripts:
                try:
                    s.exports_sync.done()
                except Exception as e:
                    print(f"{UI.RED}[!] RPC FAILED: {e}{UI.RESET}")

            for s in active_scripts:
                try:
                    s.unload()
                except:
                    pass

            print(f"{UI.GREEN}[+] SESSION FINISHED CLEANLY{UI.RESET}")

        finally:
            cleanup(pkg, session)

# =========================
# MAIN
# =========================

def main():

    show_logo()

    pkg = input(
        f"{UI.BOLD}{UI.CYAN}[?] ENTER PACKAGE NAME: {UI.RESET}"
    ).strip()

    if not pkg:

        print(f"{UI.RED}[!] INVALID PACKAGE NAME{UI.RESET}")
        return

    # =========================
    # REPORT
    # =========================

    r_path = os.path.join(

        REPORTS_DIR,

        f"audit_{pkg}_{int(time.time())}.txt"

    )

    report = open(
        r_path,
        "a",
        encoding="utf-8"
    )

    # =========================
    # FILES
    # =========================

    all_files = [

        "backupcheck.js",
        "clipboardscan.js",
        "codetampering.js",
        "contentprovidercheck.js",
        "customkeyboardscan.js",
        "dbscan.js",
        "debugcheck.js",
        "downgradescan.js",
        "exportedcheck.js",
        "insecurestoragescan.js",
        "logcatcheck.js",
        "memoryscan.js",
        "memoryscan1.js",
        "memoryscan2.js",
        "rootcheck.js",
        "rootdetectbypass.js",
        "runtimeintegrity.js",
        "screenshotscan.js",
        "sslpinningscan.js",
        "tapjackingscan.js",
        "webviewscan.js"

    ]

    instructions = {

        "clipboardscan.js":
        "COPY TEXT TO CLIPBOARD",

        "logcatcheck.js":
        "GENERATE LOGS",

        "screenshotscan.js":
        "TAKE SCREENSHOT",

        "webviewscan.js":
        "OPEN WEBVIEW",

        "customkeyboardscan.js":
        "TYPE SOMETHING"

    }

    # =========================
    # SILENT WRAPPER
    # =========================

    silent_wrapper = """
    console.log = function(msg) {
        send(msg);
    };
    """

    # =========================
    # SETUP
    # =========================

    setup_device()

    threading.Thread(
        target=keep_device_awake,
        daemon=True
    ).start()

    # =========================
    # CONNECT
    # =========================

    if not connect_device():

        print(f"{UI.RED}[!] FAILED TO CONNECT DEVICE{UI.RESET}")
        return

    print(
        f"\n{UI.BLUE}[*] STARTING SCAN "
        f"({len(all_files)} SCRIPTS){UI.RESET}\n"
    )

    success_count = 0
    failed_count = 0

    # =========================
    # RUN
    # =========================

    for fname in all_files:
        # Get the friendly name from our dictionary, default to filename if not found
        display_name = FRIENDLY_NAMES.get(fname, fname)

        print(UI.BLUE + "="*50 + UI.RESET)
        print(f"{UI.BOLD}{UI.CYAN}[>] RUNNING: {display_name}{UI.RESET}")
        print(UI.BLUE + "="*50 + UI.RESET)

        ok = run_script(

            pkg,
            fname,
            report,
            silent_wrapper,
            instructions

        )

        if ok:
            success_count += 1
        else:
            failed_count += 1

    # =========================
    # LOGOUT PHASE
    # =========================

    logout_phase(
        pkg,
        report,
        silent_wrapper
    )

    # =========================
    # FINISH
    # =========================

    report.close()

    print("\n" + UI.BLUE + "="*60 + UI.RESET)
    print(f"              {UI.BOLD}{UI.GREEN}SCAN FINISHED{UI.RESET}")
    print(UI.BLUE + "="*60 + UI.RESET)

    print(f"{UI.GREEN}[+] SUCCESS: {success_count}{UI.RESET}")
    print(f"{UI.RED}[-] FAILED : {failed_count}{UI.RESET}")

    print(f"\n{UI.BOLD}[REPORT]{UI.RESET}")
    print(f"{UI.CYAN}{r_path}{UI.RESET}")

# =========================
# ENTRY
# =========================

if __name__ == "__main__":
    main()