import * as echarts from "echarts/core";
import { BarChart, LineChart, ScatterChart } from "echarts/charts";
import { GridComponent, MarkLineComponent, TooltipComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import { LabelLayout } from "echarts/features";

echarts.use([LineChart, BarChart, ScatterChart, GridComponent, TooltipComponent, MarkLineComponent, SVGRenderer, LabelLayout]);

export { echarts };
