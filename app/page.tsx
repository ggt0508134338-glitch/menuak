
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const branches = [
  { id: "hamdaniyah", name: "فرع الحمدانية", phone: "" },
  { id: "harazat", name: "فرع الحرزات", phone: "" },
  { id: "safa", name: "فرع الصفا", phone: "" },
];

const products = [
  { id: 1, name: "لقيمات سادة", category: "لقيمات", price: 19, emoji: "🍯", description: "لقيمات ذهبية طازجة" },
  { id: 2, name: "لقيمات بستاشيو", category: "لقيمات", price: 25, emoji: "💚", description: "مع صوص الفستق" },
  { id: 3, name: "لقيمات مكس", category: "لقيمات", price: 29, emoji: "🍩", description: "تشكيلة صوصات لذيذة" },
  { id: 4, name: "دونات سكر", category: "دونات", price: 19, emoji: "🍩", description: "دونات طرية بالسكر" },
  { id: 5, name: "دونات شوكولاتة", category: "دونات", price: 25, emoji: "🍫", description: "مع صوص الشوكولاتة" },
  { id: 6, name: "دونات مكس", category: "دونات", price: 29, emoji: "🍩", description: "تشكيلة من الدونات" },
  { id: 7, name: "كنافة سادة", category: "كنافة", price: 15, emoji: "🧁", description: "كنافة طازجة" },
  { id: 8, name: "كنافة بستاشيو", category: "كنافة", price: 17, emoji: "💚", description: "كنافة بصوص الفستق" },
  { id: 9, name: "كنافة شوكولاتة", category: "كنافة", price: 22, emoji: "🍫", description: "كنافة بالشوكولاتة" },
  { id: 10, name: "كنافة مكس", category: "كنافة", price: 20, emoji: "🍰", description: "مزيج من النكهات" },
];

const categories = ["الكل", "لقيمات", "دونات", "كنافة"];
const MAP_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

declare global {
  interface Window {
    google?: any;
    initHalehaMap?: () => void;
  }
}

type DeliveryDetails = {
  name: string;
  phone: string;
  district: string;
  street: string;
  building: string;
  apartment: string;
  notes: string;
};

export default function Home() {
  const [branch, setBranch] = useState(branches[0].id);
  const [category, setCategory] = useState("الكل");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [details, setDetails] = useState<DeliveryDetails>({
    name: "",
    phone: "",
    district: "",
    street: "",
    building: "",
    apartment: "",
    notes: "",
  });

  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  const selectedBranch = branches.find((b) => b.id === branch)!;
  const visibleProducts = products.filter(
    (p) => category === "الكل" || p.category === category
  );
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const total = useMemo(
    () => products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0),
    [cart]
  );

  function changeQty(id: number, amount: number) {
    setCart((old) => {
      const next = { ...old };
      next[id] = Math.max(0, (next[id] || 0) + amount);
      if (next[id] === 0) delete next[id];
      return next;
    });
  }

  function updateDetail(key: keyof DeliveryDetails, value: string) {
    setDetails((old) => ({ ...old, [key]: value }));
  }

  useEffect(() => {
    if (!showCart || orderType !== "delivery") return;

    if (!MAP_KEY) {
      setMapError("الخريطة تحتاج إعداد مفتاح Google Maps في إعدادات المشروع.");
      return;
    }

    if (window.google?.maps) {
      initializeMap();
      return;
    }

    const existing = document.getElementById("google-maps-script") as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", initializeMap);
      return () => existing.removeEventListener("load", initializeMap);
    }

    window.initHalehaMap = initializeMap;

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAP_KEY)}&callback=initHalehaMap&language=ar&region=SA`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setMapError("تعذر تحميل الخريطة. تحقق من المفتاح وإعدادات Google Cloud.");
    document.head.appendChild(script);

    return () => {
      window.initHalehaMap = undefined;
    };

    function initializeMap() {
      if (!mapElement.current || !window.google?.maps) return;

      const google = window.google;
      const initial = coords || { lat: 21.5433, lng: 39.1728 };

      const map = new google.maps.Map(mapElement.current, {
        center: initial,
        zoom: 15,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        clickableIcons: false,
      });

      const marker = new google.maps.Marker({
        position: initial,
        map,
        draggable: true,
        title: "حدد موقع التوصيل",
      });

      const updateCoordinates = (position: any) => {
        if (!position) return;
        setCoords({
          lat: position.lat(),
          lng: position.lng(),
        });
      };

      map.addListener("click", (event: any) => {
        if (!event.latLng) return;
        marker.setPosition(event.latLng);
        updateCoordinates(event.latLng);
      });

      marker.addListener("dragend", () => {
        updateCoordinates(marker.getPosition());
      });

      mapInstance.current = map;
      markerInstance.current = marker;
      setMapReady(true);
      setMapError("");
    }
  }, [showCart, orderType]);

  function requestMyLocation() {
    if (!navigator.geolocation) {
      setMapError("المتصفح لا يدعم تحديد الموقع.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(point);
        mapInstance.current?.setCenter(point);
        mapInstance.current?.setZoom(17);
        markerInstance.current?.setPosition(point);
      },
      () => setMapError("تعذر تحديد موقعك. اسمح للموقع باستخدام الموقع أو حرّك الدبوس يدويًا."),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  function sendWhatsApp() {
    if (count === 0) {
      alert("أضف المنتجات إلى السلة أولاً.");
      return;
    }

    if (!selectedBranch.phone) {
      alert("رقم واتساب الفرع غير مضاف بعد. أضف الرقم الصحيح قبل استقبال الطلبات.");
      return;
    }

    if (orderType === "delivery") {
      if (
        !details.name.trim() ||
        !details.phone.trim() ||
        !details.district.trim() ||
        !details.street.trim() ||
        !details.building.trim() ||
        !coords
      ) {
        alert("أكمل بيانات العميل والعنوان وحدد موقع التوصيل على الخريطة.");
        return;
      }
    }

    const lines = products
      .filter((p) => cart[p.id])
      .map((p) => `${p.name} × ${cart[p.id]} = ${p.price * cart[p.id]} ريال`);

    const addressLines =
      orderType === "delivery"
        ? [
            "",
            "بيانات العميل والتوصيل:",
            `الاسم: ${details.name}`,
            `جوال العميل: ${details.phone}`,
            `الحي: ${details.district}`,
            `الشارع: ${details.street}`,
            `رقم المبنى: ${details.building}`,
            `رقم الشقة: ${details.apartment || "غير محدد"}`,
            `تفاصيل إضافية: ${details.notes || "لا يوجد"}`,
            `خط العرض: ${coords!.lat}`,
            `خط الطول: ${coords!.lng}`,
            `رابط الموقع: https://www.google.com/maps?q=${coords!.lat},${coords!.lng}`,
          ]
        : ["نوع الطلب: استلام من الفرع"];

    const message = [
      "مرحباً، أريد طلباً من حليها",
      `الفرع: ${selectedBranch.name}`,
      `نوع الطلب: ${orderType === "delivery" ? "توصيل إلى المنزل" : "استلام من الفرع"}`,
      "",
      ...lines,
      ...addressLines,
      "",
      `إجمالي المنتجات: ${total.toFixed(2)} ريال`,
      "رسوم التوصيل: تحددها الإدارة عند تأكيد الطلب",
      "يرجى تأكيد الطلب والإجمالي النهائي ووقت التوصيل.",
    ].join("\n");

    const phone = selectedBranch.phone.replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.location.href = url;
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#fff8fb] text-[#422635]">
      <header className="bg-white border-b border-pink-100">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-3xl font-black text-pink-600">حليها ♡</div>
            <p className="text-sm text-gray-500 mt-1">حلا يضبط مزاجك</p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="rounded-2xl bg-pink-600 text-white px-4 py-3 font-bold"
          >
            🛒 السلة ({count})
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-7">
        <div className="rounded-3xl bg-gradient-to-l from-pink-200 via-pink-100 to-white p-6 md:p-10">
          <p className="text-pink-600 font-bold mb-2">أهلاً بك في حليها</p>
          <h1 className="text-3xl md:text-5xl font-black leading-tight">
            لحظات حلوة تبدأ من هنا 🍩
          </h1>
          <p className="mt-3 text-gray-600">
            اختر حلاك المفضل، وحدد الفرع، وأرسل طلبك عبر واتساب.
          </p>
          <div className="mt-6 max-w-md">
            <label className="block font-bold mb-2">اختر الفرع</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full rounded-xl border border-pink-200 bg-white p-3"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto py-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-5 py-2 font-bold ${
                category === c
                  ? "bg-pink-600 text-white"
                  : "bg-white border border-pink-200 text-pink-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-10">
          {visibleProducts.map((p) => (
            <article key={p.id} className="rounded-2xl bg-white border border-pink-100 overflow-hidden shadow-sm">
              <div className="h-32 md:h-40 bg-pink-50 flex items-center justify-center text-6xl">
                {p.emoji}
              </div>
              <div className="p-3 md:p-4">
                <h2 className="font-black">{p.name}</h2>
                <p className="text-sm text-gray-500 mt-1 min-h-10">{p.description}</p>
                <div className="flex items-center justify-between gap-2 mt-3">
                  <strong className="text-pink-600">{p.price} ريال</strong>
                  <button
                    onClick={() => changeQty(p.id, 1)}
                    className="rounded-xl bg-pink-600 text-white px-3 py-2 font-bold"
                  >+</button>
                </div>
                {(cart[p.id] || 0) > 0 && (
                  <div className="flex items-center justify-between mt-3 rounded-xl bg-pink-50 p-2">
                    <button onClick={() => changeQty(p.id, -1)} className="px-3 font-bold">−</button>
                    <span>{cart[p.id]}</span>
                    <button onClick={() => changeQty(p.id, 1)} className="px-3 font-bold">+</button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {showCart && (
        <section className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-2">
          <div className="bg-white rounded-3xl p-5 w-full max-w-xl max-h-[92vh] overflow-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black">إتمام الطلب</h2>
              <button onClick={() => setShowCart(false)} className="text-3xl">×</button>
            </div>

            <p className="text-gray-500 mt-2">{selectedBranch.name}</p>

            <div className="divide-y mt-4">
              {products.filter((p) => cart[p.id]).map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold">{p.name}</div>
                    <div className="text-sm text-gray-500">{p.price} ريال × {cart[p.id]}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => changeQty(p.id, -1)}>−</button>
                    <span>{cart[p.id]}</span>
                    <button onClick={() => changeQty(p.id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-3 pt-4 flex justify-between font-black text-xl">
              <span>إجمالي المنتجات</span><span>{total.toFixed(2)} ريال</span>
            </div>

            <label className="block font-bold mt-5 mb-2">طريقة استلام الطلب</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOrderType("pickup")}
                className={`rounded-xl p-3 border font-bold ${orderType === "pickup" ? "bg-pink-600 text-white" : "border-pink-200"}`}
              >استلام من الفرع</button>
              <button
                onClick={() => setOrderType("delivery")}
                className={`rounded-xl p-3 border font-bold ${orderType === "delivery" ? "bg-pink-600 text-white" : "border-pink-200"}`}
              >توصيل للمنزل</button>
            </div>

            {orderType === "delivery" && (
              <div className="mt-5 space-y-3">
                <h3 className="font-black text-lg">حدد موقع التوصيل</h3>
                <p className="text-sm text-gray-600">
                  اضغط على الخريطة لاختيار الموقع، أو اسحب الدبوس إلى باب المنزل.
                </p>

                <div
                  ref={mapElement}
                  className="w-full h-72 rounded-2xl border border-pink-200 bg-gray-100"
                />

                <button
                  type="button"
                  onClick={requestMyLocation}
                  className="w-full rounded-xl border border-pink-300 p-3 font-bold"
                >📍 استخدم موقعي الحالي</button>

                {mapError && <p className="text-red-600 text-sm">{mapError}</p>}

                {coords && (
                  <p className="text-xs text-gray-600 break-all">
                    الإحداثيات: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                  </p>
                )}

                {!mapReady && !mapError && (
                  <p className="text-sm text-gray-500">جارٍ تجهيز الخريطة…</p>
                )}

                <h3 className="font-black text-lg pt-2">بيانات التوصيل</h3>

                {([
                  ["name", "اسم العميل"],
                  ["phone", "رقم جوال العميل"],
                  ["district", "الحي"],
                  ["street", "اسم الشارع"],
                  ["building", "رقم المبنى"],
                  ["apartment", "رقم الشقة (اختياري)"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="block text-sm font-bold mb-1">{label}</span>
                    <input
                      value={details[key]}
                      onChange={(e) => updateDetail(key, e.target.value)}
                      placeholder={label}
                      inputMode={key === "phone" || key === "building" || key === "apartment" ? "text" : "text"}
                      className="w-full rounded-xl border border-pink-200 p-3 outline-pink-400"
                    />
                  </label>
                ))}

                <label className="block">
                  <span className="block text-sm font-bold mb-1">تفاصيل إضافية (اختياري)</span>
                  <textarea
                    value={details.notes}
                    onChange={(e) => updateDetail("notes", e.target.value)}
                    placeholder="علامة مميزة أو تعليمات للمندوب"
                    className="w-full rounded-xl border border-pink-200 p-3 outline-pink-400"
                    rows={3}
                  />
                </label>
              </div>
            )}

            <button
              onClick={sendWhatsApp}
              className="w-full mt-5 rounded-xl bg-green-600 text-white p-4 font-black"
            >
              متابعة الطلب عبر واتساب
            </button>

            <p className="text-xs text-gray-500 mt-3">
              سيتم فتح واتساب برسالة جاهزة. راجع الرسالة واضغط إرسال لتأكيد الطلب.
              رسوم التوصيل غير محددة بعد، وسيتم تأكيدها من الفرع.
            </p>
          </div>
        </section>
      )}

      <footer className="bg-white border-t border-pink-100 p-6 text-center text-sm text-gray-500">
        حليها © جميع الحقوق محفوظة
      </footer>
    </main>
  );
}
