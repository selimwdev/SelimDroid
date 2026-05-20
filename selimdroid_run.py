import os
import sys
import json
import time
import subprocess
from datetime import datetime

# كتم تحذيرات بايثون المستفزة عشان الكونسول يفضل نضيف
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

import google.generativeai as genai

# مكتبات ReportLab لتصميم الـ PDF الاحترافي عالي التنسيق
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

# =========================================================================
# 1. UI COLORS & LOGO
# =========================================================================
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

# =========================================================================
# 2. GET API KEY FROM USER
# =========================================================================
def get_gemini_key():
    print(UI.BLUE + "="*70 + UI.RESET)
    print(f"🔑 {UI.BOLD}{UI.CYAN}GEMINI AI REPORTING SETUP (100% Free & Safe){UI.RESET}")
    print(UI.BLUE + "="*70 + UI.RESET)
    print(" To generate a structured PDF executive report, we utilize the Gemini AI Free Tier.")
    print(f" {UI.YELLOW}Quick Step-by-Step Guide:{UI.RESET}")
    print("   1. Open: https://aistudio.google.com/")
    print("   2. Sign in with your ordinary Google/Gmail account.")
    print("   3. Hit the blue 'Create API Key' button on the left sidebar.")
    print("   4. Copy the newly generated key (Starts with 'AIzaSy').")
    print(" Note: The key stays entirely in memory during runtime and is never saved.")
    print(UI.BLUE + "="*70 + UI.RESET + "\n")
    
    key = input(f"{UI.BOLD}{UI.YELLOW}[?] Enter your Gemini API Key: {UI.RESET}").strip()
    if not key or not key.startswith("AIzaSy"):
        print(f"\n{UI.RED}[!] Invalid API Key format. It should start with 'AIzaSy'.{UI.RESET}")
        sys.exit(1)
    return key

# =========================================================================
# 3. COMPULSORY JSON SCHEMA FOR THE AI REPORT (With array for bullets)
# =========================================================================
report_schema = {
    "type": "object",
    "properties": {
        "package_name": {"type": "string"},
        "findings": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "severity": {"type": "string"},
                    "description": {"type": "string"},
                    "steps_to_reproduce": {
                        "type": "array",
                        "items": {"type": "string"}
                    },
                    "mitigation": {"type": "string"},
                    "impact": {"type": "string"}
                },
                "required": ["title", "severity", "description", "steps_to_reproduce", "mitigation", "impact"]
            }
        }
    },
    "required": ["package_name", "findings"]
}

# =========================================================================
# 4. AI LOG PARSING & PDF GENERATION ENGINE
# =========================================================================
def analyze_with_ai(txt_path, api_key):
    print(f"\n{UI.BLUE}[*] AI Analysis Engine started. Structuring data with Gemini...{UI.RESET}")
    with open(txt_path, 'r', encoding='utf-8') as f:
        logs = f.read()

    genai.configure(api_key=api_key)
    
    # الـ Prompt المطور: شرح استشاري رفيع وتجهيز الـ Steps كـ Array من أجل الـ Bullets
    prompt = f"""
    You are an elite Mobile Security Consultant. 
    Analyze this raw log output from a Frida-based DAST tool.
    
    EXECUTIVE REPORTING COMMANDS:
    1. Do NOT use or mention raw tool internal script names (e.g., do NOT mention 'scanafterlogout2.js' or explicit console log hooks).
    2. Translate the raw facts into a high-level executive narrative. Focus strictly on explaining what was found—for example, clarify that the user's explicit session details or identifiers remain actively persistent inside localized components or application logs even AFTER a formal logout action has been executed.
    3. Connect these findings directly to business risk, compliance standards, and privacy failures (OWASP Mobile Top 10 Insecure Data Storage, GDPR violations).
    4. Ensure sentences are beautifully articulated, clear, well-separated, and highly detailed to give a premium consulting feel.
    5. For 'steps_to_reproduce', output them strictly as a JSON array of distinct, sequential strings. Each string must represent a clean, human-designed verification step.

    Generate the final outcome containing strictly these 6 fields per verified finding:
    1. title: Polished, professional name
    2. severity: Strictly choose from (Critical, High, Medium, Low, Info)
    3. description: Comprehensive high-level executive explanation of what security flaw resides in the app.
    4. steps_to_reproduce: A JSON array of clear, step-by-step professional verification procedures.
    5. mitigation: Authoritative technical code instructions for developers to securely purge memory, keys, or local DB rows.
    6. impact: Strategic business and technical privacy consequences, highlighting data exposure and regulatory non-compliance.

    Raw Frida DAST Logs:
    {logs}
    """
    
    # محاولة استخدام الفلاش أولاً لسرعته، مع الالتزام بالـ Schema
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json", "response_schema": report_schema})
        return json.loads(response.text)
    except Exception:
        # Fallback لـ 1.5-pro إذا حدثت أي مشكلة
        model = genai.GenerativeModel('gemini-1.5-pro')
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json", "response_schema": report_schema})
        return json.loads(response.text)


def generate_pdf(data, output_pdf):
    print(f"{UI.BLUE}[*] Writing PDF layouts and applying custom theme styles...{UI.RESET}")
    
    # إعداد مستند بمسافات هوامش ممتازة تمنع الالتصاق حواف الورقة
    doc = SimpleDocTemplate(
        output_pdf, 
        pagesize=letter, 
        rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50
    )
    
    styles = getSampleStyleSheet()
    
    # لوحة ألوان Dark Corporate فخمة جداً للعميل
    PRIMARY_COLOR = colors.HexColor("#0F172A")   # كحلي غامق ملكي Slate 900
    SECONDARY_COLOR = colors.HexColor("#475569") # رمادي متناسق Slate 600
    BG_LIGHT = colors.HexColor("#F8FAFC")        # خلفية ناعمة جداً للصناديق والجداول
    
    severity_colors = {
        "Critical": colors.HexColor("#991B1B"), 
        "High": colors.HexColor("#C2410C"),     
        "Medium": colors.HexColor("#D97706"),   
        "Low": colors.HexColor("#1D4ED8"),      
        "Info": colors.HexColor("#64748B")      
    }

    # ضبط هندسة الـ Typography والمسافات الرأسية
    title_style = ParagraphStyle('CoverTitle', parent=styles['Title'], fontSize=26, leading=34, textColor=PRIMARY_COLOR, alignment=0, spaceAfter=25)
    subtitle_style = ParagraphStyle('CoverSubtitle', parent=styles['Normal'], fontSize=12, leading=18, textColor=SECONDARY_COLOR)
    
    h1_style = ParagraphStyle('Heading1_Custom', parent=styles['Heading1'], fontSize=22, leading=28, textColor=PRIMARY_COLOR, spaceBefore=35, spaceAfter=20, keepWithNext=True)
    h2_style = ParagraphStyle('Heading2_Custom', parent=styles['Heading2'], fontSize=15, leading=22, textColor=PRIMARY_COLOR, spaceBefore=30, spaceAfter=15, keepWithNext=True)
    
    # الشرح متباعد ومريح لمنع الكتل المتكدسة
    body_style = ParagraphStyle('Body_Custom', parent=styles['BodyText'], fontSize=10.5, leading=17, textColor=colors.HexColor("#334155"), spaceAfter=16)
    
    # عناوين الأقسام الستة (بولد ومنفصلة)
    label_style = ParagraphStyle('Label_Custom', parent=styles['BodyText'], fontSize=11, leading=16, textColor=PRIMARY_COLOR, fontName='Helvetica-Bold', spaceBefore=18, spaceAfter=8, keepWithNext=True)
    
    # ستايل الـ Bullets والـ Steps داخل الصندوق الرمادي
    bullet_style = ParagraphStyle('Bullet_Custom', parent=styles['Normal'], fontName='Courier', fontSize=10, leading=16, textColor=colors.HexColor("#1E293B"), spaceAfter=8)

    story = []

    # ------------------ [1] صفحة الغلاف (Cover Page) ------------------
    story.append(Spacer(1, 80))
    story.append(Paragraph("<b>MOBILE APPLICATION PENETRATION TESTING REPORT</b>", title_style))
    
    line_decor = Table([[""]], colWidths=[510])
    line_decor.setStyle(TableStyle([('LINEBELOW', (0,0), (-1,-1), 4, PRIMARY_COLOR)]))
    story.append(line_decor)
    story.append(Spacer(1, 25))
    
    story.append(Paragraph(f"Target Package: <b>{data.get('package_name', 'Unknown')}</b>", subtitle_style))
    story.append(Spacer(1, 140))
    
    metadata = [
        [Paragraph(f"<b>Assessment Engine:</b> SelimDroid DAST v1.0", body_style)],
        [Paragraph(f"<b>Generated By:</b> Gemini Security Intelligence", body_style)],
        [Paragraph(f"<b>Date:</b> {datetime.now().strftime('%Y-%m-%d %H:%M')}", body_style)],
        [Paragraph(f"<b>Status:</b> Confidential - Executive Report", body_style)]
    ]
    t_meta = Table(metadata, colWidths=[400])
    t_meta.setStyle(TableStyle([
        ('LINELEFT', (0,0), (0,-1), 3, PRIMARY_COLOR),
        ('LEFTPADDING', (0,0), (-1,-1), 15),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6)
    ]))
    story.append(t_meta)
    story.append(PageBreak())

    # ------------------ [2] الملخص التنفيذي (Executive Summary) ------------------
    story.append(Paragraph("Executive Summary", h1_style))
    story.append(Paragraph("This assessment report outlines the strategic security findings discovered during the automated dynamic application security testing (DAST) phase. The evaluation focuses heavily on regulatory compliance, data privacy standards, and secure runtime behaviors. Technical telemetry has been analyzed and translated into high-level risk contexts.", body_style))
    story.append(Spacer(1, 15))

    story.append(Paragraph("Vulnerability Summary Overview", h2_style))
    summary_table_data = [["Vulnerability Findings", "Severity"]]
    
    for f in data.get('findings', []):
        summary_table_data.append([f['title'], f['severity']])
    
    if not data.get('findings'):
        summary_table_data.append(["No verified vulnerabilities identified during this assessment cycle.", "N/A"])

    t_summary = Table(summary_table_data, colWidths=[370, 140])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_COLOR),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT])
    ]))
    story.append(t_summary)
    story.append(PageBreak())

    # ------------------ [3] التفاصيل الكاملة للثغرات ------------------
    story.append(Paragraph("Detailed Vulnerability Findings", h1_style))
    story.append(Spacer(1, 10))

    for idx, f in enumerate(data.get('findings', []), start=1):
        vuln_block = []
        sev = f.get('severity', 'Info')
        sev_color = severity_colors.get(sev, PRIMARY_COLOR)
        
        # عنوان الثغرة
        vuln_block.append(Paragraph(f"<b>{idx}. {f['title']}</b>", h2_style))
        vuln_block.append(Spacer(1, 5))
        
        # شارة مستوى الخطورة
        sev_badge = Table([[f"Severity: {sev}"]], colWidths=[140])
        sev_badge.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), sev_color),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.white),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
        ]))
        vuln_block.append(sev_badge)
        vuln_block.append(Spacer(1, 15)) 
        
        # 1. قسم الـ Description
        vuln_block.append(Paragraph("Description", label_style))
        vuln_block.append(Paragraph(f.get('description', ''), body_style))
        
        # 2. قسم الـ Steps to Reproduce (توليد الـ Bullets الحقيقية المتباعدة)
        vuln_block.append(Paragraph("Steps to Reproduce", label_style))
        steps_paragraphs = []
        for step_idx, step_text in enumerate(f.get('steps_to_reproduce', []), start=1):
            steps_paragraphs.append([Paragraph(f"<b>{step_idx}.</b> {step_text}", bullet_style)])
        
        # صندوق الـ Steps المرتاح بحشو واسع (Padding 14) لمنع الالتصاق
        code_box = Table(steps_paragraphs, colWidths=[490])
        code_box.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")), 
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),   
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 14),
            ('RIGHTPADDING', (0,0), (-1,-1), 14),
        ]))
        vuln_block.append(code_box)
        vuln_block.append(Spacer(1, 12))
        
        # 3. قسم الـ Impact & Risk
        vuln_block.append(Paragraph("Impact & Compliance Risk", label_style))
        vuln_block.append(Paragraph(f.get('impact', ''), body_style))
        
        # 4. قسم الـ Remediation & Mitigation
        vuln_block.append(Paragraph("Remediation & Mitigation", label_style))
        vuln_block.append(Paragraph(f.get('mitigation', ''), body_style))
        
        # خط فاصل هادئ وأنيق أسفل كل ثغرة
        vuln_block.append(Spacer(1, 25))
        sep_line = Table([[""]], colWidths=[510])
        sep_line.setStyle(TableStyle([('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1"))]))
        vuln_block.append(sep_line)
        vuln_block.append(Spacer(1, 30))
        
        # إجبار كامل البلوك على البقاء معاً في صفحة واحدة مالم ينفد حجمها
        story.append(KeepTogether(vuln_block))

    doc.build(story)
    print(f"{UI.GREEN}[+] PDF Report successfully exported to: {output_pdf}{UI.RESET}")

# =========================================================================
# 5. ORCHESTRATION & EXECUTIVE RUNNER
# =========================================================================
def main():
    show_logo()
    
    # 1. استقبال الـ API Key التفاعلي
    api_key = get_gemini_key()
    
    target_script = "selimdroid.py"
    if not os.path.exists(target_script):
        print(f"{UI.RED}[!] Core Engine script '{target_script}' not found in current directory!{UI.RESET}")
        return

    print(f"\n{UI.BLUE}[*] Launching Core Analysis Engine...{UI.RESET}")
    print(f"{UI.YELLOW}[!] Enter the package name when the engine requests it below.{UI.RESET}\n")
    
    # 2. تشغيل السكربت الأصلي في كونسول تفاعلي بالكامل لمنع الـ EOF
    try:
        process = subprocess.run([sys.executable, target_script], check=True)
    except subprocess.CalledProcessError:
        print(f"\n{UI.RED}[!] Core Engine exited with an error. Aborting PDF generation.{UI.RESET}")
        return

    # 3. لقط أحدث ملف تكست تم توليده داخل فولدر reports
    reports_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reports")
    if not os.path.exists(reports_dir) or not os.listdir(reports_dir):
        print(f"{UI.RED}[!] No reports found in 'reports/' folder. Cannot generate PDF.{UI.RESET}")
        return

    matching_files = [os.path.join(reports_dir, f) for f in os.listdir(reports_dir) if f.endswith(".txt")]
    if not matching_files:
        print(f"{UI.RED}[!] No raw log (.txt) files found to analyze.{UI.RESET}")
        return
        
    latest_txt_report = max(matching_files, key=os.path.getmtime)
    print(f"\n{UI.GREEN}[+] Target log file captured successfully:{UI.RESET} {latest_txt_report}")

    # 4. تشغيل الـ AI والـ PDF Maker عالي الجودة والتباعد
    print("\n" + UI.BLUE + "="*60 + UI.RESET)
    print(f"🌟 {UI.BOLD}{UI.MAGENTA}STARTING AUTOMATED EXECUTIVE PDF GENERATION{UI.RESET}")
    print(UI.BLUE + "="*60 + UI.RESET)
    
    try:
        ai_data = analyze_with_ai(latest_txt_report, api_key)
        pdf_filename = latest_txt_report.replace(".txt", ".pdf").replace("audit_", "Executive_Report_")
        generate_pdf(ai_data, pdf_filename)
        
        print(f"\n🔥 {UI.BOLD}{UI.GREEN}ALL DONE SUCCESSFULLY!{UI.RESET}")
        print(f"📊 {UI.BOLD}Your executive document is waiting here:{UI.RESET} {UI.CYAN}{pdf_filename}{UI.RESET}\n")
    except Exception as e:
        print(f"\n{UI.RED}[-] AI Automation Error during compilation: {e}{UI.RESET}")

if __name__ == "__main__":
    main()
