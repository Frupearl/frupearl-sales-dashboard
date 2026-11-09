# Frupearl Offline Sales — Memory & Architecture Reference

## 📌 Quick Summary
* **Primary App**: `Frupearl-Sales.html`
* **Local Database**: **IndexedDB** (`FrupearlSalesDB` -> `sales`)
* **Standalone JSON**: `sales_data.json`
* **Google Drive Sync**: `https://docs.google.com/spreadsheets/d/1tgkhV3Y1T7T0n7S1l-Oo9K25lVW5YBZBtna_eAs7FBY/edit?usp=drive_link`
* **Sync Script**: `Google_Sheets_Sync_Script.js`

---

## 🎨 Flavor Color Matrix
* **Mini Pop (₹189)**: Lavender `#faf5ff` with purple accent `#7c3aed`.
* **Coconut (₹199)**: Fresh cyan `#f0f9ff` with sky-blue accent `#0284c7`.
* **Berry (₹99)**: Rose pink `#fff1f2` with berry-red accent `#e11d48`.
* **Mango (₹99)**: Warm peach `#fffbeb` with amber-mango accent `#d97706`.
* **Cash**: Active emerald green (`#16a34a`).
* **Online**: Active indigo (`#4f46e5`).

---

## ☁️ Google Sheets Sync Architecture
* **Sync Button**: `☁️ Sync to Google Sheet` in header with live badge (`X new` or `All synced ✅`).
* **Newly Entered Tracking**: Every new transaction has `synced: false`.
* **Auto-Column Creation**: When syncing, if any required column (`Payment Mode`, `Customer Name`, `Notes`, etc.) is missing in the Google Sheet, the script creates it automatically!
* **1-Minute Setup**: Paste `Google_Sheets_Sync_Script.js` in *Extensions > Apps Script* of your spreadsheet and deploy as Web App (Anyone).

---

## 💾 Storage & Data Flow
* **Primary Storage**: Browser **IndexedDB** (`FrupearlSalesDB`), persists indefinitely on iPad.
* **Fallback Mirror**: Synchronized with `localStorage`.
* **Separate JSON file**: `sales_data.json` provides an independent, clean JSON dataset.
