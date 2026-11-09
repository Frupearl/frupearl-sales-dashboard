/**
 * Frupearl Sales -> Google Sheets Sync Script
 * Target Spreadsheet: https://docs.google.com/spreadsheets/d/1tgkhV3Y1T7T0n7S1l-Oo9K25lVW5YBZBtna_eAs7FBY/edit
 * 
 * Instructions:
 * 1. Open your Google Sheet above in your browser.
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Delete any default code in Code.gs, paste this entire file, and click Save (💾).
 * 4. Click "Deploy" -> "New deployment".
 * 5. Select type: "Web app".
 *    - Description: Frupearl POS Sync
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 6. Click "Deploy" and copy the "Web app URL".
 * 7. In Frupearl Sales web app, click "☁️ Sync to Google Sheet", paste your Web app URL, and click Save!
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Target sheet name: 'Sales List'
    var sheet = ss.getSheetByName("Sales List");
    if (!sheet) {
      sheet = ss.insertSheet("Sales List");
    }

    var payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter || {};
    }

    var items = Array.isArray(payload) ? payload : (payload.items || [payload]);
    if (!items.length) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: 0 }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 1. Fetch existing headers from row 1
    var lastCol = sheet.getLastColumn();
    var headers = [];
    if (lastCol > 0 && sheet.getLastRow() > 0) {
      headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
    }

    // Default required columns
    var defaultCols = ["Date", "Customer Name", "Product / Service", "Payment Received ₹", "Payment Mode", "Notes", "Transaction ID"];

    // 2. Automatically create columns if they do not exist
    defaultCols.forEach(function(col) {
      if (headers.indexOf(col) === -1) {
        lastCol++;
        sheet.getRange(1, lastCol).setValue(col).setFontWeight("bold").setBackground("#f3e8ff");
        headers.push(col);
      }
    });

    // Check if incoming items have custom columns
    items.forEach(function(item) {
      Object.keys(item).forEach(function(k) {
        var colName = mapFieldToColumn(k);
        if (headers.indexOf(colName) === -1) {
          lastCol++;
          sheet.getRange(1, lastCol).setValue(colName).setFontWeight("bold").setBackground("#f3e8ff");
          headers.push(colName);
        }
      });
    });

    // 3. Format rows to match the columns
    var rowsToAppend = items.map(function(item) {
      var row = new Array(headers.length).fill("");
      
      setRowVal(row, headers, "Date", item.date || new Date().toISOString().slice(0, 10));
      setRowVal(row, headers, "Customer Name", item.customer || "");
      setRowVal(row, headers, "Product / Service", item.product || "Sale");
      setRowVal(row, headers, "Payment Received ₹", Number(item.amount || 0));
      setRowVal(row, headers, "Payment Mode", item.payment || "Cash");
      setRowVal(row, headers, "Notes", item.notes || "");
      setRowVal(row, headers, "Transaction ID", item.id || "");
      setRowVal(row, headers, "synced", true);

      // Any additional custom keys
      Object.keys(item).forEach(function(k) {
        var colName = mapFieldToColumn(k);
        if (headers.indexOf(colName) !== -1 && row[headers.indexOf(colName)] === "") {
          row[headers.indexOf(colName)] = item[k];
        }
      });

      return row;
    });

    // 4. Append all rows
    var startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rowsToAppend.length, headers.length).setValues(rowsToAppend);

    // Auto-resize columns
    for (var c = 1; c <= headers.length; c++) {
      sheet.autoResizeColumn(c);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      syncedCount: rowsToAppend.length,
      newTotalRows: sheet.getLastRow() - 1,
      headers: headers
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Frupearl Google Sheets Sync Service is active!",
    spreadsheetId: "1tgkhV3Y1T7T0n7S1l-Oo9K25lVW5YBZBtna_eAs7FBY"
  })).setMimeType(ContentService.MimeType.JSON);
}

function mapFieldToColumn(k) {
  if (k === 'date') return 'Date';
  if (k === 'customer') return 'Customer Name';
  if (k === 'product') return 'Product / Service';
  if (k === 'amount') return 'Payment Received ₹';
  if (k === 'payment') return 'Payment Mode';
  if (k === 'notes') return 'Notes';
  if (k === 'id') return 'Transaction ID';
  return k;
}

function setRowVal(row, headers, colName, val) {
  var idx = headers.indexOf(colName);
  if (idx !== -1) {
    row[idx] = val;
  }
}

