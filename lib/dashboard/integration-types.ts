export type IntegrationCategory = "PAYMENT" | "SHIPPING";
export type IntegrationItem = { category: IntegrationCategory; provider: string; name: string; description: string; logo: string | null; enabled: boolean; config: Record<string, string | boolean | number> };

export const integrationDefaults: IntegrationItem[] = [
  { category: "PAYMENT", provider: "payment-master", name: "Thanh toán trực tuyến", description: "Cho phép cấu hình các cổng thanh toán trên website.", logo: null, enabled: true, config: {} },
  { category: "PAYMENT", provider: "sepay", name: "SePay", description: "Tự động đối soát chuyển khoản ngân hàng theo thời gian thực.", logo: "/integrations/pay/sepay.webp", enabled: true, config: { accountNumber: "", bank: "", accountName: "", apiKey: "" } },
  { category: "PAYMENT", provider: "momo", name: "MoMo", description: "Ví điện tử MoMo, QR và app-to-app.", logo: "/integrations/pay/momo.optimized.webp", enabled: false, config: {} },
  { category: "PAYMENT", provider: "vnpay", name: "VNPay", description: "Thẻ nội địa, thẻ quốc tế và thanh toán QR.", logo: "/integrations/pay/vnpay.webp", enabled: false, config: {} },
  { category: "PAYMENT", provider: "vietqr", name: "VietQR", description: "Chuyển khoản nhanh bằng mã QR ngân hàng.", logo: "/integrations/pay/vnqr.optimized.webp", enabled: true, config: {} },
  { category: "PAYMENT", provider: "paypal", name: "PayPal", description: "Thanh toán quốc tế qua tài khoản PayPal.", logo: "/integrations/pay/paypal.optimized.webp", enabled: false, config: {} },
  { category: "PAYMENT", provider: "visa", name: "Visa", description: "Thanh toán bằng thẻ Visa quốc tế.", logo: "/integrations/pay/visa.optimized.webp", enabled: false, config: {} },
  { category: "PAYMENT", provider: "mastercard", name: "Mastercard", description: "Thanh toán bằng thẻ Mastercard quốc tế.", logo: "/integrations/pay/mastercard.optimized.webp", enabled: false, config: {} },
  { category: "SHIPPING", provider: "shipping-options", name: "Thiết lập vận chuyển", description: "Cấu hình cách khách chọn hãng, tính phí và theo dõi đơn.", logo: null, enabled: true, config: { customerChoice: true, realtimeFee: true, tracking: true } },
  { category: "SHIPPING", provider: "ghn", name: "Giao Hàng Nhanh", description: "Giao hàng toàn quốc, hỗ trợ COD.", logo: "/integrations/ship/ghn.optimized.webp", enabled: true, config: {} },
  { category: "SHIPPING", provider: "ghtk", name: "Giao Hàng Tiết Kiệm", description: "Tối ưu chi phí và giao nội thành nhanh.", logo: "/integrations/ship/ghtk.optimized.webp", enabled: true, config: {} },
  { category: "SHIPPING", provider: "viettel-post", name: "Viettel Post", description: "Phủ sóng rộng, gồm vùng sâu và vùng xa.", logo: "/integrations/ship/vtp.optimized.webp", enabled: true, config: {} },
  { category: "SHIPPING", provider: "jt", name: "J&T Express", description: "Giao nhanh và theo dõi hành trình tốt.", logo: "/integrations/ship/jt.optimized.webp", enabled: false, config: {} },
  { category: "SHIPPING", provider: "shopee-express", name: "Shopee Express", description: "Giao hàng và COD qua Shopee Express.", logo: "/integrations/ship/shopee.optimized.webp", enabled: false, config: {} },
  { category: "SHIPPING", provider: "vietnam-post", name: "Vietnam Post", description: "Dịch vụ bưu điện phủ toàn quốc.", logo: "/integrations/ship/vnpost.optimized.webp", enabled: false, config: {} },
  { category: "SHIPPING", provider: "grab-express", name: "GrabExpress", description: "Giao nhanh nội thành qua Grab.", logo: "/integrations/ship/grab.webp", enabled: false, config: {} },
];
