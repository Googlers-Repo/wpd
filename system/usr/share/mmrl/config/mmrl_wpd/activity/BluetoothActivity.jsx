import { useNativeStorage } from "@mmrl/hooks";
import { CodeBlock, Page } from "@mmrl/ui";
import { Divider, List, ListItem, ListItemText, ListSubheader, Switch, Typography } from "@mui/material";

import { CenterBox } from "./components/CenterBox";

import { useRenderToolbar } from "./hooks/useRenderToolbar";
import { useBluetoothConfig } from "./hooks/useBluetoothConfig";

const BluetoothActivity = () => {
  const devices = useBluetoothConfig();
  const [hideStats, setHideStats] = useNativeStorage("wpd_hide_macs", true);

  const { handleBack, RenderToolbar } = useRenderToolbar({ title: "Bluetooth", onlyPop: true });

  if (!devices || devices.length === 0) {
    return (
      <Page onDeviceBackButton={handleBack} modifier="noshadow" renderToolbar={RenderToolbar}>
        <CenterBox>No devices found</CenterBox>
      </Page>
    );
  }

  return (
    <Page onDeviceBackButton={handleBack} modifier="noshadow" renderToolbar={RenderToolbar}>
      <List subheader={<ListSubheader>Settings</ListSubheader>}>
        <ListItem>
          <ListItemText primary="Hide all stats" />
          <Switch checked={hideStats} onChange={(e) => setHideStats(e.target.checked)} />
        </ListItem>
      </List>
      <Divider />
      <List subheader={<ListSubheader>Devices</ListSubheader>}>
        {devices.map((device, index, arr) => {
          const stats = JSON.stringify(device, null, 2);
          return (
            <>
              <ListItem>
                <ListItemText
                  sx={{
                    "& .MuiListItemText-secondary": {
                      WebkitTextSecurity: hideStats ? "disc" : "none",
                      wordWrap: "break-word",
                    },
                  }}
                  primary={<Typography variant="h5">{device.Name}</Typography>}
                  secondary={<CodeBlock lang="json" sx={{ pt: 1 }} children={hideStats ? stats.slice(0, 10) : stats} />}
                />
              </ListItem>
              {index + 1 !== arr.length && <Divider variant="middle" />}
            </>
          );
        })}
      </List>
    </Page>
  );
};

export { BluetoothActivity };
