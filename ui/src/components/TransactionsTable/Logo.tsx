import { Avatar } from "@mantine/core";
import { getAvatarAlt } from "./utils";
import { Merchant } from "@/utils/types";
import { IconMailDollar } from "@tabler/icons-react";

export function Logo({ merchant, isCheck=false }: { merchant: Merchant, isCheck?: boolean }) {
  if (isCheck) {
    return (
      <Avatar size="md" alt={merchant.name} name={merchant.name} color="gray">
        <IconMailDollar />
      </Avatar>
    )
  }
  
  if (!merchant.logoUrl) {
    return (
      <Avatar size="md" alt={merchant.name} name={merchant.name} color="initials">
        {getAvatarAlt(merchant)}
      </Avatar>
    )
  }

  return (
    <img src={merchant.logoUrl} alt={merchant.name} className="h-full w-full rounded-xl" />
  )
}
