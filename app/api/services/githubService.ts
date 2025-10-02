import type { TenantConfig } from "@/types/tenant";

import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER || "";
const repo = process.env.GITHUB_REPO || "";
const branch = process.env.GITHUB_BRANCH || "main";
const filePath = "config/tenat.ts";

export interface GitHubFileResponse {
  content: string;
  sha: string;
}

/**
 * Get the current tenant configuration file from GitHub
 */
export async function getTenantConfigFromGitHub(): Promise<GitHubFileResponse> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branch,
    });

    if ("content" in data && data.type === "file") {
      const content = Buffer.from(data.content, "base64").toString("utf-8");

      return {
        content,
        sha: data.sha,
      };
    }

    throw new Error("File not found or is not a file");
  } catch (error: any) {
    throw new Error(`Failed to fetch tenant config from GitHub: ${error.message}`);
  }
}

/**
 * Parse the TENANTS object from the file content
 */
export function parseTenants(content: string): Record<string, TenantConfig> {
  try {
    // Extract the TENANTS object from the file
    const tenantsMatch = content.match(/export const TENANTS: Record<string, TenantConfig> = ({[\s\S]*?^});/m);

    if (!tenantsMatch) {
      throw new Error("Could not find TENANTS object in file");
    }

    // Use eval to parse the object (safe because we control the source)
    // Note: In production, you might want to use a proper TypeScript parser
    const tenantsStr = tenantsMatch[1];
    // eslint-disable-next-line no-eval
    const tenants = eval(`(${tenantsStr})`);

    return tenants;
  } catch (error: any) {
    throw new Error(`Failed to parse tenants: ${error.message}`);
  }
}

/**
 * Convert TENANTS object back to TypeScript code string
 */
export function stringifyTenants(tenants: Record<string, TenantConfig>): string {
  // Convert to JSON with proper indentation
  const tenantsJson = JSON.stringify(tenants, null, 2);

  // Convert JSON to TypeScript object literal format
  // This is a simplified version - in production you'd want a proper formatter
  let formatted = tenantsJson
    .replace(/"([^"]+)":/g, "$1:")  // Remove quotes from keys
    .replace(/: "([^"]+)"/g, ': "$1"')  // Keep quotes for string values
    .replace(/: (\d+)/g, ": $1")  // Keep numbers unquoted
    .replace(/: (true|false)/g, ": $1");  // Keep booleans unquoted

  return formatted;
}

/**
 * Generate the full file content with proper TypeScript formatting
 */
export function generateFileContent(tenants: Record<string, TenantConfig>): string {
  const tenantsStr = JSON.stringify(tenants, null, 2);

  return `import type { TenantConfig } from "@/types/tenant";

export const TENANTS: Record<string, TenantConfig> = ${tenantsStr};

export const DEFAULT_TENANT: TenantConfig = TENANTS["localhost:3000"];
`;
}

/**
 * Update the tenant configuration file on GitHub
 */
export async function updateTenantConfigOnGitHub(
  tenants: Record<string, TenantConfig>,
  sha: string,
  commitMessage: string,
): Promise<void> {
  try {
    const content = generateFileContent(tenants);
    const contentBase64 = Buffer.from(content).toString("base64");

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: commitMessage,
      content: contentBase64,
      sha,
      branch,
    });
  } catch (error: any) {
    throw new Error(`Failed to update tenant config on GitHub: ${error.message}`);
  }
}

/**
 * Add a new tenant to the configuration
 */
export async function addTenant(
  domain: string,
  config: TenantConfig,
): Promise<void> {
  const { content, sha } = await getTenantConfigFromGitHub();
  const tenants = parseTenants(content);

  if (tenants[domain]) {
    throw new Error(`Tenant with domain "${domain}" already exists`);
  }

  tenants[domain] = config;

  await updateTenantConfigOnGitHub(
    tenants,
    sha,
    `Add tenant configuration for ${domain}`,
  );
}

/**
 * Update an existing tenant configuration
 */
export async function updateTenant(
  domain: string,
  config: TenantConfig,
): Promise<void> {
  const { content, sha } = await getTenantConfigFromGitHub();
  const tenants = parseTenants(content);

  if (!tenants[domain]) {
    throw new Error(`Tenant with domain "${domain}" not found`);
  }

  tenants[domain] = config;

  await updateTenantConfigOnGitHub(
    tenants,
    sha,
    `Update tenant configuration for ${domain}`,
  );
}

/**
 * Delete a tenant from the configuration
 */
export async function deleteTenant(domain: string): Promise<void> {
  const { content, sha } = await getTenantConfigFromGitHub();
  const tenants = parseTenants(content);

  if (!tenants[domain]) {
    throw new Error(`Tenant with domain "${domain}" not found`);
  }

  delete tenants[domain];

  await updateTenantConfigOnGitHub(
    tenants,
    sha,
    `Delete tenant configuration for ${domain}`,
  );
}