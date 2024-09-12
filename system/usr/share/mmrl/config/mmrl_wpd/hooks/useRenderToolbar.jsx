import { Toolbar } from "@mmrl/ui";
import { useActivity, useConfirm } from "@mmrl/hooks";

const useRenderToolbar = (options) => {
  const { context } = useActivity();
  const confirm = useConfirm();

  const handleBack = React.useCallback((e) => {
    if (!options?.onlyPop) {
      confirm({
        title: "Leaving?",
        description: "Are you sure that you want leave this config?",
        confirmationText: "Yes",
        cancellationText: "No",
      })
        .then(() => {
          if (typeof e.callParentHandler === "function") {
            e.callParentHandler();
          } else {
            context.popPage();
          }
        })
        .catch(() => {});
    } else {
      if (typeof e.callParentHandler === "function") {
        e.callParentHandler();
      } else {
        context.popPage();
      }
    }
  }, []);

  const RenderToolbar = () => (
    <Toolbar modifier="noshadow">
      <Toolbar.Left>{!options?.disableBackButton && <Toolbar.BackButton onClick={handleBack} />}</Toolbar.Left>
      <Toolbar.Center>{options?.title}</Toolbar.Center>
    </Toolbar>
  );

  return {
    RenderToolbar: RenderToolbar,
    handleBack: handleBack,
  };
};

export { useRenderToolbar };
