import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Input,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Switch,
} from "@material-tailwind/react";
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/services/api';

const Integrations = () => {
    const { showToast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
    const [formData, setFormData] = useState({
        client_key: '',
        secret_key: '',
    });
    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [connectedSettings, setConnectedSettings] = useState<any[]>([]);

    const integrations = [
        {
            id: 'paypal',
            name: 'PayPal',
            description: 'Accept payments globally via PayPal. Easy integration for secure online transactions and widespread trust.',
            logo: '/img/paypal_logo.png',
        },
        {
            id: 'razorpay',
            name: 'Razorpay',
            description: 'The best payment gateway for India. Support for 100+ payment modes including UPI, Cards, and Netbanking.',
            logo: '/img/razorpay_logo.png',
        }
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await apiService.getGatewaySettings();
            if (response.status) {
                setConnectedSettings(response.data || []);
            }
        } catch (error: any) {
            showToast('Failed to load gateway settings', 'error');
            console.error('Failed to fetch gateway settings:', error);
        }
    };

    const getIntegrationStatus = (gatewayId: string) => {
        const live = connectedSettings.find(s => s.gateway_name === gatewayId && s.mode === 'live');
        const sandbox = connectedSettings.find(s => s.gateway_name === gatewayId && s.mode === 'sandbox');

        return {
            live: {
                connected: !!live,
                active: live?.is_active || false,
                color: live?.is_active ? 'green' : (live ? 'amber' : 'gray')
            },
            sandbox: {
                connected: !!sandbox,
                active: sandbox?.is_active || false,
                color: sandbox?.is_active ? 'blue' : (sandbox ? 'amber' : 'gray')
            }
        };
    };

    const handleConnectClick = (integration: any) => {
        setSelectedIntegration(integration);
        // Default to sandbox if nothing is connected, otherwise default to whatever is connected
        const status = getIntegrationStatus(integration.id);
        setIsLive(status.live.connected && !status.sandbox.connected);
        setShowModal(true);
    };

    const handleConnectNow = async () => {
        if (!formData.client_key || !formData.secret_key) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await apiService.saveGatewaySettings({
                gateway_name: selectedIntegration.id,
                mode: isLive ? 'live' : 'sandbox',
                client_id: formData.client_key,
                secret_key: formData.secret_key,
            });

            if (response.status) {
                showToast(`${selectedIntegration.name} ${isLive ? 'Live' : 'Sandbox'} environment configured!`, 'success');
                setShowModal(false);
                setFormData({ client_key: '', secret_key: '' });
                fetchSettings();
            }
        } catch (error: any) {
            console.error('Connection error:', error);
            showToast(error.message || 'Failed to connect gateway', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12 text-blue-gray-900">
            <div className="flex justify-between items-center px-4">
                <div>
                    <Typography variant="h3" color="blue-gray" className="mb-2">
                        Payment Integrations
                    </Typography>
                    <Typography variant="paragraph" className="text-gray-600 font-normal">
                        Manage your payment gateways. You can configure and maintain both **Sandbox** for testing and **Live** for production payments simultaneously.
                    </Typography>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 px-4">
                {integrations.map((integration) => {
                    const status = getIntegrationStatus(integration.id);
                    const isAnyConnected = status.live.connected || status.sandbox.connected;

                    return (
                        <Card key={integration.id} className="border border-blue-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <CardHeader
                                floated={false}
                                shadow={false}
                                color="transparent"
                                className="m-0 rounded-none border-b border-blue-gray-50 p-6 flex justify-center items-center h-48 bg-gray-50/30"
                            >
                                <img
                                    src={integration.logo}
                                    alt={integration.name}
                                    className="h-24 object-contain hover:scale-110 transition-transform duration-500"
                                />
                            </CardHeader>
                            <CardBody className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <Typography variant="h5" color="blue-gray" className="font-bold">
                                        {integration.name}
                                    </Typography>
                                    <div className="flex flex-col gap-2 items-end">
                                        {/* Sandbox Status Component */}
                                        <div className="flex items-center gap-2">
                                            <Typography variant="small" className="text-[10px] font-bold text-gray-400 uppercase">Sandbox</Typography>
                                            <div className={`w-2 h-2 rounded-full ${status.sandbox.connected ? 'bg-blue-500 shadow-[0_0_8px_rgba(33,150,243,0.5)]' : 'bg-gray-300'}`} />
                                        </div>
                                        {/* Live Status Component */}
                                        <div className="flex items-center gap-2">
                                            <Typography variant="small" className="text-[10px] font-bold text-gray-400 uppercase">Production</Typography>
                                            <div className={`w-2 h-2 rounded-full ${status.live.connected ? 'bg-green-500 shadow-[0_0_8px_rgba(76,175,80,0.5)]' : 'bg-gray-300'}`} />
                                        </div>
                                    </div>
                                </div>
                                <Typography className="mb-8 font-normal text-gray-500 text-sm leading-relaxed h-12 overflow-hidden">
                                    {integration.description}
                                </Typography>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        fullWidth
                                        variant={isAnyConnected ? "outlined" : "gradient"}
                                        color="blue"
                                        onClick={() => handleConnectClick(integration)}
                                        className="flex items-center justify-center gap-2 py-3.5 transform active:scale-95 transition-all text-sm font-bold capitalize"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 10-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 10-3 0M3.75 12h7.5" />
                                        </svg>
                                        Manage Settings
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    );
                })}
            </div>

            <Dialog
                open={showModal}
                handler={() => setShowModal(false)}
                size="sm"
                className="rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-8 text-white relative">
                    <Typography variant="h4" color="white" className="font-bold">
                        {selectedIntegration?.name} Setup
                    </Typography>
                    <Typography variant="small" color="white" className="opacity-90 mt-1 font-normal">
                        Configure connection details for your environments.
                    </Typography>
                    <button
                        onClick={() => setShowModal(false)}
                        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <DialogBody className="space-y-6 p-8 bg-white overflow-visible">
                    {/* Mode Toggle */}
                    <div className="flex items-center justify-between bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-2">
                        <div>
                            <Typography variant="h6" color="blue-gray" className="font-bold text-sm">
                                Environment
                            </Typography>
                            <Typography variant="small" className="font-normal text-blue-600 text-xs">
                                Configure {isLive ? 'Production (Live)' : 'Testing (Sandbox)'} mode
                            </Typography>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-blue-100 shadow-sm">
                            <Typography variant="small" className={`font-bold text-[10px] uppercase tracking-tighter transition-colors ${!isLive ? 'text-blue-600' : 'text-gray-400'}`}>
                                Sandbox
                            </Typography>
                            <Switch
                                id="mode-switch-modal"
                                color="blue"
                                crossOrigin={undefined}
                                checked={isLive}
                                onChange={() => setIsLive(!isLive)}
                                className="checked:bg-blue-600"
                            />
                            <Typography variant="small" className={`font-bold text-[10px] uppercase tracking-tighter transition-colors ${isLive ? 'text-green-600' : 'text-gray-400'}`}>
                                Live
                            </Typography>
                        </div>
                    </div>

                    <div className="space-y-8 pt-4">
                        <div className="relative">
                            <Input
                                label={isLive ? "Production Client ID" : "Sandbox Client ID"}
                                value={formData.client_key}
                                onChange={(e) => setFormData({ ...formData, client_key: e.target.value })}
                                crossOrigin={undefined}
                                size="lg"
                                color="blue"
                                className="!text-blue-gray-900 font-medium"
                                containerProps={{ className: "min-w-[100px]" }}
                            />
                        </div>
                        <div className="relative">
                            <Input
                                label={isLive ? "Production Secret Key" : "Sandbox Secret Key"}
                                type="password"
                                value={formData.secret_key}
                                onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
                                crossOrigin={undefined}
                                size="lg"
                                color="blue"
                                className="!text-blue-gray-900 font-medium"
                                containerProps={{ className: "min-w-[100px]" }}
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex gap-4 items-start shadow-sm mt-4">
                        <div className="bg-blue-500 p-1.5 rounded-lg text-white mt-1 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                        </div>
                        <Typography variant="small" className="text-gray-600 leading-relaxed font-normal text-xs">
                            You can save credentials for **both environments**. The system will use the correct keys based on your global application settings.
                        </Typography>
                    </div>
                </DialogBody>
                <DialogFooter className="flex gap-4 p-8 bg-gray-50 border-t border-gray-100">
                    <Button
                        variant="text"
                        color="blue-gray"
                        onClick={() => setShowModal(false)}
                        disabled={loading}
                        className="rounded-xl flex-grow font-bold py-3.5 hover:bg-gray-200 transition-colors capitalize"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="gradient"
                        color="blue"
                        onClick={handleConnectNow}
                        disabled={loading}
                        className="rounded-xl flex-grow font-bold py-3.5 shadow-blue-200 shadow-lg capitalize"
                    >
                        {loading ? 'Saving...' : `Save ${isLive ? 'Live' : 'Sandbox'}`}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

export default Integrations;
