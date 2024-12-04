const btnShowPwds = document.getElementById("show-passwords");
const ksuWebui = document.getElementById("ksu-webui");

if (!window["ksu"] || !ksu["mmrl"]) {
  ksuWebui.style.display = "block";
}

function buttonText(hide) {
  btnShowPwds.innerHTML = hide ? "Show Passwords" : "Hide Passwords";
}

function renderTable(hidePasswords, wifiConfigs) {
  const tableBody = document
    .getElementById("wifi-table")
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = "";

  wifiConfigs.forEach((config, index) => {
    const row = document.createElement("tr");

    const groupClass = Math.floor(index / 1) % 2 === 0 ? "group-1" : "group-2";
    row.classList.add(groupClass);

    const ssidCell = document.createElement("td");
    ssidCell.textContent = config.ssid;
    row.appendChild(ssidCell);

    const pskCell = document.createElement("td");
    pskCell.textContent = hidePasswords ? "********" : config.psk || "N/A";
    row.appendChild(pskCell);

    tableBody.appendChild(row);
  });
}

window.onload = async () => {
  const hidePasswords = localStorage.getItem("hidePasswords") === "true";

  const configStore = await execCommand(
    "cat /data/misc/apexdata/com.android.wifi/WifiConfigStore.xml || cat /data/misc/wifi/WifiConfigStore.xml"
  );

  const wifiXmlParser = new DOMParser();
  const xml = wifiXmlParser.parseFromString(configStore, "text/xml");
  const WifiConfigStoreData = xml.getElementsByTagName("WifiConfigStoreData")[0];
  const NetworkList = WifiConfigStoreData.getElementsByTagName("NetworkList")[0];
  const Network = [...NetworkList.getElementsByTagName("WifiConfiguration")];

  const wifiConfigs = Network.map((s) => {
    const ssid = s
      .querySelector('string[name="SSID"]')
      .textContent.replace(/"(.+)"/g, "$1");
    const psk = s.querySelector('string[name="PreSharedKey"]')
      ? s
          .querySelector('string[name="PreSharedKey"]')
          .textContent.replace(/"(.+)"/g, "$1")
      : null;

    return { ssid, psk };
  });

  buttonText(hidePasswords);

  renderTable(hidePasswords, wifiConfigs);

  btnShowPwds.addEventListener("click", () => {
    const hide = !(localStorage.getItem("hidePasswords") === "true");
    localStorage.setItem("hidePasswords", hide.toString());
    buttonText(hide);
    renderTable(hide, wifiConfigs);
  });
};

async function execCommand(command) {
  return new Promise((resolve, reject) => {
    const callbackName = `exec_callback_${Date.now()}`;
    window[callbackName] = (errno, stdout, stderr) => {
      delete window[callbackName];
      if (errno === 0) {
        resolve(stdout);
      } else {
        console.error(`Error executing command: ${stderr}`);
        reject(stderr);
      }
    };
    try {
      ksu.exec(command, "{}", callbackName);
    } catch (error) {
      console.error(`Execution error: ${error}`);
      reject(error);
    }
  });
}
