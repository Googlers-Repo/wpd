SKIPMOUNT=false
PROPFILE=false
POSTFSDATA=false
LATESTARTSERVICE=false

print_modname() {
    ui_print " __        ______  ____  "
    ui_print " \ \      / |  _ \|  _ \ "
    ui_print "  \ \ /\ / /| |_) | | | |"
    ui_print "   \ V  V / |  __/| |_| |"
    ui_print "    \_/\_/  |_|   |____/ "
}

on_install() {
    ui_print "- Extracting module files"
    unzip -qq -o "$ZIPFILE" 'system/*' -d $MODPATH >&2
    [ -d "$MODPATH/system/bin/" ] || mkdir -p "$MODPATH/system/bin/"    
}

set_permissions() {
    # The following is the default rule, DO NOT remove
    set_perm_recursive $MODPATH 0 0 0755 0644
    set_perm $MODPATH/system/bin/wpd 0 0 0755
}