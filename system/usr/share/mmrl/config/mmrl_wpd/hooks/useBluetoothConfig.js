const isBlueMac = (mac) => mac.match(/([0-9a-fA-F]{2}[:]){5}([0-9a-fA-F]{2})/)

const useBluetoothConfig = () => {
    const [config, setConfig] = React.useState([]);

    React.useEffect(() => {
        const conf = new SuFile("/data/misc/bluedroid/bt_config.conf")

        const bts = INI.parse(conf.read())

        if (conf.exist()) {
            setConfig(Object.entries(bts).filter((bt) => isBlueMac(bt[0])).map((arr) => Object.assign({
                Mac: arr[0]
            }, arr[1])))
        }
    }, [config]);

    return config;
};

export { useBluetoothConfig }