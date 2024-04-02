import React from "react";
import { Toolbar } from "@mmrl/ui";

const useBackHandler = include("hooks/useBackHandler.js")

export default () => {
  const handleBack = useBackHandler()

  return (
    <Toolbar
      modifier="noshadow"
      sx={{
        background: "rgb(188,2,194)",
        background: "linear-gradient(22deg, rgba(188,2,194,1) 0%, rgba(74,20,140,1) 100%)",
      }}
    >
      <Toolbar.Left>
        <Toolbar.BackButton onClick={handleBack} />
      </Toolbar.Left>
      <Toolbar.Center>WiFi Password Viewer</Toolbar.Center>
    </Toolbar>
  );
};
