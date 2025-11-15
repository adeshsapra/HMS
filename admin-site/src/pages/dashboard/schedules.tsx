import React from "react";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { ClockIcon } from "@heroicons/react/24/outline";

export default function Schedules(): JSX.Element {
  return (
    <div className="mt-12">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-blue-gray-800">Schedule Management</h2>
        <p className="text-blue-gray-600">Manage doctor and staff schedules</p>
      </div>

      <Card className="border border-blue-gray-100 shadow-sm">
        <CardBody className="p-6">
          <div className="text-center py-12">
            <ClockIcon className="h-16 w-16 mx-auto text-blue-gray-400 mb-4" />
            <Typography variant="h5" color="blue-gray" className="mb-2">
              Schedule Module
            </Typography>
            <Typography variant="small" color="blue-gray" className="mb-4">
              Manage doctor schedules, staff shifts, and operating room schedules
            </Typography>
            <Button>Coming Soon</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

