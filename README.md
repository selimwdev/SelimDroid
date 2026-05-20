<img width="200" height="200" alt="fb24243e-c5a9-4849-b278-75b33297d2c6" src="https://github.com/user-attachments/assets/2378873f-3ae5-4e86-ab54-d0bf24713b64" />


# SELIMDROID

Dynamic Application Security Testing (DAST) Framework for Android Applications.

SELIMDROID is an offensive mobile security framework designed to automate runtime security analysis for Android applications using Frida and ADB.

The framework focuses on real-world mobile attack surfaces including insecure storage, runtime tampering, SSL pinning, root detection bypasses, session persistence, memory inspection, and post-logout validation.

---

# Features

* Fully automated Android DAST workflow
* Runtime security analysis using Frida
* Interactive testing for user-driven attack scenarios
* Isolated post-logout security validation
* Automated root detection bypass
* Automated SSL pinning bypass
* Runtime integrity and tampering checks
* Memory, SQLite, and Shared Preferences inspection
* Unified vulnerability reporting
* Retry/reconnect handling for unstable Frida sessions
* Open Source

---

# Security Checks

## Data Leakage & Insecure Storage

* Android Backup Security Check
* Application Downgrade Validation
* Logcat Sensitive Data Leakage Scan
* Insecure Storage Audit
* SQLite Database Inspection
* Clipboard Leakage Detection
* Custom Keyboard Monitoring

## Runtime Defenses & Anti-Tampering

* Debuggable State Detection
* Runtime Integrity Verification
* Code Tampering Detection
* Root Detection Analysis
* Root Detection Bypass
* SSL Pinning Detection
* SSL Pinning Bypass

## Components & UI Security

* Exported Components Enumeration
* Content Provider Security Audit
* Screenshot Protection Validation
* WebView Security Analysis
* Tapjacking / Overlay Detection

## Isolated Post-Logout Validation

* Memory Inspection after Logout
* Shared Preferences Validation
* Database Validation
* Session Persistence Analysis
* Token Revocation Verification

---

# Requirements

* Python 3.9+
* Frida
* Frida Server
* Android Debug Bridge (ADB)
* Rooted Android Device or Emulator
* USB Debugging Enabled

---

# Installation

```bash
git clone https://github.com/selimwdev/SelimDroid.git

cd SelimDroid

pip install -r requirements.txt
```

---

# Setup

Start ADB:

```bash
adb start-server
```

Push and start Frida Server on the Android device:

```bash
adb push frida-server /data/local/tmp/

adb shell "chmod +x /data/local/tmp/frida-server"

adb shell "/data/local/tmp/frida-server &"
```

Verify Frida connection:

```bash
frida-ps -U
```

---

# Usage

Run SelimDroid:

```bash
python selimdroid.py
```

Enter the target package name:

```bash
com.example.app
```

The framework will automatically:

* Spawn the application
* Attach Frida hooks
* Execute runtime security checks
* Request interactive actions when needed
* Generate a consolidated security report

---

# Interactive Checks

Some modules require manual interaction during runtime analysis.

Examples include:

* Clipboard testing
* Screenshot validation
* WebView interaction
* Custom keyboard testing
* Tapjacking validation
* Login / Logout workflows

SELIMDROID will prompt the tester when interaction is required.

---

# Reporting

SELIMDROID generates a unified audit report containing:

* Runtime findings
* Sensitive data leaks
* Security misconfigurations
* Session persistence issues
* Runtime bypass results
* Post-logout artifacts

Reports are stored inside:

```bash
/reports/
```

---

# Architecture

```text
SELIMDROID/
│
├── scripts/
├── reports/
├── selimdroid.py
├── requirements.txt
└── README.md
```



# Disclaimer

SELIMDROID is intended for:

* Authorized penetration testing
* Security research
* Educational purposes
* Defensive security assessments

Do not use this framework against applications or systems without explicit authorization.

The author is not responsible for misuse or illegal activities performed using this tool.

---

# Author

Mohamed Selim

Cybersecurity Engineer | Mobile Application Security Researcher

---

# License

MIT License
