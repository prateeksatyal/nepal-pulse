import os
import time
import json
import urllib.request
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"
API_URL = "http://localhost:5000/api"

OUT_DIR = os.path.abspath("WarrantyFlow_UI_Screenshots")
PUBLIC_DIR = os.path.join(OUT_DIR, "public")
USER_DIR = os.path.join(OUT_DIR, "user")
ADMIN_DIR = os.path.join(OUT_DIR, "admin")
RESPONSIVE_DIR = os.path.join(OUT_DIR, "responsive")
STATES_DIR = os.path.join(OUT_DIR, "states")

for d in [PUBLIC_DIR, USER_DIR, ADMIN_DIR, RESPONSIVE_DIR, STATES_DIR]:
    os.makedirs(d, exist_ok=True)

# Helper to fetch JWT tokens from backend API
def get_auth_data(email, password):
    req = urllib.request.Request(
        f"{API_URL}/auth/login",
        data=json.dumps({"email": email, "password": password}).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    return data["token"], data["user"]

print("Fetching credentials...")
USER_TOKEN, USER_DATA = get_auth_data("user@warranty.com", "user123")
ADMIN_TOKEN, ADMIN_DATA = get_auth_data("admin@warranty.com", "admin123")
print("User token:", USER_DATA["name"])
print("Admin token:", ADMIN_DATA["name"])

captured_records = []

def record_capture(num, category, route, screen_name, viewport, state_desc, filename):
    captured_records.append({
        "num": num,
        "category": category,
        "route": route,
        "name": screen_name,
        "viewport": viewport,
        "state": state_desc,
        "file": filename
    })

def set_auth(page, token, user):
    page.goto(BASE_URL)
    page.evaluate("""({token, user}) => {
        localStorage.setItem('warranty_token', token);
        localStorage.setItem('warranty_user', JSON.stringify(user));
    }""", {"token": token, "user": user})

def wait_page(page, ms=1200):
    try:
        page.wait_for_load_state("networkidle", timeout=6000)
    except:
        pass
    page.wait_for_timeout(ms)

def run():
    print("Launching Playwright...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            executable_path=r"C:\Users\prate\AppData\Local\ms-playwright\chromium-1228\chrome-win64\chrome.exe"
        )
        
        counter = 1

        # ==========================================
        # 1. PUBLIC PAGES (1440x900)
        # ==========================================
        print("\n--- Capturing Public Pages ---")
        ctx_pub = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx_pub.new_page()

        # Landing Page
        page.goto(f"{BASE_URL}/")
        wait_page(page)
        f_landing = os.path.join(PUBLIC_DIR, f"{counter:02d}_landing_page.png")
        page.screenshot(path=f_landing, full_page=True)
        record_capture(counter, "Public", "/", "Landing Page", "1440x900", "Default view (hero, metrics, features, CTA, footer)", f_landing)
        print(f"Captured: {f_landing}")
        counter += 1

        # Login Page
        page.goto(f"{BASE_URL}/login")
        wait_page(page)
        f_login = os.path.join(PUBLIC_DIR, f"{counter:02d}_login_page.png")
        page.screenshot(path=f_login, full_page=False)
        record_capture(counter, "Public", "/login", "Sign In Page", "1440x900", "Clean authentication form with role indicators", f_login)
        print(f"Captured: {f_login}")
        counter += 1

        # Register Page
        page.goto(f"{BASE_URL}/register")
        wait_page(page)
        f_reg = os.path.join(PUBLIC_DIR, f"{counter:02d}_register_page.png")
        page.screenshot(path=f_reg, full_page=False)
        record_capture(counter, "Public", "/register", "Registration Page", "1440x900", "Account registration interface", f_reg)
        print(f"Captured: {f_reg}")
        counter += 1

        ctx_pub.close()

        # ==========================================
        # 2. STANDARD USER - ALEX JOHNSON (1440x900)
        # ==========================================
        print("\n--- Capturing Standard User Pages ---")
        ctx_user = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx_user.new_page()
        set_auth(page, USER_TOKEN, USER_DATA)

        # User Dashboard
        page.goto(f"{BASE_URL}/dashboard")
        wait_page(page)
        f_dash = os.path.join(USER_DIR, f"{counter:02d}_user_dashboard.png")
        page.screenshot(path=f_dash, full_page=True)
        record_capture(counter, "Standard User", "/dashboard", "User Dashboard", "1440x900", "Active warranties, statistics, expiring alerts & quick actions", f_dash)
        print(f"Captured: {f_dash}")
        counter += 1

        # Products Page - Table View
        page.goto(f"{BASE_URL}/products")
        wait_page(page)
        f_prod_tbl = os.path.join(USER_DIR, f"{counter:02d}_products_table_view.png")
        page.screenshot(path=f_prod_tbl, full_page=True)
        record_capture(counter, "Standard User", "/products", "Products List (Table View)", "1440x900", "Assets directory with status badges and filters in table layout", f_prod_tbl)
        print(f"Captured: {f_prod_tbl}")
        counter += 1

        # Products Page - Grid View
        try:
            page.locator("button[title*='Grid'], button:has-text('Grid'), button svg.lucide-layout-grid").first.click()
            page.wait_for_timeout(500)
        except Exception as e:
            print("Grid toggle exception:", e)
        f_prod_grid = os.path.join(USER_DIR, f"{counter:02d}_products_grid_view.png")
        page.screenshot(path=f_prod_grid, full_page=True)
        record_capture(counter, "Standard User", "/products", "Products List (Grid View)", "1440x900", "Asset cards layout showing hardware details and status", f_prod_grid)
        print(f"Captured: {f_prod_grid}")
        counter += 1

        # Add Product - Empty Form
        page.goto(f"{BASE_URL}/products/new")
        wait_page(page)
        f_prod_new_empty = os.path.join(USER_DIR, f"{counter:02d}_add_product_empty.png")
        page.screenshot(path=f_prod_new_empty, full_page=True)
        record_capture(counter, "Standard User", "/products/new", "Add Product Form (Empty)", "1440x900", "Initial asset registration form", f_prod_new_empty)
        print(f"Captured: {f_prod_new_empty}")
        counter += 1

        # Add Product - Filled Form
        try:
            page.fill("input[name='name']", "Apple iPad Pro M4 13-inch")
            page.fill("input[name='brand']", "Apple")
            page.fill("input[name='model']", "A2925 Wi-Fi 256GB")
            page.fill("input[name='serial_number']", "DMPH902LK89")
            page.fill("input[name='purchase_price']", "1299.00")
            page.fill("input[name='purchase_date']", "2024-05-18")
            page.select_option("select[name='category_id']", index=2)
            page.fill("textarea[name='notes']", "Equipped with Apple Pencil Pro and Magic Keyboard.")
            page.wait_for_timeout(400)
        except Exception as e:
            print("Product fill notice:", e)
        f_prod_new_filled = os.path.join(USER_DIR, f"{counter:02d}_add_product_filled.png")
        page.screenshot(path=f_prod_new_filled, full_page=True)
        record_capture(counter, "Standard User", "/products/new", "Add Product Form (Filled)", "1440x900", "Form populated with tablet specifications", f_prod_new_filled)
        print(f"Captured: {f_prod_new_filled}")
        counter += 1

        # Product Detail Page (/products/1)
        page.goto(f"{BASE_URL}/products/1")
        wait_page(page)
        f_prod_detail = os.path.join(USER_DIR, f"{counter:02d}_product_detail.png")
        page.screenshot(path=f_prod_detail, full_page=True)
        record_capture(counter, "Standard User", "/products/1", "Product Detail Page", "1440x900", "Dell XPS 15 asset overview, warranties, and maintenance records", f_prod_detail)
        print(f"Captured: {f_prod_detail}")
        counter += 1

        # Edit Product Page (/products/1/edit)
        page.goto(f"{BASE_URL}/products/1/edit")
        wait_page(page)
        f_prod_edit = os.path.join(USER_DIR, f"{counter:02d}_edit_product.png")
        page.screenshot(path=f_prod_edit, full_page=True)
        record_capture(counter, "Standard User", "/products/1/edit", "Edit Product Page", "1440x900", "Pre-populated product update form", f_prod_edit)
        print(f"Captured: {f_prod_edit}")
        counter += 1

        # Warranties List (/warranties)
        page.goto(f"{BASE_URL}/warranties")
        wait_page(page)
        f_war_list = os.path.join(USER_DIR, f"{counter:02d}_warranties_list.png")
        page.screenshot(path=f_war_list, full_page=True)
        record_capture(counter, "Standard User", "/warranties", "Warranties List", "1440x900", "Active, Expiring Soon, and Expired warranty contracts with status badges", f_war_list)
        print(f"Captured: {f_war_list}")
        counter += 1

        # Add Warranty - Empty Form
        page.goto(f"{BASE_URL}/warranties/new")
        wait_page(page)
        f_war_new_empty = os.path.join(USER_DIR, f"{counter:02d}_add_warranty_empty.png")
        page.screenshot(path=f_war_new_empty, full_page=True)
        record_capture(counter, "Standard User", "/warranties/new", "Add Warranty Form (Empty)", "1440x900", "Initial warranty coverage registration form", f_war_new_empty)
        print(f"Captured: {f_war_new_empty}")
        counter += 1

        # Add Warranty - Filled Form
        try:
            page.select_option("select[name='product_id']", index=1)
            page.fill("input[name='provider']", "AppleCare+ for iPad")
            page.select_option("select[name='warranty_type']", label="Manufacturer Extended")
            page.fill("input[name='start_date']", "2024-05-18")
            page.fill("input[name='end_date']", "2026-05-18")
            page.fill("textarea[name='coverage_details']", "Unlimited incidents of accidental damage protection and express replacement service.")
            page.wait_for_timeout(400)
        except Exception as e:
            print("Warranty fill notice:", e)
        f_war_new_filled = os.path.join(USER_DIR, f"{counter:02d}_add_warranty_filled.png")
        page.screenshot(path=f_war_new_filled, full_page=True)
        record_capture(counter, "Standard User", "/warranties/new", "Add Warranty Form (Filled)", "1440x900", "Form populated with warranty contract specifications", f_war_new_filled)
        print(f"Captured: {f_war_new_filled}")
        counter += 1

        # Warranty Detail Page (/warranties/1)
        page.goto(f"{BASE_URL}/warranties/1")
        wait_page(page)
        f_war_detail = os.path.join(USER_DIR, f"{counter:02d}_warranty_detail.png")
        page.screenshot(path=f_war_detail, full_page=True)
        record_capture(counter, "Standard User", "/warranties/1", "Warranty Detail Page", "1440x900", "Dell Premium Support Plus contract terms, status, and attached documents", f_war_detail)
        print(f"Captured: {f_war_detail}")
        counter += 1

        # Edit Warranty Page (/warranties/1/edit)
        page.goto(f"{BASE_URL}/warranties/1/edit")
        wait_page(page)
        f_war_edit = os.path.join(USER_DIR, f"{counter:02d}_edit_warranty.png")
        page.screenshot(path=f_war_edit, full_page=True)
        record_capture(counter, "Standard User", "/warranties/1/edit", "Edit Warranty Page", "1440x900", "Pre-populated warranty modification interface", f_war_edit)
        print(f"Captured: {f_war_edit}")
        counter += 1

        # Service & Repair List (/services)
        page.goto(f"{BASE_URL}/services")
        wait_page(page)
        f_srv_list = os.path.join(USER_DIR, f"{counter:02d}_services_list.png")
        page.screenshot(path=f_srv_list, full_page=True)
        record_capture(counter, "Standard User", "/services", "Service & Repair Records", "1440x900", "Maintenance events, repair centers, expenses, and service logs", f_srv_list)
        print(f"Captured: {f_srv_list}")
        counter += 1

        # Log Service - Empty Form (/services/new)
        page.goto(f"{BASE_URL}/services/new")
        wait_page(page)
        f_srv_new_empty = os.path.join(USER_DIR, f"{counter:02d}_log_service_empty.png")
        page.screenshot(path=f_srv_new_empty, full_page=True)
        record_capture(counter, "Standard User", "/services/new", "Log Service Record Form (Empty)", "1440x900", "Maintenance logging form", f_srv_new_empty)
        print(f"Captured: {f_srv_new_empty}")
        counter += 1

        # Log Service - Filled Form
        try:
            page.select_option("select[name='product_id']", index=1)
            page.fill("input[name='service_date']", "2024-08-10")
            page.fill("input[name='service_center']", "Dell Authorized Tech Center")
            page.fill("input[name='cost']", "0.00")
            page.fill("textarea[name='description']", "Preventative annual thermal paste replacement and dust cleanout.")
            page.fill("textarea[name='notes']", "Performed under active warranty with zero charge.")
            page.wait_for_timeout(400)
        except Exception as e:
            print("Service fill notice:", e)
        f_srv_new_filled = os.path.join(USER_DIR, f"{counter:02d}_log_service_filled.png")
        page.screenshot(path=f_srv_new_filled, full_page=True)
        record_capture(counter, "Standard User", "/services/new", "Log Service Record Form (Filled)", "1440x900", "Populated maintenance record with service center and cost", f_srv_new_filled)
        print(f"Captured: {f_srv_new_filled}")
        counter += 1

        # Edit Service Page (/services/1/edit)
        page.goto(f"{BASE_URL}/services/1/edit")
        wait_page(page)
        f_srv_edit = os.path.join(USER_DIR, f"{counter:02d}_edit_service.png")
        page.screenshot(path=f_srv_edit, full_page=True)
        record_capture(counter, "Standard User", "/services/1/edit", "Edit Service Record Page", "1440x900", "Pre-populated service modification form", f_srv_edit)
        print(f"Captured: {f_srv_edit}")
        counter += 1

        # Documents & Receipts Vault - Grid View (/documents)
        page.goto(f"{BASE_URL}/documents")
        wait_page(page)
        f_doc_grid = os.path.join(USER_DIR, f"{counter:02d}_documents_vault_grid.png")
        page.screenshot(path=f_doc_grid, full_page=True)
        record_capture(counter, "Standard User", "/documents", "Documents & Receipts Vault (Grid)", "1440x900", "Receipts and warranty card files repository in card grid layout", f_doc_grid)
        print(f"Captured: {f_doc_grid}")
        counter += 1

        # Documents & Receipts Vault - Table View
        try:
            page.locator("button[title*='Table'], button:has-text('Table'), button svg.lucide-table").first.click()
            page.wait_for_timeout(500)
        except Exception as e:
            print("Doc table toggle notice:", e)
        f_doc_tbl = os.path.join(USER_DIR, f"{counter:02d}_documents_vault_table.png")
        page.screenshot(path=f_doc_tbl, full_page=True)
        record_capture(counter, "Standard User", "/documents", "Documents & Receipts Vault (Table)", "1440x900", "Structured file listing with file type, date, and actions", f_doc_tbl)
        print(f"Captured: {f_doc_tbl}")
        counter += 1

        # Profile Page (/profile)
        page.goto(f"{BASE_URL}/profile")
        wait_page(page)
        f_profile = os.path.join(USER_DIR, f"{counter:02d}_user_profile.png")
        page.screenshot(path=f_profile, full_page=True)
        record_capture(counter, "Standard User", "/profile", "User Profile & Security", "1440x900", "Alex Johnson account details, security credentials, and stats", f_profile)
        print(f"Captured: {f_profile}")
        counter += 1

        ctx_user.close()

        # ==========================================
        # 3. SYSTEM ADMINISTRATOR (1440x900)
        # ==========================================
        print("\n--- Capturing Administrator Pages ---")
        ctx_admin = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx_admin.new_page()
        set_auth(page, ADMIN_TOKEN, ADMIN_DATA)

        # Admin Dashboard (/admin/dashboard)
        page.goto(f"{BASE_URL}/admin/dashboard")
        wait_page(page)
        f_adm_dash = os.path.join(ADMIN_DIR, f"{counter:02d}_admin_dashboard.png")
        page.screenshot(path=f_adm_dash, full_page=True)
        record_capture(counter, "Administrator", "/admin/dashboard", "Admin Console Dashboard", "1440x900", "System-wide metrics, warranty health, user counts, and quick links", f_adm_dash)
        print(f"Captured: {f_adm_dash}")
        counter += 1

        # Admin User Management (/admin/users)
        page.goto(f"{BASE_URL}/admin/users")
        wait_page(page)
        f_adm_users = os.path.join(ADMIN_DIR, f"{counter:02d}_admin_users.png")
        page.screenshot(path=f_adm_users, full_page=True)
        record_capture(counter, "Administrator", "/admin/users", "User Management (RBAC)", "1440x900", "User accounts directory with roles, registration dates, and actions", f_adm_users)
        print(f"Captured: {f_adm_users}")
        counter += 1

        # Admin Categories (/admin/categories)
        page.goto(f"{BASE_URL}/admin/categories")
        wait_page(page)
        f_adm_cat = os.path.join(ADMIN_DIR, f"{counter:02d}_admin_categories.png")
        page.screenshot(path=f_adm_cat, full_page=True)
        record_capture(counter, "Administrator", "/admin/categories", "Category Taxonomy Management", "1440x900", "System classifications, product counts, and density metrics", f_adm_cat)
        print(f"Captured: {f_adm_cat}")
        counter += 1

        # Admin Add Category Modal
        try:
            page.locator("button:has-text('Add New Category')").click()
            page.wait_for_timeout(600)
            f_adm_cat_mod = os.path.join(ADMIN_DIR, f"{counter:02d}_admin_categories_modal.png")
            page.screenshot(path=f_adm_cat_mod, full_page=False)
            record_capture(counter, "Administrator", "/admin/categories", "Add Category Modal", "1440x900", "Interactive modal overlay for creating a taxonomy category", f_adm_cat_mod)
            print(f"Captured: {f_adm_cat_mod}")
            counter += 1
            # Close modal
            page.keyboard.press("Escape")
            page.wait_for_timeout(300)
        except Exception as e:
            print("Category modal notice:", e)

        # Admin Products Directory (/admin/products)
        page.goto(f"{BASE_URL}/admin/products")
        wait_page(page)
        f_adm_prod = os.path.join(ADMIN_DIR, f"{counter:02d}_admin_products.png")
        page.screenshot(path=f_adm_prod, full_page=True)
        record_capture(counter, "Administrator", "/admin/products", "Admin Products Directory", "1440x900", "Cross-system asset directory with user ownership and serial numbers", f_adm_prod)
        print(f"Captured: {f_adm_prod}")
        counter += 1

        # Admin Warranties Directory (/admin/warranties)
        page.goto(f"{BASE_URL}/admin/warranties")
        wait_page(page)
        f_adm_war = os.path.join(ADMIN_DIR, f"{counter:02d}_admin_warranties.png")
        page.screenshot(path=f_adm_war, full_page=True)
        record_capture(counter, "Administrator", "/admin/warranties", "Admin Warranties Directory", "1440x900", "Global warranty contracts list with status filtering and expiration", f_adm_war)
        print(f"Captured: {f_adm_war}")
        counter += 1

        # Admin Services Log (/admin/services)
        page.goto(f"{BASE_URL}/admin/services")
        wait_page(page)
        f_adm_srv = os.path.join(ADMIN_DIR, f"{counter:02d}_admin_services.png")
        page.screenshot(path=f_adm_srv, full_page=True)
        record_capture(counter, "Administrator", "/admin/services", "Admin Service & Repair Log", "1440x900", "System maintenance records, costs, and repair status", f_adm_srv)
        print(f"Captured: {f_adm_srv}")
        counter += 1

        ctx_admin.close()

        # ==========================================
        # 4. INTERACTIVE & UI STATES (1440x900)
        # ==========================================
        print("\n--- Capturing UI States & Modals ---")
        ctx_states = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx_states.new_page()
        set_auth(page, USER_TOKEN, USER_DATA)

        # Products Search Active
        page.goto(f"{BASE_URL}/products")
        wait_page(page)
        page.fill("input[placeholder*='search' i]", "Dell")
        page.wait_for_timeout(600)
        f_st_search = os.path.join(STATES_DIR, f"{counter:02d}_products_search_active.png")
        page.screenshot(path=f_st_search, full_page=True)
        record_capture(counter, "UI State", "/products", "Search Active (Matching)", "1440x900", "Filter input filtering products to Dell XPS 15 matching result", f_st_search)
        print(f"Captured: {f_st_search}")
        counter += 1

        # Products Search Zero Results
        page.fill("input[placeholder*='search' i]", "xyznonexistentproduct")
        page.wait_for_timeout(600)
        f_st_empty = os.path.join(STATES_DIR, f"{counter:02d}_products_search_empty.png")
        page.screenshot(path=f_st_empty, full_page=True)
        record_capture(counter, "UI State", "/products", "Search Empty State", "1440x900", "Clean zero-results empty state indicator", f_st_empty)
        print(f"Captured: {f_st_empty}")
        counter += 1

        # Warranties Filter - Expiring Soon
        page.goto(f"{BASE_URL}/warranties")
        wait_page(page)
        try:
            page.select_option("select:has(option:has-text('Expiring'))", label="Expiring Soon")
        except:
            pass
        page.wait_for_timeout(600)
        f_st_expiring = os.path.join(STATES_DIR, f"{counter:02d}_warranties_filter_expiring.png")
        page.screenshot(path=f_st_expiring, full_page=True)
        record_capture(counter, "UI State", "/warranties", "Warranties Status Filter", "1440x900", "Filtered to expiring soon items with amber warning badges", f_st_expiring)
        print(f"Captured: {f_st_expiring}")
        counter += 1

        # Form Validation Error State (Empty submission)
        page.goto(f"{BASE_URL}/products/new")
        wait_page(page)
        try:
            page.locator("button[type='submit']").first.click()
            page.wait_for_timeout(600)
        except Exception as e:
            print("Validation submit notice:", e)
        f_st_valid = os.path.join(STATES_DIR, f"{counter:02d}_form_validation_product_errors.png")
        page.screenshot(path=f_st_valid, full_page=True)
        record_capture(counter, "UI State", "/products/new", "Form Validation Errors", "1440x900", "Validation alerts and field highlight states on empty submission", f_st_valid)
        print(f"Captured: {f_st_valid}")
        counter += 1

        # Delete Confirmation Modal
        page.goto(f"{BASE_URL}/products")
        wait_page(page)
        try:
            page.locator("button svg.lucide-trash2, button[title*='Delete']").first.click()
            page.wait_for_timeout(600)
            f_st_del = os.path.join(STATES_DIR, f"{counter:02d}_delete_confirm_modal.png")
            page.screenshot(path=f_st_del, full_page=False)
            record_capture(counter, "UI State", "/products", "Delete Confirmation Modal", "1440x900", "Destructive action confirmation modal overlay with Cancel and Delete actions", f_st_del)
            print(f"Captured: {f_st_del}")
            counter += 1
            # Cancel modal
            page.locator("button:has-text('Cancel')").first.click()
            page.wait_for_timeout(300)
        except Exception as e:
            print("Delete modal notice:", e)

        ctx_states.close()

        # ==========================================
        # 5. RESPONSIVE BREAKPOINTS
        # ==========================================
        print("\n--- Capturing Responsive Breakpoints ---")
        RESPONSIVE_CONFIGS = [
            ("1280x800", 1280, 800, "Laptop View"),
            ("1024x768", 1024, 768, "Small Desktop View"),
            ("768x1024", 768, 1024, "Tablet Portrait View"),
            ("390x844", 390, 844, "Mobile Portrait View"),
        ]

        PAGES_TO_RESPONSIVE = [
            ("public", "/", "Landing Page", "landing"),
            ("public", "/login", "Sign In Page", "login"),
            ("user", "/dashboard", "User Dashboard", "user_dashboard"),
            ("user", "/products", "Products List", "products"),
            ("user", "/warranties", "Warranties List", "warranties"),
            ("user", "/services", "Service Records", "services"),
            ("user", "/documents", "Documents Vault", "documents"),
            ("user", "/profile", "User Profile", "user_profile"),
            ("admin", "/admin/dashboard", "Admin Dashboard", "admin_dashboard"),
            ("admin", "/admin/users", "Admin Users", "admin_users"),
            ("admin", "/admin/categories", "Admin Categories", "admin_categories"),
        ]

        for vp_name, w, h, vp_label in RESPONSIVE_CONFIGS:
            ctx_resp = browser.new_context(viewport={"width": w, "height": h})
            resp_page = ctx_resp.new_page()

            for role_type, route, page_title, page_slug in PAGES_TO_RESPONSIVE:
                if role_type == "user":
                    set_auth(resp_page, USER_TOKEN, USER_DATA)
                elif role_type == "admin":
                    set_auth(resp_page, ADMIN_TOKEN, ADMIN_DATA)

                resp_page.goto(f"{BASE_URL}{route}")
                wait_page(resp_page, ms=1000)

                f_resp = os.path.join(RESPONSIVE_DIR, f"{counter:02d}_{page_slug}_{vp_name}.png")
                resp_page.screenshot(path=f_resp, full_page=True)
                record_capture(counter, "Responsive", route, f"{page_title} ({vp_label})", vp_name, f"Responsive presentation at {w}x{h}", f_resp)
                print(f"Captured: {f_resp}")
                counter += 1

            ctx_resp.close()

        browser.close()

    print(f"\nAll screenshots captured successfully! Total screens: {len(captured_records)}")
    
    # Save capture index data to json for compilation
    with open("captured_metadata.json", "w", encoding="utf-8") as f:
        json.dump(captured_records, f, indent=2)

if __name__ == "__main__":
    run()
