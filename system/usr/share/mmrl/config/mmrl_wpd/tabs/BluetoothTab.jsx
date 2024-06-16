import { useNativeStorage } from "@mmrl/hooks";
import { CodeBlock, Page } from "@mmrl/ui";
import { Divider, List, ListItem, ListItemText, ListSubheader, Switch, Typography } from "@mui/material";
import React from "react";

const CenterBox = include("components/CenterBox.jsx");
const useBluetoothConfig = include("hooks/useBluetoothConfig.js")


function BluetoothTab() {
    const devices = useBluetoothConfig();
    const [hideStats, setHideStats] = useNativeStorage("wpd_hide_macs", true);

    if (!devices || devices.length === 0) {
        return (
            <Page modifier="noshadow">
                <CenterBox>No devices found</CenterBox>
            </Page>
        );
    }

    return (
        <Page modifier="noshadow">
            <List subheader={<ListSubheader>Settings</ListSubheader>}>
                <ListItem>
                    <ListItemText primary="Hide all stats" />
                    <Switch checked={hideStats} onChange={(e) => setHideStats(e.target.checked)} />
                </ListItem>
            </List>
            <Divider />
            <List subheader={<ListSubheader>Devices</ListSubheader>}>
                {devices.map((device, index, arr) => {
                    //                    const stats = Object.entries(device).flatMap((d) => `${d[0]}: ${d[1]}`).join("\n")
                    const stats = JSON.stringify(device, null, 2)
                    return (<>
                        <ListItem>
                            <ListItemText
                                sx={{
                                    "& .MuiListItemText-secondary": {
                                        WebkitTextSecurity: hideStats ? "disc" : "none",
                                        wordWrap: "break-word",
                                    },
                                }}
                                primary={<Typography variant="h5">{device.Name}</Typography>}
                                secondary={<CodeBlock lang="json" sx={{ pt: 1 }} children={
                                    hideStats ? stats.slice(0, 10) : stats
                                } />}
                            />
                        </ListItem>
                        {index + 1 !== arr.length && <Divider variant="middle" />}
                    </>)
                })}
            </List>
        </Page>
    );
}

export default BluetoothTab