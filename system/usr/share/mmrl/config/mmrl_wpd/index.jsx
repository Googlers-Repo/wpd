import React from "react";
import { Page, Toolbar, Ansi } from "@mmrl/ui";
import { useActivity } from "@mmrl/hooks";
import { Save } from "@mui/icons-material";
import { Stack, Box } from "@mui/material";
import BuildConfig from "@mmrl/buildconfig";
import Terminal from "@mmrl/terminal";
import { write } from "@mmrl/sufile"

const __wpd = `[ "\$(whoami)" != "root" ] && { echo "root required"; exit 1; }
configs=( /data/misc/wifi/WifiConfigStore.xml /data/misc/apexdata/com.android.wifi/WifiConfigStore.xml )
for z in \${configs[@]}; do
  if [ -f \$z ]; then
    config=\$z
    break
  fi
done
SSID=(\$(grep 'name="SSID"' \$config | sed "s/.*>&quot;//;s/&quot;.*//;s/ /-_-/g"))
PSK=(\$(grep 'name="PreSharedKey"' \$config | sed "s/<null.*/\x1b[31mNONE\x1b[40m/;s/.*>&quot;/\x1b[32m/;s/&quot;.*/\x1b[40m/;s/ /-_-/g"))

echo "WiFi Password Viewer"
echo "veez21 @ xda-developers"
echo "MMRL \x1b[91m(\x1b[0m\x1b[93m\$MMRL_VER_NAME\x1b[91m)\x1b[0m version by Der_Googler"
echo " "
for i in \${!SSID[@]}; do
   echo "\${SSID[\$i]} - \${PSK[\$i]}" | sed "s/-_-/ /g"
done`

function Wpd() {
    const { context } = useActivity();
    const [lines, setLines] = React.useState([]);

    const addLine = (line) => {
        setLines((lines) => [...lines, line]);
    };

    const saveLog = () => {
        write("/data/adb/wpd.log", lines.join("\n"))
    }

    const renderToolbar = () => {
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
                <Toolbar.Right>
                    <Toolbar.Button onClick={saveLog} icon={Save} />
                </Toolbar.Right>
            </Toolbar>
        )
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
                addLine(line);
            },
            onExit: (code) => { },
        });
    }, []);

    return (
        <Page
            onShow={startLog}
            renderToolbar={renderToolbar}
            modifier="noshadow">
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                }}>
                <Stack
                    style={{
                        whiteSpace: "pre",
                        flex: "0 0 100%",
                        color: "white",
                        height: "100%",
                    }}
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="stretch"
                    spacing={0}
                >
                    {lines.map((line) => (
                        <Box component={Ansi} sx={{
                            ml: 1,
                            mr: 1,
                        }}>{line}</Box>
                    ))}
                </Stack>
            </div>
        </Page>
    );
}

export default Wpd
