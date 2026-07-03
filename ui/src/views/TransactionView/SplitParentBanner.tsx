import { Link } from "react-router-dom";
import { Alert } from "@mantine/core";
import { IconArrowsSplit } from "@tabler/icons-react";
import { Transaction } from "@/utils/types";
import { urls } from "@/utils/urls";
import { formatDollars } from "@/utils/currencyUtils";
import { format } from "date-fns";

export function SplitParentBanner({ parent }: { parent: Transaction }) {
  return (
    <Alert color="blue" variant="light">
      <div className="flex items-center gap-2">
        <IconArrowsSplit className="w-4 h-4 text-blue-500" />
        <span>
          This is part of a split transaction:{' '}
          <Link to={urls.transaction.path(parent.id)} className="font-medium underline">
            {parent.name}
          </Link>{' '}
          ({formatDollars(parent.amount, { cents: true })} on {format(new Date(parent.date), 'MMMM d, yyyy')})
        </span>
      </div>
    </Alert>
  );
}
