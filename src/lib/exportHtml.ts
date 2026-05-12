import { MockTemplate } from "./types";

export function exportHtml(template: MockTemplate): void {
  const html = buildHtml(template);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${template.name.toLowerCase().replace(/\s+/g, "-")}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildHtml(t: MockTemplate): string {
  const { primaryColor: pc, accentColor: ac } = t;

  const navLinks = t.navItems
    .map(
      (item) =>
        `<a href="#" style="color:#6b7280;font-size:13px;font-weight:500;text-decoration:none;transition:color .15s" onmouseover="this.style.color='#111827'" onmouseout="this.style.color='#6b7280'">${item}</a>`
    )
    .join("");

  const featureCards = t.features
    .map(
      (f) => `
    <div style="background:white;border-radius:16px;border:1px solid #f3f4f6;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,.05);transition:box-shadow .2s" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,.08)'" onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,.05)'">
      <div style="font-size:36px;margin-bottom:16px;">${f.icon}</div>
      <h3 style="font-size:14px;font-weight:700;color:#111827;margin:0 0 8px">${f.title}</h3>
      <p style="font-size:12px;line-height:1.7;color:#6b7280;margin:0">${f.description}</p>
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t.name} — AI Web Designer</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#fff;color:#111827;-webkit-font-smoothing:antialiased}
    nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid #f3f4f6}
    .nav-inner{max-width:960px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 24px}
    .nav-links{display:flex;align-items:center;gap:28px}
    .cta-btn{border:none;cursor:pointer;border-radius:10px;padding:8px 16px;font-size:12px;font-weight:600;color:#fff;transition:opacity .15s}
    .cta-btn:hover{opacity:.88}
    .hero{position:relative;overflow:hidden;padding:80px 24px 96px;text-align:center}
    .hero-blob{position:absolute;border-radius:50%;filter:blur(72px);pointer-events:none}
    .hero-inner{position:relative;max-width:720px;margin:0 auto}
    .badge{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 14px;font-size:11px;font-weight:600;border-width:1px;border-style:solid;margin-bottom:24px}
    h1{font-size:clamp(32px,5vw,52px);font-weight:800;line-height:1.15;letter-spacing:-.02em;color:#111827;margin-bottom:20px}
    .subtitle{font-size:16px;line-height:1.7;color:#6b7280;max-width:520px;margin:0 auto 36px}
    .btn-group{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
    .btn-primary{border:none;cursor:pointer;border-radius:12px;padding:12px 28px;font-size:14px;font-weight:700;color:#fff;transition:transform .15s,box-shadow .15s}
    .btn-primary:hover{transform:scale(1.04)}
    .btn-secondary{background:white;border:1px solid #e5e7eb;cursor:pointer;border-radius:12px;padding:12px 28px;font-size:14px;font-weight:600;color:#374151;transition:background .15s}
    .btn-secondary:hover{background:#f9fafb}
    .trust{margin-top:36px;display:flex;flex-wrap:wrap;gap:16px;justify-content:center;font-size:12px;color:#9ca3af}
    .features-section{background:#f9fafb;padding:72px 24px}
    .section-inner{max-width:960px;margin:0 auto}
    .section-title{text-align:center;margin-bottom:48px}
    .section-title h2{font-size:28px;font-weight:800;color:#111827;margin-bottom:12px}
    .section-title p{font-size:14px;color:#6b7280}
    .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}
    .stats-section{padding:56px 24px;text-align:center}
    .stats-grid{max-width:640px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .stat-value{font-size:36px;font-weight:800;letter-spacing:-.02em}
    .stat-label{font-size:12px;color:#6b7280;margin-top:4px}
    .cta-section{padding:0 24px 80px}
    .cta-banner{max-width:768px;margin:0 auto;border-radius:24px;padding:56px 40px;text-align:center;color:#fff;position:relative;overflow:hidden}
    .cta-banner h2{font-size:32px;font-weight:800;margin-bottom:12px}
    .cta-banner p{font-size:14px;opacity:.8;margin-bottom:32px}
    .cta-banner-btn{background:white;border:none;cursor:pointer;border-radius:12px;padding:14px 36px;font-size:14px;font-weight:700;transition:transform .15s,box-shadow .15s}
    .cta-banner-btn:hover{transform:scale(1.04);box-shadow:0 8px 24px rgba(0,0,0,.15)}
    footer{border-top:1px solid #f3f4f6;padding:28px 24px}
    .footer-inner{max-width:960px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px}
    .footer-links{display:flex;gap:20px}
    .footer-links a{font-size:12px;color:#9ca3af;text-decoration:none}
    .footer-links a:hover{color:#6b7280}
    @media(max-width:640px){.nav-links{display:none}.stats-grid{grid-template-columns:repeat(3,1fr)}.footer-inner{flex-direction:column;align-items:center}}
  </style>
</head>
<body>
  <!-- Navbar -->
  <nav>
    <div class="nav-inner">
      <span style="font-size:17px;font-weight:800;color:${pc};letter-spacing:-.01em">Brand</span>
      <div class="nav-links">${navLinks}</div>
      <button class="cta-btn" style="background:${pc}">${t.ctaText}</button>
    </div>
  </nav>

  <!-- Hero -->
  <section class="hero">
    <div class="hero-blob" style="width:500px;height:500px;background:${ac}18;top:-120px;right:-80px"></div>
    <div class="hero-blob" style="width:320px;height:320px;background:${pc}10;bottom:0;left:40px"></div>
    <div class="hero-inner">
      <div class="badge" style="color:${pc};border-color:${ac}40;background:${ac}12">
        <span>✦</span>
        <span>AI Web Designer 生成</span>
      </div>
      <h1>${t.heroTitle}</h1>
      <p class="subtitle">${t.heroSubtitle}</p>
      <div class="btn-group">
        <button class="btn-primary" style="background:${pc};box-shadow:0 8px 24px ${pc}40">${t.ctaText}</button>
        <button class="btn-secondary">了解更多 →</button>
      </div>
      <div class="trust">
        <span>⭐ 4.9 用户评分</span>
        <span>·</span>
        <span>50,000+ 活跃用户</span>
        <span>·</span>
        <span>无需信用卡</span>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section class="features-section">
    <div class="section-inner">
      <div class="section-title">
        <h2>为什么选择我们</h2>
        <p>专注于打磨每一个细节，只为给你最好的体验。</p>
      </div>
      <div class="features-grid">${featureCards}</div>
    </div>
  </section>

  <!-- Stats -->
  <section class="stats-section">
    <div class="stats-grid">
      <div><div class="stat-value" style="color:${pc}">50K+</div><div class="stat-label">活跃用户</div></div>
      <div><div class="stat-value" style="color:${pc}">99.9%</div><div class="stat-label">服务可用率</div></div>
      <div><div class="stat-value" style="color:${pc}">4.9★</div><div class="stat-label">用户评分</div></div>
    </div>
  </section>

  <!-- CTA Banner -->
  <section class="cta-section">
    <div class="cta-banner" style="background:linear-gradient(135deg,${pc},${ac})">
      <h2>准备好开始了吗？</h2>
      <p>加入数千个已经受益的用户，今天就迈出第一步。</p>
      <button class="cta-banner-btn" style="color:${pc}">${t.ctaText} →</button>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="footer-inner">
      <span style="font-size:14px;font-weight:700;color:${pc}">Brand</span>
      <span style="font-size:12px;color:#9ca3af">© 2025 Brand. All rights reserved.</span>
      <div class="footer-links">
        <a href="#">隐私政策</a>
        <a href="#">使用条款</a>
        <a href="#">联系我们</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
}
