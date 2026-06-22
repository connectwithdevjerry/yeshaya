/* Yashayah AI — embeddable chat widget loader.
 * Usage:
 *   <script src="https://<api-host>/embed/widget.js" data-widget-id="wgt_xxx" async></script>
 * Self-contained, no dependencies, style-isolated via Shadow DOM.
 */
(function () {
  var script =
    document.currentScript ||
    (function () {
      var s = document.getElementsByTagName("script");
      return s[s.length - 1];
    })();

  var widgetId = script.getAttribute("data-widget-id");
  if (!widgetId) {
    console.error("[Yashayah widget] missing data-widget-id");
    return;
  }
  // Derive API base from this script's own URL (".../embed/widget.js")
  var apiBase = script.src.replace(/\/embed\/widget\.js.*$/, "");
  var STORAGE_KEY = "yw_history_" + widgetId;

  var cfg = null;
  var open = false;
  var sending = false;
  var messages = [];
  try {
    messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (e) {
    messages = [];
  }

  fetch(apiBase + "/embed/" + widgetId + "/config")
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d && d.status && d.config) {
        cfg = d.config;
        init();
      } else {
        console.error("[Yashayah widget] config unavailable");
      }
    })
    .catch(function (e) { console.error("[Yashayah widget] config load failed", e); });

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50))); } catch (e) {}
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function init() {
    var theme = cfg.theme || {};
    var color = theme.primaryColor || "#6366f1";
    var pos = theme.position === "bottom-left" ? "left" : "right";
    var title = theme.title || cfg.name || "Chat";
    var greeting = theme.greeting || "Hi! How can I help you today?";
    var launcher = theme.launcherText || "";

    var host = document.createElement("div");
    host.setAttribute("id", "yashayah-widget-host");
    document.body.appendChild(host);
    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

    var style = document.createElement("style");
    style.textContent =
      ":host{all:initial}" +
      "*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}" +
      ".yw-launcher{position:fixed;bottom:20px;" + pos + ":20px;display:flex;align-items:center;gap:10px;cursor:pointer;z-index:2147483000}" +
      ".yw-bubble{width:56px;height:56px;border-radius:50%;background:" + color + ";display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,.18);transition:transform .15s}" +
      ".yw-bubble:hover{transform:scale(1.06)}" +
      ".yw-bubble svg{width:26px;height:26px;fill:#fff}" +
      ".yw-launchtext{background:#fff;color:#111;font-size:13px;font-weight:600;padding:8px 12px;border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,.12)}" +
      ".yw-panel{position:fixed;bottom:88px;" + pos + ":20px;width:370px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.22);display:flex;flex-direction:column;overflow:hidden;z-index:2147483000;opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .18s,transform .18s}" +
      ".yw-panel.open{opacity:1;transform:translateY(0);pointer-events:auto}" +
      ".yw-head{background:" + color + ";color:#fff;padding:16px 18px;display:flex;align-items:center;justify-content:space-between}" +
      ".yw-head h3{margin:0;font-size:15px;font-weight:700}" +
      ".yw-close{background:transparent;border:none;color:#fff;cursor:pointer;font-size:20px;line-height:1;opacity:.85}" +
      ".yw-close:hover{opacity:1}" +
      ".yw-body{flex:1;overflow-y:auto;padding:16px;background:#f7f7f9;display:flex;flex-direction:column;gap:10px}" +
      ".yw-msg{max-width:80%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}" +
      ".yw-msg.user{align-self:flex-end;background:" + color + ";color:#fff;border-bottom-right-radius:4px}" +
      ".yw-msg.assistant{align-self:flex-start;background:#fff;color:#111;border:1px solid #ececf0;border-bottom-left-radius:4px}" +
      ".yw-typing{align-self:flex-start;color:#888;font-size:13px;padding:4px 6px}" +
      ".yw-foot{display:flex;gap:8px;padding:12px;border-top:1px solid #ececf0;background:#fff}" +
      ".yw-input{flex:1;border:1px solid #d8d8e0;border-radius:10px;padding:10px 12px;font-size:14px;outline:none;resize:none;max-height:90px}" +
      ".yw-input:focus{border-color:" + color + "}" +
      ".yw-send{background:" + color + ";border:none;border-radius:10px;width:42px;display:flex;align-items:center;justify-content:center;cursor:pointer}" +
      ".yw-send:disabled{opacity:.5;cursor:default}" +
      ".yw-send svg{width:18px;height:18px;fill:#fff}" +
      ".yw-credit{text-align:center;font-size:10px;color:#aaa;padding:4px 0 8px}";
    root.appendChild(style);

    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="yw-launcher">' +
        (launcher ? '<span class="yw-launchtext">' + esc(launcher) + "</span>" : "") +
        '<div class="yw-bubble" aria-label="Open chat">' +
          '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>' +
        "</div>" +
      "</div>" +
      '<div class="yw-panel">' +
        '<div class="yw-head"><h3>' + esc(title) + '</h3><button class="yw-close" aria-label="Close">&times;</button></div>' +
        '<div class="yw-body"></div>' +
        '<div class="yw-foot">' +
          '<textarea class="yw-input" rows="1" placeholder="Type a message…"></textarea>' +
          '<button class="yw-send" aria-label="Send"><svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg></button>' +
        "</div>" +
        '<div class="yw-credit">Powered by Yashayah AI</div>' +
      "</div>";
    root.appendChild(wrap);

    var panel = root.querySelector(".yw-panel");
    var body = root.querySelector(".yw-body");
    var input = root.querySelector(".yw-input");
    var sendBtn = root.querySelector(".yw-send");

    function render() {
      body.innerHTML = "";
      var shown = messages.length ? messages : [{ role: "assistant", content: greeting }];
      shown.forEach(function (m) {
        var el = document.createElement("div");
        el.className = "yw-msg " + (m.role === "user" ? "user" : "assistant");
        el.textContent = m.content;
        body.appendChild(el);
      });
      if (sending) {
        var t = document.createElement("div");
        t.className = "yw-typing";
        t.textContent = "Assistant is typing…";
        body.appendChild(t);
      }
      body.scrollTop = body.scrollHeight;
    }

    function toggle(force) {
      open = typeof force === "boolean" ? force : !open;
      panel.classList.toggle("open", open);
      if (open) { render(); setTimeout(function () { input.focus(); }, 150); }
    }

    function send() {
      var text = (input.value || "").trim();
      if (!text || sending) return;
      messages.push({ role: "user", content: text });
      input.value = "";
      input.style.height = "auto";
      sending = true;
      persist();
      render();

      fetch(apiBase + "/embed/" + widgetId + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages }),
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          sending = false;
          var reply = d && d.reply && d.reply[0] && d.reply[0].content;
          messages.push({
            role: "assistant",
            content: reply || "Sorry, I couldn't respond just now. Please try again.",
          });
          persist();
          render();
        })
        .catch(function () {
          sending = false;
          messages.push({ role: "assistant", content: "Connection error. Please try again." });
          persist();
          render();
        });
    }

    root.querySelector(".yw-bubble").addEventListener("click", function () { toggle(); });
    root.querySelector(".yw-close").addEventListener("click", function () { toggle(false); });
    sendBtn.addEventListener("click", send);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    });
    input.addEventListener("input", function () {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 90) + "px";
    });
  }
})();
