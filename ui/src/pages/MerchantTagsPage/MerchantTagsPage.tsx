import { usePageTitle } from "@/hooks";
import { urls } from "@/utils/urls";
import { useEffect, useState } from "react";
import { MerchantCategoryTree } from "@/components/MerchantCategoryTree";
import { Button, Card } from "@mantine/core";
import { IconEye, IconPencil } from "@tabler/icons-react";

export default function MerchantTagsPage() {
  const setTitle = usePageTitle();
  const [isShowingEditView, setIsShowingEditView] = useState(false);
  
  useEffect(() => {
    setTitle(urls.merchantTags.title());
  }, [setTitle]);

  useEffect(() => {
    const handleHashChange = () => {
      const isEditing = window.location.hash.includes('#edit');
      setIsShowingEditView(isEditing);
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
  
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (isShowingEditView) {
      window.location.hash = '#edit';
    } else {
      window.location.hash = '';
    }
  }, [isShowingEditView]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end items-center">
        <div>
          <Button
            onClick={() => setIsShowingEditView(!isShowingEditView)}
            variant='outline'
            size="xs"
            leftSection={isShowingEditView ? <IconEye size={16} /> : <IconPencil size={16} />}
          >
            {isShowingEditView ? 'View' : 'Edit'} Categories
          </Button>
        </div>
      </div>
      
      <Card>
        {isShowingEditView ? (
          <MerchantCategoryTree.Edit />
        ) : (
          <MerchantCategoryTree.View />
        )}
      </Card>
    </div>
  );
}
