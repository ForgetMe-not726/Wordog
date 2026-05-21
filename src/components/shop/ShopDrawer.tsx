"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ShopAccessory {
  id: string;
  name: string;
  type: string;
  imageUrl: string;
  price: number;
  owned: boolean;
  equipped: boolean;
}

interface ShopBreed {
  id: string;
  name: string;
  imageUrl: string;
  unlockCost: number;
  isDefault: boolean;
  unlocked: boolean;
  active: boolean;
}

interface ShopData {
  foodCurrency: number;
  accessories: ShopAccessory[];
  breeds: ShopBreed[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  hat: "🎩",
  scarf: "🧣",
  glasses: "👓",
  collar: "💫",
  bow: "🎀",
};

export default function ShopDrawer({ open, onClose, onUpdate }: Props) {
  const [data, setData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/api/shop")
        .then((r) => r.json())
        .then(setData);
    }
  }, [open]);

  async function doAction(action: string, id: string, breed?: boolean) {
    setLoading(true);
    setActionMsg("");
    const r = await fetch("/api/dog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        breed ? { action, breedId: id } : { action, accessoryId: id },
      ),
    });
    const d = await r.json();
    setLoading(false);

    if (d.error) {
      setActionMsg(d.error === "Not enough food" ? "狗粮不足" : "操作失败");
    } else {
      onUpdate();
      // Refresh shop data
      fetch("/api/shop").then((r) => r.json()).then(setData);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto z-[80] px-4 pt-4 pb-8"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">🐶 商店</h2>
              {data && (
                <span className="bg-amber-50 text-amber-700 text-sm font-bold px-3 py-1 rounded-full">
                  🦴 {data.foodCurrency}
                </span>
              )}
            </div>

            {actionMsg && (
              <div className="mb-3 bg-red-50 text-red-400 text-sm text-center rounded-xl py-2">
                {actionMsg}
              </div>
            )}

            {/* Breeds section */}
            {data && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-600 mb-2 flex items-center gap-1">
                  <span>🐕</span> 狗狗品种
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {data.breeds.map((b) => (
                    <button
                      key={b.id}
                      disabled={loading || b.active}
                      onClick={() => {
                        if (!b.unlocked) doAction("unlock_breed", b.id, true);
                        else if (!b.active) doAction("switch_breed", b.id, true);
                      }}
                      className={`shrink-0 w-24 rounded-2xl p-2.5 text-center border transition-colors ${
                        b.active
                          ? "bg-green-50 border-green-300"
                          : b.unlocked
                            ? "bg-gray-50 border-gray-200 hover:bg-green-50"
                            : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      <p className="text-2xl mb-0.5">
                        {b.isDefault ? "🐕" : "🐶"}
                      </p>
                      <p className="text-[10px] font-bold text-gray-700 leading-tight">
                        {b.name}
                      </p>
                      {b.active ? (
                        <span className="text-[9px] text-green-500 font-bold">当前</span>
                      ) : b.unlocked ? (
                        <span className="text-[9px] text-blue-500 font-bold">已解锁</span>
                      ) : (
                        <span className="text-[9px] text-amber-600 font-bold">
                          🦴{b.unlockCost}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Accessories section */}
            {data && (
              <div>
                <h3 className="text-sm font-bold text-gray-600 mb-2 flex items-center gap-1">
                  <span>🎀</span> 装扮
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {data.accessories.map((a) => (
                    <button
                      key={a.id}
                      disabled={loading}
                      onClick={() => {
                        if (!a.owned) doAction("buy_accessory", a.id);
                        else doAction("equip", a.id);
                      }}
                      className={`rounded-2xl p-3 text-center border transition-colors ${
                        a.equipped
                          ? "bg-green-50 border-green-300"
                          : a.owned
                            ? "bg-gray-50 border-gray-200 hover:bg-green-50"
                            : "bg-white border-gray-100 hover:border-green-200"
                      }`}
                    >
                      <p className="text-xl mb-0.5">
                        {TYPE_ICONS[a.type] ?? "🎀"}
                      </p>
                      <p className="text-[10px] font-bold text-gray-700 leading-tight">
                        {a.name}
                      </p>
                      {a.equipped ? (
                        <span className="text-[9px] text-green-500 font-bold">已穿戴</span>
                      ) : a.owned ? (
                        <span className="text-[9px] text-blue-500 font-bold">穿戴</span>
                      ) : (
                        <span className="text-[9px] text-amber-600 font-bold">
                          🦴{a.price}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
