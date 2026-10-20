import { useEffect, useRef } from "react";
import type { EChartsCoreOption, EChartsType } from "echarts/core";
import { echarts } from "../lib/echarts";

interface Props {
  option: EChartsCoreOption;
  height: number;
  ariaLabel: string;
}

/**
 * Minimal ECharts wrapper: SVG renderer, resize-aware, disposes on unmount.
 * `height` is a minimum: in a figure card the chart also takes up any extra height the
 * card gets from its row. The chart is drawn in an absolutely positioned host, so its
 * pixel size never feeds back into the layout.
 */
export function EChart({ option, height, ariaLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const chart = useRef<EChartsType | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !host.current) return;
    const inst = echarts.init(host.current, undefined, { renderer: "svg" });
    chart.current = inst;
    let frame = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => inst.resize());
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      inst.dispose();
      chart.current = null;
    };
  }, []);

  useEffect(() => {
    chart.current?.setOption(option, { notMerge: true, lazyUpdate: false });
  }, [option]);

  return (
    <div ref={ref} className="echart" style={{ minHeight: height }} role="img" aria-label={ariaLabel}>
      <div ref={host} className="echart__host" />
    </div>
  );
}
