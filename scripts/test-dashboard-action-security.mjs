import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const dashboardDir = path.join(projectRoot, "lib", "dashboard");
const actionFiles = fs.readdirSync(dashboardDir)
  .filter((name) => name.endsWith("-actions.ts"))
  .sort();

if (!actionFiles.length) {
  throw new Error("Không tìm thấy server action nào của dashboard để kiểm tra.");
}

for (const fileName of actionFiles) {
  const source = fs.readFileSync(path.join(dashboardDir, fileName), "utf8");
  if (!source.includes('"use server"')) {
    throw new Error(`${fileName} phải khai báo use server.`);
  }
  if (!source.includes("requireDashboardSession()")) {
    throw new Error(`${fileName} phải kiểm tra dashboard session trước khi truy cập dữ liệu.`);
  }
}

console.log(`DASHBOARD_ACTION_SECURITY_PASS files=${actionFiles.length}`);
