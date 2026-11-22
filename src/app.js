(function () {
  var React = window.React;
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useRef = React.useRef;
  var html = window.htm.bind(React.createElement);
  var Daju = window.Daju;

  // =========================================================================
  // CENTRALIZED WEEKLY CONFIG (update prices, handles, pop-ups here only)
  // =========================================================================
  var CONFIG = {
    whatsappNumber: "60185768476",
    whatsappDisplay: "+60 18-576 8476",
    instagramHandle: "", // e.g. "@dajumatcha"
    instagramUrl: "",    // e.g. "https://instagram.com/dajumatcha"
    tiktokHandle: "",    // e.g. "@dajumatcha"
    tiktokUrl: "",       // e.g. "https://tiktok.com/@dajumatcha"
    showPreviewBanner: true,
    maxCupsPerOrder: 10,
    motwPrice: 8.99,
    cutoffs: {
      weekdayLunchStartMin: 750,  // 12:30 PM (pre-orders close before pickup starts)
      weekdayCodCloseMin: 1320,   // 10:00 PM
      weekendGrabCloseMin: 960,   // 4:00 PM
    },
    popups: [
      {
        id: "palm-square-nov-2026",
        start: "2026-11-21",
        end: "2026-11-22",
        startHour: 10,
        endHour: 20,
        days: "Sat 21 \u2013 Sun 22 Nov",
        time: "10 AM \u2013 8 PM",
        venue: "Palm Square",
        place: "Centre Point, Kota Kinabalu",
      },
    ],
    menu: [
      {
        id: "bss",
        cat: "Matcha",
        name: "Matcha Blue Sea Salt",
        flavor: "Blue Sea Salt",
        note: "Creamy matcha meets a hint of sea salt.",
        price: 8.99, // Synced with motwPrice
        status: "weekly",
        image: "blue-sea-salt.jpg",
        imageAlt:
          "Matcha Blue Sea Salt in a clear cup with blue sea-salt foam, DA JU in marker and butterfly charms",
        tilt: -2,
      },
      {
        id: "latte",
        cat: "Matcha",
        name: "Matcha Latte",
        flavor: "Latte",
        note: "Earthy matcha, creamy comfort. Simple, smooth, soul-soothing.",
        price: null,
        status: "available",
        image: "matcha-latte.jpg",
        imageAlt:
          "Matcha Latte: bright green matcha swirling down into cold milk and ice, DA JU printed on the cup",
        tilt: 1,
      },
      {
        id: "strawberry",
        cat: "Matcha",
        name: "Matcha Strawberry",
        flavor: "Strawberry",
        note: "Sweet strawberry, fruity and refreshing, under a layer of matcha.",
        price: null,
        status: "available",
        image: "matcha-strawberry.jpg",
        imageAlt:
          "Matcha Strawberry: green matcha on top of pink strawberry milk with a red strawberry layer at the bottom",
        tilt: -1,
      },
      {
        id: "coconut",
        cat: "Matcha",
        name: "Matcha Coconut",
        flavor: "Coconut",
        note: "Refreshing coconut, smooth matcha, perfect balance. Light and creamy.",
        price: null,
        status: "available",
        image: "matcha-coconut.jpg",
        imageAlt:
          "Matcha Coconut: a layer of deep green matcha floating over clear coconut water and ice",
        tilt: 2,
      },
      {
        id: "coffee-salt",
        cat: "Coffee",
        name: "Coffee Sea Salt",
        flavor: "Sea Salt",
        note: "Iced coffee under a thick salted cream cap, dusted with cinnamon.",
        price: null,
        status: "available",
        image: "coffee-sea-salt.jpg",
        imageAlt:
          "Coffee Sea Salt: iced coffee topped with a thick sea-salt cream and a dusting of cinnamon, DA JU written in marker",
        tilt: -1,
      },
      {
        id: "coffee-latte",
        cat: "Coffee",
        name: "Coffee Latte",
        flavor: "Latte",
        note: "Smooth coffee and cold milk over ice. An easy everyday cup.",
        price: null,
        status: "available",
        image: null,
        tilt: 1,
      },
    ],
  };

  var HERO_ALT =
    "The real Matcha Blue Sea Salt: a clear cup of matcha topped with blue sea-salt foam and ice, DA JU hand-lettered in black marker, decorated with colourful butterfly charms";
  var MENU = CONFIG.menu;
  var CATEGORIES = ["Matcha", "Coffee"];
  var MOTW_DRINK =
    MENU.filter(function (d) {
      return d.status === "weekly";
    })[0] || MENU[0];
  var MOTW_PRICE_TEXT = "RM" + CONFIG.motwPrice.toFixed(2);
  var STORAGE_KEY = "daju_order_v1";

  function findDrink(id) {
    return (
      MENU.filter(function (d) {
        return d.id === id;
      })[0] || MOTW_DRINK
    );
  }

  function cupClass(id) {
    return "cup-" + (id || MOTW_DRINK.id);
  }

  function DrinkThumb(props) {
    return html`<${Daju.CupPreview} width=${props.size || 40} name="" charm="none" className=${cupClass(props.drink.id)} alt="" />`;
  }

  var FLAIR_LABELS = {
    butterfly: "Butterfly Charms",
    ribbon: "Ribbon",
    both: "Butterfly Charms + Ribbon",
    none: "None",
  };
  var FLAIR_OPTS = [
    { value: "butterfly", label: "Butterfly charms", icon: "butterfly" },
    { value: "ribbon", label: "Ribbon", icon: "bow" },
    { value: "both", label: "Both", icon: "sparkle" },
  ];
  var LEVEL_OPTS = ["Normal", "Less"];
  var DAY_OPTS = [
    { value: "weekday", label: "Weekdays" },
    { value: "weekend", label: "Weekend" },
  ];
  var MODE_OPTS = [
    { value: "PICK_UP", label: "Pick Up", icon: "bag" },
    { value: "GRAB_EXPRESS", label: "Grab Express", icon: "scooter" },
    { value: "COD", label: "COD", icon: "car" },
  ];
  var GRAB_WINDOWS = [
    { value: "9:00 AM \u2013 11:00 AM", label: "9:00 AM \u2013 11:00 AM", endMin: 660 },
    { value: "11:00 AM \u2013 1:00 PM", label: "11:00 AM \u2013 1:00 PM", endMin: 780 },
    { value: "1:00 PM \u2013 3:00 PM", label: "1:00 PM \u2013 3:00 PM", endMin: 900 },
    { value: "3:00 PM \u2013 4:00 PM", label: "3:00 PM \u2013 4:00 PM", endMin: 960 },
  ];
  var MODE_NAMES = { PICK_UP: "Pick Up", GRAB_EXPRESS: "Grab Express", COD: "COD" };
  var SCHED_NAMES = { WEEKDAY: "Weekday", WEEKEND: "Weekend", "POP-UP": "Pop-up" };

  function formatPrice(val) {
    return val == null ? "Price TBC" : "RM " + Number(val).toFixed(2);
  }

  function formatSubtotal(items) {
    if (!items.length) return "RM 0.00";
    var total = 0;
    var hasTbc = false;
    for (var i = 0; i < items.length; i++) {
      if (items[i].price == null) {
        hasTbc = true;
      } else {
        total += Number(items[i].price);
      }
    }
    if (hasTbc) {
      return total > 0 ? "RM " + total.toFixed(2) + " + TBC" : "Price TBC";
    }
    return "RM " + total.toFixed(2);
  }

  var klFormatter = null;
  try {
    klFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (err) {
    klFormatter = null;
  }

  function getKLNow() {
    var now = new Date();
    if (klFormatter && typeof klFormatter.formatToParts === "function") {
      try {
        var parts = klFormatter.formatToParts(now);
        var map = {};
        for (var i = 0; i < parts.length; i++) {
          map[parts[i].type] = parts[i].value;
        }
        var yr = parseInt(map.year, 10);
        var mo = parseInt(map.month, 10);
        var da = parseInt(map.day, 10);
        var hr = parseInt(map.hour, 10) % 24;
        var mn = parseInt(map.minute, 10);
        var wdMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        var wd = wdMap[map.weekday] != null ? wdMap[map.weekday] : now.getDay();
        return {
          year: yr,
          month: mo,
          day: da,
          weekday: wd,
          hour: hr,
          minute: mn,
          minutes: hr * 60 + mn,
          isWeekend: wd === 0 || wd === 6,
          ymd: yr + "-" + String(mo).padStart(2, "0") + "-" + String(da).padStart(2, "0"),
        };
      } catch (err) {}
    }
    var shifted = new Date(now.getTime() + (now.getTimezoneOffset() + 480) * 60000);
    var fYr = shifted.getFullYear();
    var fMo = shifted.getMonth() + 1;
    var fDa = shifted.getDate();
    var fHr = shifted.getHours();
    var fMn = shifted.getMinutes();
    var fWd = shifted.getDay();
    return {
      year: fYr,
      month: fMo,
      day: fDa,
      weekday: fWd,
      hour: fHr,
      minute: fMn,
      minutes: fHr * 60 + fMn,
      isWeekend: fWd === 0 || fWd === 6,
      ymd: fYr + "-" + String(fMo).padStart(2, "0") + "-" + String(fDa).padStart(2, "0"),
    };
  }

  function formatKLTime(kl) {
    var hr12 = kl.hour % 12 || 12;
    return hr12 + ":" + (kl.minute < 10 ? "0" : "") + kl.minute + (kl.hour < 12 ? " AM" : " PM");
  }

  function makeOrderRef(kl) {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var suffix = "";
    for (var i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return (
      "DJ-" +
      (kl.month < 10 ? "0" : "") +
      kl.month +
      (kl.day < 10 ? "0" : "") +
      kl.day +
      "-" +
      suffix
    );
  }

  function getActivePopups(kl) {
    return CONFIG.popups
      .filter(function (p) {
        if (p.end > kl.ymd) return true;
        if (p.end === kl.ymd) {
          return kl.hour < (p.endHour != null ? p.endHour : 24);
        }
        return false;
      })
      .sort(function (a, b) {
        return a.start < b.start ? -1 : a.start > b.start ? 1 : 0;
      });
  }

  function popupBadgeText(popup, kl) {
    var startHr = popup.startHour != null ? popup.startHour : 10;
    var endHr = popup.endHour != null ? popup.endHour : 20;
    if (popup.start <= kl.ymd && kl.ymd <= popup.end) {
      if (kl.hour >= startHr && kl.hour < endHr) return "Happening now";
      if (kl.hour < startHr) {
        var openStr = (startHr % 12 || 12) + (startHr < 12 ? " AM" : " PM");
        return "Opens today at " + openStr;
      }
      if (kl.ymd < popup.end) return "Back tomorrow";
      return "Ended for today";
    }
    var startParts = popup.start.split("-");
    var nowParts = kl.ymd.split("-");
    var startUtc = Date.UTC(parseInt(startParts[0], 10), parseInt(startParts[1], 10) - 1, parseInt(startParts[2], 10));
    var nowUtc = Date.UTC(parseInt(nowParts[0], 10), parseInt(nowParts[1], 10) - 1, parseInt(nowParts[2], 10));
    var diffDays = Math.round((startUtc - nowUtc) / 86400000);
    var startDow = new Date(startUtc).getUTCDay();
    var startsOnWeekend = startDow === 0 || startDow === 6;
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 6 && startsOnWeekend) return "This weekend";
    if (diffDays <= 6) return "This week";
    if (diffDays <= 13) return "Next week";
    return "Coming up";
  }

  function popupMapUrl(popup) {
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(popup.venue + ", " + popup.place);
  }

  function useMediaQuery(query) {
    var readMatch = function () {
      try {
        return window.matchMedia(query).matches;
      } catch (err) {
        return false;
      }
    };
    var state = useState(readMatch);
    var matches = state[0];
    var setMatches = state[1];

    useEffect(
      function () {
        var mql;
        try {
          mql = window.matchMedia(query);
        } catch (err) {
          return;
        }
        var onChange = function () {
          setMatches(mql.matches);
        };
        onChange();
        if (mql.addEventListener) {
          mql.addEventListener("change", onChange);
        } else {
          mql.addListener(onChange);
        }
        return function () {
          if (mql.removeEventListener) {
            mql.removeEventListener("change", onChange);
          } else {
            mql.removeListener(onChange);
          }
        };
      },
      [query]
    );
    return matches;
  }

  function haptic() {
    try {
      if (navigator.vibrate) navigator.vibrate(12);
    } catch (err) {}
  }

  function copyText(text, onOk, onFail) {
    function fallbackCopy() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, text.length);
        var ok = document.execCommand("copy");
        ta.remove();
        if (ok) onOk();
        else onFail();
      } catch (err) {
        onFail();
      }
    }

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).then(onOk, fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  function formatWhatsAppTicket(order) {
    var lines = [
      "*DAJU MATCHA \u00b7 ORDER TICKET*",
      "Ref: " + (order.orderRef || ""),
      "",
      "*Contact*",
      "Name: " + (order.customer || ""),
      "Phone: " + (order.phone || ""),
      "",
      "*Order*",
    ];
    (order.items || []).forEach(function (it, idx) {
      if (idx) lines.push("");
      lines.push((it.qty || 1) + "\u00d7 " + it.name + (it.price ? " \u00b7 " + it.price : ""));
      lines.push("   Ice: " + (it.ice || "Normal") + " \u00b7 Sweetness: " + (it.sweetness || "Normal"));
      if (it.flair) lines.push("   Flair: " + it.flair);
      if (it.cupName) lines.push('   Cup name: "' + it.cupName + '"');
    });
    lines.push(
      "",
      "*" + (order.mode === "PICK_UP" ? "Pickup" : "Delivery") + "*",
      "Method: " +
        (MODE_NAMES[order.mode] || order.mode || "") +
        (order.schedule ? " (" + (SCHED_NAMES[order.schedule] || order.schedule) + ")" : ""),
      (order.mode === "PICK_UP" ? "Location: " : "Deliver to: ") + (order.location || ""),
      "Time: " + (order.time || "")
    );
    if (order.address) lines.push("Address notes: " + order.address);
    if (order.mode === "GRAB_EXPRESS") {
      lines.push(
        "Grab Express fee paid by customer: " + (order.feeAck ? "Acknowledged" : "NOT acknowledged")
      );
    }
    lines.push(
      "",
      "*Estimated subtotal:* " +
        (order.subtotal || "") +
        (order.mode === "GRAB_EXPRESS" ? " (excl. Grab Express fee)" : "")
    );
    return lines.join("\n");
  }

  function renderTicketCanvas(order) {
    var refEl = document.querySelector(".dj-ticket") || document.body;
    var cs = getComputedStyle(refEl);
    function cssVar(name, fallback) {
      var val = cs.getPropertyValue(name).trim();
      return val || fallback;
    }
    var palette = {
      paper: cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)" ? cs.backgroundColor : "#fffdf6",
      ink: cs.color || "#163a1e",
      muted: cssVar("--text-muted", "#5b6b5e"),
      heading: cssVar("--heading", "#163a1e"),
      line: cssVar("--line-strong", "#9bb09f"),
      active: cssVar("--active", "#2e7d32"),
      alert: cssVar("--alert", "#b3261e"),
      bg: "#e9efe6",
    };
    var fontMono = cssVar("--font-mono", '"Courier Prime", ui-monospace, monospace');
    var fontEditorial = cssVar("--font-editorial", "Georgia, serif");
    var fontMarker = cssVar("--font-marker", '"Permanent Marker", cursive');

    var dpr = 2;
    var width = 400;
    var padX = 28;
    var innerW = width - padX * 2;
    var labelCol = 84;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    function setFont(f) {
      ctx.font = f;
    }

    function wrapText(str, maxW) {
      var paragraphs = String(str == null ? "" : str).split(/\r?\n/);
      var out = [];
      paragraphs.forEach(function (para) {
        if (!para.trim()) return;
        var words = para.split(/\s+/);
        var current = "";
        words.forEach(function (word) {
          var test = current ? current + " " + word : word;
          if (ctx.measureText(test).width <= maxW) {
            current = test;
            return;
          }
          if (current) {
            out.push(current);
            current = "";
          }
          if (ctx.measureText(word).width <= maxW) {
            current = word;
          } else {
            var chunk = "";
            for (var i = 0; i < word.length; i++) {
              var nextChunk = chunk + word[i];
              if (ctx.measureText(nextChunk).width > maxW && chunk) {
                out.push(chunk);
                chunk = word[i];
              } else {
                chunk = nextChunk;
              }
            }
            current = chunk;
          }
        });
        if (current) out.push(current);
      });
      return out.length ? out : [""];
    }

    function layout(draw) {
      var y = 34;
      function drawText(txt, x, baselineY, color, align) {
        if (!draw) return;
        ctx.fillStyle = color;
        ctx.textAlign = align || "left";
        ctx.fillText(txt, x, baselineY);
      }
      function drawRule(ruleY) {
        if (!draw) return;
        ctx.save();
        ctx.strokeStyle = palette.line;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(padX, ruleY);
        ctx.lineTo(width - padX, ruleY);
        ctx.stroke();
        ctx.restore();
      }

      setFont("700 30px " + fontEditorial);
      drawText("DA | JU", width / 2, y + 22, palette.heading, "center");
      y += 42;
      setFont("italic 500 17px " + fontEditorial);
      drawText("Freshly Made. Made For You.", width / 2, y + 12, palette.heading, "center");
      y += 26;
      if (order.orderRef) {
        setFont("400 12px " + fontMono);
        drawText("Ref " + order.orderRef, width / 2, y + 10, palette.muted, "center");
        y += 22;
      }
      y += 6;
      drawRule(y);
      y += 18;

      var metaRows = [
        ["Customer", order.customer && order.customer + (order.phone ? " \u00b7 " + order.phone : "")],
        [
          "Mode",
          order.mode &&
            (MODE_NAMES[order.mode] || order.mode) +
              " \u2014 " +
              (SCHED_NAMES[order.schedule] || order.schedule || ""),
        ],
        ["Where", order.location],
        ["When", order.time],
        ["Notes", order.address],
      ];

      metaRows.forEach(function (pair) {
        if (!pair[1]) return;
        setFont("400 14px " + fontMono);
        drawText(pair[0], padX, y + 11, palette.muted);
        setFont("700 14px " + fontMono);
        var wrapped = wrapText(pair[1], innerW - labelCol);
        wrapped.forEach(function (ln) {
          drawText(ln, padX + labelCol, y + 11, palette.ink);
          y += 21;
        });
      });

      y += 4;
      drawRule(y);
      y += 18;

      (order.items || []).forEach(function (it) {
        setFont("700 14px " + fontMono);
        var priceTxt = it.price || "";
        var priceW = priceTxt ? ctx.measureText(priceTxt).width + 10 : 0;
        if (priceTxt) drawText(priceTxt, width - padX, y + 11, palette.ink, "right");
        var nameLines = wrapText((it.qty || 1) + "\u00d7 " + it.name, innerW - priceW);
        nameLines.forEach(function (ln) {
          drawText(ln, padX, y + 11, palette.ink);
          y += 21;
        });
        setFont("400 13px " + fontMono);
        var modLines = wrapText(
          "Ice " +
            (it.ice || "Normal") +
            " \u00b7 Sweetness " +
            (it.sweetness || "Normal") +
            (it.flair ? " \u00b7 " + it.flair : ""),
          innerW
        );
        modLines.forEach(function (ln) {
          drawText(ln, padX, y + 10, palette.muted);
          y += 19;
        });
        if (it.cupName) {
          setFont("400 20px " + fontMarker);
          var cupLines = wrapText(it.cupName, innerW);
          cupLines.forEach(function (ln) {
            drawText(ln, padX, y + 18, palette.ink);
            y += 26;
          });
        }
        y += 10;
      });

      y -= 4;
      drawRule(y);
      y += 14;

      if (order.mode === "GRAB_EXPRESS") {
        setFont((order.feeAck ? "400" : "700") + " 12px " + fontMono);
        var ackText = order.feeAck
          ? "Grab Express fee borne by customer \u2014 acknowledged"
          : "Grab Express fee not acknowledged";
        wrapText(ackText, innerW).forEach(function (ln) {
          drawText(ln, padX, y + 10, order.feeAck ? palette.active : palette.alert);
          y += 18;
        });
        y += 6;
      }

      setFont("400 15px " + fontMono);
      drawText("Estimated subtotal", padX, y + 16, palette.ink);
      setFont("700 20px " + fontMono);
      drawText(order.subtotal || "", width - padX, y + 16, palette.ink, "right");
      y += 26;

      if (order.mode === "GRAB_EXPRESS") {
        setFont("400 12px " + fontMono);
        drawText("Excl. any Grab Express fee", width - padX, y + 8, palette.muted, "right");
        y += 18;
      }

      return y + 26;
    }

    setFont("14px " + fontMono);
    var totalH = Math.ceil(layout(false));
    var margin = 20;
    canvas.width = (width + margin * 2) * dpr;
    canvas.height = (totalH + margin * 2) * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width + margin * 2, totalH + margin * 2);
    ctx.translate(margin, margin);
    ctx.save();
    ctx.shadowColor = "rgba(22,58,30,.18)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = palette.paper;
    ctx.beginPath();
    var tooth = 10;
    var teeth = Math.round(width / tooth);
    ctx.moveTo(0, 6);
    for (var i = 0; i < teeth; i++) {
      ctx.lineTo(i * tooth + tooth / 2, 0);
      ctx.lineTo((i + 1) * tooth, 6);
    }
    ctx.lineTo(width, totalH - 6);
    for (var j = teeth; j > 0; j--) {
      ctx.lineTo(j * tooth - tooth / 2, totalH);
      ctx.lineTo((j - 1) * tooth, totalH - 6);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.textBaseline = "alphabetic";
    layout(true);
    return canvas;
  }

  function loadTicketFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var reqs = [
      '400 14px "Courier Prime"',
      '700 14px "Courier Prime"',
      '400 20px "Permanent Marker"',
      '700 30px "Cormorant Garamond"',
      'italic 500 17px "Cormorant Garamond"',
    ];
    return Promise.all(
      reqs.map(function (f) {
        return document.fonts.load(f).catch(function () {});
      })
    ).then(function () {
      return document.fonts.ready;
    });
  }

  function makeTicketBlob(order) {
    return loadTicketFonts().then(function () {
      return new Promise(function (resolve, reject) {
        renderTicketCanvas(order).toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error("no image"));
        }, "image/png");
      });
    });
  }

  function downloadBlob(blob, filename) {
    try {
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 60000);
      return true;
    } catch (err) {
      return false;
    }
  }

  function shareOrDownloadTicket(order, text, toast, cachedBlob) {
    var filename = "DAJU-ticket-" + String(order.orderRef || "order").replace(/[^\w-]/g, "") + ".png";

    function handleBlob(blob) {
      var file = null;
      try {
        file = new File([blob], filename, { type: "image/png" });
      } catch (err) {}

      var sharePayload = null;
      try {
        if (file && navigator.canShare && navigator.canShare({ files: [file], text: text })) {
          sharePayload = { files: [file], text: text };
        } else if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          sharePayload = { files: [file] };
        }
      } catch (err) {}

      if (sharePayload && typeof navigator.share === "function") {
        return navigator.share(sharePayload).then(
          function () {
            return "shared";
          },
          function (err) {
            if (err && err.name === "AbortError") return "cancelled";
            var saved = downloadBlob(blob, filename);
            toast(
              saved
                ? "Ticket image saved. Attach it in the DAJU WhatsApp chat"
                : "Could not save the image here. Use Copy ticket text instead"
            );
            return saved ? "saved" : "failed";
          }
        );
      }

      var ok = downloadBlob(blob, filename);
      toast(
        ok
          ? "Ticket image saved. Attach it in the DAJU WhatsApp chat"
          : "Could not save the image here. Use Copy ticket text instead"
      );
      return Promise.resolve(ok ? "saved" : "failed");
    }

    if (cachedBlob) return handleBlob(cachedBlob);
    return makeTicketBlob(order).then(handleBlob, function () {
      toast("Could not make the image. Use Copy ticket text instead");
      return "failed";
    });
  }

  function Burst(props) {
    if (!props.n) return null;
    var pts = [[-70, -40], [64, -52], [-48, 40], [72, 30], [0, -78]];
    return html`<div className="burst" key=${props.n} aria-hidden="true">
      ${pts.map(function (pt, idx) {
        return html`<span key=${idx} style=${{ "--bx": pt[0] + "px", "--by": pt[1] + "px", animationDelay: idx * 30 + "ms" }}>
          <${Daju.Doodle} name="sparkle" size=${28} />
        </span>`;
      })}
    </div>`;
  }

  function ToastRegion(props) {
    return html`<div className="toast-live" role="status" aria-live="polite" aria-atomic="true">
      ${props.msg
        ? html`<div className=${"toast" + (props.out ? " is-leaving" : "")}>
            <${Daju.Doodle} name="sparkle" size=${20} />${props.msg}
          </div>`
        : null}
    </div>`;
  }

  function HeroWhisk(props) {
    return html`<svg className="hero-whisk" width=${props.size} viewBox="20 40 300 230" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M66 161Q66 178 83 178Q66 178 66 195Q66 178 49 178Q66 178 66 161Z" />
      <path d="M53.5 156.3L48.5 147.7M78.5 156.3L83.5 147.7M42.5 186.6L33.1 190.0M88.7 188.6L97.7 192.8" />
      <path d="M42.5 232.5L34.7 224.7M49.5 232.5L57.3 224.7M49.5 239.5L57.3 247.3M42.5 239.5L34.7 247.3" />
      <path d="M264.5 184.5L257.4 177.4M271.5 184.5L278.6 177.4M271.5 191.5L278.6 198.6M264.5 191.5L257.4 198.6" />
      <path d="M304 183Q304 196 317 196Q304 196 304 209Q304 196 291 196Q304 196 304 183Z" />
      <g className="whisk"><g transform="translate(180 170) rotate(30)">
        <rect x="-15" y="-112" width="30" height="58" rx="9" />
        <path d="M-9 -104v38M-15 -54h30M-13 -54l-2 14h30l-2 -14" />
        <path d="M-14.4 -40Q-53.1 18 -49.2 54Q-45.3 64 -35.4 58M-12.0 -40Q-44.3 18 -41.0 54Q-37.7 64 -29.5 58M-9.6 -40Q-35.4 18 -32.8 54Q-30.2 64 -23.6 58M-7.2 -40Q-26.6 18 -24.6 54Q-22.6 64 -17.7 58M-4.8 -40Q-17.7 18 -16.4 54Q-15.1 64 -11.8 58M-2.4 -40Q-8.9 18 -8.2 54Q-7.5 64 -5.9 58M0.0 -40Q0.0 18 0.0 54Q0.0 64 0.0 58M2.4 -40Q8.9 18 8.2 54Q7.5 64 5.9 58M4.8 -40Q17.7 18 16.4 54Q15.1 64 11.8 58M7.2 -40Q26.6 18 24.6 54Q22.6 64 17.7 58M9.6 -40Q35.4 18 32.8 54Q30.2 64 23.6 58M12.0 -40Q44.3 18 41.0 54Q37.7 64 29.5 58M14.4 -40Q53.1 18 49.2 54Q45.3 64 35.4 58" />
      </g></g>
    </svg>`;
  }

  function HeroSection(props) {
    return html`
      <section id="drop" className="band hero" data-theme="forest" ref=${props.heroRef}>
        <span className="hero-float desk-only" style=${{ right: "6%", top: "14%" }} aria-hidden="true"><${Daju.Doodle} name="sparkle" size=${28} className="draw" /></span>
        <span className="hero-float desk-only" style=${{ left: "46%", bottom: "10%" }} aria-hidden="true"><${Daju.Doodle} name="arrow" size=${56} className="draw" /></span>
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <div className="hero-doodles">
              <${HeroWhisk} size=${props.narrow ? 190 : 260} />
            </div>
            <${Daju.StickerHeadline} as="h1" size="xl">Matcha<br />of the week?<//>
            <div className="hero-actions">
              <${Daju.Button} variant="sticker" size="lg" icon="sparkle" onClick=${function () { props.onCustomize(MOTW_DRINK); }}>Customize & add<//>
              <${Daju.Button} variant="secondary" size="lg" href="#order">How to order<//>
            </div>
          </div>
          <div className="hero-cup">
            <p className="editorial-md p0" style=${{ textTransform: "uppercase", color: "var(--heading)", letterSpacing: "0.32em" }}>Matcha</p>
            <p className="flavor-script" aria-hidden="true">${MOTW_DRINK.flavor}</p>
            <img
              className="hero-cutout"
              src="blue-sea-salt-cutout.webp"
              srcSet="blue-sea-salt-cutout-300.webp 300w, blue-sea-salt-cutout.webp 433w"
              sizes="(min-width: 721px) 300px, (min-width: 391px) 250px, 64vw"
              width="433"
              height="521"
              fetchpriority="high"
              alt=${HERO_ALT}
            />
            <div style=${{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
              <${Daju.Stamp} tone="forest" rotate=${-4} className="stamp-pink">Matcha of the Week<//>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  var LAYER_NAMES = ["Clear cup & DA JU", "Ice drops in", "Matcha swirls up", "Sea-salt foam", "Bow & butterflies"];
  var MOTW_CARDS = [
    { at: 0.28, kind: "title" },
    { at: 0.4, n: 1, head: "Every week,", body: "we randomly pick one of our matcha creations to be your Matcha of the Week.", icon: "whisk" },
    { at: 0.52, n: 2, head: "And guess what?", body: "price", icon: "sparkle" },
    { at: 0.64, n: 3, head: "How do we pick?", body: "Every week, we roll for your Matcha of the Week on our IG Stories.", icon: "dice" },
  ];
  var CARD_SPAN = 0.12;
  var BOOM_AT = 0.78;
  var BOOM_FADE = 0.04;

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function easeOutCubic(v) { return 1 - Math.pow(1 - v, 3); }

  function DiceIcon(props) {
    var s = props.size || 26;
    return html`<svg width=${s} height=${s} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="8.5" cy="8.5" r="1.6" fill="currentColor" />
      <circle cx="15.5" cy="15.5" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>`;
  }

  function MotwCard(props) {
    var it = props.it;
    if (it.kind === "title") {
      return html`<div className="motw-card motw-title-card">
        <p className="motw-kicker">What is</p>
        <p className="motw-title">\u201cMatcha of the Week\u201d?</p>
      </div>`;
    }
    return html`<div className="motw-card">
      <span className="motw-n" aria-hidden="true">${it.n}</span>
      <span className="motw-icon" aria-hidden="true">
        ${it.icon === "dice" ? html`<${DiceIcon} size=${26} />` : html`<${Daju.Doodle} name=${it.icon} size=${28} />`}
      </span>
      <p className="motw-head">${it.head}</p>
      <p className="motw-body">
        ${it.body === "price"
          ? html`That week's pick is only <b className="motw-price-inline">${MOTW_PRICE_TEXT}</b>!`
          : it.body}
      </p>
    </div>`;
  }

  var SPARKS = Array.from({ length: 16 }).map(function (_, idx) {
    var ang = (idx / 16) * Math.PI * 2 + (idx % 2 ? 0.2 : 0);
    var dist = 120 + (idx % 3) * 38;
    return {
      x: Math.round(Math.cos(ang) * dist),
      y: Math.round(Math.sin(ang) * dist),
      c: ["ribbon", "seasalt", "whisk", "doodle"][idx % 4],
      s: 8 + (idx % 3) * 4,
      delay: (idx % 4) * 25,
    };
  });

  function PriceBoom(props) {
    return html`<div className=${"motw-boom" + (props.on ? " is-on" : "")} aria-hidden=${props.on ? void 0 : "true"}>
      <span className="boom-rays" aria-hidden="true">
        ${Array.from({ length: 12 }).map(function (_, idx) {
          return html`<i key=${idx} style=${{ "--r": idx * 30 + "deg" }}></i>`;
        })}
      </span>
      <span className="boom-sparks" aria-hidden="true">
        ${SPARKS.map(function (sp, idx) {
          return html`<i key=${idx} className=${"is-" + sp.c} style=${{ "--bx": sp.x + "px", "--by": sp.y + "px", "--bs": sp.s + "px", animationDelay: sp.delay + "ms" }}></i>`;
        })}
      </span>
      <div className="price-tag">
        <span className="price-tag-kicker">Matcha of the Week</span>
        <span className="price-tag-price"><span className="price-rm">${MOTW_PRICE_TEXT.slice(0, 2)}</span>${MOTW_PRICE_TEXT.slice(2)}</span>
        <span className="price-tag-drink">${MOTW_DRINK.name} \u00b7 this week only</span>
      </div>
    </div>`;
  }

  function AssemblySection(props) {
    var pinned = props.pinned;
    var layer = props.layer;
    var progress = props.progress;
    var narrow = props.narrow;

    var playState = useState(false);
    var playing = playState[0];
    var setPlaying = playState[1];
    var stageRef = useRef(null);
    var autoPlayedRef = useRef(false);
    var playTimerRef = useRef(null);

    function clearPlayTimer() {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    }

    useEffect(function () { return clearPlayTimer; }, []);

    function playBuild() {
      if (playing) return;
      clearPlayTimer();
      setPlaying(true);
      props.setLayer(1);
      var step = 1;
      playTimerRef.current = setInterval(function () {
        step += 1;
        props.setLayer(step);
        if (step >= 5) {
          clearPlayTimer();
          setPlaying(false);
        }
      }, 650);
    }

    useEffect(
      function () {
        if (pinned || props.reduce || !stageRef.current || !("IntersectionObserver" in window)) return;
        var io = new IntersectionObserver(
          function (entries) {
            if (entries[0].isIntersecting && !autoPlayedRef.current) {
              autoPlayedRef.current = true;
              playBuild();
              io.disconnect();
            }
          },
          { threshold: 0.6 }
        );
        io.observe(stageRef.current);
        return function () { io.disconnect(); };
      },
      [pinned, props.reduce]
    );

    var dimCup = pinned && progress >= 0.26;
    var boomOn = pinned && progress >= BOOM_AT;

    return html`
      <section id="assembly" className=${"assembly" + (pinned ? " is-pinned" : "")} ref=${props.secRef} aria-labelledby="assembly-title">
        <div className="assembly-stick" ref=${props.stickRef}>
          <div className="wrap assembly-grid">
            <div className="assembly-title">
              <${Daju.StickerHeadline} size="lg" className="chapter-title"><span id="assembly-title">Watch it come together</span><//>
            </div>
            <div className="assembly-stage" ref=${stageRef}>
              <div className="stage-inner">
                <svg className="watercolor" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
                  <defs>
                    <filter id="wc-bleed" x="-30%" y="-30%" width="160%" height="160%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="7" result="n" />
                      <feDisplacementMap in="SourceGraphic" in2="n" scale="38" xChannelSelector="R" yChannelSelector="G" result="d" />
                      <feGaussianBlur in="d" stdDeviation="7" result="b" />
                      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="grain" />
                      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1" result="g" />
                      <feComposite in="b" in2="g" operator="in" />
                    </filter>
                  </defs>
                  <g filter="url(#wc-bleed)">
                    <ellipse className="wc-a" cx="200" cy="215" rx="150" ry="135" />
                    <ellipse className="wc-b" cx="150" cy="150" rx="95" ry="80" />
                    <ellipse className="wc-c" cx="265" cy="275" rx="90" ry="70" />
                    <ellipse className="wc-d" cx="255" cy="135" rx="55" ry="45" />
                  </g>
                </svg>
                <div className=${"cup-wrap" + (dimCup ? " is-dim" : "")}>
                  <${Daju.CupPreview} width=${narrow ? 200 : 260} layers=${layer} name="DA JU" charm="both" alt=${"Illustrated " + MOTW_DRINK.name + ", layer " + layer + " of 5: " + LAYER_NAMES[layer - 1]} />
                </div>
                ${pinned
                  ? html`<div className="motw-stack" aria-hidden="true">
                      ${MOTW_CARDS.map(function (card, idx) {
                        var t = clamp01((progress - card.at) / CARD_SPAN);
                        var isLast = idx === MOTW_CARDS.length - 1;
                        var enter = easeOutCubic(clamp01(t / 0.35));
                        var exit = isLast ? clamp01((progress - (BOOM_AT - BOOM_FADE)) / BOOM_FADE) : clamp01((t - 0.72) / 0.28);
                        var alpha = enter * (1 - exit);
                        if (alpha <= 0.001) return null;
                        var style = {
                          opacity: alpha,
                          transform:
                            "translate(-50%, -50%) translateY(" +
                            ((1 - enter) * 32 - exit * 70).toFixed(1) +
                            "px) scale(" +
                            (0.2 + 0.8 * enter + exit * 0.05).toFixed(3) +
                            ")",
                        };
                        return html`<div key=${idx} className="motw-item" style=${style}><${MotwCard} it=${card} /></div>`;
                      })}
                      <${PriceBoom} on=${boomOn} />
                    </div>`
                  : null}
              </div>
              ${pinned
                ? html`<div className="sr-only">
                    <h3>What is \u201cMatcha of the Week\u201d?</h3>
                    <ol>
                      ${MOTW_CARDS.slice(1).map(function (card) {
                        return html`<li key=${card.n}>${card.head} ${card.body === "price" ? "That week's pick is only " + MOTW_PRICE_TEXT + "!" : card.body}</li>`;
                      })}
                    </ol>
                    <p>${MOTW_DRINK.name} is this week's Matcha of the Week at ${MOTW_PRICE_TEXT}.</p>
                  </div>`
                : html`<div className="motw-static">
                    <${MotwCard} it=${MOTW_CARDS[0]} />
                    ${MOTW_CARDS.slice(1).map(function (card) {
                      return html`<${MotwCard} key=${card.n} it=${card} />`;
                    })}
                    <${PriceBoom} on=${true} />
                  </div>`}
              ${pinned
                ? null
                : html`<div className="play-row">
                    <${Daju.Button} variant="secondary" icon="sparkle" onClick=${function () { haptic(); playBuild(); }} disabled=${playing}>
                      ${playing ? "Building\u2026" : "Build it again"}
                    <//>
                  </div>`}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function MenuSection(props) {
    var deckRef = useRef(null);
    var tabRefs = useRef([]);
    var dotState = useState(0);
    var activeDot = dotState[0];
    var setActiveDot = dotState[1];
    var catState = useState("Matcha");
    var cat = catState[0];
    var setCat = catState[1];

    var drinks = MENU.filter(function (d) { return d.cat === cat; });
    var cardCount = drinks.length + (cat === "Matcha" ? 1 : 0);

    useEffect(function () {
      var el = deckRef.current;
      if (el) el.scrollTo({ left: 0, behavior: "instant" });
      setActiveDot(0);
    }, [cat]);

    useEffect(function () {
      var el = deckRef.current;
      if (!el) return;
      function updateDot() {
        var cards = el.querySelectorAll(".deck-row > *");
        if (!cards.length) return;
        var best = 0;
        var bestDist = Infinity;
        if (props.narrow) {
          var center = el.scrollLeft + el.clientWidth / 2;
          for (var i = 0; i < cards.length; i++) {
            var cardCenter = cards[i].offsetLeft + cards[i].offsetWidth / 2;
            var dist = Math.abs(cardCenter - center);
            if (dist < bestDist) { bestDist = dist; best = i; }
          }
        } else {
          var maxScroll = el.scrollWidth - el.clientWidth;
          if (maxScroll > 0 && el.scrollLeft >= maxScroll - 8) {
            best = cards.length - 1;
          } else {
            var edge = el.scrollLeft + 16;
            for (var j = 0; j < cards.length; j++) {
              var d = Math.abs(cards[j].offsetLeft - edge);
              if (d < bestDist) { bestDist = d; best = j; }
            }
          }
        }
        setActiveDot(best);
      }
      el.addEventListener("scroll", updateDot, { passive: true });
      return function () { el.removeEventListener("scroll", updateDot); };
    }, [props.narrow, cat]);

    useEffect(function () {
      var el = deckRef.current;
      if (!el) return;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var lastLeft = el.scrollLeft;
      var timer = null;
      function onScroll() {
        var delta = el.scrollLeft - lastLeft;
        lastLeft = el.scrollLeft;
        var lean = Math.max(-4, Math.min(4, -delta * 0.25));
        el.style.setProperty("--lean", lean.toFixed(2) + "deg");
        el.classList.add("is-moving");
        clearTimeout(timer);
        timer = setTimeout(function () { el.classList.remove("is-moving"); }, 140);
      }
      el.addEventListener("scroll", onScroll, { passive: true });
      return function () { el.removeEventListener("scroll", onScroll); clearTimeout(timer); };
    }, []);

    function scrollToCard(idx) {
      var el = deckRef.current;
      if (!el) return;
      var card = el.querySelectorAll(".deck-row > *")[idx];
      if (!card) return;
      var target = props.narrow
        ? card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2
        : card.offsetLeft - 16;
      el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    }

    function scrollByCards(dir) {
      var el = deckRef.current;
      if (el) el.scrollBy({ left: dir * 312, behavior: "smooth" });
    }

    function onTabKeyDown(ev, idx) {
      var nextIdx = idx;
      if (ev.key === "ArrowRight") nextIdx = (idx + 1) % CATEGORIES.length;
      else if (ev.key === "ArrowLeft") nextIdx = (idx - 1 + CATEGORIES.length) % CATEGORIES.length;
      else if (ev.key === "Home") nextIdx = 0;
      else if (ev.key === "End") nextIdx = CATEGORIES.length - 1;
      else return;
      ev.preventDefault();
      haptic();
      setCat(CATEGORIES[nextIdx]);
      if (tabRefs.current[nextIdx]) tabRefs.current[nextIdx].focus();
    }

    return html`
      <section id="menu" className="band menu" aria-labelledby="menu-title">
        <div className="wrap menu-head">
          <div>
            <${Daju.StickerHeadline} size="lg" className="chapter-title"><span id="menu-title">Collection menu</span><//>
            <p className="body p0 muted" style=${{ maxWidth: 480 }}>One week. One matcha. A little surprise</p>
            <div className="menu-tabs" role="tablist" aria-label="Menu category">
              ${CATEGORIES.map(function (cName, idx) {
                var cnt = MENU.filter(function (d) { return d.cat === cName; }).length;
                var selected = cat === cName;
                return html`<button
                  key=${cName}
                  id=${"menu-tab-" + cName.toLowerCase()}
                  ref=${function (el) { tabRefs.current[idx] = el; }}
                  type="button"
                  role="tab"
                  tabIndex=${selected ? 0 : -1}
                  className=${"menu-tab" + (selected ? " is-on" : "")}
                  aria-selected=${selected}
                  aria-controls="menu-panel"
                  onKeyDown=${function (ev) { onTabKeyDown(ev, idx); }}
                  onClick=${function () { haptic(); setCat(cName); }}
                >${cName}<span className="menu-tab-n">${cnt}</span></button>`;
              })}
            </div>
          </div>
          <span className="swipe-hint label" aria-hidden="true">Swipe <svg width="18" height="18" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          ${props.narrow
            ? null
            : html`<div className="deck-btns">
                <button type="button" className="round-btn" aria-label="Scroll menu left" onClick=${function () { scrollByCards(-1); }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button type="button" className="round-btn" aria-label="Scroll menu right" onClick=${function () { scrollByCards(1); }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>`}
        </div>
        <div
          id="menu-panel"
          role="tabpanel"
          aria-labelledby=${"menu-tab-" + cat.toLowerCase()}
          className="deck"
          ref=${deckRef}
          tabIndex="0"
          aria-label=${cat + " menu cards"}
        >
          <div className="deck-row">
            ${drinks.map(function (drink) {
              var art = html`<${Daju.CupPreview} width=${150} name="DA JU" charm="butterfly" className=${cupClass(drink.id)} alt=${"Illustrated " + drink.name + " with DA JU in marker and butterfly charms"} />`;
              return html`<div key=${drink.id} className=${"deck-card drink-" + drink.id}>
                <${Daju.ProductCard}
                  name=${drink.name}
                  flavor=${drink.flavor}
                  note=${drink.note}
                  price=${formatPrice(drink.price)}
                  status=${drink.status}
                  category=${drink.cat}
                  tilt=${drink.tilt}
                  suggestion=${drink.suggestion}
                  art=${art}
                  image=${drink.image}
                  imageAlt=${drink.imageAlt}
                  onAdd=${drink.status === "soldout" ? void 0 : function () { props.onCustomize(drink); }}
                />
              </div>`;
            })}
            ${cat === "Matcha"
              ? html`<div className="coming-wrap"><div className="coming">
                  <${Daju.Doodle} name="sparkle" size=${36} />
                  <p className="script">something special, every week</p>
                  <p className="body p0 muted">A new drop every week. Follow us for the reveal.</p>
                </div></div>`
              : null}
          </div>
        </div>
        <div className="dots" role="group" aria-label="Menu cards">
          ${Array.from({ length: cardCount }).map(function (_, idx) {
            return html`<button
              key=${idx}
              type="button"
              className="dot"
              aria-label=${"Card " + (idx + 1) + " of " + cardCount}
              aria-current=${activeDot === idx ? "true" : "false"}
              onClick=${function () { scrollToCard(idx); }}
            ><span></span></button>`;
          })}
        </div>
      </section>
    `;
  }

  function StudioSection(props) {
    var st = props.studio;
    var narrow = props.narrow;
    var chipRefs = useRef([]);
    var isEach = st.qty > 1 && st.mode === "each";
    var curCup = isEach ? st.cups[st.active] : st.cups[0];
    var displayName = (curCup.name || "").trim() || "DA JU";
    var drink = findDrink(st.drink);
    var modSummary = "Ice " + curCup.ice.toLowerCase() + " \u00b7 sweetness " + curCup.sweet.toLowerCase();
    var readsLabel =
      st.qty === 1 ? "Your cup reads" : isEach ? "Cup " + (st.active + 1) + " of " + st.qty + " reads" : "All " + st.qty + " cups read";
    var priceLine = drink.price == null ? "Price TBC each" : "RM " + (drink.price * st.qty).toFixed(2);
    var remainingSlots = Math.max(0, CONFIG.maxCupsPerOrder - props.bagCount);

    var heading = html`<div className="studio-head">
      <${Daju.StickerHeadline} size="lg" className="chapter-title"><span id="studio-title">Build your cup</span><//>
    </div>`;

    function onDrinkKeyDown(ev, idx) {
      var step = 0;
      if (ev.key === "ArrowRight" || ev.key === "ArrowDown") step = 1;
      else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") step = -1;
      else return;
      ev.preventDefault();
      var nextIdx = idx;
      for (var tries = 0; tries < MENU.length; tries++) {
        nextIdx = (nextIdx + step + MENU.length) % MENU.length;
        if (MENU[nextIdx].status !== "soldout") break;
      }
      haptic();
      props.setDrink(MENU[nextIdx].id);
      var btn = chipRefs.current[nextIdx];
      if (btn) {
        btn.focus();
        if (btn.scrollIntoView) btn.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
      }
    }

    return html`
      <section id="studio" className="band" aria-labelledby="studio-title">
        <div className="wrap studio">
          ${narrow ? heading : null}
          <div className="studio-cup">
            <div className="studio-doodles" aria-hidden="true"><${Daju.Doodle} name="sparkle" size=${36} /><${Daju.Doodle} name="daisy" size=${36} /></div>
            <div className="cup-stack">
              <${Daju.CupPreview}
                width=${narrow ? 86 : 260}
                name=${displayName}
                charm=${curCup.flair}
                className=${cupClass(drink.id)}
                alt=${"Illustrated " + drink.name + ' with "' + displayName + '" written on the cup'}
                caption=${narrow ? void 0 : (st.qty > 1 ? readsLabel.replace(" reads", "").replace(" read", "") + " \u00b7 " : "") + modSummary}
              />
              ${st.qty > 1 ? html`<span className="qty-badge" aria-hidden="true">\u00d7${st.qty}</span>` : null}
            </div>
            <div className="studio-cup-meta" aria-live="polite">
              <span className="studio-drink-name">${drink.name}</span>
              <span className="small">${readsLabel}</span>
              <span className="marker">${displayName}</span>
              <span className="small">${modSummary} \u00b7 ${FLAIR_LABELS[curCup.flair]}</span>
            </div>
            <${Burst} n=${props.burst} />
          </div>
          <div className="studio-form">
            ${narrow ? null : heading}
            <div className="drink-pick-wrap">
              <p className="dj-field-label p0" id="drink-label">Drink</p>
              <div className="drink-pick" role="radiogroup" aria-labelledby="drink-label">
                ${MENU.map(function (d, idx) {
                  var isOn = d.id === drink.id;
                  var soldOut = d.status === "soldout";
                  return html`<button
                    key=${d.id}
                    ref=${function (el) { chipRefs.current[idx] = el; }}
                    type="button"
                    role="radio"
                    tabIndex=${isOn ? 0 : -1}
                    aria-checked=${isOn}
                    disabled=${soldOut}
                    className=${"drink-chip" + (isOn ? " is-on" : "")}
                    onKeyDown=${function (ev) { onDrinkKeyDown(ev, idx); }}
                    onClick=${function (ev) {
                      haptic();
                      props.setDrink(d.id);
                      if (ev.currentTarget && ev.currentTarget.scrollIntoView) {
                        ev.currentTarget.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
                      }
                    }}
                  >
                    <span className="drink-thumb"><${DrinkThumb} drink=${d} size=${34} /></span>
                    <span className="drink-chip-text">
                      <span className="drink-chip-name">${d.name}</span>
                      <span className="drink-chip-cat">${d.status === "weekly" ? "Matcha of the Week" : soldOut ? "Sold out today" : d.cat}</span>
                    </span>
                  </button>`;
                })}
              </div>
            </div>
            <div className="qty-row">
              <div>
                <p className="dj-field-label p0" id="qty-label">How many cups?</p>
                <p className="fine">Up to ${CONFIG.maxCupsPerOrder} per order. ${st.qty > 1 ? "All " + st.qty + " are " + drink.name + "." : drink.name + "."}</p>
              </div>
              <div className="stepper" role="group" aria-labelledby="qty-label">
                <button type="button" className="step-btn" aria-label="One cup fewer" disabled=${st.qty <= 1} onClick=${function () { props.setQty(st.qty - 1); }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
                </button>
                <output className="qty-num" aria-live="polite"><span className="qty-pop" key=${st.qty}>${st.qty}</span></output>
                <button type="button" className="step-btn" aria-label="One cup more" disabled=${st.qty >= CONFIG.maxCupsPerOrder} onClick=${function () { props.setQty(st.qty + 1); }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
                </button>
              </div>
            </div>
            ${st.qty > 1
              ? html`<${Daju.ChoicePills}
                  label="Customization"
                  className="full-seg"
                  value=${st.mode}
                  options=${[
                    { value: "same", label: "Same for all cups" },
                    { value: "each", label: "Customize each cup" },
                  ]}
                  onChange=${props.setMode}
                />`
              : null}
            ${isEach
              ? html`<div className="cup-tabs-wrap">
                  <p className="dj-field-label p0">Editing cup ${st.active + 1} of ${st.qty}</p>
                  <div className="cup-tabs" role="group" aria-label="Choose a cup to customize">
                    ${st.cups.map(function (c, idx) {
                      return html`<button
                        key=${idx}
                        type="button"
                        className=${"cup-tab" + (idx === st.active ? " is-on" : "")}
                        aria-pressed=${idx === st.active}
                        onClick=${function () { haptic(); props.setActive(idx); }}
                      >
                        <span className="cup-tab-n">Cup ${idx + 1}</span>
                        <span className="cup-tab-name">${(c.name || "").trim() || "DA JU"}</span>
                      </button>`;
                    })}
                  </div>
                </div>`
              : null}
            <${Daju.TextField}
              key=${"name-" + (isEach ? st.active : "all")}
              label=${isEach ? "Name on cup " + (st.active + 1) : st.qty > 1 ? "Name on every cup" : "Name on the cup"}
              hint="Up to 12 characters, written in marker."
              maxLength=${12}
              placeholder="DA JU"
              value=${curCup.name}
              autoComplete="off"
              onChange=${function (ev) { props.setCup({ name: ev.target.value.slice(0, 12) }, true); }}
            />
            <${Daju.ChoicePills} label="Ice" options=${LEVEL_OPTS} value=${curCup.ice} className="full-seg" onChange=${function (v) { props.setCup({ ice: v }); }} />
            <${Daju.ChoicePills} label="Sweetness" options=${LEVEL_OPTS} value=${curCup.sweet} className="full-seg" onChange=${function (v) { props.setCup({ sweet: v }); }} />
            <${Daju.ChoicePills} label="Cup flair" options=${FLAIR_OPTS} value=${curCup.flair} className="mode-pills" onChange=${function (v) { props.setCup({ flair: v }); }} />
            ${isEach && st.active < st.qty - 1
              ? html`<${Daju.Button} variant="secondary" onClick=${function () { haptic(); props.setActive(st.active + 1); }}>Next: cup ${st.active + 2}<//>`
              : null}
            <div className="studio-add">
              <${Daju.Button} variant="primary" className="btn-pink" size="lg" icon="bag" disabled=${remainingSlots === 0} onClick=${props.onAdd}>
                ${remainingSlots === 0
                  ? "Bag full (10 cup max)"
                  : st.qty === 1
                  ? "Add to bag"
                  : "Add " + st.qty + " cups to bag"}
              <//>
              <span className="label muted">
                ${priceLine} \u00b7 ${props.bagCount ? props.bagCount + (props.bagCount === 1 ? " cup" : " cups") + " in your bag" : "Your bag is empty"}
              </span>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function Fold(props) {
    return html`<div className=${"fold" + (props.open ? " is-open" : "") + (props.className ? " " + props.className : "")} inert=${props.open ? void 0 : ""} aria-hidden=${props.open ? void 0 : "true"}>
      <div className="fold-inner">${props.children}</div>
    </div>`;
  }

  function FulfillFields(props) {
    var f = props.f;
    var set = props.set;
    var tried = props.tried;
    var err = props.err;
    var now = props.now;
    var activePopup = props.activePopup;

    var schedCol = Daju.schedule[f.mode][f.day];
    var usingPopup = f.mode === "PICK_UP" && f.popupPickup && !!activePopup;

    var slotText = usingPopup
      ? activePopup.venue + ", " + activePopup.place + " \u00b7 " + activePopup.days + " (" + activePopup.time + ")"
      : f.mode === "PICK_UP"
      ? schedCol.location + " \u00b7 " + schedCol.time
      : f.mode === "GRAB_EXPRESS"
      ? schedCol.label + " " + schedCol.time
      : schedCol.time + " \u00b7 " + schedCol.area.replace(/ \| /g, ", ");

    var lunchClosed =
      f.day === "weekday" &&
      !now.isWeekend &&
      now.minutes >= CONFIG.cutoffs.weekdayLunchStartMin &&
      f.mode !== "COD";
    var canCodTonight = now.minutes < CONFIG.cutoffs.weekdayCodCloseMin;
    var weekendGrabClosed =
      f.mode === "GRAB_EXPRESS" &&
      f.day === "weekend" &&
      now.isWeekend &&
      now.minutes >= CONFIG.cutoffs.weekendGrabCloseMin;

    var grabWindowOpts = GRAB_WINDOWS.map(function (w) {
      var passed = f.day === "weekend" && now.isWeekend && now.minutes >= w.endMin && !weekendGrabClosed;
      return { value: w.value, label: w.label, disabled: passed };
    });

    var showAddressFields = f.mode !== "PICK_UP" && !(f.mode === "COD" && f.zone === "OTHER");

    return html`<${React.Fragment}>
      ${props.showMode
        ? html`<${Daju.ChoicePills} label="Fulfillment" options=${MODE_OPTS} value=${f.mode} className="mode-pills" onChange=${function (m) { set({ mode: m }); }} />`
        : null}

      ${f.mode === "PICK_UP" && activePopup
        ? html`<${Daju.ChoicePills}
            variant="segmented"
            label="Pickup point"
            className="full-seg"
            value=${f.popupPickup ? "popup" : "regular"}
            options=${[
              { value: "regular", label: "Regular Pick Up" },
              { value: "popup", label: activePopup.venue + " Pop-up" },
            ]}
            onChange=${function (v) {
              set({ popupPickup: v === "popup", day: v === "popup" ? "weekend" : f.day });
            }}
          />`
        : null}

      ${!usingPopup
        ? html`<${Daju.ChoicePills} variant="segmented" label="When" options=${DAY_OPTS} value=${f.day} className="full-seg" onChange=${function (d) { set({ day: d }); }} />`
        : null}

      <p className="slot-line"><${Daju.Doodle} name="clock" size=${20} />${slotText}</p>

      ${lunchClosed && !usingPopup
        ? html`<${Daju.Notice}
            tone="info"
            title="Today's lunch window has closed"
            action=${canCodTonight ? html`<${Daju.Button} variant="secondary" icon="car" onClick=${function () { set({ mode: "COD" }); }}>Switch to COD tonight<//>` : null}
          >
            It's ${formatKLTime(now)} in KK, past the 12:30 PM cutoff. This order will go to the next weekday window${canCodTonight ? ", or switch to Weekday COD (after 6:30 PM)." : "."}
          <//>`
        : null}

      ${usingPopup
        ? html`<${Daju.Notice} tone="success" title=${"Pop-up stall pickup at " + activePopup.venue}>
            Your cup will be prepared for pickup at our ${activePopup.venue} stall (${activePopup.days}, ${activePopup.time}). Tell us roughly when you're dropping by.
          <//>
          <${Daju.TextField}
            label="Estimated arrival time"
            required=${true}
            placeholder="e.g. Saturday, 2:00 PM"
            value=${f.prefTime}
            error=${tried ? err.prefTime : void 0}
            onChange=${function (ev) { set({ prefTime: ev.target.value }); }}
          />`
        : null}

      ${f.mode === "PICK_UP" && f.day === "weekend" && !usingPopup
        ? html`<${Daju.Notice} tone="availability" title="Pending time confirmation">
            Weekend pickups at Maang Apartment are by arrangement. Tell us a time and we'll confirm or suggest another.
          <//>
          <${Daju.TextField}
            label="Preferred pickup time"
            required=${true}
            placeholder="e.g. Saturday, 3:00 PM"
            value=${f.prefTime}
            error=${tried ? err.prefTime : void 0}
            onChange=${function (ev) { set({ prefTime: ev.target.value }); }}
          />`
        : null}

      ${f.mode === "GRAB_EXPRESS" && f.day === "weekend"
        ? html`<${React.Fragment}>
            ${weekendGrabClosed
              ? html`<${Daju.Notice} tone="info" title="Today's Grab Express hours have ended">
                  It's ${formatKLTime(now)} in KK, after our 4:00 PM weekend cutoff. Choose a dispatch window for the next weekend day.
                <//>`
              : null}
            <${Daju.ChoicePills}
              label="Dispatch window (9:00 AM \u2013 4:00 PM)"
              className="window-pills"
              options=${grabWindowOpts}
              value=${f.grabWindow}
              onChange=${function (w) { set({ grabWindow: w }); }}
            />
          <//>`
        : null}

      ${f.mode === "COD"
        ? html`<${Daju.ZonePicker}
            value=${f.zone}
            onChange=${function (z) { set({ zone: z }); }}
            onSwitchToGrab=${function () { set({ mode: "GRAB_EXPRESS", zone: null }); }}
          />
          ${tried && err.zone ? html`<p className="dj-field-error" role="alert"><${Daju.Doodle} name="sparkle" size=${16} />${err.zone}</p>` : null}
          ${f.day === "weekend"
            ? html`<${Daju.Notice} tone="availability">Weekend COD is based on order & availability. We'll confirm before dispatch.<//>`
            : null}`
        : null}

      ${showAddressFields
        ? html`<${Daju.TextField}
            label=${f.mode === "COD" ? "Exact drop-off address" : "Delivery address"}
            required=${true}
            multiline=${true}
            rows=${2}
            autoComplete="street-address"
            placeholder="Street, building, unit"
            value=${f.address}
            error=${tried ? err.address : void 0}
            onChange=${function (ev) { set({ address: ev.target.value }); }}
          />
          <${Daju.TextField}
            label="Address notes"
            hint="Optional. A landmark helps the rider."
            placeholder="Blue gate, beside the bakery"
            value=${f.notes}
            onChange=${function (ev) { set({ notes: ev.target.value }); }}
          />`
        : null}

      ${f.mode === "GRAB_EXPRESS"
        ? html`<${Daju.FeeAck} checked=${f.feeAck} onChange=${function (v) { set({ feeAck: v }); }} error=${tried && !!err.feeAck} />`
        : null}

      <${Daju.TextField}
        label="Your name"
        required=${true}
        autoComplete="name"
        placeholder="Aina"
        value=${f.customer}
        error=${tried ? err.customer : void 0}
        onChange=${function (ev) { set({ customer: ev.target.value }); }}
      />
      <${Daju.TextField}
        label="WhatsApp number"
        required=${true}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="012-345 6789"
        hint="We confirm your order here."
        value=${f.phone}
        error=${tried ? err.phone : void 0}
        onChange=${function (ev) { set({ phone: ev.target.value }); }}
      />
    <//>`;
  }

  function OrderSection(props) {
    var channels = [["PICK_UP", "bag"], ["GRAB_EXPRESS", "scooter"], ["COD", "car"]];
    var isFocused = props.step !== "pick";
    var errCount = Object.keys(props.errors).length;
    var activeIcon = channels.filter(function (c) { return c[0] === props.mode; })[0][1];

    return html`
      <section id="order" className="band" data-theme="forest" aria-labelledby="order-title">
        <div className="route-wrap">
          <div className="route-head">
            <${Daju.StickerHeadline} size="lg" className="chapter-title"><span id="order-title">How to order</span><//>
            <${Daju.Doodle} name="sprig" size=${40} />
            <p className="caption p0 muted" style=${{ textTransform: "uppercase" }}>
              ${isFocused ? "Step 2 of 2 \u00b7 Your details" : "Step 1 of 2 \u00b7 Pick a method"}
            </p>
          </div>
          <${Fold} open=${!isFocused} className="no-flip">
            <div className="day-toggle-static">
              <${Daju.ChoicePills} variant="segmented" label="Show schedule for" options=${DAY_OPTS} value=${props.f.day} onChange=${function (d) { props.setF({ day: d }); }} />
            </div>
          <//>
          <div className=${"route" + (isFocused ? " is-focused" : "")}>
            <span className="rider" aria-hidden="true"><${Daju.Doodle} name=${activeIcon} size=${22} /></span>
            ${channels.map(function (pair) {
              var chKey = pair[0];
              var iconName = pair[1];
              var isSelectedMode = props.mode === chKey;
              var isDetailsOpen = props.step === "details" && isSelectedMode;
              var isFolded = isFocused && !isDetailsOpen;
              var isChosenSaved = isSelectedMode && props.saved && !isFocused;
              var meta = Daju.schedule[chKey];

              return html`<div
                key=${chKey}
                id=${"station-" + chKey}
                className=${"station" + (isSelectedMode && (isFocused || props.saved) ? " is-chosen" : "") + (isFolded ? " is-folded" : "") + (isDetailsOpen ? " is-open" : "")}
              >
                <span className="station-icon" aria-hidden="true"><${Daju.Doodle} name=${iconName} size=${26} /></span>
                <${Fold} open=${isFolded}>
                  <button type="button" className="station-bar" onClick=${function () { props.onChoose(chKey); }} aria-label=${"Switch to " + meta.title}>
                    <span className="station-bar-n">${meta.step}</span>
                    <span className="station-bar-title">${meta.title}</span>
                    <span className="station-bar-cta">Switch<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                  </button>
                <//>
                <${Fold} open=${!isFolded}>
                  <div className=${"station-card" + (isDetailsOpen ? " is-open" : "")}>
                    <${Daju.ChannelCard} channel=${chKey} active=${props.f.day} selected=${isSelectedMode && (isFocused || props.saved)} />
                  </div>
                  <${Fold} open=${!isFocused}>
                    <div className="choose-row">
                      <button type="button" className="chip-btn" aria-pressed=${isChosenSaved} aria-expanded=${isDetailsOpen} onClick=${function () { props.onChoose(chKey); }}>
                        ${isChosenSaved ? html`<${Daju.Doodle} name="sparkle" size=${18} />` : null}
                        ${isChosenSaved ? MODE_NAMES[chKey] + " chosen \u00b7 edit details" : "Choose " + MODE_NAMES[chKey]}
                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </div>
                  <//>
                <//>
                ${isSelectedMode
                  ? html`<${Fold} open=${isDetailsOpen} className="fold-details">
                      <form className="details-form" noValidate=${true} onSubmit=${function (ev) { ev.preventDefault(); props.onSave(); }} aria-label=${meta.title + " details"}>
                        <div className="details-form-head">
                          <p className="caption p0 eyebrow">Your details for ${meta.title}</p>
                          <button type="button" className="back-btn" onClick=${props.onBack}>
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>Change method
                          </button>
                        </div>
                        <${FulfillFields} f=${props.f} set=${props.setF} tried=${props.tried} err=${props.errors} now=${props.now} showMode=${false} activePopup=${props.activePopup} />
                        ${props.tried && errCount
                          ? html`<p className="fine" style=${{ color: "var(--alert)", fontWeight: 600 }} role="alert">
                              Fix the highlighted ${errCount === 1 ? "field" : "fields"} to finish your ticket.
                            </p>`
                          : null}
                        <${Daju.Button} type="submit" variant="primary" size="lg" block=${true} icon="sparkle" disabled=${props.mode === "COD" && props.f.zone === "OTHER"}>
                          Save details & see my ticket
                        <//>
                      </form>
                    <//>`
                  : null}
              </div>`;
            })}
          </div>
          <${Fold} open=${!isFocused} className="no-flip">
            ${props.f.day === "weekend"
              ? html`<${Daju.Notice} tone="availability" title="Weekend notes">
                  Maang Apartment pickups are by arrangement, so add your preferred time at checkout. Weekend COD is based on order & availability, and we'll confirm before dispatch.
                <//>`
              : html`<${Daju.Notice} tone="info" title="Order before the window closes">
                  Pre-orders for the 12:30 PM \u2013 1:25 PM Centre Point slot close before pickup starts. Miss it and Weekday COD (after 6:30 PM) is next.
                <//>`}
          <//>
        </div>
      </section>
    `;
  }

  function SignOffSection(props) {
    var busyState = useState(false);
    var busy = busyState[0];
    var setBusy = busyState[1];
    var blobRef = useRef(null);
    var orderKey = JSON.stringify(props.order);

    useEffect(function () {
      blobRef.current = null;
      if (!props.complete) return;
      var active = true;
      makeTicketBlob(props.order).then(function (b) { if (active) blobRef.current = b; }, function () {});
      return function () { active = false; };
    }, [props.complete, orderKey]);

    return html`
      <section id="ticket" className="band" aria-labelledby="ticket-title">
        <div className="wrap signoff">
          <div className="signoff-copy">
            <${Daju.StickerHeadline} size="lg" className="chapter-title"><span id="ticket-title">Ready when you are</span><//>
          </div>
          <div className="signoff-ticket">
            <p className=${"ticket-state" + (props.complete ? " is-ok" : "")} role="status">
              <${Daju.Doodle} name=${props.complete ? "sparkle" : "clock"} size=${18} />
              ${props.complete
                ? "Details saved. This is the ticket we will receive."
                : "Live preview. It fills in as you build your cups and add your details."}
            </p>
            <div className="ticket-live" key=${props.flash}><${Daju.OrderTicket} ...${props.order} /></div>
            <div className="btns">
              ${props.hasBag
                ? html`<${Daju.Button} variant="primary" size="lg" icon="bag" block=${true} onClick=${props.onReview}>
                    ${props.complete ? "Send order via WhatsApp" : "Review & send order"}
                  <//>`
                : html`<${Daju.Button} variant="primary" className="btn-pink" size="lg" icon="bag" block=${true} onClick=${props.onAddStudio}>
                    ${props.studioQty > 1 ? "Add these " + props.studioQty + " cups to bag" : "Add this cup to bag"}
                  <//>`}
              ${props.complete ? null : html`<${Daju.Button} variant="sticker" block=${true} icon="pin" onClick=${props.onDetails}>Add my details<//>`}
              ${props.complete
                ? html`<${Daju.Button}
                    variant="sticker"
                    block=${true}
                    icon="sparkle"
                    disabled=${busy}
                    onClick=${function () {
                      if (busy) return;
                      setBusy(true);
                      shareOrDownloadTicket(props.order, formatWhatsAppTicket(props.order), props.toast, blobRef.current).then(function () { setBusy(false); });
                    }}
                  >${busy ? "Making your ticket image\u2026" : "Share ticket as image"}<//>`
                : null}
              <${Daju.Button} variant="secondary" block=${true} onClick=${props.onCopy}>Copy ticket text<//>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function PopupsSection(props) {
    var upcoming = props.popups;
    var next = upcoming[0];
    var later = upcoming.slice(1, 4);

    return html`
      <section id="popups" className="band popups" aria-labelledby="popups-title">
        <div className="wrap popups-wrap">
          <div className="popups-head">
            <${Daju.StickerHeadline} size="lg" className="chapter-title">
              <span id="popups-title">${next ? "Find us at our next pop-up" : "Next pop-up coming soon"}</span>
            <//>
          </div>
          ${next
            ? html`<article className="popup-card">
                <span className="popup-badge">${popupBadgeText(next, props.now)}</span>
                <p className="popup-venue">${next.venue}</p>
                <p className="popup-place">${next.place}</p>
                <ul className="popup-meta">
                  <li><${Daju.Doodle} name="clock" size=${20} /><span><b>${next.days}</b><br />${next.time}</span></li>
                  <li><${Daju.Doodle} name="pin" size=${20} /><span>Look for the DAJU stall at <b>${next.venue}</b>, ${next.place}</span></li>
                </ul>
                <div className="popup-btns">
                  <${Daju.Button} variant="primary" className="btn-pink" size="lg" icon="pin" block=${true} href=${popupMapUrl(next)} target="_blank" rel="noopener noreferrer">Get directions<//>
                  <${Daju.Button} variant="secondary" block=${true} icon="bag" onClick=${function () { props.onPreorder(next); }}>Pre-order for pickup at the stall<//>
                </div>
                <p className="popup-skip">Skip the queue: build your cup now and pick it up when you visit.</p>
              </article>`
            : html`<article className="popup-card is-empty">
                <p className="popup-venue">We're planning the next one</p>
                <p className="popup-place">Watch our IG Stories for the date and place.</p>
              </article>`}
          ${later.length
            ? html`<div className="popup-later">
                <p className="label">Also coming up</p>
                <ul>
                  ${later.map(function (p) {
                    return html`<li key=${p.start}>
                      <span className="popup-later-date">${p.days}</span>
                      <span>${p.venue}, ${p.place} \u00b7 ${p.time}</span>
                      <a href=${popupMapUrl(p)} target="_blank" rel="noopener noreferrer" className="label">Map</a>
                    </li>`;
                  })}
                </ul>
              </div>`
            : null}
        </div>
      </section>
    `;
  }

  function Footer() {
    return html`
      <footer className="foot" data-theme="forest" style=${{ background: "var(--surface)", color: "var(--text)" }}>
        <div className="wrap foot-grid">
          <div style=${{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <${Daju.Wordmark} size="sm" />
            <p className="script">One week. One matcha. A little surprise</p>
          </div>
          <nav aria-label="Footer">
            <a href="#drop" className="label">Weekly Drop</a>
            <a href="#menu" className="label">Matcha Menu</a>
            <a href="#studio" className="label">Build Your Cup</a>
            <a href="#order" className="label">How to Order</a>
            <a href="#popups" className="label">Pop-ups</a>
            ${CONFIG.instagramUrl
              ? html`<a href=${CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" className="label">Instagram ${CONFIG.instagramHandle}</a>`
              : null}
            ${CONFIG.tiktokUrl
              ? html`<a href=${CONFIG.tiktokUrl} target="_blank" rel="noopener noreferrer" className="label">TikTok ${CONFIG.tiktokHandle}</a>`
              : null}
            <a href=${"https://wa.me/" + CONFIG.whatsappNumber} target="_blank" rel="noopener noreferrer" className="label">WhatsApp ${CONFIG.whatsappDisplay}</a>
          </nav>
        </div>
        <p className="caption muted" style=${{ maxWidth: 1200, margin: "32px auto 0" }}>
          DAJU Matcha \u00b7 pop-up \u00b7 Pick Up, Grab Express & COD to KK, Penampang, Putatan, Kepayan
        </p>
      </footer>
    `;
  }

  function CustomDrawer(props) {
    var item = props.item;
    var state = useState({ name: "", ice: "Normal", sweet: "Normal", flair: "butterfly", qty: 1 });
    var form = state[0];
    var setForm = state[1];

    useEffect(function () {
      if (item) setForm({ name: "", ice: "Normal", sweet: "Normal", flair: item.charm || "butterfly", qty: 1 });
    }, [item && item.id, props.open]);

    if (!item) return null;
    var maxAdd = Math.max(1, CONFIG.maxCupsPerOrder - props.bagCount);
    var isFull = props.bagCount >= CONFIG.maxCupsPerOrder;
    var qty = Math.min(form.qty, maxAdd);
    var previewName = (form.name || "").trim() || "DA JU";
    var unitPrice = item.price == null ? "Price TBC" : "RM " + (item.price * qty).toFixed(2);

    function patch(upd) { setForm(Object.assign({}, form, upd)); }

    return html`<${Daju.Drawer}
      open=${props.open}
      onClose=${props.onClose}
      side=${props.side}
      title="Customize your cup"
      step=${item.name}
      footer=${html`<${Daju.Button}
        variant="primary"
        className="btn-pink"
        size="lg"
        icon="bag"
        block=${true}
        disabled=${isFull}
        onClick=${function () { props.onAdd(item, Object.assign({}, form, { qty: qty })); }}
      >${isFull ? "Bag full (10 cup max)" : (qty > 1 ? "Add " + qty + " cups \u00b7 " : "Add to bag \u00b7 ") + unitPrice}<//>`}
    >
      <div className="custom-cup">
        <${Daju.CupPreview} width=${props.side === "bottom" ? 130 : 170} name=${previewName} charm=${form.flair} className=${cupClass(item.id)} alt=${"Illustrated " + item.name + ' with "' + previewName + '" written on the cup'} />
      </div>
      <div className="qty-row">
        <div>
          <p className="dj-field-label p0" id="custom-qty-label">Quantity</p>
          <p className="fine">${isFull ? "Bag is at the 10-cup limit." : "Up to " + maxAdd + " more in this order."}</p>
        </div>
        <div className="stepper" role="group" aria-labelledby="custom-qty-label">
          <button type="button" className="step-btn" aria-label="One cup fewer" disabled=${qty <= 1 || isFull} onClick=${function () { haptic(); patch({ qty: Math.max(1, qty - 1) }); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
          </button>
          <output className="qty-num" aria-live="polite"><span className="qty-pop" key=${qty}>${qty}</span></output>
          <button type="button" className="step-btn" aria-label="One cup more" disabled=${qty >= maxAdd || isFull} onClick=${function () { haptic(); patch({ qty: Math.min(maxAdd, qty + 1) }); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
      <${Daju.TextField}
        label="Name on the cup"
        hint="Up to 12 characters, written in marker."
        maxLength=${12}
        placeholder="DA JU"
        autoComplete="off"
        value=${form.name}
        onChange=${function (ev) { patch({ name: ev.target.value.slice(0, 12) }); }}
      />
      <${Daju.ChoicePills} label="Ice" options=${LEVEL_OPTS} value=${form.ice} className="full-seg" onChange=${function (v) { patch({ ice: v }); }} />
      <${Daju.ChoicePills} label="Sweetness" options=${LEVEL_OPTS} value=${form.sweet} className="full-seg" onChange=${function (v) { patch({ sweet: v }); }} />
      <${Daju.ChoicePills} label="Cup flair" options=${FLAIR_OPTS} value=${form.flair} className="mode-pills" onChange=${function (v) { patch({ flair: v }); }} />
    <//>`;
  }

  function groupBagForDrawer(items) {
    var groups = [];
    var idxMap = {};
    items.forEach(function (it) {
      var sig = [it.id, it.ice, it.sweet, it.cupName, it.flair, it.price].join("|");
      if (idxMap[sig] != null) {
        groups[idxMap[sig]].keys.push(it.key);
        groups[idxMap[sig]].qty += 1;
        return;
      }
      idxMap[sig] = groups.length;
      groups.push(Object.assign({}, it, { sig: sig, qty: 1, keys: [it.key] }));
    });
    return groups;
  }

  function BagDrawer(props) {
    var items = props.items;
    var groups = groupBagForDrawer(items);
    var isFull = items.length >= CONFIG.maxCupsPerOrder;

    return html`<${Daju.Drawer}
      open=${props.open}
      onClose=${props.onClose}
      side=${props.side}
      className="checkout-drawer"
      title="Your order bag"
      step="Step 1 of 3"
      footer=${items.length
        ? html`<div className="drawer-stack" style=${{ gap: 12 }}>
            <div className="sum-row"><span>Estimated subtotal (${items.length}/${CONFIG.maxCupsPerOrder})</span><span>${formatSubtotal(items)}</span></div>
            ${props.ready
              ? html`<div className="method-summary">
                  <span className="method-summary-icon" aria-hidden="true"><${Daju.Doodle} name=${props.modeIcon} size=${22} /></span>
                  <span className="method-summary-text"><b>${props.modeName}</b><span>${props.slot}</span></span>
                  <button type="button" className="text-btn" onClick=${props.onNext}>Change</button>
                </div>
                <${Daju.Button} variant="primary" size="lg" icon="sparkle" block=${true} onClick=${props.onReview}>Review my order<//>`
              : html`<${Daju.Button} variant="primary" size="lg" block=${true} onClick=${props.onNext}>
                  ${props.saved ? "Finish my delivery details" : "Choose pickup or delivery"}
                <//>`}
            <${Daju.Button} variant="ghost" block=${true} onClick=${props.onClear}>Clear bag<//>
          </div>`
        : null}
    >
      ${items.length
        ? html`<ul className="bag-list">
            ${groups.map(function (grp) {
              var grpPrice = grp.price == null ? "Price TBC" : "RM " + (grp.price * grp.qty).toFixed(2);
              return html`<li key=${grp.sig} className="bag-item">
                <${Daju.CupPreview} width=${56} name=${grp.cupName || "DA JU"} charm=${grp.flair} className=${cupClass(grp.id)} alt="" />
                <div>
                  <h3>${grp.qty > 1 ? grp.qty + "\u00d7 " : ""}${grp.name}</h3>
                  <p>Ice ${grp.ice.toLowerCase()} \u00b7 sweetness ${grp.sweet.toLowerCase()} \u00b7 ${FLAIR_LABELS[grp.flair]}</p>
                  ${grp.cupName ? html`<p className="cupname">${grp.cupName}</p>` : null}
                  <p style=${{ fontVariantNumeric: "tabular-nums" }}>${grpPrice}</p>
                </div>
                <div className="bag-qty">
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label=${grp.qty > 1 ? "Remove one " + grp.name : "Remove " + grp.name}
                    onClick=${function () { props.onRemoveOne(grp.keys[grp.keys.length - 1]); }}
                  >
                    ${grp.qty > 1
                      ? html`<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>`
                      : html`<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>`}
                  </button>
                  <span className="bag-qty-n" aria-hidden="true">${grp.qty}</span>
                  <button
                    type="button"
                    className="icon-btn"
                    disabled=${isFull}
                    aria-label=${"Add one more " + grp.name}
                    onClick=${function () { props.onAddOne(grp); }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                  </button>
                </div>
              </li>`;
            })}
          </ul>`
        : html`<div className="empty">
            <${Daju.Doodle} name="bag" size=${48} />
            <p className="body p0">Your bag is empty. Pick a matcha and make it yours.</p>
            <${Daju.Button} variant="sticker" icon="sparkle" onClick=${props.onBrowse}>Browse the menu<//>
          </div>`}
    <//>`;
  }

  function FulfillDrawer(props) {
    var f = props.f;
    var errCount = Object.keys(props.errors).length;

    return html`<${Daju.Drawer}
      open=${props.open}
      onClose=${props.onClose}
      side=${props.side}
      className="checkout-drawer"
      title="How should we get it to you?"
      step="Step 2 of 3"
      footer=${html`<div className="drawer-stack" style=${{ gap: 10 }}>
        ${props.tried && errCount
          ? html`<p className="fine" style=${{ color: "var(--alert)", fontWeight: 600 }} role="alert">
              Fix the highlighted ${errCount === 1 ? "field" : "fields"} to see your ticket.
            </p>`
          : null}
        <${Daju.Button} variant="primary" size="lg" block=${true} disabled=${f.mode === "COD" && f.zone === "OTHER"} onClick=${props.onNext}>Review ticket<//>
        <${Daju.Button} variant="ghost" block=${true} onClick=${props.onBack}>Back to bag<//>
      </div>`}
    >
      <${FulfillFields} f=${f} set=${props.setF} tried=${props.tried} err=${props.errors} now=${props.now} showMode=${true} activePopup=${props.activePopup} />
    <//>`;
  }

  function TicketDrawer(props) {
    var fallbackState = useState(false);
    var showFallback = fallbackState[0];
    var setShowFallback = fallbackState[1];
    var taRef = useRef(null);
    var busyState = useState(false);
    var busy = busyState[0];
    var setBusy = busyState[1];
    var blobRef = useRef(null);
    var ticketText = formatWhatsAppTicket(props.order);

    useEffect(function () {
      if (!props.open) {
        setShowFallback(false);
        return;
      }
      blobRef.current = null;
      var active = true;
      makeTicketBlob(props.order).then(function (b) { if (active) blobRef.current = b; }, function () {});
      return function () { active = false; };
    }, [props.open, ticketText]);

    useEffect(function () {
      if (showFallback && taRef.current) {
        taRef.current.focus();
        taRef.current.select();
      }
    }, [showFallback]);

    return html`<${Daju.Drawer}
      open=${props.open}
      onClose=${props.onClose}
      side=${props.side}
      className="checkout-drawer"
      title="Your order ticket"
      step="Step 3 of 3"
      footer=${html`<div className="drawer-stack" style=${{ gap: 10 }}>
        <${Daju.Button}
          variant="primary"
          size="lg"
          icon="bubble"
          block=${true}
          href=${"https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(ticketText)}
          target="_blank"
          rel="noopener noreferrer"
        >Send via WhatsApp<//>
        <${Daju.Button}
          variant="sticker"
          block=${true}
          icon="sparkle"
          disabled=${busy}
          onClick=${function () {
            if (busy) return;
            setBusy(true);
            shareOrDownloadTicket(props.order, ticketText, props.toast, blobRef.current).then(function () { setBusy(false); });
          }}
        >${busy ? "Making your ticket image\u2026" : "Share ticket as image"}<//>
        <${Daju.Button}
          variant="secondary"
          block=${true}
          onClick=${function () {
            copyText(ticketText, function () { props.toast("Ticket copied"); }, function () { setShowFallback(true); });
          }}
        >Copy ticket text<//>
        <div className="ticket-foot-links">
          <${Daju.Button} variant="ghost" onClick=${props.onBack}>Edit details<//>
          <${Daju.Button} variant="ghost" onClick=${props.onNewOrder}>Start new order<//>
        </div>
      </div>`}
    >
      <div className="ticket-center"><${Daju.OrderTicket} ...${props.order} /></div>
      <p className="fine">
        Send via WhatsApp opens the chat with this ticket typed in. Prefer a picture? Share ticket as image sends it as a PNG from your phone's share menu (pick WhatsApp, then the DAJU chat, ${CONFIG.whatsappDisplay}). We'll reply to confirm your slot.
      </p>
      ${showFallback
        ? html`<div style=${{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="dj-field-label" htmlFor="raw-ticket">Ticket text (selected, copy it from here)</label>
            <textarea id="raw-ticket" ref=${taRef} className="copy-fallback" readOnly=${true} value=${ticketText}></textarea>
          </div>`
        : null}
    <//>`;
  }

  var TABS = [["drop", "Drop", "sparkle"], ["menu", "Menu", "whisk"], ["studio", "Studio", "daisy"], ["order", "Order", "scooter"]];

  function TabBar(props) {
    var activeState = useState("drop");
    var activeTab = activeState[0];
    var setActiveTab = activeState[1];

    useEffect(function () {
      if (!("IntersectionObserver" in window)) return;
      var sectionMap = { drop: "drop", assembly: "drop", menu: "menu", studio: "studio", order: "order", popups: "order" };
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && sectionMap[entry.target.id]) {
              setActiveTab(sectionMap[entry.target.id]);
            }
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      Object.keys(sectionMap).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) io.observe(el);
      });
      return function () { io.disconnect(); };
    }, []);

    return html`<nav className="tabbar" aria-label="Quick navigation">
      ${TABS.map(function (t) {
        return html`<a
          key=${t[0]}
          href=${"#" + t[0]}
          className=${"tab" + (activeTab === t[0] ? " is-here" : "")}
          aria-current=${activeTab === t[0] ? "location" : void 0}
        ><${Daju.Doodle} name=${t[2]} size=${24} />${t[1]}</a>`;
      })}
      <button type="button" className="tab" onClick=${props.onBag} aria-label=${"Order bag, " + props.count + (props.count === 1 ? " item" : " items")}>
        <${Daju.Doodle} name="bag" size=${24} />Bag
        ${props.count ? html`<span className="tab-count bump" key=${props.count}>${props.count}</span>` : null}
      </button>
    </nav>`;
  }

  function loadSavedSession(initialKL) {
    var defForm = {
      mode: "PICK_UP",
      day: initialKL.isWeekend ? "weekend" : "weekday",
      zone: null,
      address: "",
      notes: "",
      prefTime: "",
      grabWindow: GRAB_WINDOWS[0].value,
      feeAck: false,
      customer: "",
      phone: "",
      popupPickup: false,
    };
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return { bag: [], form: defForm, saved: false, orderRef: makeOrderRef(initialKL) };
      var parsed = JSON.parse(raw);
      return {
        bag: Array.isArray(parsed.bag) ? parsed.bag.slice(0, CONFIG.maxCupsPerOrder) : [],
        form: Object.assign({}, defForm, parsed.form || {}),
        saved: !!parsed.saved,
        orderRef: parsed.orderRef || makeOrderRef(initialKL),
      };
    } catch (err) {
      return { bag: [], form: defForm, saved: false, orderRef: makeOrderRef(initialKL) };
    }
  }

  function App() {
    var initKL = useRef(null);
    if (!initKL.current) initKL.current = getKLNow();
    var initSess = useRef(null);
    if (!initSess.current) initSess.current = loadSavedSession(initKL.current);

    var nowState = useState(initKL.current);
    var now = nowState[0];
    var setNow = nowState[1];
    var bagState = useState(initSess.current.bag);
    var bag = bagState[0];
    var setBag = bagState[1];
    var refState = useState(initSess.current.orderRef);
    var orderRef = refState[0];
    var setOrderRef = refState[1];

    var studioState = useState({
      drink: MOTW_DRINK.id,
      qty: 1,
      mode: "same",
      active: 0,
      cups: [{ name: "", ice: "Normal", sweet: "Normal", flair: "butterfly" }],
    });
    var studio = studioState[0];
    var setStudio = studioState[1];

    var orderStepState = useState("pick");
    var orderStep = orderStepState[0];
    var setOrderStep = orderStepState[1];
    var savedState = useState(initSess.current.saved);
    var saved = savedState[0];
    var setSaved = savedState[1];
    var triedInlineState = useState(false);
    var triedInline = triedInlineState[0];
    var setTriedInline = triedInlineState[1];
    var flashState = useState(0);
    var flash = flashState[0];
    var setFlash = flashState[1];
    var burstState = useState(0);
    var burst = burstState[0];
    var setBurst = burstState[1];
    var formState = useState(initSess.current.form);
    var form = formState[0];
    var setForm = formState[1];
    var drawerState = useState(null);
    var drawer = drawerState[0];
    var setDrawer = drawerState[1];
    var customItemState = useState(null);
    var customItem = customItemState[0];
    var setCustomItem = customItemState[1];
    var triedDrawerState = useState(false);
    var triedDrawer = triedDrawerState[0];
    var setTriedDrawer = triedDrawerState[1];
    var toastMsgState = useState("");
    var toastMsg = toastMsgState[0];
    var setToastMsg = toastMsgState[1];
    var toastOutState = useState(false);
    var toastOut = toastOutState[0];
    var setToastOut = toastOutState[1];
    var layerState = useState(5);
    var layer = layerState[0];
    var setLayer = layerState[1];
    var progressState = useState(0);
    var progress = progressState[0];
    var setProgress = progressState[1];

    var narrow = useMediaQuery("(max-width: 720px)");
    var reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
    var pinned = !reduceMotion;
    var drawerSide = narrow ? "bottom" : "right";

    var heroRef = useRef(null);
    var secRef = useRef(null);
    var stickRef = useRef(null);
    var toastHideRef = useRef(null);
    var toastFadeRef = useRef(null);
    var keySeqRef = useRef(bag.reduce(function (m, it) { return Math.max(m, it.key || 0); }, 0));
    var closeTimerRef = useRef(null);
    var isClosingRef = useRef(false);
    var switchTimerRef = useRef(null);
    var stationRafRef = useRef(0);

    useEffect(function () {
      var id = setInterval(function () { setNow(getKLNow()); }, 30000);
      return function () { clearInterval(id); };
    }, []);

    useEffect(function () {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ bag: bag, form: form, saved: saved, orderRef: orderRef }));
      } catch (err) {}
    }, [bag, form, saved, orderRef]);

    useEffect(function () {
      if (form.mode !== "GRAB_EXPRESS" || form.day !== "weekend" || !now.isWeekend) return;
      if (now.minutes >= CONFIG.cutoffs.weekendGrabCloseMin) return;
      var cur = GRAB_WINDOWS.filter(function (w) { return w.value === form.grabWindow; })[0];
      if (cur && now.minutes >= cur.endMin) {
        var nextOpen = GRAB_WINDOWS.filter(function (w) { return now.minutes < w.endMin; })[0];
        if (nextOpen) setForm(function (prev) { return Object.assign({}, prev, { grabWindow: nextOpen.value }); });
      }
    }, [form.mode, form.day, form.grabWindow, now.isWeekend, now.minutes]);

    useEffect(function () {
      var hash = window.location.hash;
      if (hash && hash.length > 1) {
        var target = document.getElementById(hash.slice(1));
        if (target) {
          requestAnimationFrame(function () { target.scrollIntoView({ behavior: "auto", block: "start" }); });
        }
      }
    }, []);

    useEffect(function () { document.body.classList.toggle("is-locked", !!drawer); }, [drawer]);
    useEffect(function () { document.body.classList.toggle("has-bag", bag.length > 0); }, [bag.length]);

    useEffect(function () {
      if (pinned) { setLayer(1); } else { setLayer(5); setProgress(1); }
      var rafId = 0;
      function updateScroll() {
        rafId = 0;
        var heroEl = heroRef.current;
        if (heroEl && !reduceMotion) {
          var hRect = heroEl.getBoundingClientRect();
          var hProg = Math.max(0, Math.min(1, -hRect.top / Math.max(1, hRect.height)));
          var rad = hProg * Math.PI * 2;
          heroEl.style.setProperty("--wr", (Math.sin(rad) * 28).toFixed(1) + "deg");
          heroEl.style.setProperty("--wx", (Math.sin(rad) * 14).toFixed(1) + "px");
          heroEl.style.setProperty("--wy", (Math.sin(rad * 2) * 8).toFixed(1) + "px");
        }
        var secEl = secRef.current;
        var stickEl = stickRef.current;
        if (pinned && secEl && stickEl) {
          var sRect = secEl.getBoundingClientRect();
          var travel = Math.max(1, secEl.offsetHeight - stickEl.offsetHeight);
          var topOff = narrow ? 0 : 64;
          var p = Math.max(0, Math.min(1, (topOff - sRect.top) / travel));
          setProgress(p);
          setLayer(Math.min(5, 1 + Math.floor((p / 0.24) * 5)));
        }
      }
      function onScroll() { if (!rafId) rafId = requestAnimationFrame(updateScroll); }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      updateScroll();
      return function () {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }, [pinned, reduceMotion, narrow]);

    function showToast(msg) {
      setToastMsg(msg);
      setToastOut(false);
      clearTimeout(toastHideRef.current);
      clearTimeout(toastFadeRef.current);
      toastFadeRef.current = setTimeout(function () { setToastOut(true); }, 2400);
      toastHideRef.current = setTimeout(function () { setToastMsg(""); setToastOut(false); }, 2620);
    }

    function openDrawer(name) {
      if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
      isClosingRef.current = false;
      document.body.classList.remove("is-closing");
      setDrawer(name);
    }

    function closeDrawer(afterClose) {
      if (isClosingRef.current) return;
      if (reduceMotion) {
        setDrawer(null);
        document.body.classList.remove("is-locked");
        if (afterClose) setTimeout(afterClose, 0);
        return;
      }
      isClosingRef.current = true;
      document.body.classList.add("is-closing");
      document.body.classList.remove("is-locked");
      closeTimerRef.current = setTimeout(function () {
        closeTimerRef.current = null;
        isClosingRef.current = false;
        document.body.classList.remove("is-closing");
        setDrawer(null);
        if (afterClose) setTimeout(afterClose, 0);
      }, 200);
    }

    function updateCup(patch, silent) {
      setStudio(function (prev) {
        var idx = prev.qty > 1 && prev.mode === "each" ? prev.active : 0;
        var nextCups = prev.cups.slice();
        nextCups[idx] = Object.assign({}, nextCups[idx], patch);
        return Object.assign({}, prev, { cups: nextCups });
      });
      if (!silent) setBurst(function (b) { return b + 1; });
    }

    function updateQty(nextQty) {
      haptic();
      setStudio(function (prev) {
        var nextCups = prev.cups.slice(0, nextQty);
        while (nextCups.length < nextQty) {
          nextCups.push(Object.assign({}, prev.mode === "each" ? nextCups[nextCups.length - 1] : prev.cups[0]));
        }
        return Object.assign({}, prev, { qty: nextQty, cups: nextCups, active: Math.min(prev.active, nextQty - 1) });
      });
    }

    function updateStudioMode(nextMode) {
      haptic();
      setStudio(function (prev) {
        var nextCups = prev.cups.slice();
        if (nextMode === "each") {
          while (nextCups.length < prev.qty) nextCups.push(Object.assign({}, prev.cups[0]));
        }
        return Object.assign({}, prev, { mode: nextMode, cups: nextCups, active: 0 });
      });
    }

    function getStudioCups() {
      var list = [];
      for (var i = 0; i < studio.qty; i++) list.push(studio.mode === "each" ? studio.cups[i] : studio.cups[0]);
      return list;
    }

    function scrollToId(id, delayMs) {
      setTimeout(function () {
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }, delayMs == null ? 30 : delayMs);
    }

    function patchForm(upd) {
      setForm(function (prev) {
        var next = Object.assign({}, prev, upd);
        if (upd.mode && upd.mode !== "COD") next.zone = null;
        if (upd.mode && upd.mode !== "PICK_UP") next.popupPickup = false;
        return next;
      });
    }

    function cancelStationScroll() {
      if (stationRafRef.current) { cancelAnimationFrame(stationRafRef.current); stationRafRef.current = 0; }
    }

    function scrollToStation(chKey, dur) {
      cancelStationScroll();
      var el = document.getElementById("station-" + chKey);
      if (!el) return;
      var topOff = narrow ? 0 : 64;
      var targetTop = topOff + 12;
      var startTop = el.getBoundingClientRect().top;
      var startTime = performance.now();
      var duration = reduceMotion ? 0 : dur;

      function abortOnUserInput() {
        cancelStationScroll();
        window.removeEventListener("wheel", abortOnUserInput);
        window.removeEventListener("touchstart", abortOnUserInput);
      }
      window.addEventListener("wheel", abortOnUserInput, { passive: true, once: true });
      window.addEventListener("touchstart", abortOnUserInput, { passive: true, once: true });

      function tick(ts) {
        var node = document.getElementById("station-" + chKey);
        if (!node) return abortOnUserInput();
        var t = duration ? Math.min(1, (ts - startTime) / duration) : 1;
        var eased = 1 - Math.pow(1 - t, 3);
        var desiredTop = startTop + (targetTop - startTop) * eased;
        var diff = node.getBoundingClientRect().top - desiredTop;
        if (Math.abs(diff) > 0.5) window.scrollTo({ top: window.scrollY + diff, behavior: "instant" });
        if (t < 1) stationRafRef.current = requestAnimationFrame(tick);
        else abortOnUserInput();
      }
      stationRafRef.current = requestAnimationFrame(tick);
    }

    function chooseStation(chKey) {
      haptic();
      setTriedInline(false);
      if (switchTimerRef.current) { clearTimeout(switchTimerRef.current); switchTimerRef.current = null; }
      var switching = orderStep === "details" && chKey !== form.mode;
      if (switching) setOrderStep("closing");
      scrollToStation(chKey, switching ? 520 : 380);
      switchTimerRef.current = setTimeout(function () {
        switchTimerRef.current = null;
        patchForm({ mode: chKey });
        requestAnimationFrame(function () { requestAnimationFrame(function () { setOrderStep("details"); }); });
      }, switching && !reduceMotion ? 260 : 0);
    }

    function addCupsToBag(drink, cups) {
      var remaining = CONFIG.maxCupsPerOrder - bag.length;
      if (remaining <= 0) {
        showToast("Bag limit reached (max " + CONFIG.maxCupsPerOrder + " cups per order)");
        return 0;
      }
      var toAdd = cups.slice(0, remaining);
      var newItems = toAdd.map(function (c) {
        keySeqRef.current += 1;
        return {
          key: keySeqRef.current,
          id: drink.id,
          name: drink.name,
          price: drink.price,
          ice: c.ice,
          sweet: c.sweet,
          cupName: (c.name || "").trim(),
          flair: c.flair,
        };
      });
      setBag(function (prev) { return prev.concat(newItems); });
      setFlash(function (f) { return f + 1; });
      setBurst(function (b) { return b + 1; });
      haptic();
      if (toAdd.length < cups.length) showToast("Added " + toAdd.length + " (10 cup max per order)");
      return toAdd.length;
    }

    var activePopups = getActivePopups(now);
    var nextPopup = activePopups[0] || null;
    var usingPopup = form.mode === "PICK_UP" && form.popupPickup && !!nextPopup;

    var errors = {};
    if (!form.customer.trim()) errors.customer = "Add your name so we can label the cup bag.";
    var phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 9 || phoneDigits.length > 15) {
      errors.phone = "Add a valid WhatsApp number (9\u201315 digits, e.g. 012-345 6789).";
    }
    if (form.mode === "PICK_UP" && (form.day === "weekend" || usingPopup) && !form.prefTime.trim()) {
      errors.prefTime = usingPopup ? "Add an estimated arrival time for the pop-up stall." : "Add a time so we can confirm or suggest another.";
    }
    if (form.mode !== "PICK_UP" && !(form.mode === "COD" && form.zone === "OTHER") && !form.address.trim()) {
      errors.address = "Add the address the rider should bring your cup to.";
    }
    if (form.mode === "GRAB_EXPRESS" && !form.feeAck) errors.feeAck = true;
    if (form.mode === "COD" && !form.zone) errors.zone = "Pick your COD area.";
    if (form.mode === "COD" && form.zone === "OTHER") errors.zone = "COD covers four areas only.";

    var schedCol = Daju.schedule[form.mode][form.day];
    var ticketLoc = usingPopup
      ? nextPopup.venue + ", " + nextPopup.place
      : form.mode === "PICK_UP"
      ? schedCol.location
      : form.mode === "COD"
      ? [form.address.trim(), form.zone && form.zone !== "OTHER" ? form.zone : ""].filter(Boolean).join(", ")
      : form.address.trim();

    var ticketTime = usingPopup
      ? (form.prefTime.trim() || nextPopup.time) + " (" + nextPopup.days + ")"
      : form.mode === "PICK_UP" && form.day === "weekend"
      ? (form.prefTime.trim() || "Time by arrangement") + " (pending time confirmation)"
      : form.mode === "GRAB_EXPRESS" && form.day === "weekend"
      ? form.grabWindow
      : schedCol.time;

    function groupForTicket(list) {
      var out = [];
      var map = {};
      list.forEach(function (it) {
        var sig = [it.name, it.ice, it.sweet, it.cupName, it.flair, it.price].join("|");
        if (map[sig] != null) {
          var row = out[map[sig]];
          row.qty += 1;
          row.price = it.price == null ? "Price TBC" : "RM " + (it.price * row.qty).toFixed(2);
          return;
        }
        map[sig] = out.length;
        out.push({
          qty: 1,
          name: it.name,
          ice: it.ice,
          sweetness: it.sweet,
          cupName: it.cupName || void 0,
          flair: FLAIR_LABELS[it.flair],
          price: formatPrice(it.price),
        });
      });
      return out;
    }

    var liveOrder = {
      orderRef: orderRef,
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      mode: form.mode,
      schedule: usingPopup ? "POP-UP" : form.day === "weekend" ? "WEEKEND" : "WEEKDAY",
      location: ticketLoc,
      time: ticketTime,
      address: form.mode !== "PICK_UP" ? form.notes.trim() : "",
      items: groupForTicket(bag),
      feeAck: form.feeAck,
      subtotal: formatSubtotal(bag),
    };

    var studioDrink = findDrink(studio.drink);
    var studioPreviewItems = getStudioCups().map(function (c) {
      return { id: studioDrink.id, name: studioDrink.name, price: studioDrink.price, ice: c.ice, sweet: c.sweet, cupName: (c.name || "").trim(), flair: c.flair };
    });
    var previewBag = bag.length ? bag : studioPreviewItems;
    var previewOrder = Object.assign({}, liveOrder, {
      customer: liveOrder.customer || "[Your name]",
      phone: liveOrder.phone || "[Your phone]",
      location: liveOrder.location || (form.mode === "PICK_UP" ? schedCol.location : "[Your address]"),
      items: groupForTicket(previewBag),
      subtotal: formatSubtotal(previewBag),
    });

    var detailsValid = saved && !Object.keys(errors).length;
    var orderComplete = bag.length > 0 && detailsValid;

    var checkoutSlot =
      MODE_NAMES[form.mode] +
      " \u00b7 " +
      (usingPopup
        ? nextPopup.venue + " \u00b7 " + nextPopup.days
        : (form.mode === "PICK_UP" ? schedCol.location + " \u00b7 " : "") +
          (form.mode === "PICK_UP" && form.day === "weekend" ? "Time by arrangement" : ticketTime));

    function startNewOrder() {
      haptic();
      setBag([]);
      setOrderRef(makeOrderRef(getKLNow()));
      closeDrawer();
      showToast("Started a new order");
    }

    return html`
      <div id="top">
        ${CONFIG.showPreviewBanner
          ? html`<div className="preview-strip"><b>Website preview</b><span>Some drink prices are TBC until the menu is final.</span></div>`
          : null}
        <${Daju.NavBar} className="nav-centered" bagCount=${bag.length} onBag=${function () { openDrawer("bag"); }} />
        <main>
          <${HeroSection} narrow=${narrow} heroRef=${heroRef} onCustomize=${function (d) { setCustomItem(d); openDrawer("custom"); }} />
          <${AssemblySection} narrow=${narrow} reduce=${reduceMotion} pinned=${pinned} layer=${layer} setLayer=${setLayer} progress=${progress} secRef=${secRef} stickRef=${stickRef} />
          <${MenuSection} narrow=${narrow} onCustomize=${function (d) { setCustomItem(d); openDrawer("custom"); }} />
          <${StudioSection}
            narrow=${narrow}
            studio=${studio}
            setCup=${updateCup}
            setQty=${updateQty}
            setMode=${updateStudioMode}
            setActive=${function (idx) { setStudio(function (p) { return Object.assign({}, p, { active: idx }); }); }}
            setDrink=${function (id) { setStudio(function (p) { return Object.assign({}, p, { drink: id }); }); }}
            burst=${burst}
            bagCount=${bag.length}
            onAdd=${function () {
              var cups = getStudioCups();
              var added = addCupsToBag(studioDrink, cups);
              if (added === cups.length) showToast(added === 1 ? "Added to your bag" : "Added " + added + " cups to your bag");
            }}
          />
          <${OrderSection}
            mode=${form.mode}
            saved=${saved}
            step=${orderStep}
            onChoose=${chooseStation}
            onBack=${function () {
              haptic();
              if (switchTimerRef.current) { clearTimeout(switchTimerRef.current); switchTimerRef.current = null; }
              scrollToStation(form.mode, 380);
              setOrderStep("pick");
            }}
            f=${form}
            setF=${patchForm}
            tried=${triedInline}
            errors=${errors}
            now=${now}
            activePopup=${nextPopup}
            onSave=${function () {
              setTriedInline(true);
              if (Object.keys(errors).length) { haptic(); return; }
              setSaved(true);
              setOrderStep("pick");
              setFlash(function (f) { return f + 1; });
              showToast("Details saved to your ticket");
              scrollToId("ticket", reduceMotion ? 30 : 340);
            }}
          />
          <${SignOffSection}
            order=${previewOrder}
            hasBag=${bag.length > 0}
            complete=${orderComplete}
            flash=${flash}
            studioQty=${studio.qty}
            toast=${showToast}
            onDetails=${function () { chooseStation(form.mode); }}
            onReview=${function () { openDrawer(orderComplete ? "ticket" : "bag"); }}
            onAddStudio=${function () {
              var added = addCupsToBag(studioDrink, getStudioCups());
              if (added > 0) openDrawer("bag");
            }}
            onCopy=${function () {
              copyText(
                formatWhatsAppTicket(previewOrder),
                function () { showToast("Ticket copied"); },
                function () { showToast("Copy is blocked here. Open your bag to select the text."); }
              );
            }}
          />
          <${PopupsSection}
            popups=${activePopups}
            now=${now}
            onPreorder=${function (popup) {
              haptic();
              patchForm({ mode: "PICK_UP", day: "weekend", popupPickup: true });
              showToast("Pickup set to " + popup.venue + " pop-up");
              scrollToId("studio", 30);
            }}
          />
        </main>
        <${Footer} />
        ${narrow ? html`<${TabBar} count=${bag.length} onBag=${function () { haptic(); openDrawer("bag"); }} />` : null}
        ${bag.length && narrow && !drawer
          ? html`<${Daju.CheckoutBar} className="is-entering" count=${bag.length} total=${formatSubtotal(bag)} slot=${checkoutSlot} onCheckout=${function () { openDrawer("bag"); }} />`
          : null}

        <${CustomDrawer}
          open=${drawer === "custom"}
          item=${customItem}
          side=${drawerSide}
          bagCount=${bag.length}
          onClose=${function () { closeDrawer(); }}
          onAdd=${function (drink, custom) {
            if (isClosingRef.current) return;
            var list = [];
            for (var i = 0; i < (custom.qty || 1); i++) list.push(custom);
            var added = addCupsToBag(drink, list);
            closeDrawer();
            if (added === list.length) showToast(added === 1 ? "Added to your bag" : "Added " + added + " cups to your bag");
          }}
        />
        <${BagDrawer}
          open=${drawer === "bag"}
          side=${drawerSide}
          items=${bag}
          onClose=${function () { closeDrawer(); }}
          onRemoveOne=${function (key) {
            haptic();
            setBag(function (prev) { return prev.filter(function (it) { return it.key !== key; }); });
          }}
          onAddOne=${function (grp) {
            var d = findDrink(grp.id);
            addCupsToBag(d, [{ ice: grp.ice, sweet: grp.sweet, name: grp.cupName, flair: grp.flair }]);
          }}
          onClear=${function () { haptic(); setBag([]); showToast("Bag cleared"); }}
          onBrowse=${function () {
            closeDrawer(function () {
              var el = document.getElementById("menu");
              if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
            });
          }}
          onNext=${function () { setTriedDrawer(false); openDrawer("fulfill"); }}
          ready=${detailsValid}
          saved=${saved}
          modeName=${MODE_NAMES[form.mode]}
          modeIcon=${{ PICK_UP: "bag", GRAB_EXPRESS: "scooter", COD: "car" }[form.mode]}
          slot=${ticketLoc + " \u00b7 " + ticketTime}
          onReview=${function () { haptic(); openDrawer("ticket"); }}
        />
        <${FulfillDrawer}
          open=${drawer === "fulfill"}
          side=${drawerSide}
          f=${form}
          setF=${patchForm}
          tried=${triedDrawer}
          errors=${errors}
          now=${now}
          activePopup=${nextPopup}
          onClose=${function () { closeDrawer(); }}
          onBack=${function () { openDrawer("bag"); }}
          onNext=${function () {
            setTriedDrawer(true);
            if (!Object.keys(errors).length) { setSaved(true); openDrawer("ticket"); }
          }}
        />
        <${TicketDrawer}
          open=${drawer === "ticket"}
          side=${drawerSide}
          order=${liveOrder}
          toast=${showToast}
          onClose=${function () { closeDrawer(); }}
          onBack=${function () { openDrawer("fulfill"); }}
          onNewOrder=${startNewOrder}
        />
        <${ToastRegion} msg=${toastMsg} out=${toastOut} />
      </div>
    `;
  }

  function ErrorBoundary(props) {
    React.Component.call(this, props);
    this.state = { hasError: false };
  }
  ErrorBoundary.prototype = Object.create(React.Component.prototype);
  ErrorBoundary.prototype.constructor = ErrorBoundary;
  ErrorBoundary.getDerivedStateFromError = function () { return { hasError: true }; };
  ErrorBoundary.prototype.render = function () {
    if (this.state.hasError) {
      return html`<div className="band" style=${{ textAlign: "center", paddingBlock: 64 }}>
        <div className="wrap" style=${{ maxWidth: 460 }}>
          <${Daju.Wordmark} size="md" />
          <h1 style=${{ marginTop: 24 }}>Something tripped up</h1>
          <p className="body muted">Refresh the page, or order directly with us on WhatsApp.</p>
          <div style=${{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
            <${Daju.Button} variant="primary" href=${"https://wa.me/" + CONFIG.whatsappNumber} target="_blank" rel="noopener noreferrer">Order on WhatsApp (${CONFIG.whatsappDisplay})<//>
            <${Daju.Button} variant="secondary" onClick=${function () { window.location.reload(); }}>Refresh page<//>
          </div>
        </div>
      </div>`;
    }
    return this.props.children;
  };

  var FLIP_SELECTORS =
    ".studio-form, .studio-add, .qty-row, .cup-tabs-wrap, .details-form, .dj-drawer-body, .drawer-stack, .bag-list, .dj-tk-meta, .dj-tk-items, .signoff-ticket, .btns, .dj-zones, .dj-fee, .dj-field, .dj-notice-body, .empty";
  var FLIP_EASE = "cubic-bezier(.2,.8,.2,1)";

  function initFlip() {
    var mql = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var rects = new WeakMap();
    var ready = false;
    var running = false;

    function collect() {
      var list = [];
      document.querySelectorAll(FLIP_SELECTORS).forEach(function (parent) {
        for (var i = 0; i < parent.children.length; i++) list.push([parent, parent.children[i]]);
      });
      return list;
    }

    function measure(parent, child) {
      var cr = child.getBoundingClientRect();
      var pr = parent.getBoundingClientRect();
      return { x: cr.left - pr.left + parent.scrollLeft, y: cr.top - pr.top + parent.scrollTop };
    }

    function isStickyOrFixed(el) {
      var pos = getComputedStyle(el).position;
      return pos === "sticky" || pos === "fixed";
    }

    function snapshot() {
      collect().forEach(function (pair) {
        if (pair[1].isConnected) rects.set(pair[1], { c: pair[0], r: measure(pair[0], pair[1]) });
      });
    }

    function runFlip() {
      if (running) return;
      running = true;
      var reduce = mql && mql.matches;
      collect().forEach(function (pair) {
        var parent = pair[0];
        var el = pair[1];
        if (el.offsetParent === null || isStickyOrFixed(el)) return;
        var prev = rects.get(el);
        if (el._flipIn) { rects.set(el, { c: parent, r: measure(parent, el) }); return; }
        var oldRect = prev && prev.c === parent ? prev.r : null;
        if (el._flip) { oldRect = measure(parent, el); el._flip.cancel(); el._flip = null; }
        var nextRect = measure(parent, el);
        if (!reduce && ready) {
          if (!oldRect) {
            if (!el.classList.contains("no-flip")) {
              var animIn = el.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 200, easing: FLIP_EASE });
              el._flipIn = animIn;
              animIn.onfinish = animIn.oncancel = function () { if (el._flipIn === animIn) el._flipIn = null; };
            }
          } else {
            var dx = oldRect.x - nextRect.x;
            var dy = oldRect.y - nextRect.y;
            if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
              var animMove = el.animate([{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }], { duration: Math.min(320, 180 + Math.hypot(dx, dy) * 0.4), easing: FLIP_EASE });
              el._flip = animMove;
              animMove.onfinish = animMove.oncancel = function () { if (el._flip === animMove) el._flip = null; };
            }
          }
        }
        rects.set(el, { c: parent, r: nextRect });
      });
      running = false;
    }

    var queued = false;
    var rootEl = document.getElementById("root");
    if (!rootEl) return;
    var mo = new MutationObserver(function () {
      if (!queued) {
        queued = true;
        Promise.resolve().then(function () { queued = false; runFlip(); });
      }
    });
    mo.observe(rootEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-pressed", "checked"] });

    var resizeTimer = null;
    window.addEventListener("resize", function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(snapshot, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(snapshot);
    setTimeout(function () { snapshot(); ready = true; }, 400);
  }

  var rootNode = document.getElementById("root");
  if (rootNode) {
    var root = window.ReactDOM.createRoot(rootNode);
    window.ReactDOM.flushSync(function () {
      root.render(html`<${ErrorBoundary}><${App} /><//>`);
    });
    document.documentElement.classList.remove("has-shell");
    if ("MutationObserver" in window && Element.prototype.animate) initFlip();
  }
})();
