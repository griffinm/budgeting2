import { usePageTitle } from "@/hooks";
import { urls } from "@/utils/urls";
import { useEffect, useMemo, useState } from "react";
import { Button, Group, RenderTreeNodePayload, TextInput, Tree, UnstyledButton } from "@mantine/core";
import { MerchantTag } from "@/utils/types";
import { createMerchantTag, CreateMerchantTagRequest, fetchMerchantTags } from "@/api";
import { formatMerchantTagsAsTree } from "@/utils/merchantTagUtils";

export function MerchantTagsPage() {
  const setTitle = usePageTitle();
  const [merchantTags, setMerchantTags] = useState<MerchantTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newMerchantTag, setNewMerchantTag] = useState<CreateMerchantTagRequest>({
    name: '',
    parentMerchantTagId: null,
  });

  useEffect(() => {
    setTitle(urls.merchantTags.title());
  }, [setTitle]);

  useEffect(() => {
    setIsLoading(true);
    fetchMerchantTags()
      .then(setMerchantTags)
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreateMerchantTag = (merchantTag: CreateMerchantTagRequest) => {
    createMerchantTag({ data: merchantTag })
      .then((merchantTag) => {
        setMerchantTags([merchantTag, ...merchantTags]);
        setNewMerchantTag({ name: '', parentMerchantTagId: merchantTag.parentMerchantTagId });
      })
  };

  const merchantTagTree = useMemo(() => formatMerchantTagsAsTree({ merchantTags }), [merchantTags]);

  const renderTreeNode = ({
    node,
    expanded,
    tree,
    elementProps,
  }: RenderTreeNodePayload) => {
    return (
      <Group {...elementProps} onClick={() => !expanded && tree.toggleExpanded(node.value)}>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 font-bold text-xl">
            {expanded && (
              <div onClick={() => tree.toggleExpanded(node.value)}>
                -
              </div>
            )}
            {!expanded && (
              <div onClick={() => tree.toggleExpanded(node.value)}>
                +
              </div>
            )}
            <div className="flex-1 font-semibold align-middle text-xl">{node.label}</div>
          </div>
          <div className="ml-5">
            {expanded && <NewMerchantTagForm parentMerchantTagId={Number(node.value)} handleCreateMerchantTag={handleCreateMerchantTag} isLoading={isLoading} />}
          </div>
        </div>
      </Group>
    )
  };

  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleCreateMerchantTag(newMerchantTag);
      }}>
        <TextInput
          value={newMerchantTag.name}
          label="New Merchant Category"
          placeholder="Enter a new merchant tag"
          onChange={(e) => setNewMerchantTag({ ...newMerchantTag, name: e.target.value })}
        />
        <div className="mt-3">
          <Button type="submit" disabled={isLoading || !newMerchantTag.name}>Create</Button>
        </div>
      </form>
      <Tree
        levelOffset={10}
        expandOnClick={true}
        data={merchantTagTree}
        renderNode={renderTreeNode}
      />
    </div>
  );
}

const NewMerchantTagForm = ({
  parentMerchantTagId,
  handleCreateMerchantTag,
  isLoading,
}: {
  parentMerchantTagId: number;
  handleCreateMerchantTag: (merchantTag: CreateMerchantTagRequest) => void;
  isLoading: boolean;
}) => {
  const [newMerchantTag, setNewMerchantTag] = useState<CreateMerchantTagRequest>({
    name: '',
    parentMerchantTagId,
  });
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <div className="flex gap-2 flex-row">
        <div>
          <UnstyledButton size="xs" variant="outline" onClick={() => setIsOpen(true)}>
            <span className="hover:underline text-sm">Create New Child</span>
          </UnstyledButton>
        </div>
      </div>
    )
  }

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        const merchantTag = { ...newMerchantTag, parentMerchantTagId };
        setNewMerchantTag({ name: '', parentMerchantTagId });
        setIsOpen(false);
        handleCreateMerchantTag(merchantTag);
      }}
    >
      <div className="flex gap-2 flex-row">
        <div>
          <TextInput
            size="xs"
            placeholder="Enter a new merchant tag"
            value={newMerchantTag.name}
            onChange={(e) => setNewMerchantTag({ ...newMerchantTag, name: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <Button size="xs" type="submit" disabled={isLoading}>Create</Button>
          <Button size="xs" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
        </div>
      </div>
    </form>
  )
}