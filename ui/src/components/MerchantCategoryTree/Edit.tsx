import { MerchantTag } from "@/utils/types";
import { Button, TextInput } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import {
   createMerchantTag as createMerchantTagApi,
   fetchMerchantTags,
   CreateMerchantTagRequest,
   deleteMerchantTag,
} from "@/api";
import { formatMerchantTagsAsTree } from "@/utils/merchantTagUtils";
import { Confirm, ConfirmParams } from "@/components/Confirm/Confirm";

export const Edit = () => {
  const [merchantTags, setMerchantTags] = useState<MerchantTag[]>([]);
  const organizedMerchantTags = useMemo(() => {
    return formatMerchantTagsAsTree({ merchantTags });
  }, [merchantTags]);
  const [confirm, setConfirm] = useState<ConfirmParams>({
    opened: false,
    label: '',
    onConfirm: () => {},
    onCancel: () => {},
    title: 'Delete Merchant Tag',
  });

  useEffect(() => {
    fetchMerchantTags()
      .then(setMerchantTags)
  }, []);

  const handleCreateMerchantTag = (params: CreateMerchantTagRequest) => {
    createMerchantTagApi({ data: params })
      .then((merchantTag) => {
        setMerchantTags([merchantTag, ...merchantTags]);
      })
  }

  const handleDeleteMerchantTag = (id: number) => {
    deleteMerchantTag({ id })
      .then(() => {
        setMerchantTags(merchantTags.filter((merchantTag) => merchantTag.id !== id));
      })
  }
  const onDeleteMerchantTag = (merchantTag: MerchantTag) => {
    setConfirm({
      opened: true,
      label: `Are you sure you want to delete ${merchantTag.name}?`,
      title: 'Delete Merchant Tag',
      onConfirm: () => {
        handleDeleteMerchantTag(merchantTag.id);
        setConfirm({
          opened: false,
          label: '',
          title: 'Delete Merchant Tag',
          onConfirm: () => {},
          onCancel: () => {}
        })
      },
      onCancel: () => setConfirm({
        opened: false,
        label: '',
        title: 'Delete Merchant Tag',
        onConfirm: () => {},
        onCancel: () => {}
      })
    })
  }

  return (
    <div>
      <Confirm confirm={confirm} />
      <NewMerchantTagForm
        onCancel={() => {}}
        saveMerchantTag={handleCreateMerchantTag}
      />
      {organizedMerchantTags.map((merchantTag) => (
        <div className="mb-2" key={merchantTag.id}>
          <TreeItem
            merchantTag={merchantTag}
            handleCreateMerchantTag={handleCreateMerchantTag}
            onDeleteMerchantTag={onDeleteMerchantTag}
          />
        </div>
      ))}
    </div>
  );
};

export const TreeItem = ({
  merchantTag,
  handleCreateMerchantTag,
  depth = 1,
  onDeleteMerchantTag,
}: {
  merchantTag: MerchantTag;
  handleCreateMerchantTag: (params: CreateMerchantTagRequest) => void;
  depth?: number;
  onDeleteMerchantTag: (merchantTag: MerchantTag) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const isLeaf = merchantTag.children.length === 0;
  const icon = expanded ? '-' : '+';
  const paddingLeft = depth * 15;

  return (
    <div className="cursor-pointer">
      <div
        className={`group font-semibold text-xl flex items-center gap-2 hover:bg-gray-100 rounded-md cursor-pointer py-2 ${isLeaf ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <span>{icon}</span>
        <span>{merchantTag.name}</span>
        <div className="flex hidden group-hover:flex gap-2">
          {!showOptions && <Button variant="outline" size="xs" onClick={() => setShowOptions(true)}>☰</Button>}
          {showOptions && (
            <>
              <Button variant="outline" size="xs">✎ Edit</Button>
              <Button variant="outline" size="xs" onClick={() => setShowForm(true)}>✎ Add Child</Button>
              <Button variant="outline" size="xs" color="red" onClick={() => onDeleteMerchantTag(merchantTag)}>🗑️ Delete</Button>
              <Button variant="outline" size="xs" onClick={() => setShowOptions(false)}>✕ Cancel</Button>
            </>
          )}
        </div>
      </div>
      {showForm && (
        <div style={{ paddingLeft: `${paddingLeft + 10}px` }}>
          <NewMerchantTagForm
            parentMerchantTagId={merchantTag.id}
            saveMerchantTag={(params) => {
              handleCreateMerchantTag({
                ...params,
              });
              setShowForm(false);
              setExpanded(true);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
      {expanded && (
        <div>
          {merchantTag.children.map((child) => (
            <div key={child.id} className="border-l-2 border-gray-200" style={{ paddingLeft: `${paddingLeft}px` }}>
              <TreeItem
                onDeleteMerchantTag={onDeleteMerchantTag}
                merchantTag={child}
                handleCreateMerchantTag={(params) => {
                  handleCreateMerchantTag({
                    ...params,
                  });
                  setShowForm(false);
                }}
                depth={depth + 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const NewMerchantTagForm = ({
  parentMerchantTagId,
  saveMerchantTag,
  onCancel,
}: {
  parentMerchantTagId?: number;
  saveMerchantTag: (params: CreateMerchantTagRequest) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveMerchantTag({ name, parentMerchantTagId });
    setName('');
    onCancel();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <TextInput
          size="xs"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a new category name"
        />
        <Button type="submit" variant="outline" size="xs" disabled={!name}>Create</Button>
        <Button type="button" variant="outline" size="xs" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};
