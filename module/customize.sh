SKIPMOUNT=false
PROPFILE=false
POSTFSDATA=false
LATESTARTSERVICE=false

ui_print " __        ______  ____  "
ui_print " \ \      / |  _ \|  _ \ "
ui_print "  \ \ /\ / /| |_) | | | |"
ui_print "   \ V  V / |  __/| |_| |"
ui_print "    \_/\_/  |_|   |____/ "

set_permissions() {
    # The following is the default rule, DO NOT remove
    set_perm_recursive $MODPATH 0 0 0755 0644
    set_perm $MODPATH/system/bin/wpd 0 0 0755
}

##########################################################################################
# MMT Extended Logic - Don't modify anything after this
##########################################################################################

SKIPUNZIP=1
unzip -qjo "$ZIPFILE" 'common/functions.sh' -d $TMPDIR >&2
. $TMPDIR/functions.sh