# Build index.html (and app.min.js) from src/, design-system/, fonts/ and vendor/.
#
#   python3 build.py            # rebuild, reuse saved first-screen snapshot (src/shell-*.html)
#   python3 build.py --shell    # also re-take the snapshot (needs Node + Playwright)

import hashlib
import os
import re
import shutil
import subprocess
import sys

# Optional: set your live domain (e.g. "https://yourdomain.com") to output absolute og:url / og:image URLs
SITE_URL = ""
WHATSAPP_URL = "https://wa.me/60185768476"
WHATSAPP_DISPLAY = "+60 18-576 8476"

DS = "design-system"
args = [a for a in sys.argv[1:] if not a.startswith("--")]
if args:
    DS = args[0]


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def write(path, content):
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(content)


def esbuild(src, loader):
    exe = shutil.which("esbuild")
    if not exe:
        return src
    cmd = [exe, "--minify", "--loader=" + loader, "--log-level=error"]
    if loader == "js":
        cmd.append("--target=es2017")
    res = subprocess.run(cmd, input=src.encode("utf-8"), capture_output=True)
    if res.returncode != 0:
        sys.stderr.write(res.stderr.decode("utf-8", "replace"))
        sys.exit(res.returncode)
    return res.stdout.decode("utf-8")


# ---------- CSS (inlined, minified) ----------
tokens = read(os.path.join(DS, "tokens.css"))
bcss = re.sub(
    r"^\s*@import\s+url\([^)]*\);\s*",
    "",
    read(os.path.join(DS, "components", "bundle.css")),
    flags=re.MULTILINE,
)
css = esbuild(
    "\n".join([read("src/fonts.css"), tokens, bcss, read("src/page.css")]),
    "css",
)

# ---------- JS (one deferred, minified, same-origin file) ----------
js = "\n;".join(
    [
        read("vendor/react.production.min.js"),
        read("vendor/react-dom.production.min.js"),
        read("vendor/htm.umd.js"),
        esbuild(read(os.path.join(DS, "components", "bundle.js")), "js"),
        esbuild(read("src/app.js"), "js"),
    ]
)
write("app.min.js", js)
ver = hashlib.sha1(js.encode("utf-8")).hexdigest()[:10]

base_url = SITE_URL.rstrip("/")
og_image_url = f"{base_url}/og-image.png" if base_url else "og-image.png"
og_url_tag = f'\n<meta property="og:url" content="{base_url}/">' if base_url else ""


def shell(name):
    path = f"src/shell-{name}.html"
    return read(path).strip() if os.path.exists(path) else ""


def make_boot():
    narrow, wide = shell("narrow"), shell("wide")
    if not (narrow and wide):
        return ""
    return (
        '<template id="shell-n">'
        + narrow
        + '</template><template id="shell-w">'
        + wide
        + "</template>\n"
        '<script>(function(){var m=window.matchMedia&&matchMedia("(max-width: 720px)").matches,'
        't=document.getElementById(m?"shell-n":"shell-w"),r=document.getElementById("root");'
        'if(t&&r){r.appendChild(t.content.cloneNode(true));document.documentElement.classList.add("has-shell");}})();</script>'
    )


def page(boot):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#163a1e">
<title>DAJU Matcha</title>
<meta name="description" content="DAJU Matcha, a pop-up matcha bar in Kota Kinabalu. Build your cup and order on WhatsApp.">
<meta property="og:type" content="website">
<meta property="og:site_name" content="DAJU">{og_url_tag}
<meta property="og:title" content="DAJU Matcha">
<meta property="og:description" content="Pop-up matcha bar in Kota Kinabalu. Build your cup and order on WhatsApp.">
<meta property="og:image" content="{og_image_url}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="DAJU logo">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{og_image_url}">
<link rel="icon" href="data:,">
<link rel="preload" as="image" type="image/webp" fetchpriority="high" imagesrcset="blue-sea-salt-cutout-300.webp 300w, blue-sea-salt-cutout.webp 433w" imagesizes="(min-width: 721px) 300px, (min-width: 391px) 250px, 64vw">
<link rel="preload" href="fonts/sacramento.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/shrikhand.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/dm-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/cormorant-garamond.woff2" as="font" type="font/woff2" crossorigin>
<script src="app.min.js?v={ver}" defer></script>
<style>{css}</style>
</head>
<body>
<div id="root"></div>
<noscript>
  <div style="max-width:480px;margin:48px auto;padding:24px;font-family:system-ui,sans-serif;text-align:center;color:#163a1e;">
    <h1 style="margin:0 0 12px;">DA | JU Matcha</h1>
    <p style="margin:0 0 20px;line-height:1.5;">Enable JavaScript to customize your cup online, or message us directly on WhatsApp to order.</p>
    <a href="{WHATSAPP_URL}" style="display:inline-block;padding:12px 24px;border-radius:999px;background:#163a1e;color:#fdfbf7;text-decoration:none;font-weight:700;">Order on WhatsApp ({WHATSAPP_DISPLAY})</a>
  </div>
</noscript>
{boot}
</body>
</html>
"""


if "--shell" in sys.argv:
    backup = read("index.html") if os.path.exists("index.html") else None
    try:
        write("index.html", page(""))
        subprocess.run(["node", "tools/prerender.js"], check=True)
    except Exception:
        if backup is not None:
            write("index.html", backup)
        raise

out = page(make_boot())
write("index.html", out)
print("index.html", len(out), "bytes; app.min.js", len(js), "bytes")
