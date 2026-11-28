import {
  ActionIcon,
  Button,
  Center,
  Group,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, Inbox, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useUiSettingsStore } from '@/shared/model/uiSettingsStore';

export interface DataTableColumn<T> {
  key: string;
  title: ReactNode;
  sortable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  render?: (record: T, index: number) => ReactNode;
}

export interface DataTableAction<T> {
  label: string;
  icon?: ReactNode;
  color?: string;
  disabled?: (record: T) => boolean;
  hidden?: (record: T) => boolean;
  onClick: (record: T) => void;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  records: T[];
  rowKey?: keyof T | ((record: T, index: number) => string | number);
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  sortBy?: string;
  isDescending?: boolean;
  onSortChange?: (sortBy: string, isDescending: boolean) => void;
  page?: number;
  pageSize?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  emptyText?: string;
  actions?: DataTableAction<T>[];
  minWidth?: number | string;
  stickyHeader?: boolean;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function resolveRowKey<T>(
  record: T,
  index: number,
  rowKey?: keyof T | ((record: T, index: number) => string | number),
): string | number {
  if (typeof rowKey === 'function') {
    return rowKey(record, index);
  }
  if (rowKey !== undefined && record && typeof record === 'object' && rowKey in record) {
    const value = record[rowKey];
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }
  }
  if (record && typeof record === 'object' && 'id' in record) {
    const id = (record as { id?: unknown }).id;
    if (typeof id === 'string' || typeof id === 'number') {
      return id;
    }
  }
  return index;
}

function getCellValue<T>(record: T, key: string): ReactNode {
  if (record && typeof record === 'object' && key in record) {
    const value = (record as Record<string, unknown>)[key];
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return String(value);
  }
  return '—';
}

export function DataTable<T>({
  columns,
  records,
  rowKey,
  isLoading = false,
  isError = false,
  onRetry,
  sortBy,
  isDescending = false,
  onSortChange,
  page = 1,
  pageSize = 20,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  emptyText = 'Không có dữ liệu',
  actions,
  minWidth = 640,
  stickyHeader = true,
}: DataTableProps<T>) {
  const hasActions = Boolean(actions && actions.length > 0);
  const total = totalRecords ?? records.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startRecord = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = total === 0 ? 0 : Math.min(page * pageSize, total);
  const colSpan = columns.length + (hasActions ? 1 : 0);

  const handleSort = (columnKey: string) => {
    if (!onSortChange) return;
    if (sortBy === columnKey) {
      onSortChange(columnKey, !isDescending);
    } else {
      onSortChange(columnKey, false);
    }
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown size={14} opacity={0.45} />;
    }
    return isDescending ? <ArrowDown size={14} /> : <ArrowUp size={14} />;
  };

  return (
    <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={minWidth}>
        <Table
          striped
          highlightOnHover
          withColumnBorders={useUiSettingsStore((s) => s.tableColumnBorders)}
          stickyHeader={stickyHeader}
          verticalSpacing="sm"
          horizontalSpacing="md"
          styles={{
            thead: {
              backgroundColor: 'var(--mantine-primary-color-filled)',
            },
            th: {
              backgroundColor: 'transparent',
              color: 'var(--mantine-primary-color-contrast)',
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th
                  key={column.key}
                  style={{ width: column.width, textAlign: column.align ?? 'left', whiteSpace: 'nowrap' }}
                >
                  {column.sortable && onSortChange ? (
                    <UnstyledButton
                      onClick={() => handleSort(column.key)}
                      c="white"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                    >
                      <span>{column.title}</span>
                      {renderSortIcon(column.key)}
                    </UnstyledButton>
                  ) : (
                    column.title
                  )}
                </Table.Th>
              ))}
              {hasActions && (
                <Table.Th style={{ width: 1, whiteSpace: 'nowrap' }}>
                  <Text size="sm" fw={600}>
                    Thao tác
                  </Text>
                </Table.Th>
              )}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {isLoading ? (
              Array.from({ length: Math.min(pageSize, 5) }, (_, i) => `row-${i}`).map((rowKeyId) => (
                <Table.Tr key={rowKeyId}>
                  {columns.map((col) => (
                    <Table.Td key={`${rowKeyId}-${col.key}`}>
                      <Skeleton height={18} radius="sm" />
                    </Table.Td>
                  ))}
                  {hasActions && (
                    <Table.Td key={`${rowKeyId}-actions`}>
                      <Skeleton height={18} radius="sm" />
                    </Table.Td>
                  )}
                </Table.Tr>
              ))
            ) : isError ? (
              <Table.Tr>
                <Table.Td colSpan={colSpan}>
                  <Center py="xl">
                    <Stack align="center" gap="xs">
                      <AlertCircle size={28} color="var(--mantine-color-red-6)" />
                      <Text size="sm" c="red" fw={500}>
                        Không thể tải dữ liệu. Vui lòng thử lại.
                      </Text>
                      {onRetry && (
                        <Button
                          variant="light"
                          color="red"
                          size="xs"
                          leftSection={<RefreshCw size={14} />}
                          onClick={onRetry}
                        >
                          Thử lại
                        </Button>
                      )}
                    </Stack>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : records.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={colSpan}>
                  <Center py="xl">
                    <Stack align="center" gap="xs">
                      <Inbox size={28} opacity={0.45} />
                      <Text size="sm" c="dimmed">
                        {emptyText}
                      </Text>
                    </Stack>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : (
              records.map((record, index) => {
                const visibleActions = actions?.filter((action) => !action.hidden?.(record)) ?? [];

                return (
                  <Table.Tr key={resolveRowKey(record, index, rowKey)}>
                    {columns.map((column) => (
                      <Table.Td key={column.key} style={{ textAlign: column.align ?? 'left' }}>
                        {column.render ? column.render(record, index) : getCellValue(record, column.key)}
                      </Table.Td>
                    ))}
                    {hasActions && (
                      <Table.Td style={{ textAlign: 'right' }}>
                        <Group gap={4} justify="flex-end" wrap="nowrap">
                          {visibleActions.map((action) => (
                            <Tooltip key={action.label} label={action.label} withArrow>
                              <ActionIcon
                                variant="subtle"
                                color={action.color ?? 'gray'}
                                radius="xl"
                                aria-label={action.label}
                                disabled={action.disabled?.(record)}
                                onClick={() => action.onClick(record)}
                              >
                                {action.icon}
                              </ActionIcon>
                            </Tooltip>
                          ))}
                        </Group>
                      </Table.Td>
                    )}
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {(onPageChange || onPageSizeChange) && !isError && (
        <Group
          justify="space-between"
          align="center"
          px="md"
          py="sm"
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            backgroundColor: 'var(--mantine-color-body)',
            borderTop: '1px solid var(--mantine-color-default-border)',
          }}
        >
          <Group gap="sm" align="center">
            <Text size="sm" c="dimmed">
              {startRecord}–{endRecord} trên tổng {total}
            </Text>
            {onPageSizeChange && (
              <Select
                size="xs"
                w={96}
                aria-label="Số dòng mỗi trang"
                value={String(pageSize)}
                onChange={(value) => {
                  if (value) {
                    onPageSizeChange(Number(value));
                  }
                }}
                data={pageSizeOptions.map((size) => ({
                  value: String(size),
                  label: `${size} / trang`,
                }))}
                allowDeselect={false}
              />
            )}
          </Group>

          {onPageChange && totalPages > 1 && (
            <Pagination size="sm" value={page} total={totalPages} onChange={onPageChange} />
          )}
        </Group>
      )}
    </Paper>
  );
}
