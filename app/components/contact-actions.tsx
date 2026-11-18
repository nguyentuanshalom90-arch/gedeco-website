"use client";

import { useEffect, useState } from "react";

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 4.5 9 4l2 4-2 1.5a14 14 0 0 0 5.5 5.5L16 13l4 2-.5 2.5c-.2 1-1.2 1.7-2.2 1.5C10.3 17.8 6.2 13.7 5 6.7c-.2-1 .5-2 1.5-2.2Z" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" />
    </svg>
  );
}

export function ContactActions({ english = false }: { english?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [chrome, setChrome] = useState<
    Record<
      string,
      { value: string; url: string; imageUrl: string; altText: string }
    >
  >({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 260);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    fetch(`/api/site-chrome?area=FOOTER&lang=${english ? "en" : "vi"}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        setChrome(payload?.values || {});
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [english]);

  const defaults = english
    ? {
        quick: "Quick contact",
        zalo: "Chat on Zalo",
        phone: "Call 0914 94 3653",
        top: "Back to top",
      }
    : {
        quick: "Liên hệ nhanh",
        zalo: "Chat qua Zalo",
        phone: "Gọi 0914 94 3653",
        top: "Lên đầu trang",
      };
  const labels = {
    quick: chrome["floating.quick"]?.value || defaults.quick,
    zalo: chrome["floating.zalo"]?.value || defaults.zalo,
    phone: chrome["floating.phone"]?.value || defaults.phone,
    top: chrome["floating.top"]?.value || defaults.top,
  };
  const safeUrl = (value: string | undefined, fallback: string) => {
    if (!value) return fallback;
    if (/^tel:\+?[0-9 .()-]+$/i.test(value)) return value;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password
        ? url.toString()
        : fallback;
    } catch {
      return fallback;
    }
  };
  const showZalo = !loaded || Boolean(chrome["floating.zalo"]);
  const showPhone = !loaded || Boolean(chrome["floating.phone"]);
  const showTop = !loaded || Boolean(chrome["floating.top"]);
  return (
    <div className="bimiFloatingTools" aria-label={labels.quick}>
      {showZalo && (
        <a
          className="bimiFloatingButton bimiFloatingContact bimiFloatingZalo"
          href={safeUrl(
            chrome["floating.zalo"]?.url,
            "https://zalo.me/0914943653",
          )}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={labels.zalo}
          title={labels.zalo}
        >
          <img
            src={
              chrome["floating.zalo"]?.imageUrl ||
              "/assets/contact-icons/zalo-chat.optimized.webp"
            }
            alt={chrome["floating.zalo"]?.altText || "Zalo"}
          />
        </a>
      )}
      {showPhone && (
        <a
          className="bimiFloatingButton bimiFloatingContact bimiFloatingPhone"
          href={safeUrl(chrome["floating.phone"]?.url, "tel:0914943653")}
          aria-label={labels.phone}
          title={labels.phone}
        >
          <PhoneIcon />
        </a>
      )}
      {showTop && (
        <button
          type="button"
          className={`bimiFloatingButton bimiFloatingTop${visible ? " isVisible" : ""}`}
          aria-label={labels.top}
          title={labels.top}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUpIcon />
        </button>
      )}
    </div>
  );
}
