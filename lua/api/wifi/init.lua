imports "dev.mmrlx.lua.nio.SuFile"

local App = require("mx:router")
local json = require("mx:json")
local xml = require("mx:xml") -- xml2lua
local handler = require("mx:xml/handler/tree")

-- file lookup
local files = {
  SuFile("/data/misc/apexdata/com.android.wifi/WifiConfigStore.xml"),
  SuFile("/data/misc/wifi/WifiConfigStore.xml")
}

local function getFirstExistingFile()
  for _, file in ipairs(files) do
    if file.exists() then return file end
  end
  return nil
end

-- lookup tables (Android WifiConfiguration constants)
local SECURITY = {
  [0] = "OPEN", [1] = "WEP", [2] = "WPA2_PSK", [3] = "EAP",
  [4] = "WPA3_SAE", [5] = "WPA3_ENTERPRISE_192", [6] = "OWE",
  [7] = "WAPI_PSK", [8] = "WAPI_CERT", [9] = "WPA3_ENTERPRISE",
  [10] = "OSEN", [11] = "PASSPOINT_R1_R2", [12] = "PASSPOINT_R3", [13] = "DPP"
}
local STATUS = { [0] = "CURRENT", [1] = "DISABLED", [2] = "ENABLED" }
local MAC_RANDOMIZATION = { [0] = "NONE", [1] = "PERSISTENT", [2] = "NON_PERSISTENT", [3] = "AUTO" }
local METERED = { [0] = "AUTO", [1] = "METERED", [2] = "UNMETERED" }

local TYPED = {
  string = true, int = true, long = true, boolean = true,
  null = true, ["byte-array"] = true, ["long-array"] = true,
  map = true, float = true, double = true
}
local ALWAYS_LIST = { Network = true, SecurityParams = true }

-- helpers
local ENTITIES = { quot = '"', amp = "&", lt = "<", gt = ">", apos = "'" }
local function decode(s)
  return (s:gsub("&(%a+);", function(e) return ENTITIES[e] end))
end

-- xml2lua returns a single element as a table and repeated ones as a list
local function asList(x)
  if x == nil then return {} end
  if type(x) == "table" and type(x[1]) == "table" then return x end
  return { x }
end

local function textOf(node)
  if type(node) == "string" then return node end
  if type(node) == "table" and type(node[1]) == "string" then return node[1] end
  return nil
end

local function unquote(s)
  if type(s) == "string" then
    return (s:gsub('^"(.*)"$', "%1"))
  end
  return s
end

local convert -- forward declaration

local function parseTyped(tag, node)
  local attr = type(node) == "table" and node._attr or {}
  if tag == "null" then
    return nil
  elseif tag == "boolean" then
    return attr.value == "true"
  elseif tag == "int" or tag == "long" or tag == "float" or tag == "double" then
    return tonumber(attr.value)
  elseif tag == "string" then
    return decode(textOf(node) or "")
  elseif tag == "byte-array" or tag == "long-array" then
    return textOf(node) or ""
  elseif tag == "map" then
    return convert(node)
  end
end

-- turns <int name="x" value="1"/> style children into { x = 1 }
convert = function(node)
  local out = {}
  if type(node) ~= "table" then return out end
  for tag, value in pairs(node) do
    if tag ~= "_attr" and type(tag) == "string" then
      for _, item in ipairs(asList(value)) do
        local name = type(item) == "table" and item._attr and item._attr.name
        if TYPED[tag] then
          if name then out[name] = parseTyped(tag, item) end
        else
          local c = convert(item)
          if ALWAYS_LIST[tag] then
            out[tag] = out[tag] or {}
            table.insert(out[tag], c)
          else
            out[tag] = c
          end
        end
      end
    end
  end
  return out
end

-- build a clean network object
local function buildNetwork(n)
  local c = n.WifiConfiguration or {}
  local s = n.NetworkStatus or {}
  local ip = n.IpConfiguration or {}

  local security = {}
  local params = c.SecurityParamsList and c.SecurityParamsList.SecurityParams or {}
  for _, p in ipairs(params) do
    table.insert(security, {
      type = p.SecurityType,
      name = SECURITY[p.SecurityType] or "UNKNOWN",
      enabled = p.IsEnabled,
      addedByAutoUpgrade = p.IsAddedByAutoUpgrade,
      saeH2eOnly = p.SaeIsH2eOnlyMode,
      saePkOnly = p.SaeIsPkOnlyMode
    })
  end

  -- the "real" security is the first one that wasn't auto-added
  local primary = "UNKNOWN"
  for _, sp in ipairs(security) do
    if not sp.addedByAutoUpgrade then primary = sp.name break end
  end

  return {
    ssid = unquote(c.SSID),
    password = unquote(c.PreSharedKey),
    hasPassword = c.PreSharedKey ~= nil,
    configKey = unquote(c.ConfigKey),
    bssid = c.BSSID,
    hidden = c.HiddenSSID,
    security = primary,
    securityParams = security,
    requirePmf = c.RequirePMF,

    status = STATUS[c.Status] or c.Status,
    selectionStatus = s.SelectionStatus,
    disableReason = s.DisableReason,
    hasEverConnected = s.HasEverConnected,
    hasEverValidatedInternet = s.HasEverValidatedInternetAccess,
    captivePortalNeverDetected = s.CaptivePortalNeverDetected,
    connectChoice = unquote(s.ConnectChoice),
    connectChoiceRssi = s.ConnectChoiceRssi,
    isMostRecentlyConnected = c.IsMostRecentlyConnected,
    numRebootsSinceLastUse = c.NumRebootsSinceLastUse,

    autoJoin = c.AutoJoinEnabled,
    shared = c.Shared,
    trusted = c.Trusted,
    restricted = c.IsRestricted,
    priority = c.Priority,
    deletionPriority = c.DeletionPriority,
    repeater = c.RepeaterEnabled,
    wifi7 = c.EnableWifi7,
    oemPaid = c.OemPaid,
    oemPrivate = c.OemPrivate,
    carrierMerged = c.CarrierMerged,
    carrierId = c.CarrierId,
    subscriptionId = c.SubscriptionId,

    validatedInternet = c.ValidatedInternetAccess,
    noInternetExpected = c.NoInternetAccessExpected,
    metered = METERED[c.MeteredOverride] or c.MeteredOverride,
    meteredHint = c.MeteredHint,

    gatewayMac = c.DefaultGwMacAddress,
    randomizedMac = c.RandomizedMacAddress,
    macRandomization = MAC_RANDOMIZATION[c.MacRandomizationSetting] or c.MacRandomizationSetting,
    sendDhcpHostname = c.SendDhcpHostname,

    ipAssignment = ip.IpAssignment,
    proxySettings = ip.ProxySettings,

    creator = c.CreatorName,
    creatorUid = c.CreatorUid,
    lastUpdateName = c.LastUpdateName,
    lastUpdateUid = c.LastUpdateUid,
    lastConnectUid = c.LastConnectUid,

    raw = n -- everything, untouched
  }
end

-- route
App.get("/api/wifi", function(request, headers)
  headers["Content-Type"] = "application/json"

  local file = getFirstExistingFile()
  if not file then
    return 404, json.encode({ error = "WifiConfigStore.xml not found" })
  end

  local ok, err = pcall(function()
    local parser = xml.parser(handler)
    parser:parse(file.readText())
  end)
  if not ok then
    return 500, json.encode({ error = "xml parse failed", detail = tostring(err) })
  end

  local root = convert(handler.root.WifiConfigStoreData)

  local networks = {}
  local list = root.NetworkList and root.NetworkList.Network or {}
  for _, n in ipairs(list) do
    table.insert(networks, buildNetwork(n))
  end

  return 200, json.encode({
    version = root.Version,
    count = #networks,
    networks = networks,
    settings = root.Settings and root.Settings.Values or {},
    carrier = root.WifiCarrierInfoStoreManagerDataStores or {},
    roamingPolicies = root.RoamingPolicies or {},
    passpoint = root.PasspointConfigData or {}
  })
end)