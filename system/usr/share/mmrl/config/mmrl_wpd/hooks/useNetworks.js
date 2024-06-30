import { useConfigStore } from "./hooks/useConfigStore.js";

const useNetworks = () => {
  const [networks, setNetworks] = React.useState(null);
  const config = useConfigStore();

  React.useEffect(() => {
    if (config) {
      const wifiXmlParser = new DOMParser();
      const xml = wifiXmlParser.parseFromString(config, "text/xml");

      const WifiConfigStoreData = xml.getElementsByTagName("WifiConfigStoreData")[0];
      const NetworkList = WifiConfigStoreData.getElementsByTagName("NetworkList")[0];

      // array
      const Network = [...NetworkList.getElementsByTagName("Network")];

      setNetworks(
        Network.flatMap((el) => {
          const WifiConfiguration = [...el.getElementsByTagName("WifiConfiguration")];

          return WifiConfiguration.map((s) => {
            const ssid = s.querySelector('string[name="SSID"]').innerHTML;

            const psk = s.querySelector('string[name="PreSharedKey"]');

            return {
              ssid: ssid.replace(/"(.+)"/g, "$1"),
              psk: psk ? psk.innerHTML.replace(/"(.+)"/g, "$1") : null,
            };
          });
        })
      );
    }
  }, [config]);

  return networks;
};

export { useNetworks }