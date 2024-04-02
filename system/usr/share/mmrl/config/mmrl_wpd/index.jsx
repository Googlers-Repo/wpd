import React from "react";
import { Page, CodeBlock } from "@mmrl/ui";
import { useNativeStorage } from "@mmrl/hooks";
import { withRequireNewVersion } from "@mmrl/hoc";
import { List, ListItem, ListSubheader, Switch, ListItemText, Divider, Typography, Stack } from "@mui/material";

const RenderToolbar = include("components/RenderToolbar.jsx");

const useNetworks = include("hooks/useNetworks.js");
const useBackHandler = include("hooks/useBackHandler.js")

function App() {
  const networks = useNetworks();
  const handleBack = useBackHandler()
  const [hidePasswords, setHidePasswords] = useNativeStorage("wpd_hide_passwords", true);

  if (!networks) {
    return (
      <Page onDeviceBackButton={handleBack} renderToolbar={RenderToolbar}>
        <CenterBox>No networks found</CenterBox>
      </Page>
    );
  }
  return (
    <Page onDeviceBackButton={handleBack} renderToolbar={RenderToolbar} modifier="noshadow">
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
}

export default withRequireNewVersion({
  versionCode: 21510,
  component: App,
});
