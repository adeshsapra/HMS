import { useState } from "react";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { ChartBarIcon } from "@heroicons/react/24/outline";

export default function Reports() {
  return (
    <div className="mt-12">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-blue-gray-800">Reports & Analytics</h2>
        <p className="text-blue-gray-600">View and generate comprehensive reports</p>
      </div>

      <Card className="border border-blue-gray-100 shadow-sm">
        <CardBody className="p-6">
          <div className="text-center py-12">
            <ChartBarIcon className="h-16 w-16 mx-auto text-blue-gray-400 mb-4" />
            <Typography variant="h5" color="blue-gray" className="mb-2">
              Reports Module
            </Typography>
            <Typography variant="small" color="blue-gray" className="mb-4">
              Generate patient reports, financial reports, and analytics
            </Typography>
            <Button>Coming Soon</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

