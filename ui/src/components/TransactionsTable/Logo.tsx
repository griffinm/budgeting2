import { Avatar, MantineSize } from "@mantine/core";
import { getAvatarAlt } from "./utils";
import { Merchant } from "@/utils/types";
import { IconMailDollar } from "@tabler/icons-react";

export function Logo({ merchant, isCheck=false, size="md" }: { merchant: Merchant, isCheck?: boolean, size?: MantineSize }) {
  if (isCheck) {
    return (
      <Avatar size={size} alt={merchant.name} name={merchant.name} color="gray">
        <IconMailDollar />
      </Avatar>
    )
  }

  if (!merchant.logoUrl) {
    return (
      <Avatar size={size} alt={merchant.name} name={merchant.name} color="initials">
        {getAvatarAlt(merchant)}
      </Avatar>
    )
  }

  return (
    <Avatar size={size} src={merchant.logoUrl} alt={merchant.name} />
  )
}
