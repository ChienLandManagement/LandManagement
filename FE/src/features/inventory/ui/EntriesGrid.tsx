import { Badge, Button, Group, NumberInput, Skeleton, Stack, Table, Text, Tooltip } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { RotateCcw, Save } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getCheckPeriodQueryKey,
  getGetEntriesQueryKey,
  getListPeriodsQueryKey,
  useSaveEntries,
} from '@/shared/api/generated/api';
import type { LandHolderTypeItem, LandTypeItem } from '@/shared/api/model';
import { showError, showSuccess } from '@/shared/api/utils';
import { buildHolderColumns, buildLandTypeRows, cellKey, formatNumberVi, type GridMode } from '../model/catalogTree';

interface EntryCell {
  landTypeId?: string;
  holderTypeId?: string;
  value?: number;
}

interface EntriesGridProps {
  periodId: string;
  mode: GridMode;
  serverCells: EntryCell[];
  landTypes: LandTypeItem[];
  holderTypes: LandHolderTypeItem[];
  readOnly: boolean;
  isLoading?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

interface GridCellInputProps {
  landTypeId: string;
  holderTypeId: string;
  value: number | string;
  isDirty: boolean;
  mode: GridMode;
  onChange: (landTypeId: string, holderTypeId: string, value: number | string) => void;
}

const GridCellInput = memo(function GridCellInput({
  landTypeId,
  holderTypeId,
  value,
  isDirty,
  mode,
  onChange,
}: GridCellInputProps) {
  return (
    <NumberInput
      value={value}
      onChange={(val) => onChange(landTypeId, holderTypeId, val)}
      hideControls
      min={0}
      decimalScale={mode === 'B01' ? 5 : 0}
      decimalSeparator=","
      thousandSeparator="."
      size="xs"
      styles={{
        input: {
          textAlign: 'right',
          minWidth: 88,
          backgroundColor: isDirty ? 'var(--mantine-color-yellow-0)' : undefined,
        },
      }}
    />
  );
});

export function EntriesGrid({
  periodId,
  mode,
  serverCells,
  landTypes,
  holderTypes,
  readOnly,
  isLoading,
  onDirtyChange,
}: EntriesGridProps) {
  const queryClient = useQueryClient();
  const saveEntries = useSaveEntries();

  const [edits, setEdits] = useState<Map<string, number | null>>(() => new Map());

  const serverMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const cell of serverCells) {
      if (cell.landTypeId && cell.holderTypeId && cell.value != null) {
        map.set(cellKey(cell.landTypeId, cell.holderTypeId), cell.value);
      }
    }
    return map;
  }, [serverCells]);

  // Reset bản nháp khi dữ liệu server thay đổi
  const prevServerCellsRef = useRef(serverCells);
  if (prevServerCellsRef.current !== serverCells) {
    prevServerCellsRef.current = serverCells;
    if (edits.size > 0) {
      setEdits(new Map());
    }
  }

  const isDirty = edits.size > 0;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const rows = useMemo(() => buildLandTypeRows(landTypes, mode), [landTypes, mode]);
  const holderCols = useMemo(() => buildHolderColumns(holderTypes), [holderTypes]);

  const handleCellChange = useCallback(
    (landTypeId: string, holderTypeId: string, rawVal: number | string) => {
      const key = cellKey(landTypeId, holderTypeId);
      const nextVal = rawVal === '' || rawVal == null ? null : Number(rawVal);
      if (nextVal !== null && Number.isNaN(nextVal)) return;

      setEdits((prev) => {
        const next = new Map(prev);
        const serverVal = serverMap.get(key) ?? null;
        if (nextVal === serverVal) {
          next.delete(key);
        } else {
          next.set(key, nextVal);
        }
        return next;
      });
    },
    [serverMap],
  );

  const getEffectiveValue = useCallback(
    (landTypeId: string, holderTypeId: string): number => {
      const key = cellKey(landTypeId, holderTypeId);
      if (edits.has(key)) {
        return edits.get(key) ?? 0;
      }
      return serverMap.get(key) ?? 0;
    },
    [edits, serverMap],
  );

  const handleReset = () => {
    setEdits(new Map());
  };

  const handleSave = async () => {
    if (!isDirty) return;
    const payloadCells = Array.from(edits.entries()).map(([key, value]) => {
      const [landTypeId, holderTypeId] = key.split('|');
      return { landTypeId, holderTypeId, value };
    });

    try {
      await saveEntries.mutateAsync({
        periodId,
        data: mode === 'B01' ? { areas: payloadCells } : { counts: payloadCells },
      });
      showSuccess('Lưu số liệu thành công');
      setEdits(new Map());
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getGetEntriesQueryKey(periodId) }),
        queryClient.invalidateQueries({ queryKey: getCheckPeriodQueryKey(periodId) }),
        queryClient.invalidateQueries({ queryKey: getListPeriodsQueryKey() }),
      ]);
    } catch (error) {
      showError(error);
    }
  };

  // Tính tổng cho từng cột ở dòng cuối bảng (chỉ cộng ô lá không-memo)
  const footerTotals = useMemo(() => {
    const colTotals = new Map<string, number>();
    let userTotal = 0;
    let managerTotal = 0;

    for (const row of rows) {
      if (!row.isLeaf || row.isMemo) continue;
      for (const leaf of holderCols.userLeaves) {
        const val = getEffectiveValue(row.id, leaf.id);
        colTotals.set(leaf.id, (colTotals.get(leaf.id) ?? 0) + val);
        userTotal += val;
      }
      for (const leaf of holderCols.managerLeaves) {
        const val = getEffectiveValue(row.id, leaf.id);
        colTotals.set(leaf.id, (colTotals.get(leaf.id) ?? 0) + val);
        managerTotal += val;
      }
    }

    return {
      colTotals,
      userTotal,
      managerTotal,
      grandTotal: userTotal + managerTotal,
    };
  }, [rows, holderCols, getEffectiveValue]);

  if (isLoading) {
    return (
      <Stack gap="sm">
        <Skeleton height={36} />
        <Skeleton height={320} />
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Đơn vị: {mode === 'B01' ? 'ha (tối đa 5 chữ số lẻ)' : 'người / đơn vị (số nguyên)'}
          </Text>
          {isDirty && (
            <Badge color="yellow" variant="light">
              Có {edits.size} ô thay đổi
            </Badge>
          )}
        </Group>

        {!readOnly && (
          <Group gap="xs">
            <Button
              variant="default"
              size="xs"
              leftSection={<RotateCcw size={14} />}
              disabled={!isDirty || saveEntries.isPending}
              onClick={handleReset}
            >
              Hủy thay đổi
            </Button>
            <Button
              size="xs"
              leftSection={<Save size={14} />}
              disabled={!isDirty}
              loading={saveEntries.isPending}
              onClick={handleSave}
            >
              Lưu thay đổi
            </Button>
          </Group>
        )}
      </Group>

      <div
        style={{
          overflow: 'auto',
          maxHeight: '65vh',
          border: '1px solid var(--mantine-color-gray-3)',
          borderRadius: 8,
        }}
      >
        <Table withTableBorder withColumnBorders highlightOnHover horizontalSpacing="xs" verticalSpacing={4}>
          <Table.Thead
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 3,
              backgroundColor: 'var(--mantine-color-gray-0)',
            }}
          >
            <Table.Tr>
              <Table.Th
                rowSpan={2}
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 4,
                  minWidth: 280,
                  backgroundColor: 'var(--mantine-color-gray-0)',
                }}
              >
                Loại đất
              </Table.Th>
              {holderCols.groups.map((group) => (
                <Table.Th key={group.id} colSpan={group.leaves.length} ta="center">
                  <Text size="xs" fw={600}>
                    {group.label}
                  </Text>
                </Table.Th>
              ))}
              {mode === 'B01' && (
                <>
                  <Table.Th rowSpan={2} ta="right" style={{ minWidth: 110 }}>
                    <Text size="xs" fw={600}>
                      Tổng người sử dụng
                    </Text>
                  </Table.Th>
                  <Table.Th rowSpan={2} ta="right" style={{ minWidth: 110 }}>
                    <Text size="xs" fw={600}>
                      Tổng người được giao quản lý
                    </Text>
                  </Table.Th>
                </>
              )}
              <Table.Th rowSpan={2} ta="right" style={{ minWidth: 110 }}>
                <Text size="xs" fw={600}>
                  Tổng cộng
                </Text>
              </Table.Th>
            </Table.Tr>

            <Table.Tr>
              {holderCols.allLeaves.map((leaf) => (
                <Table.Th key={leaf.id} ta="center" style={{ minWidth: 96 }}>
                  <Tooltip label={leaf.name} withArrow>
                    <Text size="xs" fw={600}>
                      {leaf.code || leaf.name}
                    </Text>
                  </Tooltip>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {rows.map((row) => {
              let rowUserTotal = 0;
              let rowManagerTotal = 0;

              const getRowColValue = (holderId: string): number => {
                if (row.isLeaf) {
                  return getEffectiveValue(row.id, holderId);
                }
                let sum = 0;
                for (const descId of row.leafDescendantIds) {
                  sum += getEffectiveValue(descId, holderId);
                }
                return sum;
              };

              for (const leaf of holderCols.userLeaves) {
                rowUserTotal += getRowColValue(leaf.id);
              }
              for (const leaf of holderCols.managerLeaves) {
                rowManagerTotal += getRowColValue(leaf.id);
              }
              const rowGrandTotal = rowUserTotal + rowManagerTotal;

              return (
                <Table.Tr
                  key={row.id}
                  style={{
                    backgroundColor: !row.isLeaf ? 'var(--mantine-color-gray-0)' : undefined,
                  }}
                >
                  <Table.Td
                    style={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      backgroundColor: !row.isLeaf ? 'var(--mantine-color-gray-0)' : 'var(--mantine-color-body)',
                      paddingLeft: 8 + row.depth * 16,
                    }}
                  >
                    <Text size="xs" fw={row.isLeaf ? 400 : 600} fs={row.isMemo ? 'italic' : undefined}>
                      {row.code} - {row.name}
                      {row.isMemo ? ' (trong đó)' : ''}
                    </Text>
                  </Table.Td>

                  {holderCols.allLeaves.map((leaf) => {
                    if (row.isLeaf && !readOnly) {
                      const key = cellKey(row.id, leaf.id);
                      const cellDirty = edits.has(key);
                      const inputValue = cellDirty ? (edits.get(key) ?? '') : (serverMap.get(key) ?? '');

                      return (
                        <Table.Td key={leaf.id} p={2}>
                          <GridCellInput
                            landTypeId={row.id}
                            holderTypeId={leaf.id}
                            value={inputValue}
                            isDirty={cellDirty}
                            mode={mode}
                            onChange={handleCellChange}
                          />
                        </Table.Td>
                      );
                    }

                    const val = getRowColValue(leaf.id);
                    return (
                      <Table.Td
                        key={leaf.id}
                        ta="right"
                        style={{ backgroundColor: !row.isLeaf ? 'var(--mantine-color-gray-0)' : undefined }}
                      >
                        <Text size="xs" fw={row.isLeaf ? 400 : 600}>
                          {val === 0 ? '—' : formatNumberVi(val, mode)}
                        </Text>
                      </Table.Td>
                    );
                  })}

                  {mode === 'B01' && (
                    <>
                      <Table.Td ta="right" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                        <Text size="xs" fw={600}>
                          {rowUserTotal === 0 ? '—' : formatNumberVi(rowUserTotal, mode)}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                        <Text size="xs" fw={600}>
                          {rowManagerTotal === 0 ? '—' : formatNumberVi(rowManagerTotal, mode)}
                        </Text>
                      </Table.Td>
                    </>
                  )}

                  <Table.Td ta="right" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                    <Text size="xs" fw={600}>
                      {rowGrandTotal === 0 ? '—' : formatNumberVi(rowGrandTotal, mode)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>

          <Table.Tfoot>
            <Table.Tr style={{ backgroundColor: 'var(--mantine-color-gray-1)' }}>
              <Table.Td
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  backgroundColor: 'var(--mantine-color-gray-1)',
                }}
              >
                <Text size="xs" fw={700}>
                  Tổng cộng
                </Text>
              </Table.Td>
              {holderCols.allLeaves.map((leaf) => {
                const total = footerTotals.colTotals.get(leaf.id) ?? 0;
                return (
                  <Table.Td key={leaf.id} ta="right">
                    <Text size="xs" fw={700}>
                      {total === 0 ? '—' : formatNumberVi(total, mode)}
                    </Text>
                  </Table.Td>
                );
              })}
              {mode === 'B01' && (
                <>
                  <Table.Td ta="right">
                    <Text size="xs" fw={700}>
                      {footerTotals.userTotal === 0 ? '—' : formatNumberVi(footerTotals.userTotal, mode)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="xs" fw={700}>
                      {footerTotals.managerTotal === 0 ? '—' : formatNumberVi(footerTotals.managerTotal, mode)}
                    </Text>
                  </Table.Td>
                </>
              )}
              <Table.Td ta="right">
                <Text size="xs" fw={700}>
                  {footerTotals.grandTotal === 0 ? '—' : formatNumberVi(footerTotals.grandTotal, mode)}
                </Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </div>
    </Stack>
  );
}
