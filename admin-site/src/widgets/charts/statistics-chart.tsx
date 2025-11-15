import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import Chart from "react-apexcharts";

export interface StatisticsChartProps {
  color?: string;
  chart: any;
  title: React.ReactNode;
  description: React.ReactNode;
  footer?: React.ReactNode;
}

export function StatisticsChart({ color = "blue", chart, title, description, footer }: StatisticsChartProps): JSX.Element {
  return (
    <Card className="border border-blue-gray-100 shadow-sm">
      <CardHeader variant="gradient" color={color as any} floated={false} shadow={false}>
        <Chart {...chart} />
      </CardHeader>
      <CardBody className="px-6 pt-0">
        <Typography variant="h6" color="blue-gray">
          {title}
        </Typography>
        <Typography variant="small" className="font-normal text-blue-gray-600">
          {description}
        </Typography>
      </CardBody>
      {footer && (
        <CardFooter className="border-t border-blue-gray-50 px-6 py-5">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

StatisticsChart.displayName = "/src/widgets/charts/statistics-chart.tsx";

export default StatisticsChart;

