import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Input,
  Button,
  Tabs,
  TabsHeader,
  Tab,
  TabsBody,
  TabPanel,
  Select,
  Option,
} from "@material-tailwind/react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function Settings() {
  const [settings, setSettings] = useState({
    hospitalName: "MediTrust Hospital",
    email: "info@meditrust.com",
    phone: "+1 234-567-8900",
    address: "123 Healthcare Blvd, Medical City",
    workingHours: "9:00 AM - 7:00 PM",
  });

  return (
    <div className="mt-12">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-blue-gray-800">Settings</h2>
        <p className="text-blue-gray-600">Configure hospital settings and preferences</p>
      </div>

      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader variant="gradient" color="blue" className="p-6">
          <Typography variant="h6" color="white">
            System Settings
          </Typography>
        </CardHeader>
        <CardBody className="p-6">
          <Tabs value="general">
            <TabsHeader>
              <Tab value="general">General</Tab>
              <Tab value="email">Email</Tab>
              <Tab value="sms">SMS</Tab>
              <Tab value="payment">Payment</Tab>
              <Tab value="roles">Roles & Permissions</Tab>
            </TabsHeader>
            <TabsBody>
              <TabPanel value="general">
                <div className="space-y-4">
                  <Input
                    label="Hospital Name"
                    value={settings.hospitalName}
                    onChange={(e) =>
                      setSettings({ ...settings, hospitalName: e.target.value })
                    }
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                  />
                  <Input
                    label="Phone"
                    value={settings.phone}
                    onChange={(e) =>
                      setSettings({ ...settings, phone: e.target.value })
                    }
                  />
                  <Input
                    label="Address"
                    value={settings.address}
                    onChange={(e) =>
                      setSettings({ ...settings, address: e.target.value })
                    }
                  />
                  <Input
                    label="Working Hours"
                    value={settings.workingHours}
                    onChange={(e) =>
                      setSettings({ ...settings, workingHours: e.target.value })
                    }
                  />
                  <Button color="blue">Save Settings</Button>
                </div>
              </TabPanel>
              <TabPanel value="email">
                <Typography variant="small" color="blue-gray" className="mb-4">
                  Email configuration settings
                </Typography>
                <div className="space-y-4">
                  <Input label="SMTP Host" />
                  <Input label="SMTP Port" type="number" />
                  <Input label="SMTP Username" />
                  <Input label="SMTP Password" type="password" />
                  <Button color="blue">Save Email Settings</Button>
                </div>
              </TabPanel>
              <TabPanel value="sms">
                <Typography variant="small" color="blue-gray" className="mb-4">
                  SMS gateway configuration
                </Typography>
                <div className="space-y-4">
                  <Input label="SMS Gateway API Key" />
                  <Input label="SMS Gateway URL" />
                  <Button color="blue">Save SMS Settings</Button>
                </div>
              </TabPanel>
              <TabPanel value="payment">
                <Typography variant="small" color="blue-gray" className="mb-4">
                  Payment gateway settings
                </Typography>
                <div className="space-y-4">
                  <Select label="Payment Gateway">
                    <Option value="stripe">Stripe</Option>
                    <Option value="paypal">PayPal</Option>
                    <Option value="square">Square</Option>
                  </Select>
                  <Input label="API Key" />
                  <Input label="Secret Key" type="password" />
                  <Button color="blue">Save Payment Settings</Button>
                </div>
              </TabPanel>
              <TabPanel value="roles">
                <Typography variant="small" color="blue-gray" className="mb-4">
                  Role and permission management
                </Typography>
                <Button color="blue">Manage Roles</Button>
              </TabPanel>
            </TabsBody>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}

