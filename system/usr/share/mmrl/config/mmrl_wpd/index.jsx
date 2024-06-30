import { withRequireNewVersion } from "@mmrl/hoc";
import { Page, Tabbar, Toolbar } from "@mmrl/ui";

import { BluetoothTab } from "./tabs/BluetoothTab";
import { WLANTab } from "./tabs/WLANTab";
import { useBackHandler } from "./hooks/useBackHandler";

import { useActivity } from "@mmrl/hooks";

function App() {
  const { handleBack, index, setIndex } = useBackHandler()

  const renderTabs = () => {
    return [
      {
        content: <WLANTab />,
        tab: <Tabbar.Tab label="WLAN" />,
      },
      {
        content: <BluetoothTab />,
        tab: <Tabbar.Tab label="Bluetooth" />,
      }
    ];
  };

  return (
    <Page onDeviceBackButton={handleBack} renderToolbar={() => (
      <Toolbar modifier="noshadow">
        <Toolbar.Left>
          <Toolbar.BackButton onClick={handleBack} />
        </Toolbar.Left>
        <Toolbar.Center>WiFi Password Viewer</Toolbar.Center>
      </Toolbar>
    )} modifier="noshadow" >
      <Tabbar
        modifier="noshadow"
        position="top"
        index={index}
        onPreChange={(event) => {
          if (event.index != index) {
            setIndex(event.index);
          }
        }}
        renderTabs={renderTabs}
      />
    </Page >
  );
}

export default withRequireNewVersion({
  versionCode: 21918,
  component: App,
});
