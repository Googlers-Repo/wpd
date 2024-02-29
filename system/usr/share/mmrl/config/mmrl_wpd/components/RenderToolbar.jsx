import React from "react";
import { Toolbar } from "@mmrl/ui";
import { useActivity } from "@mmrl/hooks";

export default () => {
  const { context } = useActivity();
  return (
    <Toolbar
      modifier="noshadow"
      sx={{
        background: "rgb(188,2,194)",
        background: "linear-gradient(22deg, rgba(188,2,194,1) 0%, rgba(74,20,140,1) 100%)",
      }}
    >
      <Toolbar.Left>
        <Toolbar.BackButton onClick={context.popPage} />
      </Toolbar.Left>
      <Toolbar.Center>WiFi Password Viewer</Toolbar.Center>
    </Toolbar>
  );
};
