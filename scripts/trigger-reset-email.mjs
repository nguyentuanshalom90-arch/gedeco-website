const baseUrl = "http://127.0.0.1:3000";

async function main() {
  console.log("Gửi yêu cầu reset password cho user chucnguyen...");
  const res = await fetch(`${baseUrl}/api/dashboard/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "request",
      identifier: "contract.gedeco@gmail.com"
    })
  });

  const data = await res.json().catch(() => ({}));
  console.log("Status:", res.status);
  console.log("Response:", data);
}

main().catch(console.error);
