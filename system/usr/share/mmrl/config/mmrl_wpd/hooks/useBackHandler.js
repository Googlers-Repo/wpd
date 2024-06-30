import { useActivity, useConfirm } from "@mmrl/hooks";

const useBackHandler = () => {
  const { context } = useActivity();
  const confirm = useConfirm();

  const [index, setIndex] = React.useState(0);

  const backHandler = React.useCallback((e) => {
    if (index === 0) {
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
        .catch(() => { });
    } else {
      setIndex(0)
    }
  }, [index])

  return {
    handleBack: backHandler,
    index: index,
    setIndex: setIndex
  }

};

export { useBackHandler }