import { Colors, type ThemeColorPalette } from "@/constants/theme";

/**
 * AttendWise intentionally uses one consistent starter light palette.
 * Theme switching was removed so a device system theme cannot change the app appearance.
 */
export function useColors(): ThemeColorPalette {
  return Colors.light;
}
