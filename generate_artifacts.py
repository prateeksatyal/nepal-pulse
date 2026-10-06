import os
import json
import math
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

METADATA_FILE = "captured_metadata.json"
INDEX_FILE = "WarrantyFlow_UI_Index.txt"
CONTACT_SHEET = "WarrantyFlow_UI_ContactSheet.png"
CATALOGUE_PDF = "WarrantyFlow_UI_Catalogue.pdf"

def generate_index_txt(records):
    print("Generating WarrantyFlow_UI_Index.txt...")
    lines = []
    lines.append("=" * 115)
    lines.append("WARRANTYFLOW — COMPLETE UI/UX FRONTEND SCREENSHOT SPECIFICATION INDEX")
    lines.append("=" * 115)
    lines.append(f"Total Screens Captured: {len(records)}")
    lines.append("Standard Resolution: 1440x900 (Desktop)")
    lines.append("Responsive Breakpoints: 1280x800 (Laptop), 1024x768 (Small Desktop), 768x1024 (Tablet), 390x844 (Mobile)")
    lines.append("Roles Evaluated: Public / Guest, Standard User (Alex Johnson), Administrator (System Administrator)")
    lines.append("-" * 115)
    lines.append(f"{'#':<4} | {'CATEGORY':<14} | {'VIEWPORT':<10} | {'ROUTE':<22} | {'SCREEN NAME':<32} | {'FILENAME'}")
    lines.append("-" * 115)

    for r in records:
        rel_path = os.path.relpath(r["file"], start=os.getcwd()).replace("\\", "/")
        lines.append(f"{r['num']:<4} | {r['category']:<14} | {r['viewport']:<10} | {r['route']:<22} | {r['name']:<32} | {rel_path}")

    lines.append("-" * 115)
    lines.append("\nDETAILED SCREEN DESCRIPTIONS & STATE INVENTORY:")
    lines.append("=" * 115)
    for r in records:
        rel_path = os.path.relpath(r["file"], start=os.getcwd()).replace("\\", "/")
        lines.append(f"[{r['num']:02d}] {r['name']} ({r['category']})")
        lines.append(f"     Route:       {r['route']}")
        lines.append(f"     Viewport:    {r['viewport']}")
        lines.append(f"     State/Notes: {r['state']}")
        lines.append(f"     File:        {rel_path}\n")

    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Generated {INDEX_FILE}")

def generate_contact_sheet(records):
    print("Generating WarrantyFlow_UI_ContactSheet.png...")
    # Filter primary screens (Public, User, Admin, States)
    primary_records = [r for r in records if r["category"] != "Responsive"]
    if not primary_records:
        primary_records = records[:36]

    cols = 4
    rows = math.ceil(len(primary_records) / cols)

    thumb_w = 460
    thumb_h = 280
    pad = 20
    header_h = 42

    cell_w = thumb_w + pad
    cell_h = thumb_h + header_h + pad

    total_w = cols * cell_w + pad
    total_h = rows * cell_h + pad + 100

    sheet = Image.new("RGB", (total_w, total_h), color=(15, 23, 42)) # Slate 900
    draw = ImageDraw.Draw(sheet)

    # Header title
    try:
        font_title = ImageFont.truetype("arial.ttf", 32)
        font_sub = ImageFont.truetype("arial.ttf", 16)
        font_card = ImageFont.truetype("arial.ttf", 14)
        font_route = ImageFont.truetype("arial.ttf", 12)
    except:
        font_title = font_sub = font_card = font_route = ImageFont.load_default()

    draw.text((pad, 25), "WARRANTYFLOW — SYSTEM UI/UX CONTACT SHEET", fill=(248, 250, 252), font=font_title)
    draw.text((pad, 65), f"Primary Desktop Architecture & State Overview (1440x900) — Total Primary Screens: {len(primary_records)}", fill=(148, 163, 184), font=font_sub)

    for idx, r in enumerate(primary_records):
        c = idx % cols
        row_idx = idx // cols

        x = pad + c * cell_w
        y = 100 + pad + row_idx * cell_h

        # Card container
        draw.rectangle([x, y, x + thumb_w, y + thumb_h + header_h], fill=(30, 41, 59), outline=(51, 65, 85), width=1)

        # Card Header text
        title_text = f"#{r['num']:02d} {r['name']}"
        if len(title_text) > 38:
            title_text = title_text[:35] + "..."
        draw.text((x + 10, y + 8), title_text, fill=(241, 245, 249), font=font_card)
        draw.text((x + 10, y + 25), f"{r['route']} | {r['category']}", fill=(15, 107, 104), font=font_route)

        # Thumbnail image
        img_path = r["file"]
        if os.path.exists(img_path):
            try:
                with Image.open(img_path) as im:
                    # Crop top if full page is very tall or resize with cover
                    src_w, src_h = im.size
                    target_ratio = thumb_w / thumb_h
                    curr_ratio = src_w / src_h

                    if curr_ratio < target_ratio:
                        # Tall page: take top portion
                        crop_box = (0, 0, src_w, int(src_w / target_ratio))
                        cropped = im.crop(crop_box)
                    else:
                        crop_box = (0, 0, int(src_h * target_ratio), src_h)
                        cropped = im.crop(crop_box)

                    thumb = cropped.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
                    sheet.paste(thumb, (x, y + header_h))
            except Exception as e:
                print(f"Error loading image {img_path}:", e)

    sheet.save(CONTACT_SHEET, quality=95)
    print(f"Generated {CONTACT_SHEET} ({total_w}x{total_h})")

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 570, "WarrantyFlow — UI/UX Specification & Design Reference")
            self.drawRightString(738, 570, "Confidential & Academic Submission Reference")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.75)
            self.line(54, 564, 738, 564)

        # Footer
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(54, 45, 738, 45)
        self.drawString(54, 32, "WarrantyFlow Design System — Muse AI & Figma Blueprint")
        self.drawRightString(738, 32, f"Page {self._pageNumber} of {total_pages}")
        self.restoreState()

def generate_pdf_catalogue(records):
    print("Generating WarrantyFlow_UI_Catalogue.pdf...")
    doc = SimpleDocTemplate(
        CATALOGUE_PDF,
        pagesize=landscape(letter),
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=colors.HexColor("#0F6B68"),
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=colors.HexColor("#334155"),
        spaceAfter=20
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=14,
        spaceAfter=10
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569")
    )

    badge_style = ParagraphStyle(
        'Badge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0F6B68")
    )

    story = []

    # COVER PAGE
    story.append(Spacer(1, 40))
    story.append(Paragraph("WarrantyFlow — System Interface Catalogue", title_style))
    story.append(Paragraph("Complete High-Fidelity UI/UX Specification Library for Figma & Muse AI Recreation", subtitle_style))
    story.append(Spacer(1, 15))

    meta_table_data = [
        [Paragraph("<b>Application:</b> WarrantyFlow Management System", body_style), Paragraph(f"<b>Total Screen Captures:</b> {len(records)}", body_style)],
        [Paragraph("<b>Primary Viewport:</b> 1440 × 900 (Desktop High-DPI)", body_style), Paragraph("<b>Breakpoints:</b> 1280x800, 1024x768, 768x1024, 390x844", body_style)],
        [Paragraph("<b>Standard User:</b> Alex Johnson (Role: user)", body_style), Paragraph("<b>Administrator:</b> System Administrator (Role: admin)", body_style)],
        [Paragraph("<b>Design Tone:</b> Enterprise Clean SaaS (Deep Teal & Clean Gray)", body_style), Paragraph("<b>Status:</b> Production Final State Verified", body_style)]
    ]
    t = Table(meta_table_data, colWidths=[340, 340])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t)
    story.append(Spacer(1, 30))

    story.append(Paragraph("Executive Design Overview & Specifications", h2_style))
    summary_text = (
        "This visual catalogue contains comprehensive, zero-chrome screenshots of every page, modal, "
        "interactive state, and responsive viewport within WarrantyFlow. Captured directly from the "
        "running application with seeded database records, this package establishes an unambiguous source "
        "of truth for design token extraction, layout hierarchy verification, and Figma component recreation."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(PageBreak())

    # SCREEN PAGES
    # Display 1 screen per page with high detail and metadata card
    for r in records:
        img_path = r["file"]
        if not os.path.exists(img_path):
            continue

        screen_box = [
            [
                Paragraph(f"<b>#{r['num']:02d} — {r['name']}</b>", ParagraphStyle('ScTitle', fontName='Helvetica-Bold', fontSize=13, textColor=colors.HexColor("#0F172A"))),
                Paragraph(f"<b>Category:</b> {r['category']} &nbsp;|&nbsp; <b>Route:</b> <font color='#0F6B68'>{r['route']}</font> &nbsp;|&nbsp; <b>Resolution:</b> {r['viewport']}", ParagraphStyle('ScMeta', fontName='Helvetica', fontSize=9, textColor=colors.HexColor("#475569")))
            ],
            [
                Paragraph(f"<b>State & Features:</b> {r['state']}", ParagraphStyle('ScState', fontName='Helvetica', fontSize=9, textColor=colors.HexColor("#334155"))),
                Paragraph(f"<b>File:</b> {os.path.basename(r['file'])}", ParagraphStyle('ScFile', fontName='Helvetica', fontSize=8, textColor=colors.HexColor("#64748B")))
            ]
        ]
        meta_t = Table(screen_box, colWidths=[400, 280])
        meta_t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))

        story.append(meta_t)
        story.append(Spacer(1, 8))

        # Add Screenshot image scaled to fit letter landscape height nicely
        # Available width ~ 684pt, height ~ 440pt
        try:
            with Image.open(img_path) as im:
                orig_w, orig_h = im.size
                max_w = 684
                max_h = 445

                scale = min(max_w / orig_w, max_h / orig_h)
                render_w = orig_w * scale
                render_h = orig_h * scale

                rl_img = RLImage(img_path, width=render_w, height=render_h)
                story.append(rl_img)
        except Exception as e:
            story.append(Paragraph(f"Error rendering image: {e}", body_style))

        story.append(PageBreak())

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated {CATALOGUE_PDF}")

if __name__ == "__main__":
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, "r", encoding="utf-8") as f:
            records = json.load(f)
        generate_index_txt(records)
        generate_contact_sheet(records)
        generate_pdf_catalogue(records)
    else:
        print(f"Metadata file {METADATA_FILE} not found yet.")
