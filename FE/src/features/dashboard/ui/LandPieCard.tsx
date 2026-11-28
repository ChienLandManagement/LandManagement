import { PieChart } from '@mantine/charts';
import { Center, ColorSwatch, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { formatArea } from '@/features/inventory';

export interface PieSlice {
  name: string;
  value: number;
  color: string;
}

/** Biểu đồ tròn đặc kèm chú giải diện tích từng phần. */
export function LandPieCard({ title, data }: { title: string; data: PieSlice[] }) {
  return (
    <Paper withBorder p="md" radius="md">
      <Title order={4} size="h5" mb="md">
        {title}
      </Title>
      {data.length > 0 ? (
        <Stack align="center" gap="md">
          <PieChart
            data={data}
            size={200}
            withTooltip
            tooltipDataSource="segment"
            strokeWidth={1}
            valueFormatter={(v) => `${formatArea(v)} ha`}
          />
          <Stack gap={4} w="100%">
            {data.map((d) => (
              <Group key={d.name} gap="xs" wrap="nowrap">
                <ColorSwatch color={`var(--mantine-color-${d.color.replace('.', '-')})`} size={12} />
                <Text size="xs" style={{ flex: 1 }} lineClamp={1}>
                  {d.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatArea(d.value)} ha
                </Text>
              </Group>
            ))}
          </Stack>
        </Stack>
      ) : (
        <Center py="xl">
          <Text size="sm" c="dimmed">
            Chưa có dữ liệu biểu đồ
          </Text>
        </Center>
      )}
    </Paper>
  );
}
