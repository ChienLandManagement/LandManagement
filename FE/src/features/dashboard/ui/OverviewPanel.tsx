import { BarChart } from '@mantine/charts';
import { Alert, Anchor, Center, Group, Paper, SimpleGrid, Text, Title } from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useMemo } from 'react';
import { formatArea } from '@/features/inventory';
import { useCheckPeriod, useGetDashboardOverview } from '@/shared/api/generated/api';
import { formatDate } from '@/shared/lib/date';

interface OverviewPanelProps {
  wardId?: string | null;
  periodId?: string | null;
}

const DOSSIER_CARDS = [
  { key: 'issued', label: 'Đã cấp GCN', color: 'teal.7' },
  { key: 'processing', label: 'Đang xử lý', color: 'blue.7' },
  { key: 'backlog', label: 'Hồ sơ tồn', color: 'orange.7' },
  { key: 'needSupplement', label: 'Cần bổ sung', color: 'yellow.8' },
  { key: 'rejected', label: 'Từ chối', color: 'red.7' },
] as const;

/** Khối cảnh báo và chỉ số hồ sơ GCN, đặt ngay dưới tiêu đề trang Tổng quan. */
export function OverviewAlerts({ wardId, periodId }: OverviewPanelProps) {
  const navigate = useNavigate();
  const { data } = useGetDashboardOverview({ WardId: wardId || null });
  const { data: checkData } = useCheckPeriod(periodId ?? '', { query: { enabled: Boolean(periodId) } });

  const overview = data?.data;
  const issueCount = checkData?.data?.issues?.length ?? 0;
  const overdue = overview?.dossiers?.overdue ?? 0;
  const missing = overview?.parcelsMissingInfo ?? 0;
  const hasWarning = overdue > 0 || missing > 0 || issueCount > 0;

  return (
    <>
      {hasWarning ? (
        <Alert color="orange" variant="light" icon={<AlertTriangle size={18} />} title="Cần xử lý">
          <Group gap="lg" wrap="wrap">
            {missing > 0 && (
              <Anchor component={Link} to="/parcels" size="sm">
                {missing} thửa còn thiếu thông tin
              </Anchor>
            )}
            {overdue > 0 && (
              <Anchor
                component="button"
                type="button"
                size="sm"
                onClick={() => navigate({ to: '/dossiers', search: { overdue: true } })}
              >
                {overdue} hồ sơ quá hạn
              </Anchor>
            )}
            {issueCount > 0 && periodId && (
              <Anchor
                component="button"
                type="button"
                size="sm"
                onClick={() => navigate({ to: '/inventory-periods/$periodId', params: { periodId } })}
              >
                {issueCount} chỗ lệch số liệu ở kỳ đang xem
              </Anchor>
            )}
          </Group>
        </Alert>
      ) : (
        <Alert color="teal" variant="light" icon={<CheckCircle2 size={18} />}>
          Không có thửa thiếu thông tin, hồ sơ quá hạn hay lệch số liệu.
        </Alert>
      )}

      <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} spacing="md">
        {DOSSIER_CARDS.map((card) => (
          <Paper key={card.key} withBorder p="md" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              {card.label}
            </Text>
            <Text size="xl" fw={700} mt="xs" c={card.color}>
              {overview?.dossiers?.[card.key] ?? 0}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>
    </>
  );
}

/** Biểu đồ diện tích nông nghiệp và phi nông nghiệp qua các kỳ của xã đang xem. */
export function AreaTrendChart({ wardId }: Pick<OverviewPanelProps, 'wardId'>) {
  const { data } = useGetDashboardOverview({ WardId: wardId || null });

  const chartData = useMemo(
    () =>
      (data?.data?.trend ?? []).map((point) => ({
        kỳ: formatDate(point.cutoffDate, false),
        'Nông nghiệp': point.agriculturalArea ?? 0,
        'Phi nông nghiệp': point.nonAgriculturalArea ?? 0,
      })),
    [data?.data?.trend],
  );

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={4} size="h5" mb="md">
        Diện tích qua các kỳ (ha)
      </Title>
      {chartData.length >= 2 ? (
        <BarChart
          h={260}
          data={chartData}
          dataKey="kỳ"
          type="stacked"
          series={[
            { name: 'Nông nghiệp', color: 'green.6' },
            { name: 'Phi nông nghiệp', color: 'blue.6' },
          ]}
          valueFormatter={(v) => formatArea(v)}
        />
      ) : (
        <Center py="xl">
          <Text size="sm" c="dimmed">
            Cần ít nhất hai kỳ có số liệu để vẽ biểu đồ
          </Text>
        </Center>
      )}
    </Paper>
  );
}
