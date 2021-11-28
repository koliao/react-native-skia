import type { RefObject } from "react";
import { useRef } from "react";
import { Platform } from "react-native";

import {
  Skia,
  BlendMode,
  PaintStyle,
  StrokeJoin,
  StrokeCap,
} from "../../../skia";
import type { IRuntimeEffect, IPaint } from "../../../skia";

export const useRTRef = () => useRef<IRuntimeEffect>(null);
export const usePaintRef = () => useRef<IPaint>(null);

export type SkEnum<T> = Uncapitalize<keyof T extends string ? keyof T : never>;

export interface CustomPaintProps {
  paint?: RefObject<IPaint>;
  color?: string;
  strokeWidth?: number;
  blendMode?: SkEnum<typeof BlendMode>;
  style?: SkEnum<typeof PaintStyle>;
  strokeJoin?: SkEnum<typeof StrokeJoin>;
  strokeCap?: SkEnum<typeof StrokeCap>;
  strokeMiter?: number;
  opacity?: number;
}

export const enumKey = <K extends string>(k: K) =>
  (k.charAt(0).toUpperCase() + k.slice(1)) as Capitalize<K>;

export const alpha = (c: number) => ((c >> 24) & 255) / 255;
export const red = (c: number) => (c >> 16) & 255;
export const green = (c: number) => (c >> 8) & 255;
export const blue = (c: number) => c & 255;
export const color = (r: number, g: number, b: number, af: number) => {
  const a = Math.round(af * 255);
  let processedColor = ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
  // On android we need to move the alpha byte to the start of the structure
  if (Platform.OS === "android") {
    processedColor = ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;
  }
  return processedColor;
};

// TODO: add support for currentOpacity
export const processColor = (cl: string | number, currentOpacity: number) => {
  const icl = typeof cl === "string" ? Skia.Color(cl) : cl;
  const r = red(icl);
  const g = green(icl);
  const b = blue(icl);
  const o = alpha(icl);
  return color(r, g, b, o * currentOpacity);
};

export const processPaint = (
  paint: IPaint,
  currentOpacity: number,
  {
    color: cl,
    blendMode,
    style,
    strokeWidth,
    strokeJoin,
    strokeCap,
    strokeMiter,
    opacity,
  }: CustomPaintProps
) => {
  if (cl !== undefined) {
    const c = processColor(cl, currentOpacity);
    paint.setColor(c);
  } else {
    const c = processColor(paint.getColor(), currentOpacity);
    paint.setColor(c);
  }
  if (blendMode !== undefined) {
    paint.setBlendMode(BlendMode[enumKey(blendMode)]);
  }
  if (style !== undefined) {
    paint.setStyle(PaintStyle[enumKey(style)]);
  }
  if (strokeJoin !== undefined) {
    paint.setStrokeJoin(StrokeJoin[enumKey(strokeJoin)]);
  }
  if (strokeCap !== undefined) {
    paint.setStrokeCap(StrokeCap[enumKey(strokeCap)]);
  }
  if (strokeMiter !== undefined) {
    paint.setStrokeMiter(strokeMiter);
  }
  if (strokeWidth !== undefined) {
    paint.setStrokeWidth(strokeWidth);
  }
  if (opacity !== undefined) {
    paint.setAlphaf(opacity);
  }
};

export const selectPaint = (
  currentPaint: IPaint,
  {
    paint,
    color: cl,
    blendMode,
    style: paintStyle,
    strokeWidth,
    strokeJoin,
    strokeCap,
    strokeMiter,
    opacity,
  }: CustomPaintProps
) => {
  const hasCustomPaint =
    cl !== undefined ||
    blendMode !== undefined ||
    paintStyle !== undefined ||
    strokeWidth !== undefined ||
    strokeJoin !== undefined ||
    opacity !== undefined ||
    strokeCap !== undefined ||
    strokeMiter !== undefined;
  const parentPaint = paint?.current ?? currentPaint;
  if (hasCustomPaint) {
    return parentPaint.copy();
  }
  return parentPaint;
};