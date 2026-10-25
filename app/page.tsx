
"use client";

import { useMemo, useState } from "react";

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

export default function Home() {
  const [branch, setBranch] = useState(branches[0].id);
  const [category, setCategory] = useState("الكل");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [showCart, setShowCart] = useState(false);

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

  function sendWhatsApp() {
    if (count === 0) {
      alert("أضف المنتجات إلى السلة أولاً");
      return;
    }

    if (!selectedBranch.phone) {
      alert("رقم واتساب لهذا الفرع لم يُضف بعد. ستتم إضافته من الإعدادات لاحقاً.");
      return;
    }

    const lines = products
      .filter((p) => cart[p.id])
      .map((p) => `${p.name} × ${cart[p.id]} = ${(p.price * cart[p.id]).toFixed(2)} ريال`);

    const message = [
      "مرحباً، أريد طلباً من حليها",
      `الفرع: ${selectedBranch.name}`,
      "",
      ...lines,
      "",
      `الإجمالي: ${total.toFixed(2)} ريال`,
      "يرجى تأكيد الطلب ووقت الاستلام.",
    ].join("\n");

    window.open(
      `https://wa.me/${selectedBranch.phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
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
            onClick={() => setShowCart(!showCart)}
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
              className="w-full rounded-xl border border-pink-200 bg-white p-3 outline-pink-400"
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
                    aria-label={`إضافة ${p.name}`}
                  >
                    +
                  </button>
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

        {showCart && (
          <section className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-3">
            <div className="bg-white rounded-3xl p-5 w-full max-w-lg max-h-[85vh] overflow-auto">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">سلة الطلب</h2>
                <button onClick={() => setShowCart(false)} className="text-2xl">×</button>
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
                <span>الإجمالي</span><span>{total.toFixed(2)} ريال</span>
              </div>
              <button onClick={sendWhatsApp} className="w-full mt-5 rounded-xl bg-green-600 text-white p-4 font-black">
                إرسال الطلب عبر واتساب
              </button>
              <p className="text-xs text-gray-500 mt-3">
                الأسعار تجريبية، وأرقام واتساب الفروع تحتاج إلى إعداد قبل استقبال الطلبات.
              </p>
            </div>
          </section>
        )}
      </section>

      <footer className="bg-white border-t border-pink-100 p-6 text-center text-sm text-gray-500">
        حليها © جميع الحقوق محفوظة
      </footer>
    </main>
  );
}
