import { useState, useEffect, useCallback, useRef } from "react";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://pfjdamigdoytijskwefb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmamRhbWlnZG95dGlqc2t3ZWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjIxNjUsImV4cCI6MjA4Nzk5ODE2NX0.1XgWitzxaI5Dcy_aiNptCZ_e8HnOlGr8e7rz5j6_WjA";

async function sbFetch(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

async function sbPost(path, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { slug: "cinewhoops",    name: "Cinewhoops",    icon: "🚁" },
  { slug: "drones",        name: "Drones",        icon: "🛸" },
  { slug: "radiocontroles",name: "Radiocontroles",icon: "🎮" },
  { slug: "motores",       name: "Motores",       icon: "⚙️" },
  { slug: "baterias",      name: "Baterías",      icon: "🔋" },
  { slug: "video-fpv",     name: "Video FPV",     icon: "📡" },
  { slug: "camaras-fpv",   name: "Cámaras FPV",   icon: "📷" },
  { slug: "frames",        name: "Frames",        icon: "🔧" },
  { slug: "helices",       name: "Hélices",       icon: "🌀" },
  { slug: "accesorios",    name: "Accesorios",    icon: "🔗" },
  { slug: "receptores",    name: "Receptores",    icon: "📻" },
  { slug: "cargadores",    name: "Cargadores",    icon: "⚡" },
];

const EMOJI_MAP = { cinewhoops:"🚁",drones:"🛸",radiocontroles:"🎮",motores:"⚙️",baterias:"🔋","video-fpv":"📡","camaras-fpv":"📷",frames:"🔧",helices:"🌀",accesorios:"🔗",receptores:"📻",cargadores:"⚡" };

const fmtARS = n => "$\u00a0" + Number(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });
const fmtUSD = n => "USD\u00a0" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const timeAgo = d => { const s = (Date.now() - new Date(d)) / 1000; if (s < 3600) return `hace ${Math.floor(s/60)}min`; if (s < 86400) return `hace ${Math.floor(s/3600)}h`; return `hace ${Math.floor(s/86400)}d`; };

function getImage(p) {
  if (p.images && Array.isArray(p.images) && p.images.length > 0) {
    const main = p.images.find(i => i.is_main) || p.images[0];
    if (main?.url) return main.url;
  }
  return null;
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_STORES = [
  { id:"s1", slug:"tango-fpv", name:"TangoFPV", url:"https://tangofpv.com", city:"Córdoba", platform:"WooCommerce", logo_emoji:"🎯", badge:"FPV SPECIALIST", color:"#00d4ff", description:"Especialistas en FPV racing y freestyle. Servicio técnico, armado e impresión 3D. Los mejores precios en dólares.", tags:["FPV","Racing","Freestyle","Servicio técnico"], is_verified:true, rating:4.9 },
  { id:"s2", slug:"todo-para-tu-drone", name:"Todo Para Tu Drone", url:"https://todoparatudrone.com.ar", city:"Buenos Aires", platform:"Tiendanube", logo_emoji:"🛸", badge:"MÁS GRANDE AR", color:"#ff6b00", description:"La tienda más grande de accesorios DJI. +1000 productos, envío en el día CABA.", tags:["DJI","Accesorios","Envío rápido"], is_verified:true, rating:4.7 },
  { id:"s3", slug:"dji-store-ar", name:"DJI Store Argentina", url:"https://djistore.com.ar", city:"Buenos Aires", platform:"Tiendanube", logo_emoji:"✈️", badge:"DEALER OFICIAL DJI", color:"#00ff88", description:"Importador autorizado DJI. Showroom en Palermo. Cuotas Ahora 12 sin interés.", tags:["DJI Oficial","Cuotas","Garantía oficial"], is_verified:true, rating:4.8 },
  { id:"s4", slug:"rc-nitro", name:"RC Nitro Argentina", url:"https://rcnitro.com.ar", city:"Buenos Aires", platform:"WooCommerce", logo_emoji:"⚡", badge:"FPV & RC", color:"#ff00aa", description:"HappyModel, BetaFPV, GEPRC, DarwinFPV. Cinewhoops y tinywhoops.", tags:["FPV","Tinywhoop","Cinewhoop"], is_verified:true, rating:4.6 },
  { id:"s5", slug:"rc-online", name:"RC Online", url:"https://rconline.com.ar", city:"Buenos Aires", platform:"WordPress", logo_emoji:"🏢", badge:"Nro.1 EN AR", color:"#ffcc00", description:"Empresa Nro.1 en drones de Argentina. +10 años. Agente autorizado DJI.", tags:["Enterprise","Agricultura","DJI"], is_verified:true, rating:4.7 },
];

const SEED_CLASSIFIEDS = [
  { id:"c1", title:"DJI Mini 3 Pro – Excelente estado", category_slug:"drones", condition:"usado", price_ars:850000, price_usd:null, city:"Buenos Aires", description:"Poco uso, 8 vuelos. 3 baterías y bolso original. Sin golpes ni rayones.", img_emoji:"🚁", seller_name:"Martin_G", whatsapp:"+5491155551234", status:"active", is_verified_seller:false, created_at:"2026-02-28" },
  { id:"c2", title:"RadioMaster TX16S Mark II + ELRS", category_slug:"radiocontroles", condition:"usado", price_ars:280000, price_usd:null, city:"Córdoba", description:"Joysticks calibrados. Incluye funda y manuales originales.", img_emoji:"🎮", seller_name:"fpv_cba_racer", whatsapp:"+5493514445678", status:"active", is_verified_seller:true, created_at:"2026-02-25" },
  { id:"c3", title:"Baterías Tattu R-Line 6S 1300mAh x3", category_slug:"baterias", condition:"usado", price_ars:120000, price_usd:null, city:"Rosario", description:"40 ciclos promedio. Revisadas con iCharger. >95% capacidad.", img_emoji:"🔋", seller_name:"Rodrigo_FPV", whatsapp:"+5493413339012", status:"active", is_verified_seller:false, created_at:"2026-02-22" },
  { id:"c4", title:"Frame TBS Source One V5 5\" NUEVO", category_slug:"frames", condition:"nuevo", price_ars:null, price_usd:45, city:"Mendoza", description:"Nuevo sin usar, todos los tornillos incluidos.", img_emoji:"🔧", seller_name:"nico_builds", whatsapp:"+5492612223456", status:"active", is_verified_seller:false, created_at:"2026-02-27" },
];

// ─── COMPONENTES PEQUEÑOS ─────────────────────────────────────────────────────

function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return <>{t.toLocaleTimeString("es-AR")}</>;
}

function ProductImage({ p, height = 160, fontSize = "2.8rem" }) {
  const [err, setErr] = useState(false);
  const imgUrl = getImage(p);
  if (imgUrl && !err) {
    return (
      <img
        src={imgUrl}
        alt={p.name}
        onError={() => setErr(true)}
        style={{ width: "100%", height, objectFit: "cover", display: "block" }}
      />
    );
  }
  return (
    <div style={{ width: "100%", height, display: "flex", alignItems: "center", justifyContent: "center", fontSize, background: "#080f1a" }}>
      {EMOJI_MAP[p.category_slug] || p.img_emoji || "📦"}
    </div>
  );
}

// ─── TARJETA DE PRODUCTO ──────────────────────────────────────────────────────
function ProductCard({ p, onClick }) {
  const [hov, setHov] = useState(false);
  const isOnSale = p.sale_price_usd || p.sale_price_ars;

  return (
    <div
      onClick={() => onClick(p)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#0b1420",
        border: `1px solid ${hov ? "rgba(0,212,255,0.5)" : "#1a2d4a"}`,
        cursor: "pointer",
        transform: hov ? "translateY(-3px)" : "none",
        transition: "all 0.18s",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Imagen */}
      <div style={{ position: "relative", borderBottom: "1px solid #1a2d4a" }}>
        <ProductImage p={p} height={150} />
        {isOnSale && (
          <div style={{ position: "absolute", top: 8, left: 8, background: "#ff6b00", color: "#000", fontFamily: "monospace", fontSize: "0.5rem", fontWeight: 700, padding: "2px 7px", letterSpacing: 1 }}>
            OFERTA
          </div>
        )}
        {p.badge && !isOnSale && (
          <div style={{ position: "absolute", top: 8, left: 8, background: "#00d4ff", color: "#000", fontFamily: "monospace", fontSize: "0.5rem", fontWeight: 700, padding: "2px 7px", letterSpacing: 1 }}>
            {p.badge}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.5rem", letterSpacing: 2, color: p.store_color || "#00d4ff", textTransform: "uppercase" }}>
          {p.store_name}
        </div>
        <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: "0.78rem", color: "#e8f0f8", lineHeight: 1.35, flex: 1 }}>
          {p.name}
        </div>
        <div style={{ marginTop: 8 }}>
          {/* Precio tachado si hay oferta */}
          {isOnSale && (
            <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: "#555", textDecoration: "line-through" }}>
              {p.price_usd ? fmtUSD(p.price_usd) : fmtARS(p.price_ars)}
            </div>
          )}
          {/* Precio principal */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              {p.price_usd && (
                <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: "1rem", color: "#00d4ff" }}>
                  {fmtUSD(isOnSale && p.sale_price_usd ? p.sale_price_usd : p.price_usd)}
                </div>
              )}
              {p.price_ars && !p.price_usd && (
                <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: "1rem", color: "#00ff88" }}>
                  {fmtARS(isOnSale && p.sale_price_ars ? p.sale_price_ars : p.price_ars)}
                </div>
              )}
            </div>
            <div style={{ fontFamily: "monospace", fontSize: "0.52rem", color: "#00d4ff", letterSpacing: 1 }}>
              VER →
            </div>
          </div>
          {/* Cuotas y envío gratis */}
          <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
            {p.installments > 1 && (
              <span style={{ fontFamily: "monospace", fontSize: "0.5rem", padding: "2px 6px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", color: "#00ff88" }}>
                {p.installments}x SIN INTERÉS
              </span>
            )}
            {p.free_shipping && (
              <span style={{ fontFamily: "monospace", fontSize: "0.5rem", padding: "2px 6px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff" }}>
                ✈ ENVÍO GRATIS
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA DE DETALLE DE PRODUCTO ────────────────────────────────────────────
function ProductDetail({ product, onBack, onGoToStore }) {
  const [imgErr, setImgErr] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const imgUrl = getImage(product);
  const isOnSale = product.sale_price_usd || product.sale_price_ars;
  const effectivePrice = product.sale_price_usd || product.price_usd;

  useEffect(() => {
    window.scrollTo(0, 0);
    sbFetch(`/price_history?product_id=eq.${product.id}&order=recorded_at.desc&limit=10`)
      .then(setPriceHistory)
      .catch(() => {});
  }, [product.id]);

  return (
    <div style={{ minHeight: "100vh", background: "#040810", color: "#c8d8e8", paddingBottom: 60 }}>

      {/* Back bar */}
      <div style={{ background: "rgba(4,8,16,0.95)", borderBottom: "1px solid #1a2d4a", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(20px)" }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #1a2d4a", color: "#00d4ff", fontFamily: "monospace", fontSize: "0.65rem", padding: "6px 14px", cursor: "pointer", letterSpacing: 2 }}>
          ← VOLVER
        </button>
        <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#4a6080", letterSpacing: 2 }}>
          CATÁLOGO / <span style={{ color: product.store_color || "#00d4ff" }}>{product.store_name?.toUpperCase()}</span> / {product.category_slug?.toUpperCase()}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

          {/* Columna izquierda — imagen */}
          <div>
            <div style={{ background: "#0b1420", border: "1px solid #1a2d4a", overflow: "hidden", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {imgUrl && !imgErr ? (
                <img src={imgUrl} alt={product.name} onError={() => setImgErr(true)} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 16 }} />
              ) : (
                <div style={{ fontSize: "6rem" }}>{EMOJI_MAP[product.category_slug] || product.img_emoji || "📦"}</div>
              )}
            </div>

          </div>

          {/* Columna derecha — info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Tienda badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: product.store_color || "#00d4ff" }} />
              <span style={{ fontFamily: "monospace", fontSize: "0.58rem", letterSpacing: 2, color: product.store_color || "#00d4ff", textTransform: "uppercase" }}>
                {product.store_name}
              </span>
              {product.badge && (
                <span style={{ fontFamily: "monospace", fontSize: "0.5rem", padding: "2px 7px", background: "#ff6b00", color: "#000", fontWeight: 700, letterSpacing: 1 }}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Nombre */}
            <div>
              <h1 style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: "1.3rem", color: "#fff", lineHeight: 1.3, margin: 0 }}>
                {product.name}
              </h1>
            </div>

            {/* Precio */}
            <div style={{ background: "#080f1a", border: "1px solid #1a2d4a", padding: 20 }}>
              {isOnSale && product.price_usd && (
                <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#444", textDecoration: "line-through", marginBottom: 4 }}>
                  Antes: {fmtUSD(product.price_usd)}
                </div>
              )}
              {product.price_usd && (
                <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: "2rem", color: "#00d4ff", letterSpacing: -1 }}>
                  {fmtUSD(isOnSale && product.sale_price_usd ? product.sale_price_usd : product.price_usd)}
                </div>
              )}
              {product.price_ars && !product.price_usd && (
                <>
                  {isOnSale && product.sale_price_ars && (
                    <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#444", textDecoration: "line-through", marginBottom: 4 }}>
                      Antes: {fmtARS(product.price_ars)}
                    </div>
                  )}
                  <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: "2rem", color: "#00ff88" }}>
                    {fmtARS(isOnSale && product.sale_price_ars ? product.sale_price_ars : product.price_ars)}
                  </div>
                </>
              )}
              {isOnSale && (
                <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#ff6b00", marginTop: 6, letterSpacing: 1 }}>
                  ↓ PRECIO DE OFERTA
                </div>
              )}
              <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: "#00ff88", marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", display: "inline-block" }} />
                EN STOCK — disponible en {product.store_name}
              </div>
              {product.installments > 1 && (
                <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#00ff88", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", display: "inline-block" }} />
                  {product.installments} CUOTAS SIN INTERÉS
                </div>
              )}
              {product.free_shipping && (
                <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#00d4ff", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4ff", display: "inline-block" }} />
                  ENVÍO GRATIS
                </div>
              )}
            </div>

            {/* Datos técnicos */}
            <div style={{ background: "#080f1a", border: "1px solid #1a2d4a", padding: 16 }}>
              <div style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: 2, color: "#4a6080", marginBottom: 12 }}>INFORMACIÓN</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["Tienda", product.store_name],
                  ["Ciudad", product.store_city || "Argentina"],
                ].map(([k, v]) => v && (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: "0.65rem", borderBottom: "1px solid #0d1a2e", paddingBottom: 6 }}>
                    <span style={{ color: "#4a6080" }}>{k}</span>
                    <span style={{ color: "#c8d8e8" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <a
              href={product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                textAlign: "center",
                background: "#00d4ff",
                color: "#000",
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: 3,
                padding: "16px 24px",
                textDecoration: "none",
                textTransform: "uppercase",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#00b8d9"}
              onMouseLeave={e => e.currentTarget.style.background = "#00d4ff"}
            >
              IR A LA TIENDA → {product.store_name}
            </a>

            <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#2a3d5a", textAlign: "center", lineHeight: 1.8 }}>
              DronHub AR actúa como comparador de precios.<br />
              La compra se realiza directamente en la tienda del vendedor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TARJETA CLASIFICADO ──────────────────────────────────────────────────────
function ClassifiedCard({ item, onContact }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: "#0b1420", border: `1px solid ${hov ? "rgba(255,107,0,0.4)" : "#1a2d4a"}`, overflow: "hidden", transition: "all 0.18s" }}
    >
      <div style={{ height: 80, background: "#080f1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", borderBottom: "1px solid #1a2d4a", position: "relative" }}>
        {item.img_emoji || "📦"}
        <div style={{ position: "absolute", top: 8, left: 8 }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.5rem", padding: "2px 7px", background: item.condition === "nuevo" ? "rgba(0,255,136,0.15)" : "rgba(255,107,0,0.15)", color: item.condition === "nuevo" ? "#00ff88" : "#ff6b00", border: `1px solid ${item.condition === "nuevo" ? "#00ff88" : "#ff6b00"}` }}>
            {item.condition?.toUpperCase()}
          </span>
        </div>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: "0.78rem", color: "#fff", marginBottom: 4 }}>{item.title}</div>
        <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#4a6080", marginBottom: 8 }}>📍 {item.city} · @{item.seller_name} · {timeAgo(item.created_at)}</div>
        <div style={{ fontSize: "0.68rem", color: "#7a9ab8", lineHeight: 1.5, marginBottom: 12 }}>{item.description?.slice(0, 90)}{item.description?.length > 90 ? "…" : ""}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1a2d4a", paddingTop: 10 }}>
          <div>
            {item.price_ars && <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: "0.95rem", color: "#00ff88" }}>{fmtARS(item.price_ars)}</div>}
            {item.price_usd && <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: "0.95rem", color: "#00d4ff" }}>{fmtUSD(item.price_usd)}</div>}
            {!item.price_ars && !item.price_usd && <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: "#4a6080" }}>A convenir</div>}
          </div>
          <button onClick={() => onContact(item)} style={{ background: "#ff6b00", border: "none", color: "#000", fontFamily: "monospace", fontSize: "0.58rem", fontWeight: 700, padding: "7px 12px", cursor: "pointer", letterSpacing: 1 }}>
            💬 CONTACTAR
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL PUBLICAR CLASIFICADO ───────────────────────────────────────────────
function PublishModal({ onClose, onPublish }) {
  const empty = { title:"", category_slug:"drones", condition:"usado", price_ars:"", price_usd:"", city:"", description:"", seller_name:"", whatsapp:"" };
  const [form, setForm] = useState(empty);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title || !form.city || !form.description || !form.seller_name || !form.whatsapp) { alert("Completá los campos obligatorios"); return; }
    setLoading(true);
    const data = { ...form, price_ars: form.price_ars ? parseFloat(form.price_ars) : null, price_usd: form.price_usd ? parseFloat(form.price_usd) : null, img_emoji: EMOJI_MAP[form.category_slug] || "📦", status: "active" };
    try { await sbPost("/classifieds", data); } catch (e) { console.warn("Post failed:", e); }
    onPublish({ ...data, id: "local_" + Date.now(), created_at: new Date().toISOString() });
    setDone(true); setLoading(false);
  };

  const field = (label, key, opts = {}) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: 2, color: "#00d4ff", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
      {opts.select ? (
        <select value={form[key]} onChange={e => set(key, e.target.value)} style={{ width: "100%", background: "#080f1a", border: "1px solid #1a2d4a", color: "#c8d8e8", fontFamily: "monospace", fontSize: "0.8rem", padding: "9px 12px", outline: "none" }}>
          {opts.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : opts.textarea ? (
        <textarea value={form[key]} onChange={e => set(key, e.target.value)} placeholder={opts.ph} rows={3} style={{ width: "100%", background: "#080f1a", border: "1px solid #1a2d4a", color: "#c8d8e8", fontFamily: "monospace", fontSize: "0.78rem", padding: "9px 12px", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      ) : (
        <input type={opts.type || "text"} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={opts.ph} style={{ width: "100%", background: "#080f1a", border: "1px solid #1a2d4a", color: "#c8d8e8", fontFamily: "monospace", fontSize: "0.78rem", padding: "9px 12px", outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#080f1a", border: "1px solid #1a2d4a", width: "100%", maxWidth: 520, maxHeight: "92vh", overflow: "auto", padding: 28, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", color: "#4a6080", fontSize: "1.1rem", cursor: "pointer" }}>✕</button>
        {done ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>✅</div>
            <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "1rem", color: "#00ff88", marginBottom: 8 }}>¡Publicado!</div>
            <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#4a6080", marginBottom: 20 }}>Tu aviso ya está visible. Los compradores te van a contactar por WhatsApp.</div>
            <button onClick={onClose} style={{ background: "#00d4ff", border: "none", color: "#000", fontFamily: "monospace", fontWeight: 700, fontSize: "0.7rem", padding: "10px 24px", cursor: "pointer", letterSpacing: 2 }}>CERRAR</button>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.95rem", color: "#fff", marginBottom: 20, letterSpacing: 1 }}>PUBLICAR CLASIFICADO</div>
            {field("Título *", "title", { ph: "Ej: DJI Mini 4 Pro + 3 baterías" })}
            {field("Categoría", "category_slug", { select: true, options: CATEGORIES.map(c => ({ v: c.slug, l: c.icon + " " + c.name })) })}
            {field("Condición", "condition", { select: true, options: [{ v:"usado", l:"Usado" }, { v:"nuevo", l:"Nuevo" }] })}
            {field("Precio ARS", "price_ars", { type: "number", ph: "Ej: 850000" })}
            {field("Precio USD", "price_usd", { type: "number", ph: "Ej: 450" })}
            {field("Ciudad *", "city", { ph: "Ej: Buenos Aires" })}
            {field("Descripción *", "description", { textarea: true, ph: "Describí el estado, incluye accesorios, etc." })}
            {field("Tu nombre / usuario *", "seller_name", { ph: "Ej: Martin_FPV" })}
            {field("WhatsApp *", "whatsapp", { ph: "Ej: +5491155551234" })}
            <button onClick={submit} disabled={loading} style={{ width: "100%", background: "#ff6b00", border: "none", color: "#000", fontFamily: "monospace", fontWeight: 700, fontSize: "0.72rem", padding: "14px", cursor: "pointer", letterSpacing: 2, textTransform: "uppercase", opacity: loading ? 0.6 : 1 }}>
              {loading ? "PUBLICANDO..." : "PUBLICAR GRATIS"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("catalogo");
  const [stores, setStores] = useState(SEED_STORES);
  const [products, setProducts] = useState([]);
  const [classifieds, setClassifieds] = useState(SEED_CLASSIFIEDS);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Detalle producto
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Modales
  const [contactItem, setContactItem] = useState(null);
  const [showPublish, setShowPublish] = useState(false);

  // Cargar datos de Supabase
  useEffect(() => {
    setLoading(true);
    Promise.all([
      sbFetch("/stores?is_active=eq.true&order=name"),
      sbFetch("/products_with_store?stock_status=eq.in_stock&order=last_synced_at.desc&limit=500"),
      sbFetch("/classifieds?status=eq.active&order=created_at.desc"),
    ])
      .then(([s, p, c]) => {
        if (s?.length) setStores(s);
        if (p?.length) setProducts(p);
        if (c?.length) setClassifieds(c);
      })
      .catch(e => console.error("Supabase:", e))
      .finally(() => setLoading(false));
  }, []);

  // Filtrado y ordenado
  const filteredProducts = products
    .filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name?.toLowerCase().includes(q);
      const matchCat = !catFilter || p.category_slug === catFilter;
      const matchStore = !storeFilter || p.store_slug === storeFilter;
      return matchSearch && matchCat && matchStore;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return (a.price_usd || 0) - (b.price_usd || 0);
      if (sortBy === "price_desc") return (b.price_usd || 0) - (a.price_usd || 0);
      return 0; // newest: mantiene el orden de Supabase
    });

  const filteredClassifieds = classifieds.filter(c => {
    const q = search.toLowerCase();
    return !q || c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
  });

  // Detalle de producto
  if (selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} />;
  }

  // Contar por categoría
  const countByCat = {};
  products.forEach(p => { countByCat[p.category_slug] = (countByCat[p.category_slug] || 0) + 1; });

  return (
    <div style={{ background: "#040810", minHeight: "100vh", color: "#c8d8e8" }}>
      {/* Grid BG */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.04) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Clock HUD */}
      <div style={{ position: "fixed", bottom: 14, right: 16, fontFamily: "monospace", fontSize: "0.5rem", letterSpacing: 2, color: "rgba(0,212,255,0.15)", zIndex: 50, pointerEvents: "none" }}>
        <Clock />
      </div>

      {/* ── NAV ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1a2d4a", background: "rgba(4,8,16,0.96)", backdropFilter: "blur(20px)", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => { setTab("catalogo"); setSearch(""); setCatFilter(""); setStoreFilter(""); }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff6b00", boxShadow: "0 0 10px #ff6b00" }} />
          <div>
            <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: "1.1rem", letterSpacing: 3, color: "#00d4ff" }}>DRON<span style={{ color: "#fff" }}>HUB</span> <span style={{ color: "#ff6b00", fontSize: "0.7rem" }}>AR</span></div>
            <div style={{ fontFamily: "monospace", fontSize: "0.44rem", letterSpacing: 3, color: "#2a3d5a", textTransform: "uppercase" }}>Marketplace de drones · Argentina</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
          {[["catalogo","CATÁLOGO"],["tiendas","TIENDAS"],["clasificados","CLASIFICADOS"]].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setSearch(""); }} style={{ fontFamily: "monospace", letterSpacing: 2, fontSize: "0.6rem", padding: "7px 14px", background: tab === key ? "#00d4ff" : "transparent", color: tab === key ? "#000" : "#4a6080", border: `1px solid ${tab === key ? "#00d4ff" : "#1a2d4a"}`, cursor: "pointer", textTransform: "uppercase" }}>
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── CATÁLOGO ── */}
      {tab === "catalogo" && (
        <div style={{ display: "flex", minHeight: "calc(100vh - 57px)" }}>

          {/* SIDEBAR IZQUIERDO */}
          <div style={{ width: sidebarOpen ? 220 : 40, minWidth: sidebarOpen ? 220 : 40, background: "#060d18", borderRight: "1px solid #1a2d4a", transition: "all 0.2s", overflow: "hidden", flexShrink: 0, position: "sticky", top: 57, height: "calc(100vh - 57px)", overflowY: "auto" }}>

            {/* Toggle */}
            <button onClick={() => setSidebarOpen(o => !o)} style={{ width: "100%", background: "none", border: "none", borderBottom: "1px solid #1a2d4a", color: "#4a6080", fontFamily: "monospace", fontSize: "0.6rem", padding: "10px", cursor: "pointer", textAlign: sidebarOpen ? "right" : "center", letterSpacing: 1 }}>
              {sidebarOpen ? "◀ OCULTAR" : "▶"}
            </button>

            {sidebarOpen && (
              <div style={{ padding: "16px 14px" }}>

                {/* Búsqueda */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: "monospace", fontSize: "0.5rem", letterSpacing: 2, color: "#4a6080", marginBottom: 6, textTransform: "uppercase" }}>Buscar</div>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Nombre del producto..."
                    style={{ width: "100%", background: "#080f1a", border: "1px solid #1a2d4a", color: "#c8d8e8", fontFamily: "monospace", fontSize: "0.72rem", padding: "8px 10px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                {/* Ordenar */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: "monospace", fontSize: "0.5rem", letterSpacing: 2, color: "#4a6080", marginBottom: 6, textTransform: "uppercase" }}>Ordenar por</div>
                  {[["newest","Más recientes"],["price_asc","Menor precio"],["price_desc","Mayor precio"]].map(([v, l]) => (
                    <div key={v} onClick={() => setSortBy(v)} style={{ fontFamily: "monospace", fontSize: "0.68rem", color: sortBy === v ? "#00d4ff" : "#4a6080", padding: "5px 0", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: sortBy === v ? "#00d4ff" : "#1a2d4a", flexShrink: 0 }} />
                      {l}
                    </div>
                  ))}
                </div>

                {/* Tiendas */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: "monospace", fontSize: "0.5rem", letterSpacing: 2, color: "#4a6080", marginBottom: 8, textTransform: "uppercase" }}>Tienda</div>
                  <div onClick={() => setStoreFilter("")} style={{ fontFamily: "monospace", fontSize: "0.68rem", color: !storeFilter ? "#00d4ff" : "#4a6080", padding: "5px 0", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: !storeFilter ? "#00d4ff" : "#1a2d4a", flexShrink: 0 }} />
                    Todas
                  </div>
                  {stores.map(s => (
                    <div key={s.slug} onClick={() => setStoreFilter(s.slug)} style={{ fontFamily: "monospace", fontSize: "0.68rem", color: storeFilter === s.slug ? s.color : "#4a6080", padding: "5px 0", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: storeFilter === s.slug ? s.color : "#1a2d4a", flexShrink: 0 }} />
                      {s.name}
                    </div>
                  ))}
                </div>

                {/* Categorías */}
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.5rem", letterSpacing: 2, color: "#4a6080", marginBottom: 8, textTransform: "uppercase" }}>Categoría</div>
                  <div onClick={() => setCatFilter("")} style={{ fontFamily: "monospace", fontSize: "0.68rem", color: !catFilter ? "#ff6b00" : "#4a6080", padding: "5px 0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Todas</span>
                    <span style={{ fontSize: "0.55rem", color: "#2a3d5a" }}>{products.length}</span>
                  </div>
                  {CATEGORIES.filter(c => countByCat[c.slug] > 0).map(c => (
                    <div key={c.slug} onClick={() => setCatFilter(c.slug)} style={{ fontFamily: "monospace", fontSize: "0.68rem", color: catFilter === c.slug ? "#ff6b00" : "#4a6080", padding: "5px 0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span>{c.icon}</span> {c.name}
                      </span>
                      <span style={{ fontSize: "0.55rem", color: "#2a3d5a" }}>{countByCat[c.slug] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div style={{ flex: 1, padding: "24px", minWidth: 0 }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: "1rem", color: "#fff" }}>
                  {catFilter ? CATEGORIES.find(c => c.slug === catFilter)?.name || catFilter : "Todos los productos"}
                  {storeFilter && <span style={{ color: "#4a6080", fontSize: "0.8rem" }}> · {stores.find(s => s.slug === storeFilter)?.name}</span>}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#4a6080", letterSpacing: 2, marginTop: 3 }}>
                  {loading ? "CARGANDO..." : `${filteredProducts.length} PRODUCTOS CON STOCK`}
                </div>
              </div>
              {(catFilter || storeFilter || search) && (
                <button onClick={() => { setCatFilter(""); setStoreFilter(""); setSearch(""); }} style={{ background: "none", border: "1px solid #1a2d4a", color: "#4a6080", fontFamily: "monospace", fontSize: "0.58rem", padding: "6px 12px", cursor: "pointer", letterSpacing: 1 }}>
                  ✕ LIMPIAR FILTROS
                </button>
              )}
            </div>

            {/* Grid */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 0", fontFamily: "monospace", color: "#4a6080" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
                Cargando productos...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", fontFamily: "monospace", color: "#4a6080" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>🔍</div>
                Sin resultados para este filtro.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2 }}>
                {filteredProducts.map(p => <ProductCard key={p.id} p={p} onClick={setSelectedProduct} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TIENDAS ── */}
      {tab === "tiendas" && (
        <div style={{ padding: "32px 24px", maxWidth: 960, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: "1.1rem", color: "#fff", marginBottom: 4 }}>Tiendas verificadas</div>
            <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#4a6080", letterSpacing: 2 }}>DATOS SCRAPEADOS EN TIEMPO REAL · PRECIOS ACTUALIZADOS CADA HORA</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 2 }}>
            {stores.map(s => (
              <div key={s.slug} style={{ background: "#0b1420", border: "1px solid #1a2d4a", padding: 24, position: "relative", overflow: "hidden", cursor: "pointer" }}
                onClick={() => { setTab("catalogo"); setStoreFilter(s.slug); }}
                onMouseEnter={e => e.currentTarget.style.borderColor = s.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1a2d4a"}
              >
                <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: s.color }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, paddingLeft: 8 }}>
                  <span style={{ fontSize: 26 }}>{s.logo_emoji}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.5rem", padding: "2px 8px", border: `1px solid ${s.color}`, color: s.color, letterSpacing: 1 }}>{s.badge}</span>
                </div>
                <div style={{ paddingLeft: 8 }}>
                  <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: "0.9rem", color: "#fff", marginBottom: 3 }}>{s.name}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#4a6080", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>📍 {s.city} · {s.platform}</div>
                  <div style={{ fontSize: "0.72rem", color: "#7a9ab8", lineHeight: 1.6, marginBottom: 12 }}>{s.description}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                    {(s.tags || []).map(t => <span key={t} style={{ fontFamily: "monospace", fontSize: "0.5rem", padding: "2px 7px", border: "1px solid #1a2d4a", color: "#4a6080" }}>{t}</span>)}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#00ff88", borderTop: "1px solid #1a2d4a", paddingTop: 10 }}>
                    VER CATÁLOGO →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CLASIFICADOS ── */}
      {tab === "clasificados" && (
        <div style={{ padding: "32px 24px", maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: "1.1rem", color: "#fff", marginBottom: 3 }}>Clasificados de particulares</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.52rem", color: "#4a6080", letterSpacing: 2 }}>COMPRÁ Y VENDÉ DIRECTO · SIN INTERMEDIARIOS · SIN COMISIÓN</div>
            </div>
            <button onClick={() => setShowPublish(true)} style={{ background: "#ff6b00", border: "none", color: "#000", fontFamily: "monospace", fontWeight: 700, fontSize: "0.65rem", padding: "10px 20px", cursor: "pointer", letterSpacing: 2 }}>
              + PUBLICAR GRATIS
            </button>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar en clasificados..."
            style={{ width: "100%", background: "rgba(255,107,0,0.04)", border: "1px solid #1a2d4a", color: "#c8d8e8", fontFamily: "monospace", fontSize: "0.8rem", padding: "12px 18px", outline: "none", marginBottom: 16, boxSizing: "border-box" }} />
          {filteredClassifieds.length > 0
            ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 2 }}>
                {filteredClassifieds.map(c => <ClassifiedCard key={c.id} item={c} onContact={setContactItem} />)}
              </div>
            : <div style={{ padding: "60px 0", textAlign: "center", fontFamily: "monospace", color: "#4a6080" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>📦</div>Sin clasificados. ¡Sé el primero en publicar!
              </div>
          }
        </div>
      )}

      {/* MODAL CONTACTO CLASIFICADO */}
      {contactItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#080f1a", border: "1px solid #1a2d4a", width: "100%", maxWidth: 380, padding: 28, position: "relative" }}>
            <button onClick={() => setContactItem(null)} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "#4a6080", fontSize: "1.1rem", cursor: "pointer" }}>✕</button>
            <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: "0.9rem", color: "#fff", marginBottom: 4 }}>{contactItem.title}</div>
            <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#ff6b00", marginBottom: 16 }}>
              {contactItem.price_ars ? fmtARS(contactItem.price_ars) : contactItem.price_usd ? fmtUSD(contactItem.price_usd) : "A convenir"}
            </div>
            <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#4a6080", marginBottom: 20, lineHeight: 2 }}>
              Vendedor: <span style={{ color: "#c8d8e8" }}>@{contactItem.seller_name}</span><br />
              Ciudad: <span style={{ color: "#c8d8e8" }}>{contactItem.city}</span><br />
              Condición: <span style={{ color: "#c8d8e8" }}>{contactItem.condition}</span>
            </div>
            <a href={`https://wa.me/${(contactItem.whatsapp||"").replace(/\D/g,"")}?text=${encodeURIComponent(`Hola! Vi tu aviso en DronHub AR: "${contactItem.title}". ¿Está disponible?`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "block", textAlign: "center", fontFamily: "monospace", fontSize: "0.7rem", padding: "13px", background: "#25D366", color: "#000", textDecoration: "none", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
              💬 CONTACTAR POR WHATSAPP
            </a>
          </div>
        </div>
      )}

      {showPublish && (
        <PublishModal
          onClose={() => setShowPublish(false)}
          onPublish={item => { setClassifieds(prev => [item, ...prev]); setShowPublish(false); setTab("clasificados"); }}
        />
      )}

      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #040810; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #1a2d4a; } input:focus, textarea:focus, select:focus { border-color: #00d4ff !important; } @media (max-width: 600px) { .sidebar { display: none; } }`}</style>
    </div>
  );
}
