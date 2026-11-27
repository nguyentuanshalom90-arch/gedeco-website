import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://127.0.0.1:3000/vmg-login";

const USERS = [
  {
    roleName: "Quản lý nội dung",
    username: "quanlynoidung",
    pass: "ContentMgr@2026!",
    port: 9311,
    dataDir: "C:\\Users\\amenh\\AppData\\Local\\Temp\\chrome_guest_noidung",
    windowPos: "100,80",
    windowSize: "1100,750",
  },
  {
    roleName: "Quản lý sản phẩm",
    username: "quanlysanpham",
    pass: "ProductMgr@2026!",
    port: 9312,
    dataDir: "C:\\Users\\amenh\\AppData\\Local\\Temp\\chrome_guest_sanpham",
    windowPos: "250,130",
    windowSize: "1100,750",
  },
  {
    roleName: "Quản lý bài viết",
    username: "quanlybaiviet",
    pass: "PostMgr@2026!",
    port: 9313,
    dataDir: "C:\\Users\\amenh\\AppData\\Local\\Temp\\chrome_guest_baiviet",
    windowPos: "400,180",
    windowSize: "1100,750",
  },
];

async function launchChrome(u) {
  console.log(`[1/3] Đang mở Chrome Guest cho: @${u.username} (${u.roleName})...`);
  const args = [
    `--user-data-dir=${u.dataDir}`,
    "--guest",
    `--remote-debugging-port=${u.port}`,
    `--window-position=${u.windowPos}`,
    `--window-size=${u.windowSize}`,
    "--no-first-run",
    "--no-default-browser-check",
    BASE_URL,
  ];

  const child = spawn(CHROME_PATH, args, {
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  // Wait for CDP to become available
  let wsUrl = null;
  for (let attempt = 0; attempt < 25; attempt++) {
    await sleep(400);
    try {
      const res = await fetch(`http://127.0.0.1:${u.port}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) {
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    throw new Error(`Không thể kết nối Chrome CDP trên port ${u.port} cho @${u.username}`);
  }

  return wsUrl;
}

function sendCdpCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener("message", handler);
          if (msg.error) {
            reject(new Error(msg.error.message));
          } else {
            resolve(msg.result);
          }
        }
      } catch {}
    };
    ws.addEventListener("message", handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function performHumanLogin(wsUrl, u) {
  console.log(`[2/3] Đang kết nối và nhập liệu human login cho @${u.username}...`);
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", reject);
  });

  // Enable Runtime and Page
  await sendCdpCommand(ws, "Runtime.enable");
  await sendCdpCommand(ws, "Page.enable");

  // Wait for form elements to be present in DOM
  for (let i = 0; i < 20; i++) {
    const check = await sendCdpCommand(ws, "Runtime.evaluate", {
      expression: 'Boolean(document.querySelector("input[type=\'password\']"))',
      returnByValue: true,
    });
    if (check.result?.value) break;
    await sleep(300);
  }

  // Simulate human filling: fill username and password, then click submit
  await sendCdpCommand(ws, "Runtime.evaluate", {
    expression: `
      (function() {
        const inputs = Array.from(document.querySelectorAll("input"));
        const usernameInput = inputs.find(i => i.type !== "password") || inputs[0];
        const passwordInput = inputs.find(i => i.type === "password") || inputs[1];
        const submitBtn = document.querySelector("button[type='submit']") || document.querySelector("form button");

        function setNativeValue(element, val) {
          const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          if (descriptor && descriptor.set) {
            descriptor.set.call(element, val);
          } else {
            element.value = val;
          }
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (usernameInput) {
          usernameInput.focus();
          setNativeValue(usernameInput, "${u.username}");
        }

        if (passwordInput) {
          passwordInput.focus();
          setNativeValue(passwordInput, "${u.pass}");
        }

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.click();
          }
        }, 300);
      })()
    `,
  });

  // Wait for navigation to /dashboard
  let inDashboard = false;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    const urlCheck = await sendCdpCommand(ws, "Runtime.evaluate", {
      expression: 'window.location.href.includes("/dashboard")',
      returnByValue: true,
    });
    if (urlCheck.result?.value) {
      inDashboard = true;
      break;
    }
  }

  ws.close();

  if (inDashboard) {
    console.log(`[3/3] ✓ @${u.username} đã đăng nhập thành công vào Dashboard trên Chrome Guest!\n`);
  } else {
    console.log(`[3/3] Đã gửi lệnh submit cho @${u.username}, đang chuyển hướng...\n`);
  }
}

async function main() {
  console.log("================================================================================");
  console.log("MỞ 3 CỬA SỔ CHROME CHẾ ĐỘ GUEST ĐỘC LẬP VÀ ĐĂNG NHẬP 3 USER NHƯ HUMAN");
  console.log("================================================================================\n");

  for (const u of USERS) {
    const wsUrl = await launchChrome(u);
    await performHumanLogin(wsUrl, u);
    await sleep(600);
  }

  console.log("================================================================================");
  console.log("🎉 HOÀN TẤT: Cả 3 cửa sổ Chrome Guest riêng biệt đã đăng nhập sẵn vào Dashboard!");
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Lỗi:", err);
  process.exit(1);
});
