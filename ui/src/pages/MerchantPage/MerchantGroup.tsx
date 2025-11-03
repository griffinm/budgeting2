import { MerchantLinking } from "@/components/MerchantLinking";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { Merchant } from "@/utils/types";
import { urls } from "@/utils/urls";
import { Card, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { Link } from "react-router-dom";


export function MerchantGroupCard({
  merchant,
  setMerchant,
}: {
  merchant: Merchant;
  setMerchant: (merchant: Merchant) => void;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold">Merchant Group</h2>
        <Tooltip
          label={
            <div className="max-w-md">
              <p className="mb-2">
                A Merchant Group is a way to combine multiple merchants into one for easier tracking. Sometimes merchant names
                are different across transactions. In order for Budgeting to know these are the same merchants they need to be grouped together.
              </p>
              <p className="mb-2">
                For instance <strong>"Amazon"</strong> and <strong>"Amazon.com, Inc."</strong> are the same merchant.
                Similarly <strong>"Starbucks"</strong> and <strong>"Starbucks Corporation"</strong> are the same merchant.
              </p>
              <p className="mb-2">
                This is why we have Merchant Groups. You can create a group for these merchants and then all the transactions for
                these merchants will be grouped together.
              </p>
              <p>
                You can also add merchants to an existing group.
              </p>
            </div>
          }
          multiline
          withArrow
          position="bottom-start"
          w={400}
        >
          <IconInfoCircle size={20} className="text-gray-500 cursor-help" />
        </Tooltip>
      </div>
      
      {/* Merchant Linking Component */}
      <div className="mb-6">
        <MerchantLinking 
          merchant={merchant} 
          onMerchantUpdate={setMerchant}
        />
      </div>

      {/* Group Information and Merchants */}
      {merchant.merchantGroup && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {merchant.merchantGroup.name}
            </h3>
            {merchant.merchantGroup.description && (
              <p className="text-gray-600 mb-4">{merchant.merchantGroup.description}</p>
            )}
            <div className="text-sm text-gray-500 mb-4">
              {merchant.merchantGroup.merchants?.length || 0} merchants in this group
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Merchants in this group:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {merchant.merchantGroup.merchants?.map((groupMerchant) => (
                <div
                  key={groupMerchant.id}
                  className={`p-3 border rounded-lg transition-colors ${
                    groupMerchant.id === merchant.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Link
                        to={urls.merchant.path(groupMerchant.id)}
                        className={`font-medium ${
                          groupMerchant.id === merchant.id
                            ? 'text-blue-700'
                            : 'text-gray-700 hover:text-blue-600'
                        }`}
                      >
                        {merchantDisplayName(groupMerchant)}
                      </Link>
                      {groupMerchant.id === merchant.merchantGroup?.primaryMerchant?.id && (
                        <div className="text-xs text-blue-600 font-medium mt-1">
                          Primary Merchant
                        </div>
                      )}
                      {groupMerchant.id === merchant.id && (
                        <div className="text-xs text-blue-600 font-medium mt-1">
                          Current Merchant
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}