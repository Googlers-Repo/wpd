import { withRequireNewVersion } from "@mmrl/hoc";
import { Page, Tabbar } from "@mmrl/ui";
import React from "react";

const BluetoothTab = include("tabs/BluetoothTab.jsx");
const WLANTab = include("tabs/WLANTab.jsx");
const RenderToolbar = include("components/RenderToolbar.jsx");
const useBackHandler = include("hooks/useBackHandler.js")


function App() {
  const handleBack = useBackHandler()
  const [index, setIndex] = React.useState(0);

  const renderTabs = () => {
    return [
      {
        content: <WLANTab />,
        tab: <Tabbar.Tab label="WLAN" />,
      },
      {
        content: <BluetoothTab />,
        tab: <Tabbar.Tab label="Bluetooth" />,
      },
    ];
  };

  return (
    <Page onDeviceBackButton={handleBack} renderToolbar={RenderToolbar} modifier="noshadow">
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
    </Page>
  );
}

export default withRequireNewVersion({
  versionCode: 21510,
  component: App,
});
