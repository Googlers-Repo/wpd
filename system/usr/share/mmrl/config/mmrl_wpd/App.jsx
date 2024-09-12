import { Page } from "@mmrl/ui";
import { useActivity } from "@mmrl/hooks";
import { List, ListSubheader, ListItemButton, ListItemText, Divider } from "@mui/material";

import { BluetoothActivity } from "./activity/BluetoothActivity";
import { WLANActivity } from "./activity/WLANActivity";

import { useRenderToolbar } from "./hooks/useRenderToolbar";
import { SoundsListActivity } from "./activity/SoundsListActivity";

const App = () => {
  const { context } = useActivity();
  const { handleBack, RenderToolbar } = useRenderToolbar({ title: "WiFi Password Viewer" });

  const pushPage = (options) => () => {
    context.pushPage(options);
  };

  return (
    <Page onDeviceBackButton={handleBack} renderToolbar={RenderToolbar} modifier="noshadow">
      <List subheader={<ListSubheader>General</ListSubheader>}>
        <ListItemButton>
          <ListItemText
            primary="WLAN"
            secondary="View all your saved WLAN passwords"
            onClick={pushPage({
              component: WLANActivity,
              key: "WLANActivity",
            })}
          />
        </ListItemButton>
        <ListItemButton>
          <ListItemText
            primary="Bluetooth"
            secondary="See the stats of all your saved Bluetooth devices"
            onClick={pushPage({
              component: BluetoothActivity,
              key: "BluetoothActivity",
            })}
          />
        </ListItemButton>
      </List>

      <Divider />

      <List subheader={<ListSubheader>System Sounds (Beta)</ListSubheader>}>
        <ListItemButton>
          <ListItemText
            primary="Alarms"
            onClick={pushPage({
              component: SoundsListActivity,
              key: "SoundsListActivity_alarms",
              extra: {
                title: "Alarms",
                path: "/product/media/audio/alarms",
              },
            })}
          />
        </ListItemButton>
        <ListItemButton>
          <ListItemText
            primary="Notifications"
            onClick={pushPage({
              component: SoundsListActivity,
              key: "SoundsListActivity_notifications",
              extra: {
                title: "Notifications",
                path: "/product/media/audio/notifications",
              },
            })}
          />
        </ListItemButton>
        <ListItemButton>
          <ListItemText
            primary="Ringtones"
            onClick={pushPage({
              component: SoundsListActivity,
              key: "SoundsListActivity_ringtones",
              extra: {
                title: "Ringtones",
                path: "/product/media/audio/ringtones",
              },
            })}
          />
        </ListItemButton>
        <ListItemButton>
          <ListItemText
            primary="UI"
            onClick={pushPage({
              component: SoundsListActivity,
              key: "SoundsListActivity_ui",
              extra: {
                title: "UI",
                path: "/product/media/audio/ui",
              },
            })}
          />
        </ListItemButton>
      </List>
    </Page>
  );
};

export { App };
