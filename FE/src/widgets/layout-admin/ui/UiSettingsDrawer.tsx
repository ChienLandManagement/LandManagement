import { Button, CheckIcon, ColorSwatch, Drawer, Group, SegmentedControl, Stack, Switch, Text, useMantineTheme } from '@mantine/core';
import { RotateCcw } from 'lucide-react';
import { type UiMainBg, type UiPrimaryColor, type UiRadius, useUiSettingsStore } from '@/shared/model/uiSettingsStore';

const PRIMARY_COLORS: { value: UiPrimaryColor; label: string }[] = [
  { value: 'teal', label: 'Xanh ngọc' },
  { value: 'blue', label: 'Xanh dương' },
  { value: 'indigo', label: 'Chàm' },
  { value: 'violet', label: 'Tím' },
  { value: 'green', label: 'Xanh lá' },
  { value: 'orange', label: 'Cam' },
];

const RADIUS_OPTIONS: { value: UiRadius; label: string }[] = [
  { value: 'xs', label: 'Nhỏ' },
  { value: 'sm', label: 'Vừa' },
  { value: 'md', label: 'Mặc định' },
  { value: 'lg', label: 'Bo tròn' },
];

const MAIN_BG_OPTIONS: { value: UiMainBg; label: string; color: string }[] = [
  { value: 'default', label: 'Trắng', color: '#ffffff' },
  { value: 'gray', label: 'Xám nhẹ', color: '#f8f9fa' },
  { value: 'cool', label: 'Xanh dịu', color: '#f1f5f9' },
  { value: 'warm', label: 'Ấm áp', color: '#fafaf9' },
];

interface UiSettingsDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export function UiSettingsDrawer({ opened, onClose }: UiSettingsDrawerProps) {
  const mantineTheme = useMantineTheme();
  const {
    primaryColor,
    defaultRadius,
    tableColumnBorders,
    mainBg,
    setPrimaryColor,
    setDefaultRadius,
    setTableColumnBorders,
    setMainBg,
    reset,
  } = useUiSettingsStore();

  return (
    <Drawer opened={opened} onClose={onClose} position="right" size="xs" title="Tùy chỉnh giao diện">
      <Stack gap="lg">
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Màu chủ đạo
          </Text>
          <Group gap="sm">
            {PRIMARY_COLORS.map((item) => (
              <ColorSwatch
                key={item.value}
                component="button"
                type="button"
                color={mantineTheme.colors[item.value][6]}
                onClick={() => setPrimaryColor(item.value)}
                aria-label={item.label}
                title={item.label}
                style={{ color: '#fff', cursor: 'pointer' }}
              >
                {primaryColor === item.value && <CheckIcon size={12} />}
              </ColorSwatch>
            ))}
          </Group>
        </Stack>

        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Độ bo góc
          </Text>
          <SegmentedControl
            fullWidth
            value={defaultRadius}
            onChange={(val) => setDefaultRadius(val as UiRadius)}
            data={RADIUS_OPTIONS}
          />
        </Stack>

        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Màu nền trang
          </Text>
          <Group gap="sm">
            {MAIN_BG_OPTIONS.map((item) => (
              <ColorSwatch
                key={item.value}
                component="button"
                type="button"
                color={item.color}
                onClick={() => setMainBg(item.value)}
                aria-label={item.label}
                title={item.label}
                style={{
                  color: mantineTheme.colors.dark[6],
                  cursor: 'pointer',
                  border: `1px solid ${mantineTheme.colors.gray[4]}`,
                }}
              >
                {mainBg === item.value && <CheckIcon size={12} />}
              </ColorSwatch>
            ))}
          </Group>
        </Stack>

        <Switch
          label="Hiển thị viền cột bảng"
          checked={tableColumnBorders}
          onChange={(e) => setTableColumnBorders(e.currentTarget.checked)}
        />

        <Button variant="default" leftSection={<RotateCcw size={14} />} onClick={reset}>
          Khôi phục mặc định
        </Button>
      </Stack>
    </Drawer>
  );
}
