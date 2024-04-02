import { useActivity, useConfirm } from "@mmrl/hooks";

export default () => {
  const { context } = useActivity();
  const confirm = useConfirm();

  return (e) => {
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
  };
};
