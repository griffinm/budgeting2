import { useContext, useEffect, useState } from "react";
import { fetchTags, createTag as createTagApi } from "@/api";
import { Tag } from "@/utils/types";
import { NotificationContext } from "@/providers/Notification/NotificationContext";

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    setLoading(true);
    fetchTags()
      .then(setTags)
      .finally(() => setLoading(false));
  }, []);

  const createTag = async (name: string): Promise<Tag> => {
    try {
      const newTag = await createTagApi({ name });
      setTags((prev) => [...prev, newTag]);
      return newTag;
    } catch {
      showNotification({ title: 'Error', message: 'Failed to create tag.', type: 'error' });
      throw new Error('Failed to create tag');
    }
  };

  return { tags, loading, createTag };
}
