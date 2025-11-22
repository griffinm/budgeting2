import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Text, TextInput, Textarea, Modal, Badge, Group, Stack, Alert, Loader, Select } from '@mantine/core';
import { IconLink, IconUsers, IconPlus, IconX, IconCheck, IconArrowRight } from '@tabler/icons-react';
import { Merchant, MerchantGroup, MerchantGroupSuggestion } from '@/utils/types';
import { fetchMerchantGroupSuggestions, createMerchantGroup, fetchMerchant } from '@/api/merchant-client';
import { addMerchantToGroup, removeMerchantFromGroup, setPrimaryMerchant, fetchMerchantGroups } from '@/api/merchant-groups-client';

interface MerchantLinkingProps {
  merchant: Merchant;
  onMerchantUpdate: (merchant: Merchant) => void;
}

export function MerchantLinking({ merchant, onMerchantUpdate }: MerchantLinkingProps) {
  const [suggestions, setSuggestions] = useState<MerchantGroupSuggestion[]>([]);
  const [merchantGroups, setMerchantGroups] = useState<MerchantGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [addToGroupModalOpen, setAddToGroupModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const loadSuggestions = useCallback(async () => {
    setSuggestionsLoading(true);
    try {
      const suggestions = await fetchMerchantGroupSuggestions(merchant.id);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  }, [merchant.id]);

  useEffect(() => {
    loadMerchantGroups();
    if (!merchant.merchantGroup) {
      loadSuggestions();
    }
  }, [merchant.id, merchant.merchantGroup, loadSuggestions]);

  const loadMerchantGroups = async () => {
    try {
      const groups = await fetchMerchantGroups();
      setMerchantGroups(groups);
    } catch (error) {
      console.error('Failed to load merchant groups:', error);
    }
  };

  const refreshMerchantData = async () => {
    try {
      const updatedMerchant = await fetchMerchant({ id: merchant.id });
      onMerchantUpdate(updatedMerchant);
    } catch (error) {
      console.error('Failed to refresh merchant data:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    setLoading(true);
    try {
      await createMerchantGroup(merchant.id, {
        groupName: groupName.trim(),
        description: groupDescription.trim() || undefined
      });
      
      setCreateGroupModalOpen(false);
      setGroupName('');
      setGroupDescription('');
      
      // Refresh merchant data
      await loadMerchantGroups();
      await refreshMerchantData();
      
      // Show success message
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGroup = async (groupId: number) => {
    setLoading(true);
    try {
      await addMerchantToGroup(groupId, merchant.id);
      await loadMerchantGroups();
      await refreshMerchantData();
    } catch (error) {
      console.error('Failed to add merchant to group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromGroup = async () => {
    if (!merchant.merchantGroup) return;

    setLoading(true);
    try {
      await removeMerchantFromGroup(merchant.merchantGroup.id, merchant.id);
      await loadMerchantGroups();
      await refreshMerchantData();
    } catch (error) {
      console.error('Failed to remove merchant from group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async () => {
    if (!merchant.merchantGroup) return;

    setLoading(true);
    try {
      await setPrimaryMerchant(merchant.merchantGroup.id, merchant.id);
      await loadMerchantGroups();
      await refreshMerchantData();
    } catch (error) {
      console.error('Failed to set primary merchant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToExistingGroup = async () => {
    if (!selectedGroupId) return;

    setLoading(true);
    try {
      await addMerchantToGroup(Number(selectedGroupId), merchant.id);
      setAddToGroupModalOpen(false);
      setSelectedGroupId(null);
      await loadMerchantGroups();
      await refreshMerchantData();
    } catch (error) {
      console.error('Failed to add merchant to existing group:', error);
    } finally {
      setLoading(false);
    }
  };

  if (merchant.merchantGroup) {
    return (
      <Card>
        <Group justify="space-between" mb="md">
          <Group>
            <IconUsers size={20} />
            <Text fw={600}>Merchant Group</Text>
          </Group>
          <Badge color="blue" variant="light">
            {merchant.merchantGroup.name}
          </Badge>
        </Group>

        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            This merchant is part of the "{merchant.merchantGroup.name}" group
            {merchant.merchantGroup.description && ` - ${merchant.merchantGroup.description}`}
          </Text>

          <Group gap="xs">
            {merchant.merchantGroup.primaryMerchant?.id === merchant.id ? (
              <Badge color="green" size="sm">Primary</Badge>
            ) : (
              <Button
                size="xs"
                variant="light"
                onClick={handleSetPrimary}
                loading={loading}
                leftSection={<IconCheck size={14} />}
              >
                Set as Primary
              </Button>
            )}
            
            <Button
              size="xs"
              variant="outline"
              color="red"
              onClick={handleRemoveFromGroup}
              loading={loading}
              leftSection={<IconX size={14} />}
            >
              Remove from Group
            </Button>
          </Group>
        </Stack>
      </Card>
    );
  }

  return (
    <Card>
      <Group justify="space-between" mb="md">
        <Group>
          <IconLink size={20} />
          <Text fw={600}>Link Merchants</Text>
        </Group>
        <Group gap="sm">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAddToGroupModalOpen(true)}
            leftSection={<IconArrowRight size={16} />}
            disabled={!merchantGroups || merchantGroups.length === 0}
          >
            Add to Existing Group
          </Button>
          <Button
            size="sm"
            variant="light"
            onClick={() => setCreateGroupModalOpen(true)}
            leftSection={<IconPlus size={16} />}
          >
            Create Group
          </Button>
        </Group>
      </Group>

      {suggestionsLoading ? (
        <Group justify="center" py="md">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">Loading suggestions...</Text>
        </Group>
      ) : suggestions && suggestions.length > 0 ? (
        <Stack gap="md">
          <Alert color="blue" title="Suggested Merchants to Link">
            <Text size="sm">
              We found {suggestions?.length || 0} merchant(s) that might be related to this one.
            </Text>
          </Alert>

          <Stack gap="sm">
            {(suggestions || []).slice(0, 5).map((suggestion) => (
              <Group key={suggestion.merchant.id} justify="space-between" p="sm" style={{ border: '1px solid #e9ecef', borderRadius: '8px' }}>
                <div>
                  <Text fw={500}>{suggestion.merchant.customName || suggestion.merchant.name}</Text>
                  <Text size="sm" c="dimmed">{suggestion.reason}</Text>
                </div>
                <Group gap="xs">
                  <Badge size="sm" color="green" variant="light">
                    {Math.round(suggestion.confidence * 100)}% match
                  </Badge>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => {
                      // Find a suitable group or create one
                      const existingGroup = merchantGroups.find(group => 
                        group.merchants?.some(m => m.id === suggestion.merchant.id)
                      );
                      if (existingGroup) {
                        handleAddToGroup(existingGroup.id);
                      } else {
                        // Create a new group with both merchants
                        setGroupName(suggestion.merchant.name);
                        setCreateGroupModalOpen(true);
                      }
                    }}
                    loading={loading}
                  >
                    Link
                  </Button>
                </Group>
              </Group>
            ))}
          </Stack>
        </Stack>
      ) : (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            No similar merchants found. You can still create a group manually or add this merchant to an existing group.
          </Text>
          
          {merchantGroups && merchantGroups.length > 0 && (
            <Alert color="blue" title="Available Groups">
              <Text size="sm" mb="sm">
                You have {merchantGroups?.length || 0} existing merchant group(s):
              </Text>
              <Stack gap="xs">
                {(merchantGroups || []).slice(0, 3).map((group) => (
                  <Group key={group.id} justify="space-between" p="xs" style={{ border: '1px solid #e9ecef', borderRadius: '6px' }}>
                    <div>
                      <Text fw={500} size="sm">{group.name}</Text>
                      <Text size="xs" c="dimmed">
                        {group.merchantCount || (group.merchants?.length || 0)} merchants
                        {group.description && ` • ${group.description}`}
                      </Text>
                    </div>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => {
                        setSelectedGroupId(group.id.toString());
                        setAddToGroupModalOpen(true);
                      }}
                    >
                      Add Here
                    </Button>
                  </Group>
                ))}
                {merchantGroups && merchantGroups.length > 3 && (
                  <Text size="xs" c="dimmed" ta="center">
                    ... and {(merchantGroups?.length || 0) - 3} more groups
                  </Text>
                )}
              </Stack>
            </Alert>
          )}
        </Stack>
      )}

      <Modal
        opened={createGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
        title="Create Merchant Group"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Group Name"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
          
          <Textarea
            label="Description (Optional)"
            placeholder="Enter group description"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            rows={3}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={() => setCreateGroupModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              loading={loading}
              disabled={!groupName.trim()}
            >
              Create Group
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={addToGroupModalOpen}
        onClose={() => setAddToGroupModalOpen(false)}
        title="Add to Existing Group"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Select an existing merchant group to add "{merchant.customName || merchant.name}" to:
          </Text>
          
          <Select
            label="Select Group"
            placeholder="Choose a group..."
            value={selectedGroupId}
            onChange={setSelectedGroupId}
            data={(merchantGroups || []).map(group => ({
              value: group.id.toString(),
              label: `${group.name} (${group.merchantCount || (group.merchants?.length || 0)} merchants)`
            }))}
            required
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={() => setAddToGroupModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddToExistingGroup}
              loading={loading}
              disabled={!selectedGroupId}
            >
              Add to Group
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  );
}
