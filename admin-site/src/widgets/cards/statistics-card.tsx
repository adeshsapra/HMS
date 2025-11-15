import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";

export interface StatisticsCardProps {
  color?: string;
  icon: React.ReactNode;
  title: React.ReactNode;
  value: React.ReactNode;
  footer?: React.ReactNode;
}

export function StatisticsCard({ color = "blue", icon, title, value, footer }: StatisticsCardProps): JSX.Element {
  return (
    <Card className="border border-blue-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader
        variant="gradient"
        color={color as any}
        floated={false}
        shadow={false}
        className="absolute grid h-14 w-14 place-items-center rounded-lg shadow-md"
      >
        {icon}
      </CardHeader>
      <CardBody className="p-5 pt-8 text-right">
        <Typography variant="small" className="font-semibold text-blue-gray-600 mb-1 uppercase text-xs tracking-wider">
          {title}
        </Typography>
        <Typography variant="h4" color="blue-gray" className="font-bold">
          {value}
        </Typography>
      </CardBody>
      {footer && (
        <CardFooter className="border-t border-blue-gray-50 p-4 bg-blue-gray-50/30">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

StatisticsCard.displayName = "/src/widgets/cards/statistics-card.tsx";

export default StatisticsCard;

