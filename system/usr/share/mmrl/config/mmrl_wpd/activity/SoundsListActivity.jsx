import { List } from "@mui/material";
import { useActivity } from "@mmrl/hooks";
import { Page } from "@mmrl/ui";
import FlatList from "flatlist-react";

import { CenterBox } from "./components/CenterBox";
import { ListItemSound } from "./components/ListItemSound";

import { useRenderToolbar } from "./hooks/useRenderToolbar";

const SoundsListActivity = () => {
  const { extra } = useActivity();

  const { title, path: __path } = extra;
  const file = React.useMemo(() => new SuFile(String(__path)), [__path]);

  const { handleBack, RenderToolbar } = useRenderToolbar({ title: title, onlyPop: true });

  if (!file.exist()) {
    return (
      <Page onDeviceBackButton={handleBack} modifier="noshadow" renderToolbar={RenderToolbar}>
        <CenterBox>No sounds found</CenterBox>
      </Page>
    );
  }

  return (
    <Page onDeviceBackButton={handleBack} modifier="noshadow" renderToolbar={RenderToolbar}>
      <List>
        <FlatList
          list={file.list()}
          renderItem={(sound, key) => {
            const fullPath = path.resolve(file.getPath(), sound);
            return <ListItemSound key={key} title={sound} src={fullPath} />;
          }}
          renderOnScroll
          renderWhenEmpty={() => <></>}
        />
      </List>
    </Page>
  );
};

export { SoundsListActivity };
