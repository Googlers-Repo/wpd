import { Toolbar } from "@mmrl/ui";
import React from "react";

const useBackHandler = include("hooks/useBackHandler.js")

export default () => {
  const handleBack = useBackHandler()

  return (
    <Toolbar modifier="noshadow">
      <Toolbar.Left>
        <Toolbar.BackButton onClick={handleBack} />
      </Toolbar.Left>
      <Toolbar.Center>WiFi Password Viewer</Toolbar.Center>
    </Toolbar>
  );
};
