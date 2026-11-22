(function () {
  function h() {
    var R = window.React;
    return R.createElement.apply(R, arguments);
  }
  function useState(init) {
    return window.React.useState(init);
  }
  function useEffect(fn, deps) {
    return window.React.useEffect(fn, deps);
  }
  function useRef(init) {
    return window.React.useRef(init);
  }
  function cx() {
    return Array.prototype.filter.call(arguments, Boolean).join(" ");
  }

  var idCounter = 0;
  function useUid(prefix) {
    var ref = useRef(null);
    if (ref.current === null) {
      ref.current = (prefix || "dj") + "-" + ++idCounter;
    }
    return ref.current;
  }

  function useControlled(val, defVal, onChange) {
    var state = useState(defVal);
    var inner = state[0];
    var setInner = state[1];
    var isControlled = val !== void 0;
    return [
      isControlled ? val : inner,
      function (next) {
        if (!isControlled) setInner(next);
        if (onChange) onChange(next);
      },
    ];
  }

  var schedule = {
    PICK_UP: {
      step: 1,
      title: "Pick Up",
      icon: "bag",
      weekday: {
        days: "Monday \u2013 Friday",
        location: "Centre Point",
        time: "12:30 PM \u2013 1:25 PM",
      },
      weekend: {
        days: "Saturday \u2013 Sunday",
        location: "Maang Apartment",
        time: "Time by arrangement",
      },
    },
    GRAB_EXPRESS: {
      step: 2,
      title: "Grab Express",
      icon: "scooter",
      note: "*Delivery fee is borne by customer.",
      weekday: {
        days: "Monday \u2013 Friday",
        label: "Pickup starts",
        time: "12:30 PM \u2013 1:25 PM",
      },
      weekend: {
        days: "Saturday \u2013 Sunday",
        label: "Pickup starts",
        time: "9:00 AM \u2013 4:00 PM",
      },
    },
    COD: {
      step: 3,
      title: "COD",
      icon: "car",
      weekday: {
        days: "Monday \u2013 Friday",
        time: "After 6:30 PM",
        area: "KK | Penampang | Putatan | Kepayan",
      },
      weekend: {
        days: "Saturday \u2013 Sunday",
        time: "Based on order & availability",
        area: "KK | Penampang | Putatan | Kepayan",
      },
    },
  };

  var codZones = ["KK", "Penampang", "Putatan", "Kepayan"];

  var icons = {
    bag: [
      ["path", { d: "M12 18h24l-2.5 22h-19z" }],
      ["path", { d: "M18 18v-3a6 6 0 0 1 12 0v3" }],
    ],
    scooter: [
      ["circle", { cx: 13, cy: 35, r: 5 }],
      ["circle", { cx: 36, cy: 35, r: 5 }],
      ["path", { d: "M8 30c0-4 3.5-7 8-7h5l3 8h7" }],
      ["path", { d: "M33 33l-5-17h6" }],
      ["path", { d: "M13 19h8" }],
    ],
    car: [
      ["path", { d: "M7 32v-6c0-1.6 1-3 2.6-3.6L13.5 16h21l3.9 6.4C40 23 41 24.4 41 26v6z" }],
      ["path", { d: "M16 18.5l-2 4h20l-2-4z" }],
      ["circle", { cx: 15, cy: 32, r: 3.5 }],
      ["circle", { cx: 33, cy: 32, r: 3.5 }],
    ],
    pin: [
      ["path", { d: "M24 42s-12-10.5-12-20a12 12 0 0 1 24 0c0 9.5-12 20-12 20z" }],
      ["circle", { cx: 24, cy: 22, r: 4 }],
    ],
    clock: [
      ["circle", { cx: 24, cy: 24, r: 16 }],
      ["path", { d: "M24 14v10l7 4" }],
    ],
    sprig: [
      ["path", { d: "M24 38V18" }],
      ["path", { d: "M24 27c-5 0-8-3-8-8 5 0 8 3 8 8z" }],
      ["path", { d: "M24 27c5 0 8-3 8-8-5 0-8 3-8 8z" }],
      ["path", { d: "M8 30h10M30 30h10" }],
    ],
    whisk: [
      ["path", { d: "M24 4v13" }],
      ["path", { d: "M17 17h14" }],
      ["path", { d: "M18.5 17c-3.5 8-4.5 16-3.5 24" }],
      ["path", { d: "M22 17c-1 8-1.2 16-.4 24" }],
      ["path", { d: "M26 17c1 8 1.2 16 .4 24" }],
      ["path", { d: "M29.5 17c3.5 8 4.5 16 3.5 24" }],
      ["path", { d: "M15 41c6 2.2 12 2.2 18 0" }],
    ],
    sparkle: [
      ["path", { d: "M22 6c1 10 4 14 14 17-10 3-13 7-14 17-1-10-4-14-14-17 10-3 13-7 14-17z" }],
      ["path", { d: "M39 6v8M35 10h8" }],
    ],
    bubble: [
      ["path", { d: "M24 8c10 0 18 6.3 18 14s-8 14-18 14c-2.2 0-4.2-.3-6.1-.8L9 40l2.6-7.4C7.9 30 6 26.2 6 22 6 14.3 14 8 24 8z" }],
    ],
    arrow: [
      ["path", { d: "M7 35c8-14 19-19 32-15" }],
      ["path", { d: "M32 14l7.5 6-6 7" }],
    ],
    route: [
      ["path", { d: "M6 42c12 0 7-18 18-18s6-18 18-18", strokeDasharray: "1 6" }],
    ],
    butterfly: [
      ["path", { d: "M24 17v19" }],
      ["path", { d: "M24 21c-4-8.5-15-11-15-2.5 0 5.5 6.5 7.5 15 4.5z" }],
      ["path", { d: "M24 21c4-8.5 15-11 15-2.5 0 5.5-6.5 7.5-15 4.5z" }],
      ["path", { d: "M24 27c-3.5 1.5-10.5 4-9.5 9 .8 4 7 2.5 9.5-5z" }],
      ["path", { d: "M24 27c3.5 1.5 10.5 4 9.5 9-.8 4-7 2.5-9.5-5z" }],
      ["path", { d: "M24 17l-3.5-6M24 17l3.5-6" }],
    ],
    bow: [
      ["path", { d: "M24 21c-6-6.5-15-8.5-15-2s9 6.5 15 2z" }],
      ["path", { d: "M24 21c6-6.5 15-8.5 15-2s-9 6.5-15 2z" }],
      ["circle", { cx: 24, cy: 21, r: 2.6 }],
      ["path", { d: "M22.5 23.5L16 41M25.5 23.5L32 41" }],
    ],
    daisy: [
      ["circle", { cx: 24, cy: 24, r: 4 }],
      ["ellipse", { cx: 24, cy: 13, rx: 4, ry: 6.5, transform: "rotate(0 24 24)" }],
      ["ellipse", { cx: 24, cy: 13, rx: 4, ry: 6.5, transform: "rotate(60 24 24)" }],
      ["ellipse", { cx: 24, cy: 13, rx: 4, ry: 6.5, transform: "rotate(120 24 24)" }],
      ["ellipse", { cx: 24, cy: 13, rx: 4, ry: 6.5, transform: "rotate(180 24 24)" }],
      ["ellipse", { cx: 24, cy: 13, rx: 4, ry: 6.5, transform: "rotate(240 24 24)" }],
      ["ellipse", { cx: 24, cy: 13, rx: 4, ry: 6.5, transform: "rotate(300 24 24)" }],
    ],
  };

  function Doodle(props) {
    var shapes = icons[props.name || "sparkle"];
    if (!shapes) return null;
    var size = props.size || 24;
    return h(
      "svg",
      {
        className: cx("dj-doodle", props.className),
        width: size,
        height: size,
        viewBox: "0 0 48 48",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: props.strokeWidth || 2.25,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        style: props.style,
        role: props.label ? "img" : void 0,
        "aria-label": props.label,
        "aria-hidden": props.label ? void 0 : true,
        focusable: "false",
      },
      shapes.map(function (s, idx) {
        return h(s[0], Object.assign({ key: idx }, s[1]));
      })
    );
  }

  function Wordmark(props) {
    var size = props.size || "md";
    var showSub = props.sub === true;
    return h(
      "span",
      {
        className: cx("dj-wordmark", "dj-wordmark-" + size, props.className),
        role: "img",
        "aria-label": showSub ? "DA JU Matcha" : "DA JU",
      },
      h(
        "span",
        { className: "dj-wm-main", "aria-hidden": true },
        "DA",
        h("span", { className: "dj-wm-bar" }),
        "JU"
      ),
      showSub
        ? h("span", { className: "dj-wm-sub", "aria-hidden": true }, "Matcha")
        : null
    );
  }

  function StickerHeadline(props) {
    var Tag = props.as || "h2";
    return h(
      Tag,
      {
        className: cx("dj-sticker", "dj-sticker-" + (props.size || "lg"), props.className),
        style: props.style,
      },
      props.children
    );
  }

  function SpeechBubble(props) {
    var size = props.size || 156;
    return h(
      "div",
      { className: cx("dj-bubble", props.className), style: { width: size, height: size } },
      h(Doodle, { name: "bubble", size: size, strokeWidth: 1.6, className: "dj-bubble-line" }),
      h(
        "span",
        {
          className: "dj-bubble-text",
          style: {
            fontSize: Math.round(size * 0.145),
            transform: "rotate(" + (props.tilt == null ? -14 : props.tilt) + "deg)",
          },
        },
        props.children
      )
    );
  }

  function Stamp(props) {
    return h(
      "span",
      {
        className: cx("dj-stamp", "dj-stamp-" + (props.tone || "alert"), props.className),
        style: { transform: "rotate(" + (props.rotate == null ? -8 : props.rotate) + "deg)" },
      },
      h("span", { className: "dj-stamp-inner" }, props.children)
    );
  }

  function StatusPill(props) {
    var state = props.state || "open";
    return h(
      "span",
      { className: cx("dj-status", "dj-status-" + state, props.className), role: "status" },
      h("span", { className: "dj-status-dot", "aria-hidden": true }),
      h("span", { className: "dj-status-label" }, props.label),
      props.time ? h("span", { className: "dj-status-time" }, props.time) : null
    );
  }

  function NavBar(props) {
    var links = props.links || [
      { label: "Weekly Drop", href: "#drop" },
      { label: "Menu", href: "#menu" },
      { label: "Build Cup", href: "#studio" },
      { label: "Order", href: "#order" },
      { label: "Pop-ups", href: "#popups" },
    ];
    var count = props.bagCount || 0;
    return h(
      "header",
      { className: cx("dj-nav", props.className) },
      h(
        "a",
        { className: "dj-nav-brand", href: props.homeHref || "#top" },
        h(Wordmark, { size: "sm" })
      ),
      props.status ? h("div", { className: "dj-nav-status" }, h(StatusPill, props.status)) : h("span"),
      h(
        "nav",
        { className: "dj-nav-right", "aria-label": "Sections" },
        h(
          "ul",
          { className: "dj-nav-links" },
          links.map(function (lnk) {
            return h("li", { key: lnk.label }, h("a", { href: lnk.href }, lnk.label));
          })
        ),
        h(
          "button",
          {
            type: "button",
            className: "dj-bag",
            onClick: props.onBag,
            "aria-label": "Order bag, " + count + (count === 1 ? " item" : " items"),
          },
          h(Doodle, { name: "bag", size: 22 }),
          h("span", { className: "dj-bag-count" }, count)
        )
      )
    );
  }

  function Button(props) {
    var rest = Object.assign({}, props);
    ["variant", "size", "icon", "className", "children", "block"].forEach(function (k) {
      delete rest[k];
    });
    var Tag = props.href ? "a" : "button";
    if (!props.href && !rest.type) rest.type = "button";
    return h(
      Tag,
      Object.assign(rest, {
        className: cx(
          "dj-btn",
          "dj-btn-" + (props.variant || "primary"),
          "dj-btn-" + (props.size || "md"),
          props.block && "dj-btn-block",
          props.className
        ),
      }),
      props.icon ? h(Doodle, { name: props.icon, size: props.size === "lg" ? 22 : 18 }) : null,
      h("span", null, props.children)
    );
  }

  function CheckoutBar(props) {
    var count = props.count || 0;
    return h(
      "div",
      {
        className: cx("dj-checkout", props.inline && "dj-checkout-inline", props.className),
        role: "region",
        "aria-label": "Checkout",
      },
      h(
        "div",
        { className: "dj-checkout-info" },
        h(
          "span",
          { className: "dj-checkout-count" },
          h(Doodle, { name: "bag", size: 20 }),
          count + (count === 1 ? " cup" : " cups"),
          h("b", null, props.total)
        ),
        props.slot ? h("span", { className: "dj-checkout-slot" }, props.slot) : null
      ),
      h(Button, { variant: "primary", onClick: props.onCheckout }, props.cta || "Review order")
    );
  }

  function ChoicePills(props) {
    var groupName = useUid("pills");
    var options = (props.options || []).map(function (opt) {
      return typeof opt === "string" ? { value: opt, label: opt } : opt;
    });
    var state = useControlled(
      props.value,
      props.defaultValue !== void 0 ? props.defaultValue : options[0] && options[0].value,
      props.onChange
    );
    var active = state[0];
    var setActive = state[1];

    return h(
      "fieldset",
      { className: cx("dj-pills", "dj-pills-" + (props.variant || "pills"), props.className) },
      props.label ? h("legend", { className: "dj-field-label" }, props.label) : null,
      h(
        "div",
        { className: "dj-pills-row" },
        options.map(function (opt) {
          var isOn = opt.value === active;
          return h(
            "label",
            {
              key: opt.value,
              className: cx("dj-pill", isOn && "is-on", opt.disabled && "is-disabled"),
            },
            h("input", {
              type: "radio",
              name: groupName,
              value: opt.value,
              checked: isOn,
              disabled: opt.disabled,
              onChange: function () {
                if (!opt.disabled) setActive(opt.value);
              },
            }),
            opt.icon ? h(Doodle, { name: opt.icon, size: 18 }) : null,
            h("span", null, opt.label),
            opt.hint ? h("small", null, opt.hint) : null
          );
        })
      )
    );
  }

  function TextField(props) {
    var fieldId = useUid("field");
    var hintId = fieldId + "-hint";
    var Tag = props.multiline ? "textarea" : "input";
    var inputProps = {
      id: fieldId,
      className: "dj-input",
      value: props.value,
      defaultValue: props.defaultValue,
      placeholder: props.placeholder,
      required: props.required,
      maxLength: props.maxLength,
      onChange: props.onChange,
      "aria-invalid": props.error ? true : void 0,
      "aria-describedby": props.error || props.hint ? hintId : void 0,
      inputMode: props.inputMode,
      autoComplete: props.autoComplete,
    };
    if (props.multiline) {
      inputProps.rows = props.rows || 3;
    } else {
      inputProps.type = props.type || "text";
    }
    return h(
      "div",
      { className: cx("dj-field", props.error && "is-invalid", props.className) },
      h(
        "label",
        { className: "dj-field-label", htmlFor: fieldId },
        props.label,
        props.required ? h("span", { className: "dj-req", "aria-hidden": true }, " *") : null
      ),
      h(Tag, inputProps),
      props.error
        ? h("p", { id: hintId, className: "dj-field-error" }, h(Doodle, { name: "sparkle", size: 16 }), props.error)
        : props.hint
        ? h("p", { id: hintId, className: "dj-field-hint" }, props.hint)
        : null
    );
  }

  function Notice(props) {
    var tone = props.tone || "info";
    var defaultIcons = { info: "sparkle", alert: "sparkle", availability: "clock", success: "sparkle" };
    return h(
      "div",
      {
        className: cx("dj-notice", "dj-notice-" + tone, props.className),
        role: tone === "alert" ? "alert" : "status",
      },
      h("span", { className: "dj-notice-icon" }, h(Doodle, { name: props.icon || defaultIcons[tone], size: 22 })),
      h(
        "div",
        { className: "dj-notice-body" },
        props.title ? h("p", { className: "dj-notice-title" }, props.title) : null,
        h("div", { className: "dj-notice-text" }, props.children),
        props.action ? h("div", { className: "dj-notice-action" }, props.action) : null
      )
    );
  }

  function FeeAck(props) {
    var state = useControlled(props.checked, !!props.defaultChecked, props.onChange);
    var checked = state[0];
    var setChecked = state[1];
    var feeId = useUid("fee");
    var errId = feeId + "-err";
    var hasErr = !!(props.error && !checked);

    return h(
      "div",
      { className: cx("dj-fee", hasErr && "is-invalid", props.className) },
      h("p", { className: "dj-fee-note" }, "*Delivery fee is borne by customer."),
      h(
        "label",
        { className: "dj-check", htmlFor: feeId },
        h("input", {
          id: feeId,
          type: "checkbox",
          checked: checked,
          onChange: function (ev) {
            setChecked(ev.target.checked);
          },
          "aria-invalid": hasErr ? true : void 0,
          "aria-describedby": hasErr ? errId : void 0,
        }),
        h(
          "span",
          { className: "dj-check-box", "aria-hidden": true },
          h(
            "svg",
            { viewBox: "0 0 16 16", width: 14, height: 14 },
            h("path", {
              d: "M3 8.5l3.2 3L13 4.5",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: 2.4,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            })
          )
        ),
        h("span", null, "I understand that the Grab Express delivery fee is borne by the customer.")
      ),
      hasErr
        ? h(
            "p",
            { id: errId, className: "dj-field-error" },
            h(Doodle, { name: "sparkle", size: 16 }),
            "Please tick this to send a Grab Express order."
          )
        : null
    );
  }

  function ZonePicker(props) {
    var state = useControlled(props.value, props.defaultValue !== void 0 ? props.defaultValue : null, props.onChange);
    var val = state[0];
    var setVal = state[1];
    var opts = codZones
      .map(function (z) {
        return { value: z, label: z };
      })
      .concat([{ value: "OTHER", label: "Somewhere else" }]);

    return h(
      "div",
      { className: cx("dj-zones", props.className) },
      h(ChoicePills, {
        label: props.label || "COD delivery area",
        options: opts,
        value: val === void 0 ? null : val,
        onChange: setVal,
      }),
      val === "OTHER"
        ? h(
            Notice,
            {
              tone: "alert",
              title: "COD covers four areas only",
              action: h(
                Button,
                { variant: "secondary", size: "md", icon: "scooter", onClick: props.onSwitchToGrab },
                "Switch to Grab Express"
              ),
            },
            "We deliver cash-on-delivery to KK, Penampang, Putatan and Kepayan. Grab Express can reach you anywhere else."
          )
        : null
    );
  }

  function CupPreview(props) {
    var layers = props.layers == null ? 5 : props.layers;
    var charm = props.charm || "butterfly";
    var rawName = props.name == null ? "DA JU" : String(props.name);
    var label = rawName.slice(0, 14).trim();
    var words = label ? label.split(/\s+/) : [];
    var lines =
      label.length > 4 && words.length > 1
        ? [
            words.slice(0, Math.ceil(words.length / 2)).join(" "),
            words.slice(Math.ceil(words.length / 2)).join(" "),
          ]
        : label
        ? [label]
        : [];
    var maxChars = lines.length
      ? Math.max.apply(
          null,
          lines.map(function (ln) {
            return ln.length || 1;
          })
        )
      : 1;
    // Lower min clamp to 12px and clip inside glass so wide strings (e.g. WWWWWWWWWWWW) never bleed out
    var fontSize = Math.max(12, Math.min(40, 108 / (0.72 * maxChars)));
    var clipId = useUid("cup");
    var cupPath = "M34 52 L54 246 Q100 254 146 246 L166 52 Z";

    var isDecorative = props.alt === "";
    var ariaLabel = isDecorative
      ? void 0
      : props.alt ||
        "Illustrated iced matcha cup" +
          (label ? ' with "' + label + '" written on it' : "") +
          (charm !== "none"
            ? ", decorated with " +
              (charm === "ribbon"
                ? "a pink ribbon"
                : charm === "both"
                ? "a ribbon and butterfly charms"
                : "butterfly charms")
            : "");

    function renderFly(x, y, rot, cls, key) {
      return h(
        "g",
        {
          key: key,
          transform: "translate(" + x + " " + y + ") rotate(" + rot + ") scale(.42)",
          className: "dj-cup-fly " + cls,
        },
        h("path", {
          d: "M0 -2c-4-8.5-15-11-15-2.5 0 5.5 6.5 7.5 15 4.5z M0 -2c4-8.5 15-11 15-2.5 0 5.5-6.5 7.5-15 4.5z M0 4c-3.5 1.5-10.5 4-9.5 9 .8 4 7 2.5 9.5-5z M0 4c3.5 1.5 10.5 4 9.5 9-.8 4-7 2.5-9.5-5z",
        }),
        h("path", { d: "M0 -6v18", className: "dj-cup-fly-body" })
      );
    }

    return h(
      "figure",
      { className: cx("dj-cup", props.className), style: { width: props.width || 220 } },
      h(
        "svg",
        {
          viewBox: "0 0 200 270",
          role: isDecorative ? void 0 : "img",
          "aria-label": ariaLabel,
          "aria-hidden": isDecorative ? true : void 0,
          focusable: "false",
        },
        h("defs", null, h("clipPath", { id: clipId }, h("path", { d: cupPath }))),
        h(
          "g",
          { clipPath: "url(#" + clipId + ")" },
          h("rect", { className: "dj-cup-clear", x: 0, y: 40, width: 200, height: 232 }),
          layers >= 3
            ? h(
                window.React.Fragment,
                null,
                h("rect", { className: "dj-cup-milk", x: 0, y: 92, width: 200, height: 180 }),
                h("path", {
                  className: "dj-cup-matcha",
                  d: "M0 140 C40 118 70 160 110 138 S170 120 200 132 V272 H0 Z",
                }),
                h("path", {
                  className: "dj-cup-swirl",
                  d: "M58 150 C80 140 96 168 124 150 M70 196 C92 184 112 210 140 192",
                })
              )
            : null,
          layers >= 4
            ? h("path", {
                className: "dj-cup-foam",
                d: "M0 50 H200 V96 C186 104 172 92 158 100 S130 92 116 100 S88 92 74 100 S46 92 32 100 S8 94 0 98 Z",
              })
            : null,
          layers >= 2
            ? h(
                "g",
                { className: "dj-cup-ice" },
                h("rect", { x: 52, y: 60, width: 30, height: 28, rx: 7, transform: "rotate(-12 67 74)" }),
                h("rect", { x: 92, y: 56, width: 30, height: 28, rx: 7, transform: "rotate(8 107 70)" }),
                h("rect", { x: 128, y: 64, width: 26, height: 24, rx: 6, transform: "rotate(-6 141 76)" }),
                h("rect", {
                  x: 74,
                  y: 98,
                  width: 26,
                  height: 24,
                  rx: 6,
                  transform: "rotate(14 87 110)",
                  className: "dj-cup-ice-low",
                })
              )
            : null,
          lines.length
            ? h(
                "text",
                {
                  className: "dj-cup-name",
                  x: 100,
                  y: lines.length > 1 ? 172 : 190,
                  textAnchor: "middle",
                  fontSize: fontSize,
                  transform: "rotate(-5 100 180)",
                },
                lines.map(function (ln, idx) {
                  return h("tspan", { key: idx, x: 100, dy: idx ? fontSize * 1.05 : 0 }, ln);
                })
              )
            : null
        ),
        h("path", { className: "dj-cup-glass", d: cupPath }),
        h("ellipse", { className: "dj-cup-rim", cx: 100, cy: 52, rx: 68, ry: 7 }),
        layers >= 5 && (charm === "ribbon" || charm === "both")
          ? h(
              "g",
              { className: "dj-cup-bow", transform: "translate(100 118)" },
              h("path", {
                d: "M0 0c-10-11-27-14-27-3s17 11 27 3z M0 0c10-11 27-14 27-3s-17 11-27 3z",
              }),
              h("path", { className: "dj-cup-bow-tail", d: "M-2 3l-12 34 M2 3l12 34" }),
              h("circle", { r: 4.5 })
            )
          : null,
        layers >= 5 && (charm === "butterfly" || charm === "both")
          ? h(
              "g",
              null,
              renderFly(52, 128, -18, "is-ribbon", 1),
              renderFly(146, 112, 14, "is-seasalt", 2),
              renderFly(140, 210, -10, "is-doodle", 3),
              renderFly(64, 222, 12, "is-seasalt", 4),
              renderFly(104, 236, 0, "is-ribbon", 5)
            )
          : null
      ),
      props.caption ? h("figcaption", { className: "dj-cup-caption" }, props.caption) : null
    );
  }

  function ProductCard(props) {
    var status = props.status || "available";
    var isSoldOut = status === "soldout";
    var flipState = useState(false);
    var showPhoto = flipState[0];
    var setShowPhoto = flipState[1];
    var errState = useState(false);
    var imgBroken = errState[0];
    var setImgBroken = errState[1];

    useEffect(
      function () {
        setImgBroken(false);
        setShowPhoto(false);
      },
      [props.image]
    );

    var hasPhoto = !!(props.image && !imgBroken);
    var canFlip = !!(hasPhoto && props.art !== null);

    return h(
      "article",
      {
        className: cx("dj-card", isSoldOut && "is-soldout", props.className),
        style: props.tilt ? { "--dj-tilt": props.tilt + "deg" } : null,
      },
      h(
        "div",
        { className: cx("dj-card-media", showPhoto && hasPhoto && "show-photo") },
        h(
          "div",
          { className: "dj-card-art" },
          props.art !== void 0 ? props.art : h(CupPreview, { width: 150, name: "DA JU", charm: "butterfly" })
        ),
        hasPhoto
          ? h("img", {
              className: "dj-card-photo",
              src: props.image,
              alt: props.imageAlt || "Photo of " + props.name,
              loading: "lazy",
              onError: function () {
                setImgBroken(true);
                setShowPhoto(false);
              },
            })
          : null,
        canFlip
          ? h(
              "button",
              {
                type: "button",
                className: "dj-card-flip",
                "aria-pressed": showPhoto,
                onClick: function () {
                  setShowPhoto(!showPhoto);
                },
              },
              showPhoto ? "See the art" : "See the real cup"
            )
          : null,
        status === "weekly"
          ? h(Stamp, { tone: "seasalt", rotate: 6, className: "dj-card-stamp" }, "Matcha of the Week")
          : null,
        isSoldOut
          ? h(Stamp, { tone: "alert", className: "dj-card-stamp dj-card-stamp-big" }, "Sold out for today")
          : null
      ),
      h(
        "div",
        { className: "dj-card-body" },
        h("p", { className: "dj-card-cat" }, props.category || "Matcha"),
        h(
          "h3",
          { className: "dj-card-title" },
          props.flavor ? h("span", { className: "dj-card-script", "aria-hidden": true }, props.flavor) : null,
          h("span", { className: props.flavor ? "dj-card-name" : "dj-card-name dj-card-name-lg" }, props.name)
        ),
        props.note ? h("p", { className: "dj-card-note" }, props.note) : null,
        h(
          "div",
          { className: "dj-card-foot" },
          h("span", { className: "dj-card-price" }, props.price),
          h(
            Button,
            {
              variant: "sticker",
              icon: isSoldOut ? null : "sparkle",
              disabled: isSoldOut,
              onClick: props.onAdd,
            },
            isSoldOut ? "Sold out" : props.cta || "Customize & add"
          )
        ),
        isSoldOut && props.suggestion ? h("p", { className: "dj-card-suggest" }, props.suggestion) : null
      )
    );
  }

  function ChannelCard(props) {
    var chanKey = props.channel || "PICK_UP";
    var data = schedule[chanKey];

    function renderCol(dayKey) {
      var col = data[dayKey];
      var isActive = props.active === dayKey;
      return h(
        "div",
        { className: cx("dj-chan-col", isActive && "is-active") },
        h("span", { className: "dj-chan-badge" }, dayKey === "weekday" ? "Weekdays" : "Weekend"),
        h("p", { className: "dj-chan-days" }, col.days),
        col.location ? h("p", { className: "dj-chan-line" }, h(Doodle, { name: "pin", size: 16 }), col.location) : null,
        col.label ? h("p", { className: "dj-chan-sub" }, col.label) : null,
        h("p", { className: "dj-chan-time" }, col.time),
        col.area ? h("p", { className: "dj-chan-sub" }, "Cover area: " + col.area) : null
      );
    }

    return h(
      "section",
      { className: cx("dj-chan", props.selected && "is-selected", props.className), "aria-label": data.title },
      h(
        "div",
        { className: "dj-chan-head" },
        h("span", { className: "dj-chan-step" }, data.step),
        h("span", { className: "dj-chan-icon" }, h(Doodle, { name: data.icon, size: 34 })),
        h("h3", { className: "dj-chan-title" }, data.title)
      ),
      h("div", { className: "dj-chan-cols" }, renderCol("weekday"), renderCol("weekend")),
      data.note ? h("p", { className: "dj-chan-note" }, data.note) : null
    );
  }

  var modeLabels = { PICK_UP: "Pick Up", GRAB_EXPRESS: "Grab Express", COD: "COD" };
  var schedLabels = { WEEKDAY: "Weekday", WEEKEND: "Weekend" };

  function OrderTicket(props) {
    function row(label, val) {
      return val
        ? h("div", { className: "dj-tk-row", key: label }, h("dt", null, label), h("dd", null, val))
        : null;
    }

    return h(
      "article",
      { className: cx("dj-ticket", props.className), "aria-label": "Order ticket " + (props.orderRef || "") },
      h(
        "header",
        { className: "dj-tk-head" },
        h(Wordmark, { size: "sm" }),
        h("p", { className: "dj-tk-motto" }, "Freshly Made. Made For You."),
        props.orderRef ? h("p", { className: "dj-tk-ref" }, "Ref " + props.orderRef) : null
      ),
      h(
        "dl",
        { className: "dj-tk-meta" },
        row("Customer", props.customer && props.customer + (props.phone ? " \u00b7 " + props.phone : "")),
        row(
          "Mode",
          props.mode &&
            (modeLabels[props.mode] || props.mode) + " \u2014 " + (schedLabels[props.schedule] || props.schedule || "")
        ),
        row("Where", props.location),
        row("When", props.time),
        row("Notes", props.address)
      ),
      h(
        "ul",
        { className: "dj-tk-items" },
        (props.items || []).map(function (it, idx) {
          return h(
            "li",
            { key: idx },
            h(
              "div",
              { className: "dj-tk-item" },
              h("span", null, (it.qty || 1) + "\u00d7 " + it.name),
              it.price ? h("span", null, it.price) : null
            ),
            h(
              "p",
              { className: "dj-tk-mods" },
              "Ice " +
                (it.ice || "Normal") +
                " \u00b7 Sweetness " +
                (it.sweetness || "Normal") +
                (it.flair ? " \u00b7 " + it.flair : "")
            ),
            it.cupName ? h("p", { className: "dj-tk-cupname" }, it.cupName) : null
          );
        })
      ),
      props.mode === "GRAB_EXPRESS"
        ? h(
            "p",
            { className: cx("dj-tk-policy", !props.feeAck && "is-missing") },
            props.feeAck
              ? "Grab Express fee borne by customer \u2014 acknowledged"
              : "Grab Express fee not acknowledged"
          )
        : null,
      h("div", { className: "dj-tk-total" }, h("span", null, "Estimated subtotal"), h("b", null, props.subtotal)),
      props.mode === "GRAB_EXPRESS"
        ? h("p", { className: "dj-tk-fine" }, "Excl. any Grab Express fee")
        : null,
      props.actions ? h("div", { className: "dj-tk-actions" }, props.actions) : null
    );
  }

  function Drawer(props) {
    var panelRef = useRef(null);
    var closeRef = useRef(props.onClose);
    var prevFocusRef = useRef(null);
    var scrimDownRef = useRef(false);

    closeRef.current = props.onClose;

    useEffect(
      function () {
        if (!props.open || props.inline) return;

        prevFocusRef.current = document.activeElement;
        var panel = panelRef.current;
        var focusableSel =
          'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

        if (panel) {
          var first = panel.querySelector(focusableSel);
          if (first) first.focus();
        }

        function onKeyDown(ev) {
          if (ev.key === "Escape") {
            if (closeRef.current) closeRef.current();
            return;
          }
          if (ev.key === "Tab" && panel) {
            var nodes = Array.prototype.filter.call(panel.querySelectorAll(focusableSel), function (el) {
              return el.offsetParent !== null;
            });
            if (!nodes.length) return;
            var firstEl = nodes[0];
            var lastEl = nodes[nodes.length - 1];
            if (ev.shiftKey) {
              if (document.activeElement === firstEl || !panel.contains(document.activeElement)) {
                ev.preventDefault();
                lastEl.focus();
              }
            } else {
              if (document.activeElement === lastEl || !panel.contains(document.activeElement)) {
                ev.preventDefault();
                firstEl.focus();
              }
            }
          }
        }

        document.addEventListener("keydown", onKeyDown);
        return function () {
          document.removeEventListener("keydown", onKeyDown);
          var prev = prevFocusRef.current;
          prevFocusRef.current = null;
          if (prev && typeof prev.focus === "function" && prev.isConnected) {
            try {
              prev.focus({ preventScroll: true });
            } catch (err) {
              prev.focus();
            }
          }
        };
      },
      [props.open, props.inline]
    );

    if (!props.open && !props.inline) return null;

    var side = props.side || "right";
    var panel = h(
      "div",
      {
        ref: panelRef,
        className: cx("dj-drawer", "dj-drawer-" + side, props.inline && "dj-drawer-inline", props.className),
        role: "dialog",
        "aria-modal": props.inline ? void 0 : true,
        "aria-label": props.title,
      },
      h(
        "div",
        { className: "dj-drawer-head" },
        props.step ? h("p", { className: "dj-drawer-step" }, props.step) : null,
        h("h2", { className: "dj-drawer-title" }, props.title),
        h(
          "button",
          {
            type: "button",
            className: "dj-drawer-close",
            onClick: props.onClose,
            "aria-label": "Close",
          },
          h(
            "svg",
            { viewBox: "0 0 24 24", width: 20, height: 20, "aria-hidden": true },
            h("path", {
              d: "M6 6l12 12M18 6L6 18",
              stroke: "currentColor",
              strokeWidth: 2.2,
              strokeLinecap: "round",
            })
          )
        )
      ),
      h("div", { className: "dj-drawer-body" }, props.children),
      props.footer ? h("div", { className: "dj-drawer-foot" }, props.footer) : null
    );

    if (props.inline) return panel;

    return h(
      "div",
      {
        className: cx("dj-drawer-scrim", side === "bottom" && "dj-drawer-scrim-bottom"),
        onPointerDown: function (ev) {
          scrimDownRef.current = ev.target === ev.currentTarget;
        },
        onMouseDown: function (ev) {
          scrimDownRef.current = ev.target === ev.currentTarget;
        },
        onClick: function (ev) {
          if (scrimDownRef.current && ev.target === ev.currentTarget && props.onClose) {
            props.onClose();
          }
          scrimDownRef.current = false;
        },
      },
      panel
    );
  }

  window.Daju = Object.assign(window.Daju || {}, {
    Wordmark: Wordmark,
    StickerHeadline: StickerHeadline,
    SpeechBubble: SpeechBubble,
    Doodle: Doodle,
    Stamp: Stamp,
    NavBar: NavBar,
    StatusPill: StatusPill,
    CheckoutBar: CheckoutBar,
    Button: Button,
    ChoicePills: ChoicePills,
    TextField: TextField,
    FeeAck: FeeAck,
    ZonePicker: ZonePicker,
    ProductCard: ProductCard,
    CupPreview: CupPreview,
    ChannelCard: ChannelCard,
    Notice: Notice,
    OrderTicket: OrderTicket,
    Drawer: Drawer,
    schedule: schedule,
    codZones: codZones,
    icons: Object.keys(icons),
  });
})();
