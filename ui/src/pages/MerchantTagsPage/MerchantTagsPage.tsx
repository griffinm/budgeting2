import { usePageTitle } from "@/hooks";
import { urls } from "@/utils/urls";
import { useEffect, useState } from "react";
import { MerchantCategoryTree } from "@/components/MerchantCategoryTree";
import { Button, Card } from "@mantine/core";

export default function MerchantTagsPage() {
  const setTitle = usePageTitle();
  const [isShowingEditView, setIsShowingEditView] = useState(false);
  const pagetitle = isShowingEditView ? 'Edit Categories' : 'View Categories';
  
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{pagetitle}</h1>

        <div>
          <Button
            onClick={() => setIsShowingEditView(!isShowingEditView)}
            variant='outline'
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
