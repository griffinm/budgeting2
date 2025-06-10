import { MerchantTag } from "@/utils/types";
import { Button, TextInput } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import {
   createMerchantTag as createMerchantTagApi,
   fetchMerchantTags,
   CreateMerchantTagRequest,
} from "@/api";
import { formatMerchantTagsAsTree } from "@/utils/merchantTagUtils";

export const MerchantCategoryTreeView = () => {
  const [merchantTags, setMerchantTags] = useState<MerchantTag[]>([]);
  const organizedMerchantTags = useMemo(() => {
    return formatMerchantTagsAsTree({ merchantTags });
  }, [merchantTags]);

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

  return (
    <div>
      <NewMerchantTagForm
        alwaysShow={true}
        saveMerchantTag={handleCreateMerchantTag}
      />
      {organizedMerchantTags.map((merchantTag) => (
        <div className="mb-2">
          <TreeItem key={merchantTag.id} merchantTag={merchantTag} handleCreateMerchantTag={handleCreateMerchantTag} />
        </div>
      ))}
    </div>
  );
};

export const TreeItem = ({
  merchantTag,
  handleCreateMerchantTag,
  depth = 1,
}: {
  merchantTag: MerchantTag;
  handleCreateMerchantTag: (params: CreateMerchantTagRequest) => void;
  depth?: number;
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
              <Button variant="outline" size="xs" color="red">🗑️ Delete</Button>
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
            <div className="border-l-2 border-gray-200" style={{ paddingLeft: `${paddingLeft}px` }}>
              <TreeItem
                key={child.id}
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
