import { useNativeStorage } from "@mmrl/hooks";
import { CodeBlock, Page } from "@mmrl/ui";
import { Divider, List, ListItem, ListItemText, ListSubheader, Switch, Typography } from "@mui/material";

import { CenterBox } from "./components/CenterBox";

import { useRenderToolbar } from "./hooks/useRenderToolbar";
import { useNetworks } from "./hooks/useNetworks";

const WLANActivity = () => {
  const networks = useNetworks();
  const [hidePasswords, setHidePasswords] = useNativeStorage("wpd_hide_passwords", true);

  const { handleBack, RenderToolbar } = useRenderToolbar({ title: "WLAN", onlyPop: true });

  if (!networks) {
    return (
      <Page onDeviceBackButton={handleBack} modifier="noshadow" renderToolbar={RenderToolbar}>
        <CenterBox>No networks found</CenterBox>
      </Page>
    );
  }
  return (
    <Page onDeviceBackButton={handleBack} modifier="noshadow" renderToolbar={RenderToolbar}>
      <List subheader={<ListSubheader>Settings</ListSubheader>}>
        <ListItem>
          <ListItemText primary="Hide passwords" />
          <Switch checked={hidePasswords} onChange={(e) => setHidePasswords(e.target.checked)} />
        </ListItem>
      </List>
      <Divider />
      <List subheader={<ListSubheader>Passwords</ListSubheader>}>
        {networks.map((wifi, index, arr) => (
          <>
            <ListItem>
              <ListItemText
                sx={{
                  "& .MuiListItemText-secondary": {
                    WebkitTextSecurity: wifi.psk !== null && hidePasswords ? "disc" : "none",
                    wordWrap: "break-word",
                    fontStyle: wifi.psk === null ? "italic" : "none",
                  },
                }}
                primary={<Typography variant="h5">{wifi.ssid}</Typography>}
                secondary={<CodeBlock sx={{ pt: 1 }} children={wifi.psk ? wifi.psk : "Has no password"} />}
              />
            </ListItem>
            {index + 1 !== arr.length && <Divider variant="middle" />}
          </>
        ))}
      </List>
    </Page>
  );
};

export { WLANActivity };
