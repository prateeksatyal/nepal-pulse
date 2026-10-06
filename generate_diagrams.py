import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle, Polygon, Wedge
import matplotlib.lines as mlines

# Output directory in workspace
OUTPUT_DIR = os.getcwd()
IMAGE_ERD = os.path.join(OUTPUT_DIR, "WarrantyFlow_ERD.png")
IMAGE_USECASE = os.path.join(OUTPUT_DIR, "WarrantyFlow_UseCase_Diagram.png")
IMAGE_FLOWCHART = os.path.join(OUTPUT_DIR, "WarrantyFlow_System_Flowchart.png")

# Palette constants matching WarrantyFlow
COLOR_NAVY = "#101827"
COLOR_TEAL = "#0F6B68"
COLOR_TEAL_HOVER = "#0B5754"
COLOR_LIGHT_BG = "#F8FAF9"
COLOR_CARD_BG = "#FFFFFF"
COLOR_BORDER = "#CBD5E1"
COLOR_BORDER_STRONG = "#64748B"
COLOR_TEXT = "#0F172A"
COLOR_TEXT_MUTED = "#475569"
COLOR_PK = "#B45309"
COLOR_FK = "#0369A1"
COLOR_ACCENT = "#2563EB"

# ==============================================================================
# DIAGRAM 1: ENTITY RELATIONSHIP DIAGRAM (ERD)
# ==============================================================================
def draw_erd():
    fig, ax = plt.subplots(figsize=(24, 16), dpi=300)
    ax.set_xlim(0, 240)
    ax.set_ylim(0, 160)
    ax.axis("off")
    fig.patch.set_facecolor("#FFFFFF")

    # Diagram Title Header
    ax.text(120, 154, "WarrantyFlow — Entity Relationship Diagram (ERD)", 
            ha="center", va="center", fontsize=20, fontweight="bold", color=COLOR_NAVY, fontfamily="sans-serif")
    ax.text(120, 149.5, "Physical Database Schema Specification • PostgreSQL Relational Architecture", 
            ha="center", va="center", fontsize=11, color=COLOR_TEAL, fontfamily="sans-serif")
    
    # Legend Box at bottom right
    leg_x, leg_y = 175, 8
    ax.add_patch(FancyBboxPatch((leg_x, leg_y), 58, 14, boxstyle="round,pad=0.5,rounding_size=1.5", 
                                facecolor="#F1F5F9", edgecolor="#CBD5E1", lw=1.2))
    ax.text(leg_x + 29, leg_y + 11.5, "ERD Cardinality & Attribute Legend", ha="center", va="center", 
            fontsize=9.5, fontweight="bold", color=COLOR_NAVY)
    ax.text(leg_x + 4, leg_y + 7.5, "[PK] Primary Key", fontsize=8.5, fontweight="bold", color=COLOR_PK)
    ax.text(leg_x + 22, leg_y + 7.5, "[FK] Foreign Key", fontsize=8.5, fontweight="bold", color=COLOR_FK)
    ax.text(leg_x + 40, leg_y + 7.5, "1 : N One-to-Many", fontsize=8.5, fontweight="bold", color=COLOR_NAVY)
    ax.text(leg_x + 4, leg_y + 3.5, "* Note: Warranty status is dynamically calculated from end_date (not stored).", 
            fontsize=7.5, color=COLOR_TEXT_MUTED, style="italic")

    # Helper function to draw an Entity Table Box
    def draw_entity(x, y, width, entity_name, pk_attrs, fk_attrs, regular_attrs):
        total_rows = len(pk_attrs) + len(fk_attrs) + len(regular_attrs)
        header_h = 4.5
        row_h = 2.4
        box_h = header_h + (total_rows * row_h) + 1.5

        # Outer container
        rect = FancyBboxPatch((x, y - box_h), width, box_h, boxstyle="round,pad=0.2,rounding_size=1.2",
                              facecolor=COLOR_CARD_BG, edgecolor=COLOR_BORDER_STRONG, lw=1.5)
        ax.add_patch(rect)

        # Header background
        header_rect = FancyBboxPatch((x, y - header_h), width, header_h, boxstyle="round,pad=0.2,rounding_size=1.2",
                                     facecolor=COLOR_TEAL, edgecolor=COLOR_TEAL, lw=1)
        ax.add_patch(header_rect)
        # Patch bottom corners of header to be square
        ax.add_patch(patches.Rectangle((x, y - header_h), width, 1.5, facecolor=COLOR_TEAL, edgecolor=COLOR_TEAL))
        
        # Entity Title
        ax.text(x + width/2, y - header_h/2, entity_name.upper(), ha="center", va="center", 
                fontsize=11, fontweight="bold", color="#FFFFFF", fontfamily="sans-serif")

        curr_y = y - header_h - 1.5
        # Primary keys
        for attr in pk_attrs:
            ax.text(x + 2, curr_y, "PK", fontsize=8, fontweight="bold", color=COLOR_PK, fontfamily="monospace")
            ax.text(x + 7, curr_y, attr[0], fontsize=8.5, fontweight="bold", color=COLOR_TEXT, fontfamily="sans-serif")
            ax.text(x + width - 2, curr_y, attr[1], fontsize=7.5, color=COLOR_TEXT_MUTED, ha="right", fontfamily="monospace")
            curr_y -= row_h
        
        # Foreign keys
        for attr in fk_attrs:
            ax.text(x + 2, curr_y, "FK", fontsize=8, fontweight="bold", color=COLOR_FK, fontfamily="monospace")
            ax.text(x + 7, curr_y, attr[0], fontsize=8.5, fontweight="semibold", color=COLOR_TEXT, fontfamily="sans-serif")
            ax.text(x + width - 2, curr_y, attr[1], fontsize=7.5, color=COLOR_TEXT_MUTED, ha="right", fontfamily="monospace")
            curr_y -= row_h

        # Regular attributes
        for attr in regular_attrs:
            ax.text(x + 2, curr_y, "•", fontsize=9, color=COLOR_BORDER_STRONG)
            ax.text(x + 7, curr_y, attr[0], fontsize=8.5, color=COLOR_TEXT, fontfamily="sans-serif")
            ax.text(x + width - 2, curr_y, attr[1], fontsize=7.5, color=COLOR_TEXT_MUTED, ha="right", fontfamily="monospace")
            curr_y -= row_h

        return (x, y - box_h, width, box_h)

    # Place entities
    # 1. Users (Top Left)
    e_users = draw_entity(
        x=15, y=140, width=42,
        entity_name="Users",
        pk_attrs=[("id", "INTEGER")],
        fk_attrs=[],
        regular_attrs=[
            ("name", "VARCHAR(255)"),
            ("email", "VARCHAR(255)"),
            ("password", "VARCHAR(255)"),
            ("role", "VARCHAR(50)"),
            ("created_at", "TIMESTAMP")
        ]
    )

    # 2. Categories (Bottom Left)
    e_categories = draw_entity(
        x=15, y=70, width=42,
        entity_name="Categories",
        pk_attrs=[("id", "INTEGER")],
        fk_attrs=[],
        regular_attrs=[
            ("name", "VARCHAR(255)"),
            ("created_at", "TIMESTAMP")
        ]
    )

    # 3. Products (Center)
    e_products = draw_entity(
        x=82, y=120, width=48,
        entity_name="Products",
        pk_attrs=[("id", "INTEGER")],
        fk_attrs=[
            ("user_id", "INTEGER"),
            ("category_id", "INTEGER")
        ],
        regular_attrs=[
            ("name", "VARCHAR(255)"),
            ("brand", "VARCHAR(255)"),
            ("model", "VARCHAR(255)"),
            ("serial_number", "VARCHAR(255)"),
            ("purchase_date", "DATE"),
            ("purchase_price", "NUMERIC(10,2)"),
            ("notes", "TEXT"),
            ("created_at", "TIMESTAMP")
        ]
    )

    # 4. Warranties (Top Center-Right)
    e_warranties = draw_entity(
        x=155, y=140, width=48,
        entity_name="Warranties",
        pk_attrs=[("id", "INTEGER")],
        fk_attrs=[("product_id", "INTEGER")],
        regular_attrs=[
            ("provider", "VARCHAR(255)"),
            ("warranty_type", "VARCHAR(100)"),
            ("start_date", "DATE"),
            ("end_date", "DATE"),
            ("coverage_details", "TEXT"),
            ("created_at", "TIMESTAMP")
        ]
    )

    # 5. Receipts (Bottom Center)
    e_receipts = draw_entity(
        x=82, y=36, width=48,
        entity_name="Receipts",
        pk_attrs=[("id", "INTEGER")],
        fk_attrs=[("product_id", "INTEGER")],
        regular_attrs=[
            ("file_name", "VARCHAR(255)"),
            ("file_path", "TEXT"),
            ("file_size", "INTEGER"),
            ("uploaded_at", "TIMESTAMP")
        ]
    )

    # 6. Warranty_Documents (Top Far-Right)
    e_wdocs = draw_entity(
        x=155, y=55, width=48,
        entity_name="Warranty_Documents",
        pk_attrs=[("id", "INTEGER")],
        fk_attrs=[("warranty_id", "INTEGER")],
        regular_attrs=[
            ("file_name", "VARCHAR(255)"),
            ("file_path", "TEXT"),
            ("file_size", "INTEGER"),
            ("uploaded_at", "TIMESTAMP")
        ]
    )

    # 7. Service_Records (Far Right Center)
    e_services = draw_entity(
        x=175, y=105, width=50,
        entity_name="Service_Records",
        pk_attrs=[("id", "INTEGER")],
        fk_attrs=[
            ("product_id", "INTEGER"),
            ("warranty_id (opt)", "INTEGER")
        ],
        regular_attrs=[
            ("service_date", "DATE"),
            ("service_center", "VARCHAR(255)"),
            ("description", "TEXT"),
            ("cost", "NUMERIC(10,2)"),
            ("notes", "TEXT"),
            ("created_at", "TIMESTAMP")
        ]
    )

    # Connector Helper with Orthogonal Lines and Crow's Foot / 1:N Notation
    def draw_rel(p1, p2, label, card1="1", card2="N", color="#1E293B", style="-"):
        # Draw elbow path between p1 and p2
        mid_x = (p1[0] + p2[0]) / 2
        ax.plot([p1[0], mid_x, mid_x, p2[0]], [p1[1], p1[1], p2[1], p2[1]], 
                color=color, lw=1.6, ls=style, zorder=2)
        
        # Circle / Crow's foot indicators
        # 1-side badge
        ax.text(p1[0] + (1.5 if p2[0] > p1[0] else -1.5), p1[1] + 1.2, card1, 
                fontsize=8.5, fontweight="bold", color=color, ha="center")
        # N-side badge
        ax.text(p2[0] + (-2.5 if p2[0] > p1[0] else 2.5), p2[1] + 1.2, card2, 
                fontsize=8.5, fontweight="bold", color=color, ha="center")
        
        # Relationship diamond / text badge in the middle
        badge_y = (p1[1] + p2[1]) / 2
        ax.text(mid_x, badge_y, f" {label} ", fontsize=7.5, fontweight="bold", color="#FFFFFF",
                ha="center", va="center", bbox=dict(boxstyle="round,pad=0.3", fc=color, ec="none", alpha=0.9), zorder=3)

    # 1. Users -> Products (1:N owns)
    draw_rel((57, 128), (82, 110), "owns", "1", "N", COLOR_NAVY)

    # 2. Categories -> Products (1:N categorizes)
    draw_rel((57, 60), (82, 90), "categorizes", "1", "N", COLOR_NAVY)

    # 3. Products -> Warranties (1:N has)
    draw_rel((130, 115), (155, 125), "has", "1", "N", COLOR_NAVY)

    # 4. Products -> Receipts (1:N has receipt)
    # Direct vertical down from Products bottom to Receipts top
    ax.plot([106, 106], [87.5, 36], color=COLOR_NAVY, lw=1.6, zorder=2)
    ax.text(106, 85, "1", fontsize=8.5, fontweight="bold", color=COLOR_NAVY, ha="left")
    ax.text(106, 38, "N", fontsize=8.5, fontweight="bold", color=COLOR_NAVY, ha="left")
    ax.text(106, 62, " has receipt ", fontsize=7.5, fontweight="bold", color="#FFFFFF",
            ha="center", va="center", bbox=dict(boxstyle="round,pad=0.3", fc=COLOR_NAVY, ec="none", alpha=0.9), zorder=3)

    # 5. Warranties -> Warranty_Documents (1:N has document)
    ax.plot([179, 179], [116.5, 55], color=COLOR_NAVY, lw=1.6, zorder=2)
    ax.text(179, 114, "1", fontsize=8.5, fontweight="bold", color=COLOR_NAVY, ha="left")
    ax.text(179, 57, "N", fontsize=8.5, fontweight="bold", color=COLOR_NAVY, ha="left")
    ax.text(179, 85, " has document ", fontsize=7.5, fontweight="bold", color="#FFFFFF",
            ha="center", va="center", bbox=dict(boxstyle="round,pad=0.3", fc=COLOR_NAVY, ec="none", alpha=0.9), zorder=3)

    # 6. Products -> Service_Records (1:N maintains)
    # Route: Products right -> under Warranties -> Service Records
    ax.plot([130, 142, 142, 175], [98, 98, 80, 80], color=COLOR_NAVY, lw=1.6, zorder=2)
    ax.text(133, 100, "1", fontsize=8.5, fontweight="bold", color=COLOR_NAVY)
    ax.text(171, 82, "N", fontsize=8.5, fontweight="bold", color=COLOR_NAVY)
    ax.text(142, 89, " maintains ", fontsize=7.5, fontweight="bold", color="#FFFFFF",
            ha="center", va="center", bbox=dict(boxstyle="round,pad=0.3", fc=COLOR_NAVY, ec="none", alpha=0.9), zorder=3)

    # 7. Warranties -> Service_Records (1:N optional covered by)
    # Route: Warranties right -> Service Records top right
    ax.plot([203, 215, 215, 205], [128, 128, 105, 105], color="#0284C7", lw=1.6, ls="--", zorder=2)
    ax.text(205, 130, "1", fontsize=8.5, fontweight="bold", color="#0284C7")
    ax.text(207, 107, "0..N (opt)", fontsize=8, fontweight="bold", color="#0284C7")
    ax.text(215, 116.5, " covered by (opt) ", fontsize=7.5, fontweight="bold", color="#FFFFFF",
            ha="center", va="center", bbox=dict(boxstyle="round,pad=0.3", fc="#0284C7", ec="none", alpha=0.9), zorder=3)

    plt.tight_layout()
    plt.savefig(IMAGE_ERD, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"Generated: {IMAGE_ERD}")


# ==============================================================================
# DIAGRAM 2: USE CASE DIAGRAM
# ==============================================================================
def draw_use_case():
    fig, ax = plt.subplots(figsize=(24, 16), dpi=300)
    ax.set_xlim(0, 240)
    ax.set_ylim(0, 160)
    ax.axis("off")
    fig.patch.set_facecolor("#FFFFFF")

    # Header
    ax.text(120, 154, "WarrantyFlow — UML Use Case Diagram", 
            ha="center", va="center", fontsize=20, fontweight="bold", color=COLOR_NAVY, fontfamily="sans-serif")
    ax.text(120, 149.5, "System Boundary Specification • Role-Based Access Control (Normal User vs Administrator)", 
            ha="center", va="center", fontsize=11, color=COLOR_TEAL, fontfamily="sans-serif")

    # System Boundary Box
    bound_x, bound_y, bound_w, bound_h = 55, 10, 130, 134
    system_box = FancyBboxPatch((bound_x, bound_y), bound_w, bound_h, boxstyle="round,pad=0.5,rounding_size=2",
                                facecolor="#F8FAFC", edgecolor=COLOR_BORDER_STRONG, lw=2.0, zorder=1)
    ax.add_patch(system_box)
    
    # Boundary Title
    ax.text(bound_x + bound_w / 2, bound_y + bound_h - 4, "WarrantyFlow Warranty Management System", 
            ha="center", va="center", fontsize=12, fontweight="bold", color=COLOR_NAVY)
    ax.plot([bound_x + 10, bound_x + bound_w - 10], [bound_y + bound_h - 7, bound_y + bound_h - 7], 
            color=COLOR_BORDER, lw=1)

    # Stick Figure Drawer
    def draw_actor(x, y, name, role_subtitle):
        # Head
        head = Circle((x, y + 6), radius=2.2, facecolor="#F1F5F9", edgecolor=COLOR_NAVY, lw=2, zorder=5)
        ax.add_patch(head)
        # Body
        ax.plot([x, x], [y + 3.8, y - 2.5], color=COLOR_NAVY, lw=2.2, zorder=5)
        # Arms
        ax.plot([x - 4, x + 4], [y + 1.5, y + 1.5], color=COLOR_NAVY, lw=2.2, zorder=5)
        # Legs
        ax.plot([x, x - 3.5], [y - 2.5, y - 8], color=COLOR_NAVY, lw=2.2, zorder=5)
        ax.plot([x, x + 3.5], [y - 2.5, y - 8], color=COLOR_NAVY, lw=2.2, zorder=5)
        # Labels
        ax.text(x, y - 11, name, ha="center", va="center", fontsize=11, fontweight="bold", color=COLOR_NAVY)
        ax.text(x, y - 14, role_subtitle, ha="center", va="center", fontsize=8.5, color=COLOR_TEAL, style="italic")

    # Actors
    draw_actor(28, 85, "Normal User", "e.g. Alex Johnson")
    draw_actor(212, 85, "Administrator", "e.g. System Admin")

    # Use Case Drawer
    use_case_registry = {}

    def draw_uc(key, cx, cy, text, w=22, h=5.5):
        ellipse = FancyBboxPatch((cx - w/2, cy - h/2), w, h, boxstyle="round,pad=0.2,rounding_size=2.8",
                                 facecolor="#FFFFFF", edgecolor=COLOR_TEAL, lw=1.5, zorder=3)
        ax.add_patch(ellipse)
        ax.text(cx, cy, text, ha="center", va="center", fontsize=8.5, fontweight="semibold", 
                color=COLOR_NAVY, zorder=4, multialignment="center")
        use_case_registry[key] = (cx, cy, w, h)

    # Normal User Use Cases (Left Column & Center)
    # Vertical distribution between y=18 and y=130
    normal_ucs = [
        ("reg", 85, 128, "Register Account"),
        ("signin", 120, 128, "Sign In"),
        ("signout", 120, 118, "Sign Out"),
        ("products", 85, 118, "Manage Products"),
        ("warranties", 85, 108, "Manage Warranties"),
        ("services", 85, 98, "Manage Service Records"),
        ("receipt", 85, 88, "Upload Purchase Receipt"),
        ("wdoc", 85, 78, "Upload Warranty Document"),
        ("search", 85, 68, "Search Products"),
        ("filter", 85, 58, "Filter & Sort Records"),
        ("status", 85, 48, "View Warranty Status\n(Active / Expiring / Expired)"),
        ("reminder", 85, 36, "Trigger Warranty Expiry\nReminder (Nodemailer)"),
    ]

    for key, cx, cy, label in normal_ucs:
        draw_uc(key, cx, cy, label, w=26, h=6.5 if "\n" in label else 5.2)

    # Administrator Use Cases (Right Column & Center)
    admin_ucs = [
        ("admin_users", 155, 112, "Manage Users\n(RBAC / Roles)"),
        ("admin_cats", 155, 98, "Manage Categories\n(Taxonomy CRUD)"),
        ("admin_prods", 155, 84, "View Products\n(All Accounts)"),
        ("admin_wars", 155, 70, "View Warranties\n(All Accounts)"),
        ("admin_srvs", 155, 56, "View Service Records\n(All Accounts)"),
        ("admin_docs", 155, 42, "Review Uploaded Documents\n(Receipts & Warranties)"),
    ]

    for key, cx, cy, label in admin_ucs:
        draw_uc(key, cx, cy, label, w=26, h=6.5 if "\n" in label else 5.2)

    # Connect Normal User (Actor at x=28, y=85) to Use Cases
    user_actor_pt = (33, 85)
    for key, _, _, _ in normal_ucs:
        uc_pt = use_case_registry[key]
        target_x = uc_pt[0] - uc_pt[2] / 2
        target_y = uc_pt[1]
        ax.plot([user_actor_pt[0], target_x], [user_actor_pt[1], target_y], 
                color="#475569", lw=1.3, zorder=2)

    # Connect Administrator (Actor at x=212, y=85) to Use Cases
    admin_actor_pt = (207, 85)
    # Admin connects to Sign In, Sign Out, and all admin-specific UCs
    admin_targets = ["signin", "signout", "admin_users", "admin_cats", "admin_prods", "admin_wars", "admin_srvs", "admin_docs"]
    for key in admin_targets:
        uc_pt = use_case_registry[key]
        target_x = uc_pt[0] + uc_pt[2] / 2
        target_y = uc_pt[1]
        ax.plot([admin_actor_pt[0], target_x], [admin_actor_pt[1], target_y], 
                color="#0F6B68", lw=1.3, ls="-", zorder=2)

    # Sub-note in boundary bottom
    ax.text(bound_x + bound_w / 2, bound_y + 3, 
            "* Security note: Trigger Warranty Expiry Reminder dispatches transactional notification via Nodemailer on-demand.",
            ha="center", va="center", fontsize=8, color=COLOR_TEXT_MUTED, style="italic")

    plt.tight_layout()
    plt.savefig(IMAGE_USECASE, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"Generated: {IMAGE_USECASE}")


# ==============================================================================
# DIAGRAM 3: SYSTEM FLOWCHART
# ==============================================================================
def draw_flowchart():
    fig, ax = plt.subplots(figsize=(20, 26), dpi=300)
    ax.set_xlim(0, 200)
    ax.set_ylim(0, 260)
    ax.axis("off")
    fig.patch.set_facecolor("#FFFFFF")

    # Title
    ax.text(100, 252, "WarrantyFlow — System Process Flowchart", 
            ha="center", va="center", fontsize=20, fontweight="bold", color=COLOR_NAVY, fontfamily="sans-serif")
    ax.text(100, 247, "End-to-End Operational Workflow • Authentication, Data Management, Validation & Alerting", 
            ha="center", va="center", fontsize=11, color=COLOR_TEAL, fontfamily="sans-serif")

    # Shape Drawing Primitives
    def draw_terminator(cx, cy, text, w=38, h=8):
        patch = FancyBboxPatch((cx - w/2, cy - h/2), w, h, boxstyle="round,pad=0.2,rounding_size=3.5",
                               facecolor="#1E293B", edgecolor="#0F172A", lw=1.5, zorder=3)
        ax.add_patch(patch)
        ax.text(cx, cy, text, ha="center", va="center", fontsize=11, fontweight="bold", color="#FFFFFF", zorder=4)
        return (cx, cy, w, h)

    def draw_process(cx, cy, text, subtext="", w=46, h=10):
        patch = FancyBboxPatch((cx - w/2, cy - h/2), w, h, boxstyle="round,pad=0.2,rounding_size=0.8",
                               facecolor="#FFFFFF", edgecolor=COLOR_TEAL, lw=1.6, zorder=3)
        ax.add_patch(patch)
        if subtext:
            ax.text(cx, cy + 1.8, text, ha="center", va="center", fontsize=10, fontweight="bold", color=COLOR_NAVY, zorder=4)
            ax.text(cx, cy - 2.2, subtext, ha="center", va="center", fontsize=8, color=COLOR_TEXT_MUTED, zorder=4, multialignment="center")
        else:
            ax.text(cx, cy, text, ha="center", va="center", fontsize=10, fontweight="bold", color=COLOR_NAVY, zorder=4, multialignment="center")
        return (cx, cy, w, h)

    def draw_decision(cx, cy, text, w=40, h=14):
        # Draw diamond using Polygon
        pts = [[cx, cy + h/2], [cx + w/2, cy], [cx, cy - h/2], [cx - w/2, cy]]
        diamond = Polygon(pts, closed=True, facecolor="#F0FDF4", edgecolor="#15803D", lw=1.8, zorder=3)
        ax.add_patch(diamond)
        ax.text(cx, cy, text, ha="center", va="center", fontsize=9.5, fontweight="bold", color="#166534", zorder=4, multialignment="center")
        return (cx, cy, w, h)

    def draw_arrow(start, end, label="", label_pos=(0,0)):
        ax.annotate("", xy=end, xytext=start,
                    arrowprops=dict(arrowstyle="-|>", color="#1E293B", lw=1.8, mutation_scale=15), zorder=2)
        if label:
            ax.text(label_pos[0], label_pos[1], label, fontsize=9, fontweight="bold", color="#B91C1C" if "No" in label else "#15803D",
                    bbox=dict(boxstyle="round,pad=0.2", fc="#FFFFFF", ec="none", alpha=0.9), zorder=5)

    # 1. Start
    n_start = draw_terminator(100, 236, "Start")

    # 2. Access WarrantyFlow
    n_access = draw_process(100, 218, "Access WarrantyFlow", "Navigate to Application Portal (Vite Client)")
    draw_arrow((100, 232), (100, 223))

    # 3. User Authentication
    n_auth = draw_process(100, 198, "User Authentication", "Login / Register with JWT Validation")
    draw_arrow((100, 213), (100, 203))

    # 4. Authorised Decision Diamond
    n_auth_dec = draw_decision(100, 178, "Authorised?")
    draw_arrow((100, 193), (100, 185))

    # Authorised? No -> Loop back to Authentication
    # Route: right side of diamond -> right margin -> back to User Authentication
    ax.plot([120, 138, 138, 123], [178, 178, 198, 198], color="#B91C1C", lw=1.6, ls="--", zorder=2)
    ax.annotate("", xy=(123, 198), xytext=(126, 198),
                arrowprops=dict(arrowstyle="-|>", color="#B91C1C", lw=1.6, mutation_scale=14), zorder=2)
    ax.text(126, 180, "No", fontsize=9, fontweight="bold", color="#B91C1C",
            bbox=dict(boxstyle="round,pad=0.2", fc="#FFFFFF", ec="none"), zorder=5)

    # Authorised? Yes -> Dashboard
    n_dash = draw_process(100, 155, "Dashboard", "Load User / Admin Dashboard Overview")
    draw_arrow((100, 171), (100, 160), label="Yes", label_pos=(102, 166))

    # 5. Choose System Function
    n_func = draw_process(100, 135, "Choose System Function", "Select Products / Warranties / Service / Documents")
    draw_arrow((100, 150), (100, 140))

    # 6. Enter or Edit Record Details
    n_entry = draw_process(100, 115, "Enter or Edit Record Details", "Fill Form Inputs & Attach Documents (Receipts/Certificates)")
    draw_arrow((100, 130), (100, 120))

    # 7. Validate Input & Uploaded Files
    n_val = draw_process(100, 95, "Validate Input & Uploaded Files", "Check Required Fields, Valid Formats, File Constraints")
    draw_arrow((100, 110), (100, 100))

    # 8. Valid Decision Diamond
    n_val_dec = draw_decision(100, 75, "Valid?")
    draw_arrow((100, 90), (100, 82))

    # Valid? No -> Loop back to Enter/Edit Details
    # Route: left side of diamond -> left margin -> back to Enter or Edit Record Details
    ax.plot([80, 62, 62, 77], [75, 75, 115, 115], color="#B91C1C", lw=1.6, ls="--", zorder=2)
    ax.annotate("", xy=(77, 115), xytext=(74, 115),
                arrowprops=dict(arrowstyle="-|>", color="#B91C1C", lw=1.6, mutation_scale=14), zorder=2)
    ax.text(68, 77, "No", fontsize=9, fontweight="bold", color="#B91C1C",
            bbox=dict(boxstyle="round,pad=0.2", fc="#FFFFFF", ec="none"), zorder=5)

    # Valid? Yes -> Store or Update Record in PostgreSQL
    n_db = draw_process(100, 53, "Store or Update Record", "Persist Entity Data in PostgreSQL & Files in Storage", w=48, h=9)
    draw_arrow((100, 68), (100, 57.5), label="Yes", label_pos=(102, 63))

    # 9. Recalculate Warranty Status
    n_calc = draw_process(100, 36, "Recalculate Warranty Status", "Dynamic Evaluation: Active / Expiring Soon (<30d) / Expired", w=50, h=9)
    draw_arrow((100, 48.5), (100, 40.5))

    # 10. Warranty Expiring Soon? Decision Diamond
    n_exp_dec = draw_decision(100, 20, "Warranty\nExpiring Soon?", w=36, h=12)
    draw_arrow((100, 31.5), (100, 26))

    # Expiring Soon? Yes -> User Manually Triggers Warranty Expiry Reminder Email
    n_email = draw_process(162, 20, "User Manually Triggers\nWarranty Expiry Reminder", "(Nodemailer SMTP Dispatch)", w=32, h=10)
    draw_arrow((118, 20), (146, 20), label="Yes", label_pos=(128, 22))

    # 11. Display Updated Information
    n_disp = draw_process(100, 6, "Display Updated Information", "Refresh Dashboard, Status Badges & Live Records Table", w=48, h=8)

    # From Decision No -> Display Updated Information
    draw_arrow((100, 14), (100, 10), label="No", label_pos=(102, 12))

    # From Email -> Down to Display Updated Information
    ax.plot([162, 162, 124], [15, 6, 6], color="#1E293B", lw=1.6, zorder=2)
    ax.annotate("", xy=(124, 6), xytext=(128, 6),
                arrowprops=dict(arrowstyle="-|>", color="#1E293B", lw=1.6, mutation_scale=14), zorder=2)

    # 12. End (Place to the left or bottom)
    n_end = draw_terminator(38, 6, "End", w=26, h=7)
    draw_arrow((76, 6), (51, 6))

    plt.tight_layout()
    plt.savefig(IMAGE_FLOWCHART, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"Generated: {IMAGE_FLOWCHART}")

if __name__ == "__main__":
    print("Generating Academic System Design Diagrams...")
    draw_erd()
    draw_use_case()
    draw_flowchart()
    print("All diagrams generated successfully at 300 DPI!")
