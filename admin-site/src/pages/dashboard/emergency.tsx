import React from "react";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function Emergency(): JSX.Element {
  return (
    <div className="mt-12">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-blue-gray-800">Emergency Management</h2>
        <p className="text-blue-gray-600">Manage emergency cases and protocols</p>
      </div>

      <Card className="border border-blue-gray-100 shadow-sm">
        <CardBody className="p-6">
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-red-400 mb-4" />
            <Typography variant="h5" color="blue-gray" className="mb-2">
              Emergency Module
            </Typography>
            <Typography variant="small" color="blue-gray" className="mb-4">
              Track emergency cases, manage triage, and emergency protocols
            </Typography>
            <Button>Coming Soon</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

