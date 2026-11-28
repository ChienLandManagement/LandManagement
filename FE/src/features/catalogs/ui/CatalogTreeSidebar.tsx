import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { ChevronDown, ChevronRight, FolderTree, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { type TreeNode, filterVisibleTreeNodes } from '../model/treeUtils';

interface CatalogTreeItem {
  id?: string;
  code?: string;
  name?: string;
  parentId?: string | null;
}

interface CatalogTreeSidebarProps<T extends CatalogTreeItem> {
  title: string;
  items: TreeNode<T>[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function CatalogTreeSidebar<T extends CatalogTreeItem>({
  title,
  items,
  selectedId,
  onSelect,
}: CatalogTreeSidebarProps<T>) {
  const [treeSearch, setTreeSearch] = useState('');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());

  const visibleNodes = useMemo(() => {
    const q = treeSearch.trim().toLowerCase();
    if (q) {
      return items.filter(
        (item) =>
          item.code?.toLowerCase().includes(q) || item.name?.toLowerCase().includes(q),
      );
    }
    return filterVisibleTreeNodes(items, collapsedIds);
  }, [items, collapsedIds, treeSearch]);

  const toggleExpand = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Paper
      withBorder
      p="sm"
      radius="md"
      miw={{ base: '100%', md: 240 }}
      maw={{ base: '100%', md: 420 }}
      style={{ flexShrink: 0 }}
    >
      <Stack gap="xs">
        <Group gap="xs">
          <FolderTree size={16} />
          <Text size="sm" fw={600}>
            {title}
          </Text>
        </Group>

        <TextInput
          size="sm"
          placeholder="Tìm trong cây..."
          leftSection={<Search size={14} />}
          value={treeSearch}
          onChange={(e) => setTreeSearch(e.currentTarget.value)}
        />

        <UnstyledButton
          onClick={() => onSelect(null)}
          px="xs"
          py={6}
          style={(theme) => ({
            borderRadius: theme.radius.sm,
            backgroundColor:
              selectedId === null ? 'var(--mantine-primary-color-light)' : 'transparent',
            color:
              selectedId === null ? 'var(--mantine-primary-color-light-color)' : 'inherit',
          })}
        >
          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" fw={600}>
              Tất cả
            </Text>
            <Badge size="sm" variant="light">
              {items.length}
            </Badge>
          </Group>
        </UnstyledButton>

        <Stack gap={2}>
            {visibleNodes.map((node) => {
              const id = node.id ?? '';
              const isSelected = Boolean(id && selectedId === id);
              const isCollapsed = Boolean(id && collapsedIds.has(id));
              const showToggle = !treeSearch.trim() && node.hasChildren && Boolean(id);

              return (
                <Group
                  key={id || `${node.code}-${node.depth}`}
                  gap={4}
                  pl={node.depth * 14}
                  wrap="nowrap"
                  px={6}
                  py={4}
                  style={(theme) => ({
                    borderRadius: theme.radius.sm,
                    backgroundColor: isSelected
                      ? 'var(--mantine-primary-color-light)'
                      : 'transparent',
                    color: isSelected ? 'var(--mantine-primary-color-light-color)' : 'inherit',
                  })}
                >
                  {showToggle ? (
                    <ActionIcon
                      variant="subtle"
                      size="xs"
                      color="gray"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(id);
                      }}
                      aria-label={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
                    >
                      {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    </ActionIcon>
                  ) : (
                    <Box w={18} style={{ flexShrink: 0 }} />
                  )}
                  <UnstyledButton
                    onClick={() => onSelect(id || null)}
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    <Text size="sm" fw={node.depth === 0 || node.hasChildren ? 600 : 400} truncate>
                      {node.code ? `${node.code} - ` : ''}
                      {node.name ?? '—'}
                    </Text>
                  </UnstyledButton>
                </Group>
              );
            })}
        </Stack>
      </Stack>
    </Paper>
  );
}
