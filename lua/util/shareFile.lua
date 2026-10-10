-- You really choosed hell? Impressive!

imports "dev.mmrlx.lua.nio.SuFile"
imports "androidx.core.app.ShareCompat"
imports "androidx.core.content.FileProvider"
imports "java.io.OutputStreamWriter"
imports "java.nio.charset.StandardCharsets"

local function createTempFileFromString(textContent, fileName)
    local success, result = pcall(function()
        local cachePath = SuFile(activity.getCacheDir().getPath() .. "/shared_files")

        if not cachePath.exists() then
            cachePath.mkdirs()
        end

        local newFile = SuFile(cachePath.getPath() .. "/" .. fileName)
        local output = newFile.outputstream()
        local writer = OutputStreamWriter(output, StandardCharsets.UTF_8)

        local writeSuccess, writeError = pcall(function()
            writer.write(tostring(textContent))
            writer.flush()
        end)

        writer.close()

        if not writeSuccess then
            error(writeError)
        end

        local authority = activity.getPackageName() .. ".fileprovider"

        return FileProvider.getUriForFile(
            activity,
            authority,
            newFile
        )
    end)

    if not success then
        print("createTempFileFromString: " .. tostring(result))
        return nil
    end

    return result
end

return function(mimeType, textToShare, fileName)
    local fileUri = createTempFileFromString(
        textToShare,
        fileName or "shared_document.txt"
    )

    if fileUri == nil then
        return false
    end

    local success, err = pcall(function()
        local builder = ShareCompat.IntentBuilder.from(activity)
        builder.setType(mimeType or "text/plain")
        builder.setStream(fileUri)
        builder.setChooserTitle("Share file via")
        builder.startChooser()
    end)

    if not success then
        print("shareFile: " .. tostring(err))
        return false
    end

    return true
end