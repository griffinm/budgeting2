import { Avatar } from "@mantine/core";
import { getAvatarAlt } from "./utils";
import { Merchant } from "@/utils/types";

export function Logo({ merchant }: { merchant: Merchant }) {
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
