import { useState, useEffect, useRef } from "react";

// ─── FUENTE SORA ──────────────────────────────────────────────────────────────
const FONT_LINK = document.createElement("link");
FONT_LINK.rel = "stylesheet";
FONT_LINK.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap";
document.head.appendChild(FONT_LINK);

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://pfjdamigdoytijskwefb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmamRhbWlnZG95dGlqc2t3ZWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjIxNjUsImV4cCI6MjA4Nzk5ODE2NX0.1XgWitzxaI5Dcy_aiNptCZ_e8HnOlGr8e7rz5j6_WjA";

async function sbFetch(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

async function sbPost(path, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method: "POST",
    headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  white:   "#FFFFFF",
  bg:      "#F5F7FA",
  bgCard:  "#FFFFFF",
  primary: "#2563EB",
  primaryHover: "#1D4ED8",
  orange:  "#FF6B00",
  orangeHover: "#E85F00",
  text:    "#1F2937",
  textMid: "#6B7280",
  textLight:"#9CA3AF",
  border:  "#E5E7EB",
  borderHover: "#2563EB",
  shadow:  "0 4px 24px rgba(37,99,235,0.10)",
  shadowHover: "0 12px 40px rgba(37,99,235,0.18)",
};

const font = "'Sora', sans-serif";

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { slug: "drones",         name: "Drones",         icon: "🛸" },
  { slug: "radiocontroles", name: "Radiocontroles",  icon: "🎮" },
  { slug: "motores",        name: "Motores",         icon: "⚙️" },
  { slug: "baterias",       name: "Baterías",        icon: "🔋" },
  { slug: "video-fpv",      name: "Video FPV",       icon: "📡" },
  { slug: "camaras-fpv",    name: "Cámaras FPV",     icon: "📷" },
  { slug: "camaras-deportivas", name: "Cámaras Deportivas", icon: "🎥" },
  { slug: "frames",         name: "Frames",          icon: "🔧" },
  { slug: "helices",        name: "Hélices",         icon: "🌀" },
  { slug: "gafas-fpv",      name: "Gafas FPV",       icon: "🥽" },
  { slug: "cargadores",     name: "Cargadores",      icon: "⚡" },
  { slug: "filtros",        name: "Filtros",         icon: "🔲" },
  { slug: "transporte",     name: "Transporte",      icon: "🎒" },
  { slug: "accesorios",     name: "Accesorios",      icon: "🔗" },
];

const EMOJI_MAP = { drones:"🛸",radiocontroles:"🎮",motores:"⚙️",baterias:"🔋","video-fpv":"📡","camaras-fpv":"📷","camaras-deportivas":"🎥",frames:"🔧",helices:"🌀","gafas-fpv":"🥽",cargadores:"⚡",filtros:"🔲",transporte:"🎒",accesorios:"🔗" };

const fmtARS = n => "$ " + Number(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });
const fmtUSD = n => "USD " + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const timeAgo = d => { const s = (Date.now() - new Date(d)) / 1000; if (s < 3600) return `hace ${Math.floor(s/60)}min`; if (s < 86400) return `hace ${Math.floor(s/3600)}h`; return `hace ${Math.floor(s/86400)}d`; };

function getImage(p) {
  if (p.images && Array.isArray(p.images) && p.images.length > 0) {
    const main = p.images.find(i => i.is_main) || p.images[0];
    if (main?.url) return main.url;
  }
  return null;
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_CLASSIFIEDS = [
  { id:"c1", title:"DJI Mini 3 Pro – Excelente estado", category_slug:"drones", condition:"usado", price_ars:850000, price_usd:null, city:"Buenos Aires", description:"Poco uso, 8 vuelos. 3 baterías y bolso original. Sin golpes ni rayones.", img_emoji:"🚁", seller_name:"Martin_G", whatsapp:"+5491155551234", status:"active", is_verified_seller:false, created_at:"2026-02-28" },
  { id:"c2", title:"RadioMaster TX16S Mark II + ELRS", category_slug:"radiocontroles", condition:"usado", price_ars:280000, price_usd:null, city:"Córdoba", description:"Joysticks calibrados. Incluye funda y manuales originales.", img_emoji:"🎮", seller_name:"fpv_cba_racer", whatsapp:"+5493514445678", status:"active", is_verified_seller:true, created_at:"2026-02-25" },
  { id:"c3", title:"Baterías Tattu R-Line 6S 1300mAh x3", category_slug:"baterias", condition:"usado", price_ars:120000, price_usd:null, city:"Rosario", description:"40 ciclos promedio. Revisadas con iCharger. >95% capacidad.", img_emoji:"🔋", seller_name:"Rodrigo_FPV", whatsapp:"+5493413339012", status:"active", is_verified_seller:false, created_at:"2026-02-22" },
  { id:"c4", title:'Frame TBS Source One V5 5" NUEVO', category_slug:"frames", condition:"nuevo", price_ars:null, price_usd:45, city:"Mendoza", description:"Nuevo sin usar, todos los tornillos incluidos.", img_emoji:"🔧", seller_name:"nico_builds", whatsapp:"+5492612223456", status:"active", is_verified_seller:false, created_at:"2026-02-27" },
];

// ─── COMPONENTE: IMAGEN DE PRODUCTO ───────────────────────────────────────────
function ProductImage({ p, height = 200 }) {
  const [err, setErr] = useState(false);
  const imgUrl = getImage(p);
  if (imgUrl && !err) {
    return <img src={imgUrl} alt={p.name} onError={() => setErr(true)} style={{ width:"100%", height, objectFit:"cover", display:"block" }} />;
  }
  return (
    <div style={{ width:"100%", height, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"3.5rem", background: C.bg }}>
      {EMOJI_MAP[p.category_slug] || p.img_emoji || "📦"}
    </div>
  );
}

// ─── COMPONENTE: TARJETA DE PRODUCTO ─────────────────────────────────────────
function ProductCard({ p, onClick }) {
  const [hov, setHov] = useState(false);
  const isOnSale = p.sale_price_usd || p.sale_price_ars;
  const displayPrice = isOnSale
    ? (p.sale_price_usd ? fmtUSD(p.sale_price_usd) : fmtARS(p.sale_price_ars))
    : (p.price_usd ? fmtUSD(p.price_usd) : fmtARS(p.price_ars));
  const originalPrice = isOnSale
    ? (p.price_usd ? fmtUSD(p.price_usd) : fmtARS(p.price_ars))
    : null;

  return (
    <div
      onClick={() => onClick(p)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.bgCard,
        border: `1px solid ${hov ? C.primary : C.border}`,
        borderRadius: 12,
        cursor: "pointer",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? C.shadowHover : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Imagen */}
      <div style={{ position:"relative", overflow:"hidden" }}>
        <ProductImage p={p} height={180} />
        {isOnSale && (
          <div style={{ position:"absolute", top:10, left:10, background: C.orange, color:"#fff", fontFamily:font, fontSize:"0.62rem", fontWeight:700, padding:"3px 9px", borderRadius:4, letterSpacing:0.5 }}>
            {p.badge || "OFERTA"}
          </div>
        )}
        {p.badge && !isOnSale && (
          <div style={{ position:"absolute", top:10, left:10, background: p.badge === "USADO" ? "#6B7280" : C.primary, color:"#fff", fontFamily:font, fontSize:"0.62rem", fontWeight:700, padding:"3px 9px", borderRadius:4 }}>
            {p.badge}
          </div>
        )}
        {/* Store dot */}
        <div style={{ position:"absolute", top:10, right:10, background:"rgba(255,255,255,0.92)", borderRadius:20, padding:"3px 8px", display:"flex", alignItems:"center", gap:4, backdropFilter:"blur(8px)" }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background: p.store_color || C.primary, flexShrink:0 }} />
          <span style={{ fontFamily:font, fontSize:"0.55rem", fontWeight:600, color: C.text }}>{p.store_name}</span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding:"14px 16px", flex:1, display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ fontFamily:font, fontWeight:500, fontSize:"0.82rem", color: C.text, lineHeight:1.4, flex:1 }}>
          {p.name.length > 60 ? p.name.slice(0,60) + "…" : p.name}
        </div>

        <div style={{ marginTop:4 }}>
          {originalPrice && (
            <div style={{ fontFamily:font, fontSize:"0.7rem", color: C.textLight, textDecoration:"line-through", marginBottom:2 }}>
              {originalPrice}
            </div>
          )}
          <div style={{ fontFamily:font, fontWeight:700, fontSize:"1.1rem", color: isOnSale ? C.orange : C.primary }}>
            {displayPrice}
          </div>
        </div>

        {/* Chips */}
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:2 }}>
          {p.installments > 1 && (
            <span style={{ fontFamily:font, fontSize:"0.58rem", fontWeight:500, padding:"2px 7px", background:"#F0FDF4", border:"1px solid #BBF7D0", color:"#15803D", borderRadius:4 }}>
              {p.installments}x sin interés
            </span>
          )}
          {p.free_shipping && (
            <span style={{ fontFamily:font, fontSize:"0.58rem", fontWeight:500, padding:"2px 7px", background:"#EFF6FF", border:"1px solid #BFDBFE", color: C.primary, borderRadius:4 }}>
              ✈ Envío gratis
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE: DETALLE DE PRODUCTO ─────────────────────────────────────────
function ProductDetail({ product, onBack }) {
  const [imgErr, setImgErr] = useState(false);
  const imgUrl = getImage(product);
  const isOnSale = product.sale_price_usd || product.sale_price_ars;

  useEffect(() => { window.scrollTo(0, 0); }, [product.id]);

  return (
    <div style={{ minHeight:"100vh", background: C.bg, fontFamily:font }}>

      {/* Top bar */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"14px 32px", display:"flex", alignItems:"center", gap:14, position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:`1px solid ${C.border}`, color: C.text, fontFamily:font, fontSize:"0.75rem", fontWeight:600, padding:"7px 16px", cursor:"pointer", borderRadius:8, transition:"all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background=C.primary; e.currentTarget.style.color="#fff"; e.currentTarget.style.borderColor=C.primary; }}
          onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color=C.text; e.currentTarget.style.borderColor=C.border; }}
        >
          ← Volver
        </button>
        <span style={{ fontSize:"0.75rem", color: C.textMid }}>
          Catálogo / <span style={{ color: product.store_color || C.primary, fontWeight:600 }}>{product.store_name}</span>
        </span>
      </div>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"40px 24px" }}>
        <div className="detail-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, alignItems:"start" }}>

          {/* Columna izquierda — imagen */}
          <div style={{ background:C.white, borderRadius:16, overflow:"hidden", border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
              {imgUrl && !imgErr
                ? <img src={imgUrl} alt={product.name} onError={() => setImgErr(true)} style={{ width:"100%", height:"100%", objectFit:"contain", padding:24 }} />
                : <div style={{ fontSize:"7rem" }}>{EMOJI_MAP[product.category_slug] || "📦"}</div>
              }
            </div>
          </div>

          {/* Columna derecha */}
          <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

            {/* Store + badge */}
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, background: C.bg, border:`1px solid ${C.border}`, borderRadius:20, padding:"4px 12px" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background: product.store_color || C.primary }} />
                <span style={{ fontFamily:font, fontSize:"0.72rem", fontWeight:600, color: product.store_color || C.primary }}>{product.store_name}</span>
              </div>
              {product.badge && (
                <span style={{ fontFamily:font, fontSize:"0.65rem", fontWeight:700, padding:"4px 10px", background: C.orange, color:"#fff", borderRadius:6 }}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Nombre */}
            <h1 style={{ fontFamily:font, fontWeight:700, fontSize:"1.5rem", color: C.text, lineHeight:1.3, margin:0 }}>
              {product.name}
            </h1>

            {/* Precio */}
            <div style={{ background: C.white, borderRadius:12, border:`1px solid ${C.border}`, padding:24, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
              {isOnSale && product.price_usd && (
                <div style={{ fontFamily:font, fontSize:"0.9rem", color: C.textLight, textDecoration:"line-through", marginBottom:4 }}>
                  Antes: {fmtUSD(product.price_usd)}
                </div>
              )}
              {product.price_usd && (
                <div style={{ fontFamily:font, fontWeight:800, fontSize:"2.4rem", color: isOnSale ? C.orange : C.primary, letterSpacing:"-0.5px" }}>
                  {fmtUSD(isOnSale && product.sale_price_usd ? product.sale_price_usd : product.price_usd)}
                </div>
              )}
              {product.price_ars && !product.price_usd && (
                <>
                  {isOnSale && product.sale_price_ars && (
                    <div style={{ fontFamily:font, fontSize:"0.9rem", color: C.textLight, textDecoration:"line-through", marginBottom:4 }}>
                      Antes: {fmtARS(product.price_ars)}
                    </div>
                  )}
                  <div style={{ fontFamily:font, fontWeight:800, fontSize:"2.4rem", color: isOnSale ? C.orange : C.primary, letterSpacing:"-0.5px" }}>
                    {fmtARS(isOnSale && product.sale_price_ars ? product.sale_price_ars : product.price_ars)}
                  </div>
                </>
              )}

              {/* Chips de stock/envío/cuotas */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:16 }}>
                <span style={{ fontFamily:font, fontSize:"0.7rem", fontWeight:500, padding:"4px 10px", background:"#F0FDF4", border:"1px solid #BBF7D0", color:"#15803D", borderRadius:6 }}>
                  ✓ En stock
                </span>
                {product.installments > 1 && (
                  <span style={{ fontFamily:font, fontSize:"0.7rem", fontWeight:500, padding:"4px 10px", background:"#F0FDF4", border:"1px solid #BBF7D0", color:"#15803D", borderRadius:6 }}>
                    {product.installments} cuotas sin interés
                  </span>
                )}
                {product.free_shipping && (
                  <span style={{ fontFamily:font, fontSize:"0.7rem", fontWeight:500, padding:"4px 10px", background:"#EFF6FF", border:"1px solid #BFDBFE", color: C.primary, borderRadius:6 }}>
                    ✈ Envío gratis
                  </span>
                )}
              </div>
            </div>

            {/* Info tienda */}
            <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, padding:20 }}>
              <div style={{ fontFamily:font, fontSize:"0.7rem", fontWeight:600, color: C.textMid, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Información</div>
              {[["Tienda", product.store_name], ["Ciudad", product.store_city || "Argentina"]].map(([k, v]) => v && (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", fontFamily:font, fontSize:"0.78rem", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ color: C.textMid }}>{k}</span>
                  <span style={{ color: C.text, fontWeight:500 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href={product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display:"block", textAlign:"center", background: C.primary, color:"#fff", fontFamily:font, fontWeight:700, fontSize:"0.9rem", letterSpacing:0.5, padding:"16px 24px", textDecoration:"none", borderRadius:10, transition:"all 0.15s", boxShadow:`0 4px 14px rgba(37,99,235,0.3)` }}
              onMouseEnter={e => { e.currentTarget.style.background = C.primaryHover; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = "none"; }}
            >
              Ir a la tienda — {product.store_name} →
            </a>

            <p style={{ fontFamily:font, fontSize:"0.68rem", color: C.textLight, textAlign:"center", lineHeight:1.7, margin:0 }}>
              DronHub AR actúa como comparador de precios.<br />
              La compra se realiza directamente en la tienda del vendedor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE: COMPARADOR ───────────────────────────────────────────────────
const normalize = s => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

function Comparador({ products }) {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  const drones = products.filter(p => p.category_slug === "drones" && (p.price_usd || p.price_ars));
  const results = drones.filter(p => normalize(p.name).includes(normalize(search))).slice(0, 30);

  const toggle = (p) => {
    if (selected.find(s => s.id === p.id)) {
      setSelected(selected.filter(s => s.id !== p.id));
    } else if (selected.length < 3) {
      setSelected([...selected, p]);
    }
  };

  const specs = [
    { key: "price", label: "Precio", render: p => p.price_usd ? fmtUSD(p.sale_price_usd || p.price_usd) : fmtARS(p.sale_price_ars || p.price_ars) },
    { key: "store", label: "Tienda", render: p => p.store_name },
    { key: "stock", label: "Stock", render: () => "✓ En stock" },
    { key: "shipping", label: "Envío gratis", render: p => p.free_shipping ? "✓ Sí" : "—" },
    { key: "installments", label: "Cuotas s/i", render: p => p.installments > 1 ? `${p.installments}x` : "—" },
  ];

  return (
    <div style={{ padding:"40px 24px", maxWidth:1100, margin:"0 auto", fontFamily:font }}>
      <div style={{ marginBottom:32 }}>
        <h2 style={{ fontFamily:font, fontWeight:700, fontSize:"1.8rem", color: C.text, margin:"0 0 6px" }}>Comparador de drones</h2>
        <p style={{ fontFamily:font, fontSize:"0.9rem", color: C.textMid, margin:0 }}>Seleccioná hasta 3 drones para comparar lado a lado</p>
      </div>

      {/* Búsqueda */}
      <div style={{ position:"relative", marginBottom:20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar drone para agregar..."
          style={{ width:"100%", fontFamily:font, fontSize:"0.9rem", padding:"12px 16px 12px 44px", border:`1px solid ${C.border}`, borderRadius:10, outline:"none", background:C.white, color: C.text, boxSizing:"border-box" }}
          onFocus={e => e.target.style.borderColor = C.primary}
          onBlur={e => e.target.style.borderColor = C.border}
        />
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color: C.textMid }}>🔍</span>
      </div>

      {/* Lista de resultados */}
      {search && results.length > 0 && (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, marginBottom:24, boxShadow: C.shadow, maxHeight:280, overflowY:"auto" }}>
          {results.map(p => {
            const inComp = !!selected.find(s => s.id === p.id);
            return (
              <div key={p.id} onClick={() => toggle(p)} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px", borderBottom:`1px solid ${C.border}`, cursor:selected.length >= 3 && !inComp ? "not-allowed" : "pointer", background: inComp ? "#EFF6FF" : "transparent", transition:"background 0.12s" }}
                onMouseEnter={e => { if (!inComp) e.currentTarget.style.background = C.bg; }}
                onMouseLeave={e => { if (!inComp) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ width:40, height:40, flexShrink:0, borderRadius:8, overflow:"hidden", background: C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {getImage(p) ? <img src={getImage(p)} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ fontSize:"1.4rem" }}>🛸</span>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:font, fontSize:"0.8rem", fontWeight:500, color: C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</div>
                  <div style={{ fontFamily:font, fontSize:"0.7rem", color: C.primary, fontWeight:600 }}>
                    {p.price_usd ? fmtUSD(p.sale_price_usd || p.price_usd) : fmtARS(p.sale_price_ars || p.price_ars)}
                  </div>
                </div>
                <div style={{ fontFamily:font, fontSize:"0.7rem", fontWeight:600, color: inComp ? C.orange : C.primary, flexShrink:0 }}>
                  {inComp ? "✓ Agregado" : selected.length >= 3 ? "Máx 3" : "+ Agregar"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chips seleccionados */}
      {selected.length > 0 && (
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:28 }}>
          {selected.map(p => (
            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:8, background: C.white, border:`1px solid ${C.primary}`, borderRadius:20, padding:"6px 14px" }}>
              <span style={{ fontFamily:font, fontSize:"0.75rem", fontWeight:500, color: C.text }}>{p.name.slice(0,35)}{p.name.length>35?"…":""}</span>
              <button onClick={() => toggle(p)} style={{ background:"none", border:"none", cursor:"pointer", color: C.textMid, fontSize:"1rem", lineHeight:1, padding:0 }}>×</button>
            </div>
          ))}
          <button onClick={() => setSelected([])} style={{ fontFamily:font, fontSize:"0.72rem", color: C.textMid, background:"none", border:`1px solid ${C.border}`, borderRadius:20, padding:"6px 14px", cursor:"pointer" }}>
            Limpiar
          </button>
        </div>
      )}

      {/* Tabla comparativa */}
      {selected.length >= 2 ? (
        <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden", boxShadow: C.shadow }}>
          {/* Header con imágenes */}
          <div style={{ display:"grid", gridTemplateColumns:`200px repeat(${selected.length}, 1fr)`, borderBottom:`2px solid ${C.border}` }}>
            <div style={{ padding:20, background: C.bg }} />
            {selected.map(p => (
              <div key={p.id} style={{ padding:20, textAlign:"center", borderLeft:`1px solid ${C.border}`, background: C.white }}>
                <div style={{ width:80, height:80, margin:"0 auto 10px", borderRadius:10, overflow:"hidden", background: C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {getImage(p) ? <img src={getImage(p)} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ fontSize:"2.5rem" }}>🛸</span>}
                </div>
                <div style={{ fontFamily:font, fontSize:"0.78rem", fontWeight:600, color: C.text, lineHeight:1.3 }}>{p.name.slice(0,45)}{p.name.length>45?"…":""}</div>
                <button onClick={() => toggle(p)} style={{ marginTop:8, fontFamily:font, fontSize:"0.65rem", color: C.textLight, background:"none", border:"none", cursor:"pointer" }}>Quitar</button>
              </div>
            ))}
          </div>

          {/* Filas */}
          {specs.map((spec, i) => (
            <div key={spec.key} style={{ display:"grid", gridTemplateColumns:`200px repeat(${selected.length}, 1fr)`, borderBottom: i < specs.length-1 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? C.white : C.bg }}>
              <div style={{ padding:"14px 20px", fontFamily:font, fontSize:"0.78rem", fontWeight:600, color: C.textMid, display:"flex", alignItems:"center" }}>{spec.label}</div>
              {selected.map(p => (
                <div key={p.id} style={{ padding:"14px 20px", fontFamily:font, fontSize:"0.82rem", color: spec.key === "price" ? C.primary : C.text, fontWeight: spec.key === "price" ? 700 : 400, textAlign:"center", borderLeft:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {spec.render(p)}
                </div>
              ))}
            </div>
          ))}

          {/* CTAs */}
          <div style={{ display:"grid", gridTemplateColumns:`200px repeat(${selected.length}, 1fr)`, borderTop:`2px solid ${C.border}`, background: C.bg }}>
            <div style={{ padding:20 }} />
            {selected.map(p => (
              <div key={p.id} style={{ padding:16, borderLeft:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <a href={p.product_url} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily:font, fontSize:"0.75rem", fontWeight:700, padding:"10px 20px", background: C.primary, color:"#fff", textDecoration:"none", borderRadius:8, textAlign:"center", display:"inline-block", transition:"background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
                  onMouseLeave={e => e.currentTarget.style.background = C.primary}
                >
                  Ver en tienda →
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign:"center", padding:"60px 20px", color: C.textMid, fontFamily:font }}>
          <div style={{ fontSize:"3rem", marginBottom:12 }}>⚖️</div>
          <div style={{ fontWeight:600, fontSize:"1rem", color: C.text, marginBottom:6 }}>Seleccioná al menos 2 drones</div>
          <div style={{ fontSize:"0.85rem" }}>Buscá por nombre y agregá drones para comparar precios, tiendas y más.</div>
        </div>
      )}
    </div>
  );
}

// ─── COMPONENTE: TARJETA CLASIFICADO ─────────────────────────────────────────
function ClassifiedCard({ item, onContact }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:C.white, border:`1px solid ${hov ? C.orange : C.border}`, borderRadius:12, overflow:"hidden", transition:"all 0.2s", boxShadow: hov ? "0 8px 24px rgba(255,107,0,0.12)" : "0 1px 4px rgba(0,0,0,0.06)" }}
    >
      <div style={{ height:90, background: C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.5rem", borderBottom:`1px solid ${C.border}`, position:"relative" }}>
        {item.img_emoji || "📦"}
        <div style={{ position:"absolute", top:10, left:10 }}>
          <span style={{ fontFamily:font, fontSize:"0.62rem", fontWeight:600, padding:"3px 8px", background: item.condition === "nuevo" ? "#F0FDF4" : "#FFF7ED", color: item.condition === "nuevo" ? "#15803D" : C.orange, border:`1px solid ${item.condition === "nuevo" ? "#BBF7D0" : "#FED7AA"}`, borderRadius:4 }}>
            {item.condition === "nuevo" ? "Nuevo" : "Usado"}
          </span>
        </div>
      </div>
      <div style={{ padding:16 }}>
        <div style={{ fontFamily:font, fontWeight:600, fontSize:"0.85rem", color: C.text, marginBottom:4 }}>{item.title}</div>
        <div style={{ fontFamily:font, fontSize:"0.68rem", color: C.textMid, marginBottom:8 }}>📍 {item.city} · @{item.seller_name} · {timeAgo(item.created_at)}</div>
        <div style={{ fontSize:"0.75rem", color: C.textMid, lineHeight:1.5, marginBottom:14 }}>{item.description?.slice(0,90)}{item.description?.length > 90 ? "…" : ""}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
          <div>
            {item.price_ars && <div style={{ fontFamily:font, fontWeight:700, fontSize:"1rem", color: C.primary }}>{fmtARS(item.price_ars)}</div>}
            {item.price_usd && <div style={{ fontFamily:font, fontWeight:700, fontSize:"1rem", color: C.primary }}>{fmtUSD(item.price_usd)}</div>}
            {!item.price_ars && !item.price_usd && <div style={{ fontFamily:font, fontSize:"0.75rem", color: C.textMid }}>A convenir</div>}
          </div>
          <button onClick={() => onContact(item)} style={{ background: C.orange, border:"none", color:"#fff", fontFamily:font, fontSize:"0.72rem", fontWeight:700, padding:"8px 14px", cursor:"pointer", borderRadius:8, letterSpacing:0.3, transition:"background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = C.orangeHover}
            onMouseLeave={e => e.currentTarget.style.background = C.orange}
          >
            💬 Contactar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE: MODAL PUBLICAR CLASIFICADO ───────────────────────────────────
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

  const inputStyle = { width:"100%", fontFamily:font, fontSize:"0.85rem", padding:"10px 14px", border:`1px solid ${C.border}`, borderRadius:8, outline:"none", background:C.white, color: C.text, boxSizing:"border-box" };
  const labelStyle = { fontFamily:font, fontSize:"0.72rem", fontWeight:600, color: C.textMid, textTransform:"uppercase", letterSpacing:0.8, display:"block", marginBottom:5 };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.white, borderRadius:16, width:"100%", maxWidth:520, maxHeight:"92vh", overflow:"auto", padding:32, position:"relative", boxShadow:"0 24px 60px rgba(0,0,0,0.2)" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"none", border:`1px solid ${C.border}`, color: C.textMid, fontSize:"1rem", cursor:"pointer", borderRadius:6, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        {done ? (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <div style={{ fontSize:"3rem", marginBottom:12 }}>✅</div>
            <div style={{ fontFamily:font, fontWeight:700, fontSize:"1.1rem", color: C.text, marginBottom:8 }}>¡Publicado!</div>
            <div style={{ fontFamily:font, fontSize:"0.82rem", color: C.textMid, marginBottom:24 }}>Tu aviso ya está visible. Los compradores te van a contactar por WhatsApp.</div>
            <button onClick={onClose} style={{ background: C.primary, border:"none", color:"#fff", fontFamily:font, fontWeight:700, fontSize:"0.8rem", padding:"12px 28px", cursor:"pointer", borderRadius:8 }}>Cerrar</button>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily:font, fontWeight:700, fontSize:"1.1rem", color: C.text, marginBottom:24 }}>Publicar clasificado</h3>
            {[
              { label:"Título *", key:"title", ph:"Ej: DJI Mini 4 Pro + 3 baterías" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:16 }}>
                <label style={labelStyle}>{f.label}</label>
                <input value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.ph} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom:16 }}>
              <label style={labelStyle}>Categoría</label>
              <select value={form.category_slug} onChange={e => set("category_slug", e.target.value)} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={labelStyle}>Condición</label>
              <select value={form.condition} onChange={e => set("condition", e.target.value)} style={inputStyle}>
                <option value="usado">Usado</option>
                <option value="nuevo">Nuevo</option>
              </select>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              <div>
                <label style={labelStyle}>Precio ARS</label>
                <input type="number" value={form.price_ars} onChange={e => set("price_ars", e.target.value)} placeholder="850000" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Precio USD</label>
                <input type="number" value={form.price_usd} onChange={e => set("price_usd", e.target.value)} placeholder="450" style={inputStyle} />
              </div>
            </div>
            {[
              { label:"Ciudad *", key:"city", ph:"Ej: Buenos Aires" },
              { label:"Tu nombre / usuario *", key:"seller_name", ph:"Ej: Martin_FPV" },
              { label:"WhatsApp *", key:"whatsapp", ph:"+5491155551234" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:16 }}>
                <label style={labelStyle}>{f.label}</label>
                <input value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.ph} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom:24 }}>
              <label style={labelStyle}>Descripción *</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describí el estado, accesorios incluidos, etc." rows={3} style={{ ...inputStyle, resize:"vertical" }} />
            </div>
            <button onClick={submit} disabled={loading}
              style={{ width:"100%", background: C.orange, border:"none", color:"#fff", fontFamily:font, fontWeight:700, fontSize:"0.85rem", padding:"14px", cursor:"pointer", borderRadius:10, opacity: loading ? 0.7 : 1, transition:"background 0.15s" }}
              onMouseEnter={e => { if(!loading) e.currentTarget.style.background = C.orangeHover; }}
              onMouseLeave={e => e.currentTarget.style.background = C.orange}
            >
              {loading ? "Publicando..." : "Publicar gratis"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── COMPONENTE: HERO ─────────────────────────────────────────────────────────
function Hero({ onExplore }) {
  return (
    <div style={{ position:"relative", height:600, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
      {/* Video background */}
      <video
        autoPlay muted loop playsInline
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", zIndex:0 }}
      >
        <source src="https://assets.mixkit.co/videos/4247/4247-720.mp4" type="video/mp4" />
      </video>
      {/* Overlay */}
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 100%)", zIndex:1 }} />

      {/* Contenido */}
      <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"0 24px", maxWidth:800, margin:"0 auto" }}>
        <div style={{ fontFamily:font, fontSize:"0.8rem", fontWeight:600, color:"rgba(255,255,255,0.7)", letterSpacing:3, textTransform:"uppercase", marginBottom:16 }}>
          Argentina · Marketplace de drones
        </div>
        <h1 style={{ fontFamily:font, fontWeight:800, fontSize:"clamp(2.2rem, 5vw, 3.8rem)", color:"#fff", lineHeight:1.15, margin:"0 0 20px", letterSpacing:"-0.5px" }}>
          Explorá el cielo<br />
          <span style={{ color: "#60A5FA" }}>con precisión profesional</span>
        </h1>
        <p style={{ fontFamily:font, fontSize:"1.05rem", color:"rgba(255,255,255,0.8)", lineHeight:1.7, margin:"0 0 36px", maxWidth:540, marginLeft:"auto", marginRight:"auto" }}>
          Comparamos precios de drones y equipos FPV en las mejores tiendas de Argentina, en tiempo real.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={onExplore}
            style={{ fontFamily:font, fontWeight:700, fontSize:"0.95rem", padding:"14px 32px", background: C.primary, color:"#fff", border:"none", borderRadius:10, cursor:"pointer", transition:"all 0.15s", boxShadow:"0 4px 20px rgba(37,99,235,0.4)" }}
            onMouseEnter={e => { e.currentTarget.style.background = C.primaryHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = "none"; }}
          >
            Ver catálogo
          </button>
          <button onClick={onExplore}
            style={{ fontFamily:font, fontWeight:600, fontSize:"0.95rem", padding:"14px 32px", background:"rgba(255,255,255,0.15)", color:"#fff", border:"1px solid rgba(255,255,255,0.4)", borderRadius:10, cursor:"pointer", backdropFilter:"blur(8px)", transition:"all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          >
            Ver comparativa
          </button>
        </div>

      </div>

      {/* Scroll indicator */}
      <div style={{ position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", gap:6, cursor:"pointer" }} onClick={onExplore}>
        <span style={{ fontFamily:font, fontSize:"0.68rem", color:"rgba(255,255,255,0.5)", letterSpacing:2, textTransform:"uppercase" }}>Explorar</span>
        <div style={{ width:1, height:32, background:"rgba(255,255,255,0.3)" }} />
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [classifieds, setClassifieds] = useState(SEED_CLASSIFIEDS);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [contactItem, setContactItem] = useState(null);
  const [showPublish, setShowPublish] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const catalogRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      sbFetch("/stores?is_active=eq.true&order=name"),
      sbFetch("/products_with_store?stock_status=eq.in_stock&order=last_synced_at.desc&limit=2000"),
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

  const filteredProducts = products
    .filter(p => {
      const q = normalize(search);
      const matchSearch = !q || normalize(p.name).includes(q);
      const matchCat = !catFilter || p.category_slug === catFilter;
      const matchStore = !storeFilter || p.store_slug === storeFilter;
      const matchCondition = !conditionFilter || p.condition === conditionFilter;
      return matchSearch && matchCat && matchStore && matchCondition;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return ((a.sale_price_usd || a.price_usd || 0)) - ((b.sale_price_usd || b.price_usd || 0));
      if (sortBy === "price_desc") return ((b.sale_price_usd || b.price_usd || 0)) - ((a.sale_price_usd || a.price_usd || 0));
      if (search) {
        const q = normalize(search);
        const aStarts = normalize(a.name).startsWith(q) ? 0 : 1;
        const bStarts = normalize(b.name).startsWith(q) ? 0 : 1;
        return aStarts - bStarts;
      }
      return 0;
    });

  const filteredClassifieds = classifieds.filter(c => {
    const q = normalize(search);
    return !q || normalize(c.title).includes(q) || normalize(c.description).includes(q);
  });

  const countByCat = {};
  products.forEach(p => { countByCat[p.category_slug] = (countByCat[p.category_slug] || 0) + 1; });

  const goToCatalog = () => {
    setTab("catalogo");
    setTimeout(() => catalogRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
  };

  if (selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} />;
  }

  const NAV_TABS = [["home","Inicio"],["catalogo","Productos"],["comparador","Comparador"]];

  return (
    <div style={{ background: C.bg, minHeight:"100vh", fontFamily:font, color: C.text }}>

      {/* ── NAV ── */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(255,255,255,0.95)", borderBottom:`1px solid ${C.border}`, backdropFilter:"blur(20px)", boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 16px", display:"flex", alignItems:"center", height:64, gap:12 }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", flexShrink:0 }} onClick={() => { setTab("home"); setMobileMenuOpen(false); }}>
            <div style={{ width:34, height:34, borderRadius:9, background: C.primary, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem" }}>🛸</div>
            <div className="logo-text">
              <div style={{ fontFamily:font, fontWeight:800, fontSize:"1.05rem", color: C.text, letterSpacing:"-0.3px", lineHeight:1.1 }}>
                Dron<span style={{ color: C.primary }}>Hub</span> <span style={{ color: C.orange, fontSize:"0.65rem", fontWeight:700 }}>AR</span>
              </div>
            </div>
          </div>

          {/* Search bar — center, grows */}
          <div className="nav-search" style={{ flex:1, position:"relative", maxWidth:480 }}>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); if (tab !== "catalogo" && tab !== "clasificados") setTab("catalogo"); }}
              placeholder="Buscar productos..."
              style={{ width:"100%", fontFamily:font, fontSize:"0.82rem", padding:"8px 14px 8px 36px", border:`1.5px solid ${C.border}`, borderRadius:22, outline:"none", background: C.bg, color: C.text, boxSizing:"border-box", transition:"border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor = C.primary}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:"0.85rem", color: C.textLight, pointerEvents:"none" }}>🔍</span>
            {search && (
              <button onClick={() => setSearch("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color: C.textLight, fontSize:"1rem", lineHeight:1, padding:0 }}>×</button>
            )}
          </div>

          {/* Tabs — right side, hidden on mobile */}
          <div className="nav-tabs" style={{ display:"flex", gap:2, alignItems:"center", flexShrink:0 }}>
            {NAV_TABS.map(([key, label]) => (
              <button key={key} onClick={() => { setTab(key); setSearch(""); setMobileMenuOpen(false); }}
                style={{ fontFamily:font, fontSize:"0.78rem", fontWeight: tab === key ? 600 : 500, padding:"6px 14px", background: tab === key ? "#EFF6FF" : "transparent", color: tab === key ? C.primary : C.textMid, border: tab === key ? `1px solid #BFDBFE` : "1px solid transparent", borderRadius:8, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" }}
                onMouseEnter={e => { if(tab !== key) e.currentTarget.style.background = C.bg; }}
                onMouseLeave={e => { if(tab !== key) e.currentTarget.style.background = "transparent"; }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Hamburger — visible on mobile only */}
          <button className="hamburger" onClick={() => setMobileMenuOpen(o => !o)}
            style={{ display:"none", background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 10px", cursor:"pointer", flexShrink:0, color: C.text, fontSize:"1.1rem" }}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu" style={{ background:C.white, borderTop:`1px solid ${C.border}`, padding:"8px 0 12px" }}>
            {NAV_TABS.map(([key, label]) => (
              <button key={key} onClick={() => { setTab(key); setSearch(""); setMobileMenuOpen(false); }}
                style={{ width:"100%", fontFamily:font, fontSize:"0.92rem", fontWeight: tab === key ? 600 : 400, padding:"11px 20px", background: tab === key ? "#EFF6FF" : "transparent", color: tab === key ? C.primary : C.text, border:"none", cursor:"pointer", textAlign:"left", display:"block" }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── HOME ── */}
      {tab === "home" && (
        <>
          <Hero onExplore={goToCatalog} />

          {/* Stats bar */}
          <div style={{ background:C.white, borderBottom:`1px solid ${C.border}` }}>
            <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px", display:"flex", gap:0, justifyContent:"center", flexWrap:"wrap" }}>
              {[
                [`${products.length}+`, "Productos con stock"],
                [`${stores.length}`, "Tiendas verificadas"],
                ["Cada hora", "Precios actualizados"],
                ["100%", "Gratis"],
              ].map(([val, label], i) => (
                <div key={label} style={{ textAlign:"center", padding:"0 40px", borderRight: i < 3 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ fontFamily:font, fontWeight:800, fontSize:"1.6rem", color: C.primary }}>{val}</div>
                  <div style={{ fontFamily:font, fontSize:"0.75rem", color: C.textMid, marginTop:2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured products */}
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"56px 24px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28, flexWrap:"wrap", gap:12 }}>
              <div>
                <div style={{ fontFamily:font, fontSize:"0.75rem", fontWeight:600, color: C.primary, textTransform:"uppercase", letterSpacing:1.5, marginBottom:6 }}>Recién actualizados</div>
                <h2 style={{ fontFamily:font, fontWeight:700, fontSize:"1.8rem", color: C.text, margin:0 }}>Productos destacados</h2>
              </div>
              <button onClick={goToCatalog} style={{ fontFamily:font, fontSize:"0.82rem", fontWeight:600, color: C.primary, background:"none", border:`1px solid ${C.primary}`, borderRadius:8, padding:"8px 18px", cursor:"pointer" }}>
                Ver todos →
              </button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:16 }}>
              {products.filter(p => p.sale_price_usd || p.sale_price_ars).slice(0, 8).concat(products.slice(0, 8)).slice(0, 8).map(p => (
                <ProductCard key={p.id} p={p} onClick={p => { setSelectedProduct(p); }} />
              ))}
            </div>
          </div>

          {/* CTA Comparador */}
          <div style={{ background: C.primary, padding:"56px 24px" }}>
            <div style={{ maxWidth:700, margin:"0 auto", textAlign:"center" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:16 }}>⚖️</div>
              <h2 style={{ fontFamily:font, fontWeight:700, fontSize:"1.8rem", color:"#fff", margin:"0 0 12px" }}>¿No sabés qué drone elegir?</h2>
              <p style={{ fontFamily:font, fontSize:"1rem", color:"rgba(255,255,255,0.8)", margin:"0 0 28px", lineHeight:1.7 }}>
                Usá nuestro comparador para ver precios, disponibilidad y tiendas lado a lado.
              </p>
              <button onClick={() => setTab("comparador")} style={{ fontFamily:font, fontWeight:700, fontSize:"0.95rem", padding:"14px 32px", background:"#fff", color: C.primary, border:"none", borderRadius:10, cursor:"pointer", transition:"all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                Comparar drones ahora →
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── CATÁLOGO ── */}
      {tab === "catalogo" && (
        <div ref={catalogRef} style={{ display:"flex", minHeight:"calc(100vh - 64px)", position:"relative" }}>

          {/* Mobile filter overlay backdrop */}
          {mobileFiltersOpen && (
            <div onClick={() => setMobileFiltersOpen(false)}
              style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:200, display:"none" }}
              className="mobile-backdrop"
            />
          )}

          {/* Sidebar — desktop sticky / mobile drawer */}
          <div className={`sidebar-panel${mobileFiltersOpen ? " sidebar-open" : ""}`}
            style={{ width:240, minWidth:240, background:C.white, borderRight:`1px solid ${C.border}`, position:"sticky", top:64, height:"calc(100vh - 64px)", overflowY:"auto", flexShrink:0 }}
          >
            <div style={{ padding:20 }}>

              {/* Mobile close */}
              <div className="mobile-only" style={{ display:"none", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <span style={{ fontFamily:font, fontWeight:700, fontSize:"1rem", color: C.text }}>Filtros</span>
                <button onClick={() => setMobileFiltersOpen(false)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", cursor:"pointer", fontSize:"1rem", color: C.textMid }}>✕</button>
              </div>

              {/* Ordenar */}
              <div style={{ marginBottom:24 }}>
                <label style={{ fontFamily:font, fontSize:"0.68rem", fontWeight:600, color: C.textMid, textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:8 }}>Ordenar por</label>
                {[["newest","Más recientes"],["price_asc","Menor precio"],["price_desc","Mayor precio"]].map(([v, l]) => (
                  <div key={v} onClick={() => setSortBy(v)} style={{ fontFamily:font, fontSize:"0.8rem", color: sortBy === v ? C.primary : C.textMid, padding:"6px 0", cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontWeight: sortBy === v ? 600 : 400 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background: sortBy === v ? C.primary : C.border, flexShrink:0 }} />
                    {l}
                  </div>
                ))}
              </div>

              {/* Tiendas */}
              <div style={{ marginBottom:24 }}>
                <label style={{ fontFamily:font, fontSize:"0.68rem", fontWeight:600, color: C.textMid, textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:8 }}>Tienda</label>
                <div onClick={() => setStoreFilter("")} style={{ fontFamily:font, fontSize:"0.8rem", color: !storeFilter ? C.primary : C.textMid, padding:"6px 0", cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontWeight: !storeFilter ? 600 : 400 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background: !storeFilter ? C.primary : C.border }} />
                  Todas
                </div>
                {stores.map(s => (
                  <div key={s.slug} onClick={() => { setStoreFilter(s.slug); setMobileFiltersOpen(false); }} style={{ fontFamily:font, fontSize:"0.8rem", color: storeFilter === s.slug ? s.color : C.textMid, padding:"6px 0", cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontWeight: storeFilter === s.slug ? 600 : 400 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background: storeFilter === s.slug ? s.color : C.border }} />
                    {s.name}
                  </div>
                ))}
              </div>

              {/* Categorías */}
              <div>
                <label style={{ fontFamily:font, fontSize:"0.68rem", fontWeight:600, color: C.textMid, textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:8 }}>Categoría</label>
                <div onClick={() => setCatFilter("")} style={{ fontFamily:font, fontSize:"0.8rem", color: !catFilter ? C.orange : C.textMid, padding:"5px 0", cursor:"pointer", display:"flex", justifyContent:"space-between", fontWeight: !catFilter ? 600 : 400 }}>
                  <span>Todas</span>
                  <span style={{ fontSize:"0.72rem", color: C.textLight }}>{products.length}</span>
                </div>
                {CATEGORIES.filter(c => countByCat[c.slug] > 0).map(c => (
                  <div key={c.slug} onClick={() => { setCatFilter(c.slug); setMobileFiltersOpen(false); }} style={{ fontFamily:font, fontSize:"0.8rem", color: catFilter === c.slug ? C.orange : C.textMid, padding:"5px 0", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", fontWeight: catFilter === c.slug ? 600 : 400 }}>
                    <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:"0.9rem" }}>{c.icon}</span> {c.name}
                    </span>
                    <span style={{ fontSize:"0.72rem", color: C.textLight }}>{countByCat[c.slug] || 0}</span>
                  </div>
                ))}
              </div>

              {/* Estado */}
              <div style={{ marginTop:24 }}>
                <label style={{ fontFamily:font, fontSize:"0.68rem", fontWeight:600, color: C.textMid, textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:8 }}>Estado</label>
                {[["","Todos"],["nuevo","Nuevo"],["usado","Usado"]].map(([v, l]) => (
                  <div key={v} onClick={() => { setConditionFilter(v); setMobileFiltersOpen(false); }} style={{ fontFamily:font, fontSize:"0.8rem", color: conditionFilter === v ? C.primary : C.textMid, padding:"6px 0", cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontWeight: conditionFilter === v ? 600 : 400 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background: conditionFilter === v ? C.primary : C.border, flexShrink:0 }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div style={{ flex:1, padding:"20px 20px", minWidth:0 }}>
            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                {/* Mobile filter button */}
                <button className="filter-btn-mobile" onClick={() => setMobileFiltersOpen(true)}
                  style={{ display:"none", alignItems:"center", gap:6, fontFamily:font, fontSize:"0.8rem", fontWeight:600, padding:"7px 14px", background:C.white, border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer", color: C.text }}
                >
                  ⚙️ Filtros {(catFilter || storeFilter) ? "·" : ""} {catFilter ? CATEGORIES.find(c=>c.slug===catFilter)?.name : ""}{catFilter && storeFilter ? ", " : ""}{storeFilter ? stores.find(s=>s.slug===storeFilter)?.name : ""}
                </button>
                <div>
                  <h2 style={{ fontFamily:font, fontWeight:700, fontSize:"1.15rem", color: C.text, margin:0 }}>
                    {catFilter ? CATEGORIES.find(c => c.slug === catFilter)?.name || catFilter : "Todos los productos"}
                    {storeFilter && <span style={{ color: C.textMid, fontSize:"0.9rem", fontWeight:400 }}> · {stores.find(s => s.slug === storeFilter)?.name}</span>}
                  </h2>
                  <div style={{ fontFamily:font, fontSize:"0.72rem", color: C.textMid, marginTop:2 }}>
                    {loading ? "Cargando..." : `${filteredProducts.length} productos con stock`}
                  </div>
                </div>
              </div>
              {(catFilter || storeFilter || conditionFilter || search) && (
                <button onClick={() => { setCatFilter(""); setStoreFilter(""); setConditionFilter(""); setSearch(""); }}
                  style={{ fontFamily:font, fontSize:"0.72rem", color: C.textMid, background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 12px", cursor:"pointer" }}>
                  × Limpiar filtros
                </button>
              )}
            </div>

            {/* Grid */}
            {loading ? (
              <div style={{ textAlign:"center", padding:"80px 0", color: C.textMid }}>
                <div style={{ fontSize:"2rem", marginBottom:12 }}>⏳</div>
                <div style={{ fontFamily:font }}>Cargando productos...</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign:"center", padding:"80px 0", color: C.textMid }}>
                <div style={{ fontSize:"2rem", marginBottom:12 }}>🔍</div>
                <div style={{ fontFamily:font }}>Sin resultados para este filtro.</div>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:14 }}>
                {filteredProducts.map(p => <ProductCard key={p.id} p={p} onClick={setSelectedProduct} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── COMPARADOR ── */}
      {tab === "comparador" && <Comparador products={products} />}

      {/* ── TIENDAS ── */}
      {tab === "tiendas" && (
        <div style={{ padding:"48px 24px", maxWidth:1100, margin:"0 auto" }}>
          <div style={{ marginBottom:32 }}>
            <div style={{ fontFamily:font, fontSize:"0.75rem", fontWeight:600, color: C.primary, textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>Red de tiendas</div>
            <h2 style={{ fontFamily:font, fontWeight:700, fontSize:"1.8rem", color: C.text, margin:"0 0 6px" }}>Tiendas verificadas</h2>
            <p style={{ fontFamily:font, fontSize:"0.88rem", color: C.textMid, margin:0 }}>Precios actualizados automáticamente cada hora</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:20 }}>
            {stores.map(s => (
              <div key={s.slug}
                onClick={() => { setTab("catalogo"); setStoreFilter(s.slug); }}
                style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:24, cursor:"pointer", transition:"all 0.2s", position:"relative", overflow:"hidden" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = s.color || C.primary; e.currentTarget.style.boxShadow = C.shadowHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ position:"absolute", top:0, left:0, width:"100%", height:3, background: s.color || C.primary }} />
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <span style={{ fontSize:"2rem" }}>{s.logo_emoji}</span>
                  {s.badge && <span style={{ fontFamily:font, fontSize:"0.6rem", fontWeight:700, padding:"3px 8px", border:`1px solid ${s.color || C.primary}`, color: s.color || C.primary, borderRadius:4 }}>{s.badge}</span>}
                </div>
                <div style={{ fontFamily:font, fontWeight:700, fontSize:"1rem", color: C.text, marginBottom:4 }}>{s.name}</div>
                <div style={{ fontFamily:font, fontSize:"0.72rem", color: C.textMid, marginBottom:10 }}>📍 {s.city} · {s.platform}</div>
                <div style={{ fontFamily:font, fontSize:"0.8rem", color: C.textMid, lineHeight:1.6, marginBottom:14 }}>{s.description}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:16 }}>
                  {(s.tags || []).map(t => <span key={t} style={{ fontFamily:font, fontSize:"0.62rem", padding:"2px 8px", border:`1px solid ${C.border}`, color: C.textMid, borderRadius:4 }}>{t}</span>)}
                </div>
                <div style={{ fontFamily:font, fontSize:"0.78rem", fontWeight:600, color: C.primary }}>Ver catálogo →</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CLASIFICADOS ── */}
      {tab === "clasificados" && (
        <div style={{ padding:"48px 24px", maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28, flexWrap:"wrap", gap:12 }}>
            <div>
              <div style={{ fontFamily:font, fontSize:"0.75rem", fontWeight:600, color: C.orange, textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>Comunidad</div>
              <h2 style={{ fontFamily:font, fontWeight:700, fontSize:"1.8rem", color: C.text, margin:"0 0 4px" }}>Clasificados</h2>
              <p style={{ fontFamily:font, fontSize:"0.85rem", color: C.textMid, margin:0 }}>Comprá y vendé directo · Sin comisión · Gratis</p>
            </div>
            <button onClick={() => setShowPublish(true)}
              style={{ fontFamily:font, fontWeight:700, fontSize:"0.85rem", padding:"11px 22px", background: C.orange, color:"#fff", border:"none", borderRadius:9, cursor:"pointer", transition:"background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.orangeHover}
              onMouseLeave={e => e.currentTarget.style.background = C.orange}
            >
              + Publicar gratis
            </button>
          </div>
          <div style={{ position:"relative", marginBottom:20 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar en clasificados..."
              style={{ width:"100%", fontFamily:font, fontSize:"0.88rem", padding:"12px 16px 12px 44px", border:`1px solid ${C.border}`, borderRadius:10, outline:"none", background:C.white, color: C.text, boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor = C.primary}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color: C.textMid }}>🔍</span>
          </div>
          {filteredClassifieds.length > 0
            ? <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
                {filteredClassifieds.map(c => <ClassifiedCard key={c.id} item={c} onContact={setContactItem} />)}
              </div>
            : <div style={{ padding:"80px 0", textAlign:"center", color: C.textMid }}>
                <div style={{ fontSize:"2rem", marginBottom:10 }}>📦</div>
                <div style={{ fontFamily:font }}>Sin clasificados. ¡Sé el primero en publicar!</div>
              </div>
          }
        </div>
      )}

      {/* MODAL CONTACTO CLASIFICADO */}
      {contactItem && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:C.white, borderRadius:16, width:"100%", maxWidth:400, padding:32, position:"relative", boxShadow:"0 24px 60px rgba(0,0,0,0.2)" }}>
            <button onClick={() => setContactItem(null)} style={{ position:"absolute", top:14, right:14, background:"none", border:`1px solid ${C.border}`, color: C.textMid, fontSize:"1rem", cursor:"pointer", borderRadius:6, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
            <h3 style={{ fontFamily:font, fontWeight:700, fontSize:"1rem", color: C.text, marginBottom:6, paddingRight:30 }}>{contactItem.title}</h3>
            <div style={{ fontFamily:font, fontSize:"0.88rem", color: C.orange, fontWeight:700, marginBottom:18 }}>
              {contactItem.price_ars ? fmtARS(contactItem.price_ars) : contactItem.price_usd ? fmtUSD(contactItem.price_usd) : "A convenir"}
            </div>
            <div style={{ fontFamily:font, fontSize:"0.78rem", color: C.textMid, marginBottom:24, lineHeight:2 }}>
              Vendedor: <span style={{ color: C.text, fontWeight:500 }}>@{contactItem.seller_name}</span><br />
              Ciudad: <span style={{ color: C.text, fontWeight:500 }}>{contactItem.city}</span><br />
              Condición: <span style={{ color: C.text, fontWeight:500 }}>{contactItem.condition}</span>
            </div>
            <a href={`https://wa.me/${(contactItem.whatsapp||"").replace(/\D/g,"")}?text=${encodeURIComponent(`Hola! Vi tu aviso en DronHub AR: "${contactItem.title}". ¿Está disponible?`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display:"block", textAlign:"center", fontFamily:font, fontSize:"0.85rem", fontWeight:700, padding:"13px", background:"#25D366", color:"#fff", textDecoration:"none", borderRadius:9, letterSpacing:0.3 }}>
              💬 Contactar por WhatsApp
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

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; font-family: 'Sora', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.textLight}; }
        input:focus, textarea:focus, select:focus { border-color: ${C.primary} !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          /* Nav: hide tabs, show hamburger and keep search */
          .nav-tabs { display: none !important; }
          .hamburger { display: flex !important; }
          /* Hide logo text, keep only icon */
          .logo-text { display: none !important; }
          /* Search bar expands to fill available space */
          .nav-search { max-width: none !important; flex: 1 !important; }

          /* Sidebar: hidden by default, slide in as drawer */
          .sidebar-panel {
            position: fixed !important;
            top: 0 !important;
            left: -260px !important;
            height: 100vh !important;
            width: 260px !important;
            z-index: 300;
            transition: left 0.25s ease;
            box-shadow: none;
          }
          .sidebar-panel.sidebar-open {
            left: 0 !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.15);
          }
          .mobile-backdrop { display: block !important; }
          .mobile-only { display: flex !important; }
          .filter-btn-mobile { display: flex !important; }

          /* Product grid: 2 columns on mobile */
          .sidebar-panel + div > div:last-child > div {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }

          /* Detail: single column */
          .detail-grid { grid-template-columns: 1fr !important; }

          /* Hero smaller */
          .hero-content h1 { font-size: 1.9rem !important; }
          .hero-stats { gap: 20px !important; }

          /* Stats bar: 2x2 */
          .stats-bar { flex-wrap: wrap; }
          .stats-bar > div { border-right: none !important; border-bottom: 1px solid ${C.border}; width: 50%; padding: 16px 0 !important; }
        }

        @media (max-width: 480px) {
          /* Product grid: 1 column on very small */
          .sidebar-panel + div > div:last-child > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
