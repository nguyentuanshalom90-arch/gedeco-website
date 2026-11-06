/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/vimigo-icon";
import {
  listIntegrations,
  saveIntegration,
} from "@/lib/dashboard/integration-actions";
import type {
  IntegrationCategory,
  IntegrationItem,
} from "@/lib/dashboard/integration-types";

export function IntegrationManager({
  category,
}: {
  category: IntegrationCategory;
}) {
  const [items, setItems] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    setLoading(true);
    setMessage("");
    setError("");
    listIntegrations(category)
      .then(setItems)
      .catch((reason) =>
        setError(
          reason instanceof Error ? reason.message : "Không tải được cấu hình.",
        ),
      )
      .finally(() => setLoading(false));
  }, [category]);
  const update = (provider: string, patch: Partial<IntegrationItem>) =>
    setItems((current) =>
      current.map((item) =>
        item.provider === provider ? { ...item, ...patch } : item,
      ),
    );
  const config = (provider: string, key: string, value: string | boolean) =>
    setItems((current) =>
      current.map((item) =>
        item.provider === provider
          ? { ...item, config: { ...item.config, [key]: value } }
          : item,
      ),
    );
  async function persist(item: IntegrationItem) {
    setSaving(item.provider);
    setMessage("");
    setError("");
    try {
      await saveIntegration(item);
      setMessage(`Đã lưu cấu hình ${item.name}.`);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Lưu cấu hình thất bại.",
      );
    } finally {
      setSaving(null);
    }
  }
  const isPayment = category === "PAYMENT";
  const master = items.find(
    (item) =>
      item.provider === (isPayment ? "payment-master" : "shipping-options"),
  );
  const providers = items.filter((item) => item !== master);
  if (loading) return <p className="cms-empty">Đang tải cấu hình…</p>;
  return (
    <section className="integration-page">
      <div className="dashboard-view-head">
        <p className="eyebrow">TÍCH HỢP GEDECO</p>
        <h1 className="disp">{isPayment ? "Thanh toán" : "Vận chuyển"}</h1>
        <p>
          {isPayment
            ? "Quản lý cổng thanh toán và thông tin nhận tiền."
            : "Quản lý tùy chọn giao hàng và các đơn vị vận chuyển."}
        </p>
      </div>
      {(message || error) && (
        <div className={`cms-notice ${error ? "error" : "success"}`}>
          {error || message}
        </div>
      )}
      {master && (
        <section className="panel integration-master">
          <div className="integration-icon">
            <Icon name={isPayment ? "creditCard" : "truck"} size={24} />
          </div>
          <div>
            <strong>{master.name}</strong>
            <p>{master.description}</p>
          </div>
          <button
            type="button"
            className={`cms-switch ${master.enabled ? "on" : ""}`}
            aria-pressed={master.enabled}
            onClick={() =>
              update(master.provider, { enabled: !master.enabled })
            }
          >
            <span />
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={saving === master.provider}
            onClick={() => void persist(master)}
          >
            {saving === master.provider ? "Đang lưu…" : "Lưu thiết lập"}
          </button>
        </section>
      )}
      {!isPayment && master && (
        <section className="panel integration-options">
          <h2>Tùy chọn vận chuyển</h2>
          {[
            [
              "customerChoice",
              "Cho khách chọn đơn vị vận chuyển",
              "Hiển thị danh sách hãng để khách tự chọn.",
            ],
            [
              "realtimeFee",
              "Tính phí vận chuyển theo thời gian thực",
              "Kết nối API để tính phí theo địa chỉ và khối lượng.",
            ],
            [
              "tracking",
              "Theo dõi hành trình đơn hàng",
              "Cho khách xem trạng thái giao hàng trên website.",
            ],
          ].map(([key, name, description]) => (
            <label key={key}>
              <div>
                <strong>{name}</strong>
                <span>{description}</span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(master.config[key])}
                onChange={(event) =>
                  config(master.provider, key, event.target.checked)
                }
              />
            </label>
          ))}
        </section>
      )}
      <section className="panel integration-providers">
        <div className="cms-section-head">
          <div>
            <p className="eyebrow">NHÀ CUNG CẤP</p>
            <h2>{isPayment ? "Cổng và ví thanh toán" : "Đơn vị vận chuyển"}</h2>
          </div>
          <span>
            {providers.filter((item) => item.enabled).length}/{providers.length}{" "}
            đang bật
          </span>
        </div>
        <div className="integration-list">
          {providers.map((item) => (
            <article key={item.provider} className="integration-row">
              {item.logo ? (
                <div className="integration-logo">
                  <img src={item.logo} alt={`Logo ${item.name}`} />
                </div>
              ) : (
                <div className="integration-logo">
                  <Icon name={isPayment ? "creditCard" : "truck"} />
                </div>
              )}
              <div>
                <strong>{item.name}</strong>
                <span>{item.description}</span>
              </div>
              <button
                type="button"
                className={`cms-switch ${item.enabled ? "on" : ""}`}
                aria-pressed={item.enabled}
                onClick={() =>
                  update(item.provider, { enabled: !item.enabled })
                }
              >
                <span />
              </button>
              <button
                type="button"
                className="btn"
                disabled={saving === item.provider}
                onClick={() => void persist(item)}
              >
                {saving === item.provider ? "Đang lưu…" : "Lưu"}
              </button>
            </article>
          ))}
        </div>
      </section>
      {isPayment &&
        items.some((item) => item.provider === "sepay") &&
        (() => {
          const sepay = items.find((item) => item.provider === "sepay")!;
          return (
            <section className="panel integration-form">
              <div>
                <p className="eyebrow">ĐỐI SOÁT TỰ ĐỘNG</p>
                <h2>Thông tin nhận thanh toán qua SePay</h2>
                <p>
                  Khóa API được lưu ở phía máy chủ và không hiển thị lại trên
                  giao diện.
                </p>
              </div>
              <div className="integration-form-grid">
                <label className="field">
                  <span>Ngân hàng</span>
                  <input
                    className="input"
                    value={String(sepay.config.bank || "")}
                    onChange={(event) =>
                      config("sepay", "bank", event.target.value)
                    }
                  />
                </label>
                <label className="field">
                  <span>Số tài khoản</span>
                  <input
                    className="input"
                    value={String(sepay.config.accountNumber || "")}
                    onChange={(event) =>
                      config("sepay", "accountNumber", event.target.value)
                    }
                  />
                </label>
                <label className="field">
                  <span>Tên chủ tài khoản</span>
                  <input
                    className="input"
                    value={String(sepay.config.accountName || "")}
                    onChange={(event) =>
                      config("sepay", "accountName", event.target.value)
                    }
                  />
                </label>
                <label className="field">
                  <span>Khóa API mới</span>
                  <input
                    className="input"
                    type="password"
                    value={String(sepay.config.apiKey || "")}
                    onChange={(event) =>
                      config("sepay", "apiKey", event.target.value)
                    }
                    autoComplete="new-password"
                  />
                </label>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={saving === "sepay"}
                onClick={() => void persist(sepay)}
              >
                Lưu cấu hình SePay
              </button>
            </section>
          );
        })()}
    </section>
  );
}
