export const LAND_CHANGE_REASON_LABELS: Record<string, string> = {
  Remeasure: 'Đo đạc lại',
  CorrectError: 'Sửa sai số liệu kỳ trước',
  Reclamation: 'Lấn biển, bồi lắng',
  Erosion: 'Sạt lở',
  BoundaryChange: 'Điều chỉnh địa giới',
  Other: 'Lý do khác',
};

export const LAND_CHANGE_REASON_OPTIONS = Object.entries(LAND_CHANGE_REASON_LABELS).map(([value, label]) => ({
  value,
  label,
}));
