// Sync result types matching C# backend models

export enum ChangeType {
  Added = "Added",
  Updated = "Updated",
  NoChange = "NoChange",
  Failed = "Failed",
}

export interface FieldChange {
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface ProductChangeDetail {
  productName: string;
  finaId: number;
  internalId: string;
  changeType: ChangeType;
  fieldChanges: FieldChange[];
}

export interface SyncResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  processedItems: number;
  errors: string[];
}

export interface DetailedSyncResult extends SyncResult {
  addedCount: number;
  updatedCount: number;
  unchangedCount: number;
  productChanges: ProductChangeDetail[];
}

// Helper to format sync result as downloadable text
export function formatSyncResultAsLog(result: DetailedSyncResult): string {
  const lines: string[] = [];
  const timestamp = new Date().toISOString();
  const hasDetailedTracking = result.productChanges.length > 0;

  lines.push("=".repeat(80));
  lines.push("PRODUCT SYNC LOG");
  lines.push(`Timestamp: ${timestamp}`);
  lines.push("=".repeat(80));
  lines.push("");

  // Summary
  lines.push("SUMMARY");
  lines.push("-".repeat(80));

  if (hasDetailedTracking) {
    lines.push(`Total Processed: ${result.successCount + result.failureCount}`);
    lines.push(`✓ Added: ${result.addedCount}`);
    lines.push(`✓ Updated: ${result.updatedCount}`);
    lines.push(`○ Unchanged: ${result.unchangedCount}`);
    lines.push(`✗ Failed: ${result.failureCount}`);
  } else {
    // Basic tracking mode
    lines.push(`Total Processed: ${result.processedItems}`);
    lines.push(`✓ Successful: ${result.successCount}`);
    lines.push(`✗ Failed: ${result.failureCount}`);
    lines.push("");
    lines.push("Note: Detailed change tracking not available.");
    lines.push("Update backend to enable product-level change details.");
  }

  lines.push(`Overall Status: ${result.success ? "SUCCESS" : "COMPLETED WITH ERRORS"}`);
  lines.push("");

  // Errors section
  if (result.errors && result.errors.length > 0) {
    lines.push("ERRORS");
    lines.push("-".repeat(80));
    result.errors.forEach((error, index) => {
      lines.push(`${index + 1}. ${error}`);
    });
    lines.push("");
  }

  // Product changes
  if (result.productChanges && result.productChanges.length > 0) {
    lines.push("DETAILED CHANGES");
    lines.push("-".repeat(80));

    // Group by change type
    const added = result.productChanges.filter((p) => p.changeType === ChangeType.Added);
    const updated = result.productChanges.filter((p) => p.changeType === ChangeType.Updated);
    const unchanged = result.productChanges.filter((p) => p.changeType === ChangeType.NoChange);
    const failed = result.productChanges.filter((p) => p.changeType === ChangeType.Failed);

    if (added.length > 0) {
      lines.push("");
      lines.push(`[ADDED PRODUCTS] (${added.length})`);
      lines.push("");
      added.forEach((product, index) => {
        lines.push(`${index + 1}. ${product.productName}`);
        lines.push(`   FINA ID: ${product.finaId}`);
        lines.push(`   Internal ID: ${product.internalId}`);
        if (product.fieldChanges.length > 0) {
          lines.push("   Initial Values:");
          product.fieldChanges.forEach((change) => {
            lines.push(`     • ${change.fieldName}: ${change.newValue}`);
          });
        }
        lines.push("");
      });
    }

    if (updated.length > 0) {
      lines.push("");
      lines.push(`[UPDATED PRODUCTS] (${updated.length})`);
      lines.push("");
      updated.forEach((product, index) => {
        lines.push(`${index + 1}. ${product.productName}`);
        lines.push(`   FINA ID: ${product.finaId}`);
        lines.push(`   Internal ID: ${product.internalId}`);
        if (product.fieldChanges.length > 0) {
          lines.push("   Changed Fields:");
          product.fieldChanges.forEach((change) => {
            lines.push(`     • ${change.fieldName}:`);
            lines.push(`       Old: ${change.oldValue || "(empty)"}`);
            lines.push(`       New: ${change.newValue || "(empty)"}`);
          });
        }
        lines.push("");
      });
    }

    if (unchanged.length > 0) {
      lines.push("");
      lines.push(`[UNCHANGED PRODUCTS] (${unchanged.length})`);
      lines.push("");
      unchanged.forEach((product, index) => {
        lines.push(`${index + 1}. ${product.productName} (FINA ID: ${product.finaId})`);
      });
      lines.push("");
    }

    if (failed.length > 0) {
      lines.push("");
      lines.push(`[FAILED PRODUCTS] (${failed.length})`);
      lines.push("");
      failed.forEach((product, index) => {
        lines.push(`${index + 1}. ${product.productName}`);
        lines.push(`   FINA ID: ${product.finaId}`);
        lines.push(`   Reason: Check error logs above`);
        lines.push("");
      });
    }
  }

  lines.push("=".repeat(80));
  lines.push("END OF LOG");
  lines.push("=".repeat(80));

  return lines.join("\n");
}

// Helper to format as CSV for Excel
export function formatSyncResultAsCSV(result: DetailedSyncResult): string {
  const lines: string[] = [];

  if (result.productChanges.length > 0) {
    // Detailed tracking mode - full CSV with product details
    lines.push(
      "Change Type,Product Name,FINA ID,Internal ID,Field Name,Old Value,New Value"
    );

    // Data rows
    result.productChanges.forEach((product) => {
      if (product.fieldChanges.length === 0) {
        // Product with no field changes
        lines.push(
          `${product.changeType},"${product.productName}",${product.finaId},${product.internalId},"","",""`
        );
      } else {
        // Product with field changes
        product.fieldChanges.forEach((change) => {
          const oldVal = (change.oldValue || "").replace(/"/g, '""');
          const newVal = (change.newValue || "").replace(/"/g, '""');

          lines.push(
            `${product.changeType},"${product.productName}",${product.finaId},${product.internalId},"${change.fieldName}","${oldVal}","${newVal}"`
          );
        });
      }
    });
  } else {
    // Basic tracking mode - simple summary CSV
    lines.push("Metric,Count");
    lines.push(`Total Processed,${result.processedItems}`);
    lines.push(`Successful,${result.successCount}`);
    lines.push(`Failed,${result.failureCount}`);

    if (result.errors.length > 0) {
      lines.push("");
      lines.push("Error Messages");
      result.errors.forEach((error) => {
        lines.push(`"${error.replace(/"/g, '""')}"`);
      });
    }
  }

  return lines.join("\n");
}

// Helper to format as JSON (prettified)
export function formatSyncResultAsJSON(result: DetailedSyncResult): string {
  return JSON.stringify(result, null, 2);
}

// Download helper
export function downloadSyncLog(
  result: DetailedSyncResult,
  format: "txt" | "csv" | "json" = "txt"
) {
  let content: string;
  let filename: string;
  let mimeType: string;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  switch (format) {
    case "csv":
      content = formatSyncResultAsCSV(result);
      filename = `sync-log-${timestamp}.csv`;
      mimeType = "text/csv";
      break;
    case "json":
      content = formatSyncResultAsJSON(result);
      filename = `sync-log-${timestamp}.json`;
      mimeType = "application/json";
      break;
    default:
      content = formatSyncResultAsLog(result);
      filename = `sync-log-${timestamp}.txt`;
      mimeType = "text/plain";
  }

  // Create blob and download
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
