const useConfigStore = () => {
  const [store, setStore] = React.useState(null);

  React.useEffect(() => {
    const miscWifiConfigStore = new SuFile("/data/misc/wifi/WifiConfigStore.xml");
    const miscApexDataWifiConfigStore = new SuFile("/data/misc/apexdata/com.android.wifi/WifiConfigStore.xml");

    if (miscWifiConfigStore.exist()) {
      setStore(miscWifiConfigStore.read());
    } else if (miscApexDataWifiConfigStore.exist()) {
      setStore(miscApexDataWifiConfigStore.read());
    } else {
      setStore(null);
    }
  }, []);

  return store;
};

export { useConfigStore }