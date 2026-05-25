"""
Génère des screenshots HD du portfolio pour import dans Figma.
- 3 viewports : Desktop (1440), Tablet (768), Mobile (375)
- Full page + sections individuelles
"""
import asyncio
import http.server
import socketserver
import threading
import os
from pathlib import Path
from playwright.async_api import async_playwright

PORT = 8765
PORTFOLIO_DIR = Path(__file__).parent
OUTPUT_DIR = PORTFOLIO_DIR / "figma-screenshots"
OUTPUT_DIR.mkdir(exist_ok=True)

# ─ Lance un mini serveur HTTP local ──────────────────────────
os.chdir(PORTFOLIO_DIR)
handler = http.server.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(("", PORT), handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()
print(f"[OK] Serveur local sur http://localhost:{PORT}")

VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "tablet":  {"width": 768,  "height": 1024},
    "mobile":  {"width": 375,  "height": 812},
}

SECTIONS = ["hero", "about", "education", "skills", "projects", "contact"]

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for vp_name, vp_size in VIEWPORTS.items():
            print(f"\n>> Viewport: {vp_name} ({vp_size['width']}x{vp_size['height']})")
            ctx = await browser.new_context(
                viewport=vp_size,
                device_scale_factor=2,  # Retina HD x2
            )
            page = await ctx.new_page()
            await page.goto(f"http://localhost:{PORT}", wait_until="networkidle")
            # Attend que toutes les images soient charges
            await page.evaluate("""
                () => Promise.all(
                    Array.from(document.images)
                        .filter(img => !img.complete)
                        .map(img => new Promise(r => { img.onload = img.onerror = r; }))
                )
            """)
            await page.wait_for_timeout(4500)  # Laisse les animations finir

            # ─ Full page screenshot ─
            full_path = OUTPUT_DIR / f"00-full-{vp_name}.png"
            await page.screenshot(path=str(full_path), full_page=True)
            print(f"  [OK]{full_path.name}")

            # ─ Section par section ─
            for i, sec in enumerate(SECTIONS, 1):
                try:
                    el = await page.query_selector(f"#{sec}")
                    if el:
                        sec_path = OUTPUT_DIR / f"{i:02d}-{sec}-{vp_name}.png"
                        await el.screenshot(path=str(sec_path))
                        print(f"  [OK]{sec_path.name}")
                except Exception as e:
                    print(f"  [ERR] {sec}: {e}")

            await ctx.close()
        await browser.close()
    print(f"\n[DONE] Tous les screenshots dans : {OUTPUT_DIR}")

asyncio.run(capture())
httpd.shutdown()
