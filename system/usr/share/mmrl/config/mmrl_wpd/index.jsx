import React from "react";
import { Page, Toolbar } from "@mmrl/ui";
import { useActivity, useNativeStorage } from "@mmrl/hooks";
import {
    List,
    ListItem,
    ListItemText,
    Divider
} from "@mui/material";
import Terminal from "@mmrl/terminal";

const __wpd = `[ "\$(whoami)" != "root" ] && { echo "root required"; exit 1; }
configs=( /data/misc/wifi/WifiConfigStore.xml /data/misc/apexdata/com.android.wifi/WifiConfigStore.xml )
for z in \${configs[@]}; do
  if [ -f \$z ]; then
    config=\$z
    break
  fi
done
SSID=(\$(grep 'name="SSID"' \$config | sed "s/.*>&quot;//;s/&quot;.*//;s/ /-_-/g"))
PSK=(\$(grep 'name="PreSharedKey"' \$config | sed "s/<null.*/NONE/;s/.*>&quot;//;s/&quot;.*//;s/ /-_-/g"))
for i in \${!SSID[@]}; do
   echo "\${SSID[\$i]},\"\${PSK[\$i]}\"" | sed "s/-_-/ /g"
done`


function RenderToolbar() {
    const { context } = useActivity()
    return (
        <Toolbar modifier="noshadow" sx={{
            background: "rgb(188,2,194)",
            background: "linear-gradient(22deg, rgba(188,2,194,1) 0%, rgba(74,20,140,1) 100%)"
        }}>
            <Toolbar.Left>
                <Toolbar.BackButton onClick={context.popPage} />
            </Toolbar.Left>
            <Toolbar.Center>
                WiFi Password Viewer
            </Toolbar.Center>
        </Toolbar>
    )
}

function Wpd() {
    const [lines, setLines] = React.useState([]);
    const [hidePasswords, setHidePasswords] = useNativeStorage("wpd_hide_passwords", true)

    const addLine = (line) => {
        setLines((lines) => [...lines, line]);
    };

    const saveLog = () => {
        write("/data/adb/wpd.log", lines.join("\n"))
    }

    const startLog = React.useMemo(() => {
        const envp = {
            MMRL_VER_NAME: BuildConfig.VERSION_NAME,
            PACKAGENAME: BuildConfig.APPLICATION_ID,
        };

        Terminal.exec({
            command: __wpd,
            env: envp,
            onLine: (line) => {
                line = line.split(",")
                addLine({
                    ssid: line[0],
                    psk: line[1]
                });
            },
            onExit: (code) => { },
        });
    }, []);

    return (
        <Page
            onShow={startLog}
            renderToolbar={RenderToolbar}
            modifier="noshadow">
            <List subheader={<ListSubheader>Settings</ListSubheader>}>
                <ListItem>
                    <ListItemText primary="Hide passwords" />
                    <Switch checked={hidePasswords} onChange={(e) => setHidePasswords(e.target.checked)} />
                </ListItem>
            </List>
            <Divider />
            <List subheader={<ListSubheader>Passwords</ListSubheader>}>
                {lines.map((line) => (
                    <ListItem>
                        <ListItemText sx={{
                            "& .MuiListItemText-secondary": {
                                WebkitTextSecurity: hidePasswords ? "disc" : "none",
                                wordWrap: "break-word"
                            }
                        }} primary={line.ssid} secondary={line.psk} />
                    </ListItem>
                ))}
            </List>
        </Page>
    );
}

export default Wpd
