import '@mantine/charts/styles.css';
import { DonutChart } from '@mantine/charts';
import {
  Alert,
  Box,
  Button,
  Center,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Info } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { formatArea } from '@/features/inventory';
import { useGetPeriodDashboard, useListPeriods } from '@/shared/api/generated/api';
import type { DashboardLandTypeItem } from '@/shared/api/model';
import { formatDate } from '@/shared/lib/date';

const LEVEL1_COLORS: Record<string, string> = {
  NNP: 'green.6',
  PNN: 'blue.6',
  CSD: 'gray.6',
};

const FALLBACK_COLORS = ['teal.6', 'indigo.6', 'orange.6', 'cyan.6', 'violet.6'];

function getLandTypeColor(code?: string, index = 0): string {
  if (code && LEVEL1_COLORS[code]) {
    return LEVEL1_COLORS[code];
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function formatPercent(value?: number | null): string {
  if (value == null) return '—';
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(value)}%`;
}

function formatChange(value?: number | null): string {
  if (value == null || value === 0) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatArea(value)}`;
}

export function DashboardView() {
  const { data: periodsData, isLoading: isLoadingPeriods } = useListPeriods({
    PageSize: 100,
  });

  const sortedPeriods = useMemo(() => {
    const items = periodsData?.data?.items ?? [];
    return [...items].sort((a, b) => {
      const dateA = a.cutoffDate ?? '';
      const dateB = b.cutoffDate ?? '';
      return dateB.localeCompare(dateA);
    });
  }, [periodsData?.data?.items]);

  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPeriodId && sortedPeriods.length > 0) {
      const firstId = sortedPeriods[0]?.id;
      if (firstId) {
        setSelectedPeriodId(firstId);
      }
    }
  }, [selectedPeriodId, sortedPeriods]);

  const periodOptions = useMemo(
    () =>
      sortedPeriods
        .filter((p) => p.id)
        .map((p) => ({
          value: p.id ?? '',
          label: `${formatDate(p.cutoffDate, false)}${p.wardName ? ` - ${p.wardName}` : ''}`,
        })),
    [sortedPeriods],
  );

  const { data: dashboardData, isLoading: isLoadingDashboard } = useGetPeriodDashboard(selectedPeriodId ?? '', {
    query: { enabled: Boolean(selectedPeriodId) },
  });

  const dashboard = dashboardData?.data;

  const donutData = useMemo(() => {
    const landTypes = dashboard?.landTypes ?? [];
    return landTypes
      .filter((lt) => lt.level === 1 && (lt.area ?? 0) > 0)
      .map((lt, idx) => ({
        name: lt.name ?? lt.code ?? 'Khác',
        value: lt.area ?? 0,
        color: getLandTypeColor(lt.code, idx),
      }));
  }, [dashboard?.landTypes]);

  const totalDiff =
    dashboard?.previousTotalArea != null && dashboard.totalArea != null
      ? dashboard.totalArea - dashboard.previousTotalArea
      : null;

  if (isLoadingPeriods) {
    return (
      <Stack gap="md">
        <Skeleton height={32} width="40%" />
        <Skeleton height={96} />
        <Skeleton height={280} />
      </Stack>
    );
  }

  if (sortedPeriods.length === 0) {
    return (
      <Alert icon={<Info size={18} />} title="Chưa có dữ liệu tổng quan" color="blue" variant="light">
        <Stack gap="sm" align="flex-start">
          <Text size="sm">Chưa có kỳ kiểm kê, vào mục Kiểm kê để tạo.</Text>
          <Button
            component={Link}
            to="/inventory-periods"
            size="xs"
            variant="light"
            rightSection={<ArrowRight size={14} />}
          >
            Đi tới Kiểm kê
          </Button>
        </Stack>
      </Alert>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center" wrap="wrap">
        <Box>
          <Title order={2} size="h3">
            Tổng quan hiện trạng đất đai
          </Title>
          <Text size="sm" c="dimmed">
            Thống kê diện tích và cơ cấu sử dụng đất theo kỳ kiểm kê
          </Text>
        </Box>
        <Select
          label="Kỳ kiểm kê"
          placeholder="Chọn kỳ kiểm kê"
          data={periodOptions}
          value={selectedPeriodId}
          onChange={setSelectedPeriodId}
          w={{ base: '100%', sm: 280 }}
          allowDeselect={false}
        />
      </Group>

      {isLoadingDashboard ? (
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={88} />
            ))}
          </SimpleGrid>
          <Skeleton height={280} />
        </Stack>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Tổng diện tích (ha)
              </Text>
              <Text size="xl" fw={700} mt="xs">
                {formatArea(dashboard?.totalArea)}
              </Text>
              {totalDiff != null && (
                <Text size="xs" c={totalDiff > 0 ? 'teal' : totalDiff < 0 ? 'red' : 'dimmed'} mt={4}>
                  {formatChange(totalDiff)} ha so với kỳ trước ({formatDate(dashboard?.previousCutoffDate, false)})
                </Text>
              )}
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Đất nông nghiệp (ha)
              </Text>
              <Text size="xl" fw={700} mt="xs" c="green.7">
                {formatArea(dashboard?.agriculturalArea)}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Cơ cấu: {formatPercent(dashboard?.agriculturalPercent)}
              </Text>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Đất phi nông nghiệp (ha)
              </Text>
              <Text size="xl" fw={700} mt="xs" c="blue.7">
                {formatArea(dashboard?.nonAgriculturalArea)}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Cơ cấu: {formatPercent(dashboard?.nonAgriculturalPercent)}
              </Text>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Số biến động trong kỳ
              </Text>
              <Text size="xl" fw={700} mt="xs">
                {dashboard?.changeCount ?? 0}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Hồ sơ biến động được ghi nhận
              </Text>
            </Paper>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, lg: 12 }} spacing="md">
            <Paper withBorder p="md" radius="md" style={{ gridColumn: 'span 4' }}>
              <Title order={4} size="h5" mb="md">
                Biểu đồ cơ cấu nhóm đất
              </Title>
              {donutData.length > 0 ? (
                <Center py="md">
                  <DonutChart
                    data={donutData}
                    size={220}
                    thickness={28}
                    withLabelsLine
                    withLabels
                    tooltipDataSource="segment"
                    valueFormatter={(v) => `${formatArea(v)} ha`}
                  />
                </Center>
              ) : (
                <Center py="xl">
                  <Text size="sm" c="dimmed">
                    Chưa có dữ liệu biểu đồ
                  </Text>
                </Center>
              )}
            </Paper>

            <Paper withBorder p="md" radius="md" style={{ gridColumn: 'span 8' }}>
              <Title order={4} size="h5" mb="md">
                Bảng cơ cấu loại đất
              </Title>
              <Table.ScrollContainer minWidth={540}>
                <Table striped highlightOnHover withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Loại đất</Table.Th>
                      <Table.Th ta="right">Diện tích (ha)</Table.Th>
                      <Table.Th ta="right">Cơ cấu (%)</Table.Th>
                      <Table.Th ta="right">Biến động trong kỳ (ha)</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {(dashboard?.landTypes ?? []).map((item: DashboardLandTypeItem) => {
                      const isLevel1 = item.level === 1;
                      const change = item.change ?? 0;
                      const changeColor = change > 0 ? 'teal' : change < 0 ? 'red' : 'dimmed';

                      return (
                        <Table.Tr key={`${item.code}-${item.level}`}>
                          <Table.Td pl={isLevel1 ? undefined : 'lg'}>
                            <Text size="sm" fw={isLevel1 ? 700 : 400}>
                              {item.code} - {item.name}
                            </Text>
                          </Table.Td>
                          <Table.Td ta="right">
                            <Text size="sm" fw={isLevel1 ? 700 : 400}>
                              {formatArea(item.area)}
                            </Text>
                          </Table.Td>
                          <Table.Td ta="right">
                            <Text size="sm" fw={isLevel1 ? 700 : 400}>
                              {formatPercent(item.percent)}
                            </Text>
                          </Table.Td>
                          <Table.Td ta="right">
                            <Text size="sm" fw={isLevel1 ? 700 : 400} c={changeColor}>
                              {formatChange(item.change)}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Paper>
          </SimpleGrid>
        </>
      )}
    </Stack>
  );
}
