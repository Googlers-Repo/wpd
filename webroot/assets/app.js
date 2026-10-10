(function () {
  "use strict";

  var API = new URLSearchParams(location.search).get("api") || "/api/wifi";

  var SECURITY_LABEL = {
    OPEN: "Open",
    WEP: "WEP",
    WPA2_PSK: "WPA2 Personal",
    EAP: "Enterprise (EAP)",
    WPA3_SAE: "WPA3 Personal",
    WPA3_ENTERPRISE_192: "WPA3 Enterprise 192-bit",
    OWE: "Enhanced Open (OWE)",
    WAPI_PSK: "WAPI Personal",
    WAPI_CERT: "WAPI Certificate",
    WPA3_ENTERPRISE: "WPA3 Enterprise",
    OSEN: "OSEN",
    PASSPOINT_R1_R2: "Passpoint R1/R2",
    PASSPOINT_R3: "Passpoint R3",
    DPP: "DPP",
    UNKNOWN: "Unknown",
  };

  var SAMPLE = {
    version: 3,
    count: 3,
    networks: [
      {
        ssid: "Home Network",
        password: "correct-horse-battery",
        hasPassword: true,
        configKey: '"Home Network"WPA_PSK',
        security: "WPA2_PSK",
        securityParams: [
          { type: 2, name: "WPA2_PSK", enabled: true, addedByAutoUpgrade: false },
          { type: 4, name: "WPA3_SAE", enabled: true, addedByAutoUpgrade: true },
        ],
        status: "CURRENT",
        selectionStatus: "NETWORK_SELECTION_ENABLED",
        hasEverConnected: true,
        validatedInternet: true,
        autoJoin: true,
        isMostRecentlyConnected: true,
        numRebootsSinceLastUse: 0,
        gatewayMac: "aa:bb:cc:dd:ee:ff",
        randomizedMac: "02:11:22:33:44:55",
        macRandomization: "AUTO",
        ipAssignment: "DHCP",
        proxySettings: "NONE",
        creator: "android.uid.system:1000",
        raw: {},
      },
      {
        ssid: "Cafe Free Wifi",
        hasPassword: false,
        security: "OPEN",
        securityParams: [],
        status: "ENABLED",
        selectionStatus: "NETWORK_SELECTION_ENABLED",
        validatedInternet: false,
        autoJoin: true,
        numRebootsSinceLastUse: 114,
        ipAssignment: "DHCP",
        proxySettings: "NONE",
        raw: {},
      },
      {
        ssid: "Smart Bulb Setup",
        hasPassword: false,
        security: "OPEN",
        securityParams: [],
        status: "DISABLED",
        selectionStatus: "NETWORK_SELECTION_PERMANENTLY_DISABLED",
        disableReason: "NETWORK_SELECTION_DISABLED_NO_INTERNET_PERMANENT",
        autoJoin: true,
        numRebootsSinceLastUse: 207,
        raw: {},
      },
    ],
    settings: { wifi_last_country_code: "DE", wifi_scan_throttle_enabled: true },
    carrier: {},
    roamingPolicies: {},
    passpoint: {},
  };

  var state = { data: null, nets: [], query: "", filter: "all", sort: "recent", reveal: false, open: {}, openOrder: [], demo: false };

  var $ = function (s) {
    return document.querySelector(s);
  };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function yn(v) {
    return v == null ? null : v ? "Yes" : "No";
  }
  function nice(s) {
    return s
      ? String(s)
          .replace(/^NETWORK_SELECTION_(DISABLED_)?/, "")
          .toLowerCase()
          .replace(/_/g, " ")
      : s;
  }
  function isDisabled(n) {
    return !!n.selectionStatus && n.selectionStatus !== "NETWORK_SELECTION_ENABLED";
  }
  function isOpen(n) {
    return n.security === "OPEN" || n.security === "OWE";
  }

  function secLabel(n) {
    var label = SECURITY_LABEL[n.security] || n.security || "Unknown";
    var upgrades = (n.securityParams || []).some(function (p) {
      return p.addedByAutoUpgrade && p.enabled && p.name === "WPA3_SAE";
    });
    if (n.security === "WPA2_PSK" && upgrades) label += " + WPA3";
    if (n.security === "OPEN") label = "Open";
    return label;
  }
  function lastUsed(n) {
    var r = n.numRebootsSinceLastUse;
    if (r == null) return null;
    if (r === 0) return "Used since last reboot";
    return "Last used " + r + (r === 1 ? " reboot ago" : " reboots ago");
  }

  /* ---------- data ---------- */
  function setData(data, demo) {
    state.data = data;
    state.demo = !!demo;
    state.nets = (Array.isArray(data.networks) ? data.networks : []).map(function (n, i) {
      n._id = i;
      return n;
    });
    render();
  }

  function load() {
    $("#sub").textContent = "Loading networks…";
    return fetch(API, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) {
          return r.text().then(function (t) {
            throw new Error("HTTP " + r.status + (t ? ": " + t.slice(0, 160) : ""));
          });
        }
        return r.json();
      })
      .then(function (d) {
        setData(d, false);
      })
      .catch(function (err) {
        showError(err);
      });
  }

  function showError(err) {
    state.data = null;
    state.nets = [];
    $("#sub").textContent = "Couldn't load networks";
    $("#notice").innerHTML = "";
    $("#chips").innerHTML = "";
    $("#device").hidden = true;
    $("#list").innerHTML =
      '<div class="state"><h2>Couldn\'t reach ' +
      esc(API) +
      "</h2>" +
      "<p>" +
      esc(err && err.message ? err.message : err) +
      "<br>Check that the module is running and the file is readable with root.</p>" +
      '<div class="btns"><button class="btn primary" data-act="retry">Try again</button>' +
      '<button class="btn" data-act="file">Open a JSON file</button>' +
      '<button class="btn" data-act="sample">Preview with sample data</button></div></div>';
  }

  /* ---------- filtering ---------- */
  var FILTERS = [
    [
      "all",
      "All",
      function () {
        return true;
      },
    ],
    [
      "connected",
      "Connected",
      function (n) {
        return n.status === "CURRENT";
      },
    ],
    [
      "secured",
      "Secured",
      function (n) {
        return !isOpen(n);
      },
    ],
    [
      "open",
      "Open",
      function (n) {
        return isOpen(n);
      },
    ],
    ["disabled", "Disabled", isDisabled],
  ];

  function visibleNets() {
    var f = FILTERS.filter(function (x) {
      return x[0] === state.filter;
    })[0];
    var q = state.query.trim().toLowerCase();
    var list = state.nets.filter(function (n) {
      if (!f[2](n)) return false;
      if (!q) return true;
      return [n.ssid, n.configKey, n.gatewayMac, n.randomizedMac, secLabel(n), n.security].some(function (v) {
        return v && String(v).toLowerCase().indexOf(q) !== -1;
      });
    });
    list.sort(function (a, b) {
      if (state.sort === "name") return String(a.ssid).toLowerCase().localeCompare(String(b.ssid).toLowerCase());
      if (state.sort === "security") {
        return secLabel(a).localeCompare(secLabel(b)) || String(a.ssid).localeCompare(String(b.ssid));
      }
      var ra = a.numRebootsSinceLastUse == null ? 1e9 : a.numRebootsSinceLastUse;
      var rb = b.numRebootsSinceLastUse == null ? 1e9 : b.numRebootsSinceLastUse;
      return ra - rb || String(a.ssid).localeCompare(String(b.ssid));
    });
    return list;
  }

  /* ---------- rendering ---------- */
  var GROUPS = [
    [
      "Connection",
      [
        [
          "Status",
          function (n) {
            return nice(n.status);
          },
        ],
        [
          "Selection",
          function (n) {
            return nice(n.selectionStatus);
          },
        ],
        [
          "Disable reason",
          function (n) {
            return nice(n.disableReason);
          },
        ],
        [
          "Has connected before",
          function (n) {
            return yn(n.hasEverConnected);
          },
        ],
        [
          "Internet validated now",
          function (n) {
            return yn(n.validatedInternet);
          },
        ],
        [
          "Internet ever validated",
          function (n) {
            return yn(n.hasEverValidatedInternet);
          },
        ],
        [
          "Captive portal seen",
          function (n) {
            return n.captivePortalNeverDetected == null ? null : yn(!n.captivePortalNeverDetected);
          },
        ],
        [
          "Auto-join",
          function (n) {
            return yn(n.autoJoin);
          },
        ],
        [
          "Metered",
          function (n) {
            return n.metered == null ? null : String(n.metered).toLowerCase();
          },
        ],
        [
          "Reboots since last use",
          function (n) {
            return n.numRebootsSinceLastUse;
          },
        ],
        [
          "Preferred over",
          function (n) {
            return n.connectChoice;
          },
        ],
      ],
    ],
    [
      "Addressing",
      [
        [
          "IP assignment",
          function (n) {
            return n.ipAssignment;
          },
        ],
        [
          "Proxy",
          function (n) {
            return n.proxySettings;
          },
        ],
        [
          "Gateway MAC",
          function (n) {
            return n.gatewayMac;
          },
          true,
        ],
        [
          "Randomized MAC",
          function (n) {
            return n.randomizedMac;
          },
          true,
        ],
        [
          "MAC randomization",
          function (n) {
            return n.macRandomization == null ? null : String(n.macRandomization).toLowerCase();
          },
        ],
        [
          "Sends DHCP hostname",
          function (n) {
            return yn(n.sendDhcpHostname);
          },
        ],
      ],
    ],
    [
      "Configuration",
      [
        [
          "Config key",
          function (n) {
            return n.configKey;
          },
          true,
        ],
        [
          "BSSID",
          function (n) {
            return n.bssid;
          },
          true,
        ],
        [
          "Hidden network",
          function (n) {
            return yn(n.hidden);
          },
        ],
        [
          "Priority",
          function (n) {
            return n.priority;
          },
        ],
        [
          "Shared with users",
          function (n) {
            return yn(n.shared);
          },
        ],
        [
          "Trusted",
          function (n) {
            return yn(n.trusted);
          },
        ],
        [
          "Restricted",
          function (n) {
            return yn(n.restricted);
          },
        ],
        [
          "Wi-Fi 7",
          function (n) {
            return yn(n.wifi7);
          },
        ],
        [
          "Requires PMF",
          function (n) {
            return yn(n.requirePmf);
          },
        ],
        [
          "Carrier ID",
          function (n) {
            return n.carrierId;
          },
        ],
      ],
    ],
    [
      "Origin",
      [
        [
          "Created by",
          function (n) {
            return n.creator;
          },
          true,
        ],
        [
          "Last updated by",
          function (n) {
            return n.lastUpdateName;
          },
          true,
        ],
        [
          "Last connected by UID",
          function (n) {
            return n.lastConnectUid;
          },
        ],
      ],
    ],
  ];

  function detailsHtml(n) {
    var out = "";
    GROUPS.forEach(function (g) {
      var rows = g[1]
        .map(function (r) {
          var v = r[1](n);
          if (v == null || v === "") return "";
          return "<div><dt>" + esc(r[0]) + "</dt><dd" + (r[2] ? ' class="mono"' : "") + ">" + esc(v) + "</dd></div>";
        })
        .join("");
      if (rows) out += '<div class="group"><h3>' + esc(g[0]) + "</h3><dl>" + rows + "</dl></div>";
    });
    var sp = n.securityParams || [];
    if (sp.length) {
      out +=
        '<div class="group"><h3>Security modes</h3><table><thead><tr><th>Mode</th><th>Enabled</th><th>Added by</th></tr></thead><tbody>' +
        sp
          .map(function (p) {
            return (
              "<tr><td>" +
              esc(SECURITY_LABEL[p.name] || p.name) +
              "</td><td>" +
              (p.enabled ? "Yes" : "No") +
              "</td><td>" +
              (p.addedByAutoUpgrade ? "Android (auto-upgrade)" : "Saved config") +
              "</td></tr>"
            );
          })
          .join("") +
        "</tbody></table></div>";
    }
    out += "<details><summary>Raw data</summary><pre>" + esc(JSON.stringify(n.raw || n, null, 2)) + "</pre></details>";
    return out;
  }

  function rowHtml(n) {
    var open = !!state.open[n._id];
    var cls = n.status === "CURRENT" ? "good" : isDisabled(n) ? "bad" : "";
    var tags = '<span class="tag">' + esc(secLabel(n)) + "</span>";
    if (n.status === "CURRENT") tags += '<span class="tag good">Connected</span>';
    if (isDisabled(n)) tags += '<span class="tag bad">Disabled' + (n.disableReason ? ": " + esc(nice(n.disableReason)) : "") + "</span>";
    else if (n.validatedInternet === false) tags += '<span class="tag warn">No internet</span>';
    if (n.hidden) tags += '<span class="tag">Hidden</span>';
    if (n.autoJoin === false) tags += '<span class="tag">Auto-join off</span>';
    var lu = lastUsed(n);
    if (lu) tags += '<span class="tag">' + esc(lu) + "</span>";

    var pw = n.hasPassword
      ? '<span class="pw' +
        (state.reveal ? "" : " masked") +
        '">' +
        (state.reveal ? esc(n.password) : "••••••••") +
        "</span>" +
        '<button class="mini" data-act="copy" data-id="' +
        n._id +
        '">Copy</button>'
      : '<span class="nopw">No password</span>';

    return (
      '<article class="net ' +
      cls +
      '" data-id="' +
      n._id +
      '">' +
      '<button class="head" data-act="toggle" data-id="' +
      n._id +
      '" aria-expanded="' +
      open +
      '">' +
      '<span class="ssid">' +
      esc(n.ssid || "(no name)") +
      '</span><span class="caret" aria-hidden="true">▼</span></button>' +
      '<div class="meta">' +
      tags +
      "</div>" +
      '<div class="pwline">' +
      pw +
      "</div>" +
      (open ? '<div class="body">' + detailsHtml(n) + "</div>" : "") +
      "</article>"
    );
  }

  function render() {
    var nets = state.nets;

    // summary line
    var recent = nets.filter(function (n) {
      return n.status === "CURRENT" || n.isMostRecentlyConnected;
    })[0];
    var sub = nets.length + (nets.length === 1 ? " saved network" : " saved networks");
    if (recent) sub += ". " + (recent.status === "CURRENT" ? "Connected to " : "Last connected to ") + (recent.ssid || "(no name)");
    $("#sub").textContent = sub;

    $("#notice").innerHTML = state.demo ? '<div class="notice">Showing sample data. Tap Refresh to load your real networks.</div>' : "";

    // chips with counts
    $("#chips").innerHTML = FILTERS.map(function (f) {
      var c = nets.filter(f[2]).length;
      return '<button class="chip" data-act="filter" data-f="' + f[0] + '" aria-pressed="' + (state.filter === f[0]) + '">' + esc(f[1]) + "<b>" + c + "</b></button>";
    }).join("");

    // list
    var list = visibleNets();
    if (!nets.length) {
      $("#list").innerHTML = '<div class="state"><h2>No saved networks</h2><p>The Wi-Fi store was read, but it has no networks in it.</p></div>';
    } else if (!list.length) {
      $("#list").innerHTML =
        '<div class="state"><h2>No matches</h2><p>Nothing fits the current search and filter.</p>' +
        '<div class="btns"><button class="btn" data-act="clear">Clear search and filter</button></div></div>';
    } else {
      $("#list").innerHTML = list.map(rowHtml).join("");
    }

    // device panel
    var d = state.data || {};
    var settings = d.settings || {};
    var keys = Object.keys(settings).sort();
    var items = [];
    if (d.version != null) items.push(["Store version", d.version]);
    keys.forEach(function (k) {
      var v = settings[k];
      items.push([k, typeof v === "object" ? JSON.stringify(v) : v]);
    });
    $("#deviceList").innerHTML = items
      .map(function (r) {
        return "<div><dt>" + esc(r[0]) + '</dt><dd class="mono">' + esc(r[1]) + "</dd></div>";
      })
      .join("");
    $("#carrierPre").textContent = JSON.stringify(
      {
        carrier: d.carrier || {},
        roamingPolicies: d.roamingPolicies || {},
        passpoint: d.passpoint || {},
      },
      null,
      2
    );
    $("#device").hidden = !items.length;
  }

  /* ---------- actions ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove("on");
    }, 1800);
  }

  function copyText(text, okMsg) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {}
      document.body.removeChild(ta);
      toast(ok ? okMsg : "Couldn't copy. Select the text and copy it manually.");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast(okMsg);
      }, fallback);
    } else {
      fallback();
    }
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]");
    if (!el) return;
    var act = el.getAttribute("data-act");
    var id = Number(el.getAttribute("data-id"));
    if (act === "toggle") {
      if (state.open[id]) {
        delete state.open[id];
        state.openOrder = state.openOrder.filter(function (x) {
          return x !== id;
        });
      } else {
        state.open[id] = true;
        state.openOrder.push(id);
      }
      render();
    } else if (act === "copy") {
      var n = state.nets[id];
      if (n && n.password != null) copyText(n.password, "Password copied for " + n.ssid);
    } else if (act === "filter") {
      state.filter = el.getAttribute("data-f");
      render();
    } else if (act === "clear") {
      state.query = "";
      state.filter = "all";
      $("#q").value = "";
      render();
    } else if (act === "retry") {
      load();
    } else if (act === "sample") {
      setData(JSON.parse(JSON.stringify(SAMPLE)), true);
    } else if (act === "file") {
      $("#file").click();
    }
  });

  $("#q").addEventListener("input", function (e) {
    state.query = e.target.value;
    render();
  });
  $("#sort").addEventListener("change", function (e) {
    state.sort = e.target.value;
    render();
  });
  $("#reveal").addEventListener("change", function (e) {
    state.reveal = e.target.checked;
    render();
  });
  $("#refresh").addEventListener("click", function () {
    load();
  });
  $("#shareJson").addEventListener("click", function () {
    if (!state.data) {
      toast("Nothing to copy yet");
      return;
    }

    if (typeof fs.shareJson !== "function") {
      toast("Unable to share JSON");
      return;
    }

    fs.shareJson(JSON.stringify(state.data, null, 2), "wifi.json");
  });
  $("#file").addEventListener("change", function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        setData(JSON.parse(r.result), false);
      } catch (err) {
        showError(new Error("That file isn't valid JSON."));
      }
    };
    r.readAsText(f);
    e.target.value = "";
  });

  /* ---------- back navigation (MMRL predictive back) ---------- */
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var swipe = null; // { el } while a back gesture is in progress

  // The topmost thing back should close: an expanded network, then search/filter, then the page itself.
  function backLayer() {
    while (state.openOrder.length) {
      var id = state.openOrder[state.openOrder.length - 1];
      var el = document.querySelector('.net[data-id="' + id + '"]');
      if (el) {
        return {
          el: el,
          run: function () {
            state.openOrder.pop();
            delete state.open[id];
            render();
          },
        };
      }
      // expanded network is hidden by the current filter, so skip it
      state.openOrder.pop();
      delete state.open[id];
    }
    if (state.query || state.filter !== "all") {
      return {
        el: $("#list"),
        run: function () {
          state.query = "";
          state.filter = "all";
          $("#q").value = "";
          render();
        },
      };
    }
    return {
      el: document.querySelector(".wrap"),
      exit: true,
      run: function () {
        history.back();
      },
    };
  }

  function resetSwipe(animate) {
    if (!swipe) return;
    var el = swipe.el;
    swipe = null;
    if (!el) return;
    el.classList.remove("is-swiping");
    if (animate) {
      el.classList.add("is-returning");
      setTimeout(function () {
        el.classList.remove("is-returning");
      }, 220);
    }
    el.style.transform = "";
    el.style.opacity = "";
    delete el.dataset.edge;
  }

  window.addEventListener("DOMContentLoaded", () => {
    document.addMXEventListener("backStarted", function (ev) {
      resetSwipe(false);
      var layer = backLayer();
      swipe = { el: layer.el };
      if (layer.el) {
        layer.el.classList.add("is-swiping");
        layer.el.dataset.edge = ev.swipeEdge === 0 ? "left" : "right";
      }
    });

    document.addMXEventListener("backProgressed", function (ev) {
      if (!swipe || !swipe.el) return;
      var dir = ev.swipeEdge === 0 ? 1 : -1;
      if (!reduceMotion) {
        swipe.el.style.transform = "translateX(" + dir * ev.progress * 64 + "px) scale(" + (1 - ev.progress * 0.05) + ")";
      }
      swipe.el.style.opacity = String(1 - ev.progress * 0.3);
    });

    document.addMXEventListener("backCancelled", function () {
      resetSwipe(true);
    });

    document.addMXEventListener("backPressed", function () {
      resetSwipe(false);
      backLayer().run();
    });
  });

  // Escape closes the same layers outside MMRL (desktop browser preview)
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var layer = backLayer();
    if (!layer.exit) layer.run();
  });

  load();
})();