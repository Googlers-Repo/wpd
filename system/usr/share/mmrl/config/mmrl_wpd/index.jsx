import React from "react";
import { Page } from "@mmrl/ui";
import { useNativeStorage } from "@mmrl/hooks";
import { List, ListItem, ListSubheader, Switch, ListItemText, Divider } from "@mui/material";

const RenderToolbar = include("components/RenderToolbar.jsx");
const CenterBox = include("components/CenterBox.jsx");
const useNetworks = include("hooks/useNetworks.js");

function App() {
  const networks = useNetworks();
  const [hidePasswords, setHidePasswords] = useNativeStorage("wpd_hide_passwords", true);

  if (!networks) {
    return (
      <Page renderToolbar={RenderToolbar}>
        <CenterBox>No networks found</CenterBox>
      </Page>
    );
  }

  return (
    <Page renderToolbar={RenderToolbar} modifier="noshadow">
      <List subheader={<ListSubheader>Settings</ListSubheader>}>
        <ListItem>
          <ListItemText primary="Hide passwords" />
          <Switch checked={hidePasswords} onChange={(e) => setHidePasswords(e.target.checked)} />
        </ListItem>
      </List>
      <Divider />
      <List subheader={<ListSubheader>Passwords</ListSubheader>}>
        {networks.map((wifi) => (
          <ListItem>
            <ListItemText
              sx={{
                "& .MuiListItemText-secondary": {
                  WebkitTextSecurity: wifi.psk !== null && hidePasswords ? "disc" : "none",
                  wordWrap: "break-word",
                  fontStyle: wifi.psk === null ? "italic" : "none",
                },
              }}
              primary={wifi.ssid}
              secondary={wifi.psk ? wifi.psk : "Has no password"}
            />
          </ListItem>
        ))}
      </List>
    </Page>
  );
}

export default () => {
  if (BuildConfig.VERSION_CODE < 21410) {
    return (
      <Page renderToolbar={RenderToolbar}>
        <CenterBox>
          WPD requires MMRL above <strong>2.14.10</strong>!
        </CenterBox>
      </Page>
    );
  } else {
    return <App />;
  }
};
