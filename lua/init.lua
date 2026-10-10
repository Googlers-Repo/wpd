-- Don't do that if you choose hell

require("api/wifi")

local Bridge = require("mx:bridge")
local shareAsFile = require("util/shareFile")

local extendedFs = Bridge.interface("fs")

extendedFs:method("shareJson", function(content, fileName)
    return shareAsFile("application/json", content, fileName)
end)

extendedFs:register()