# Project Memory: Frupearl Offline Sales

This file maintains persistent project context, architecture patterns, and conventions for the Frupearl Offline Sales system.

---

## Workspace Overview
* **Project Name**: Frupearl Sales Offline Counter
* **Target Environment**: Web browsers, primarily deployed on **iPad** (Safari) for offline stall operations.
* **Core Application**: `Frupearl-Sales.html` (Single-file offline web app)
* **Brand Logo Asset**: `frupearl_logo.svg` (High-resolution vector SVG in Frupearl purple `#5b2b85`, transparent background)
* **Master Ledger**: `Frupearl Sales 2026-27.xlsx`
* **Standalone JSON Data**: `sales_data.json`
* **Google Drive Sync Script**: `Google_Sheets_Sync_Script.js`
* **Connected Google Sheet**: `https://docs.google.com/spreadsheets/d/1tgkhV3Y1T7T0n7S1l-Oo9K25lVW5YBZBtna_eAs7FBY/edit?usp=drive_link`

---

## Product Catalog & Flavor Color Palette

The **Fast Punch Counter** uses specific color variables defined in CSS:

| Product | Flavor ID | Price | Primary Accent | Background Tint |
| :--- | :--- | :--- | :--- | :--- |
| **🍧 1. Mini Pop** | `mini` | ₹189 | `#7c3aed` (Purple) | `#faf5ff` |
| **🥥 2. Coconut** | `coconut` | ₹199 | `#0284c7` (Sky Blue) | `#f0f9ff` |
| **🫐 3. Berry** | `berry` | ₹99 | `#e11d48` (Rose Berry) | `#fff1f2` |
| **🥭 4. Mango** | `mango` | ₹99 | `#d97706` (Amber Mango) | `#fffbeb` |

### Dynamic Product & Price Customization (⚙️ Prices):
* Accessible via the compact **`⚙️`** icon button in the Fast Punch Counter panel header (right next to "Reset counts").
* Opens `#product-settings-modal` instantly with zero animation lag (hardware blur removed for 60fps performance on iPad).
* **Unlimited Products**: Users can click **`＋ Add New Product`** to add a 5th, 6th, or unlimited items to the Fast Punch grid.
* **On-the-Fly Editing**: Edit both product names and ₹ prices for any slot.
* **Remove Items**: Click **`🗑️ Remove`** next to any product to delete it from the counter pad.
* **Automatic Flavor Theming**: Added items automatically cycle through a high-contrast pastel palette (Purple, Sky Blue, Rose Berry, Amber Mango, Emerald Green, Coral Orange, Royal Indigo, Vibrant Pink, Fresh Teal).
* **Offline Persistent Storage**: Stored persistently in IndexedDB (`settings` store, key: `custom_products_catalog`) with `localStorage` fallback.
* Immediately re-renders counter cards, stepper controls, price pills, and real-time punch total calculations.
* Includes a **↺ Reset Defaults** option to restore standard catalog names & pricing at any time.

### Payment Mode Theming:
* **💵 Cash**: Green highlight (`#16a34a` / `#f0fdf4`)
* **📱 Online**: Indigo highlight (`#4f46e5` / `#eef2ff`)

---

## UI Layout & Pagination Rules

1. **Top Navigation Tabs**:
   * `⚡ Counter`: Main screen with Fast Punch pad, Custom Sale form, and **Recent Sales (Top 3)** (large total sales banner removed for a clean POS layout).
   * **Collapsible Custom Sale Panel**: Includes a compact toggle button (`Hide ▲` / `Show ▼`) right in the header. When hidden, the form collapses into a single-line bar and the Fast Punch Counter expands full-width for maximum counter speed on iPad. Automatically unhides if an entry is edited. Remembers state in `localStorage`.
   * `📅 Daily Sales`: Dedicated date-wise breakdown showing per-day total sales, active selling days, average per day, and cash/online breakdown.
   * `📋 All Sales & Totals`: Dedicated page showing full sales history (10 per page), cash/online breakdown, and tools.
2. **Recent Sales Display (Top 3 Rule & Chronological Ordering)**:
   * **Date-Wise & Punch-Time Descending Sort**: All transactions are sorted with newest dates and latest punches first (`date descending`, then `timestamp descending`).
   * **Latest Entered Sale Always on Top**: Every new entry records high-precision millisecond `timestamp` and `createdAt`. If multiple entries occur on the same date, the most recently entered sale is guaranteed to be at position #1.
   * By default, page 1 **only shows the 3 most recent entries**.
   * Shows entries count and pagination info only (no revenue/grand total displayed on counter view).
   * **Smart Compact Pagination**: Clean, single-line pagination with smart ellipsis (e.g. `[◀ Prev] 1 2 3 4 … 32 [Next ▶]`) replacing previous multi-line clutter.
3. **The Other Page ("All Sales History & Totals")**:
   * **10 Entries Per Page**: Paginated at 10 transactions per page with clean `[◀ Prev]` and `[Next ▶]` controls.
   * Shows complete summary metrics:
     * Grand Total Received
     * Cash Received & Count
     * Online Received & Count
   * Search filter across product, payment mode, date, and notes (automatically resets to page 1 on search).
   * Tools: `CSV Export`, `Save sales_data.json`, `Backup JSON`, `Import JSON` (Smart De-duplicating merge by unique ID).

---

## Data Schema, IndexedDB & Sync Architecture

* **Database Engine**: **IndexedDB** (`FrupearlSalesDB`, object store: `sales`, keyPath: `id`), with localStorage mirror for fallback redundancy.
* **Standalone JSON**: `sales_data.json` contains independent JSON data.
* **Record Structure**:
  ```typescript
  interface SaleRecord {
    id: string;        // Unique chronological ID (e.g. "s_1794156..._a1b2" or historical "s96")
    date: string;      // YYYY-MM-DD
    customer?: string; // Optional customer name
    product: string;   // e.g., "Mini Pop ×2, Berry"
    amount: number;    // Total price in INR
    payment: "Cash" | "Online";
    notes: string;     // Optional notes or item summary
    timestamp?: number;// Millisecond punch timestamp for precise ordering
    createdAt?: string;// ISO timestamp string
    synced: boolean;   // Tracks if pushed to Google Drive Sheet
  }
  ```
* **Google Drive Sheet Sync**:
  * Connected to Google Sheet `1tgkhV3Y1T7T0n7S1l-Oo9K25lVW5YBZBtna_eAs7FBY`.
  * **Deployed Web App URL**: `https://script.google.com/macros/s/AKfycbyZBWEPKalAR7-zXweZL82LGY1pI4m9O5VDKkrDqStTcFIe3yOf7Froyd38aOOUY7NGaQ/exec`
  * **Deployment ID**: `AKfycbyZBWEPKalAR7-zXweZL82LGY1pI4m9O5VDKkrDqStTcFIe3yOf7Froyd38aOOUY7NGaQ`
  * **Important Setting**: Deployment access MUST be configured with **"Who has access: Anyone"** to allow the offline browser app on iPad to post sales data without requiring Google login.
  * Top bar button: **`☁️ Sync to Google Sheet`** shows live count of unsynced transactions.
  * Backend: Powered by `Google_Sheets_Sync_Script.js` (Google Apps Script Web App).
  * **Auto-Column Creation**: When syncing, if any column (e.g. `Payment Mode`, `Customer Name`, etc.) is missing in row 1 of the sheet, the script automatically appends the column header without breaking existing sheets!
  * **Synced Field Handling**: When pushing sales to Google Sheets, the payload explicitly passes `synced: true` so the `synced` column in Google Sheets records `TRUE`.
