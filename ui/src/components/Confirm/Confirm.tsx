import { Button, Modal } from "@mantine/core";

export type ConfirmParams = {
  opened: boolean;
  label: string;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Confirm({
  confirm,
}: {
  confirm: ConfirmParams;
}) {

  return (
    <Modal
      opened={confirm.opened}
      onClose={confirm.onCancel}
      title={confirm.title}
    >
      <p>{confirm.label}</p>
      <div className="flex flex-row gap-2 justify-end mt-5">
        <Button onClick={confirm.onCancel} variant="outline">Cancel</Button>
        <Button onClick={confirm.onConfirm} variant="filled">Confirm</Button>
      </div>
    </Modal>
  )
}