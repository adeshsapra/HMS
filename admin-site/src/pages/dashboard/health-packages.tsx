import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Switch,
    IconButton,
    Chip,
    List,
    ListItem,
    ListItemSuffix,
} from '@material-tailwind/react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/solid';
import axios from 'axios';


interface HealthPackage {
    id: number;
    title: string;
    subtitle: string;
    price_monthly: number;
    price_yearly: number;
    features_monthly: string[];
    features_yearly: string[];
    featured: boolean;
}

const HealthPackages = () => {
    const [packages, setPackages] = useState<HealthPackage[]>([]);
    const [open, setOpen] = useState(false);
    const [currentPackage, setCurrentPackage] = useState<Partial<HealthPackage>>({
        title: '',
        subtitle: '',
        price_monthly: 0,
        price_yearly: 0,
        features_monthly: [],
        features_yearly: [],
        featured: false,
    });
    const [featureInputMonthly, setFeatureInputMonthly] = useState('');
    const [featureInputYearly, setFeatureInputYearly] = useState('');
    const token = localStorage.getItem('auth_token');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await axios.get(`${API_URL}/public/health-packages`);
            if (response.data.success) {
                setPackages(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching packages:', error);
        }
    };

    const handleOpen = (pkg?: HealthPackage) => {
        if (pkg) {
            setCurrentPackage(pkg);
        } else {
            setCurrentPackage({
                title: '',
                subtitle: '',
                price_monthly: 0,
                price_yearly: 0,
                features_monthly: [],
                features_yearly: [],
                featured: false,
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setFeatureInputMonthly('');
        setFeatureInputYearly('');
    };

    const handleSave = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            if (currentPackage.id) {
                await axios.put(`${API_URL}/health-packages/${currentPackage.id}`, currentPackage, config);
            } else {
                await axios.post(`${API_URL}/health-packages`, currentPackage, config);
            }
            fetchPackages();
            handleClose();
        } catch (error) {
            console.error('Error saving package:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            try {
                await axios.delete(`${API_URL}/health-packages/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                fetchPackages();
            } catch (error) {
                console.error('Error deleting package:', error);
            }
        }
    };

    const handleAddFeatureMonthly = () => {
        if (featureInputMonthly.trim()) {
            setCurrentPackage({
                ...currentPackage,
                features_monthly: [...(currentPackage.features_monthly || []), featureInputMonthly.trim()],
            });
            setFeatureInputMonthly('');
        }
    };

    const handleRemoveFeatureMonthly = (index: number) => {
        const newFeatures = [...(currentPackage.features_monthly || [])];
        newFeatures.splice(index, 1);
        setCurrentPackage({ ...currentPackage, features_monthly: newFeatures });
    };

    const handleAddFeatureYearly = () => {
        if (featureInputYearly.trim()) {
            setCurrentPackage({
                ...currentPackage,
                features_yearly: [...(currentPackage.features_yearly || []), featureInputYearly.trim()],
            });
            setFeatureInputYearly('');
        }
    };

    const handleRemoveFeatureYearly = (index: number) => {
        const newFeatures = [...(currentPackage.features_yearly || [])];
        newFeatures.splice(index, 1);
        setCurrentPackage({ ...currentPackage, features_yearly: newFeatures });
    };

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="blue" className="mb-8 p-6 flex justify-between items-center">
                    <Typography variant="h6" color="white">
                        Health Packages
                    </Typography>
                    <Button
                        variant="filled"
                        color="white"
                        className="flex items-center gap-3 text-blue-500"
                        onClick={() => handleOpen()}
                    >
                        <PlusIcon strokeWidth={2} className="h-4 w-4" /> Add Package
                    </Button>
                </CardHeader>
                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    <table className="w-full min-w-[640px] table-auto">
                        <thead>
                            <tr>
                                {["Title", "Subtitle", "Monthly Price", "Yearly Price", "Featured", "Actions"].map((el) => (
                                    <th
                                        key={el}
                                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                    >
                                        <Typography
                                            variant="small"
                                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                                        >
                                            {el}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {packages.map((pkg, key) => {
                                const className = `py-3 px-5 ${key === packages.length - 1
                                    ? ""
                                    : "border-b border-blue-gray-50"
                                    }`;

                                return (
                                    <tr key={pkg.id}>
                                        <td className={className}>
                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                {pkg.title}
                                            </Typography>
                                        </td>
                                        <td className={className}>
                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                {pkg.subtitle}
                                            </Typography>
                                        </td>
                                        <td className={className}>
                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                ${pkg.price_monthly}
                                            </Typography>
                                        </td>
                                        <td className={className}>
                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                ${pkg.price_yearly || '-'}
                                            </Typography>
                                        </td>
                                        <td className={className}>
                                            <Chip
                                                variant="gradient"
                                                color={pkg.featured ? "green" : "blue-gray"}
                                                value={pkg.featured ? "Featured" : "Standard"}
                                                icon={pkg.featured ? <CheckCircleIcon /> : <XCircleIcon />}
                                                className="py-0.5 px-2 text-[11px] font-medium w-fit"
                                            />
                                        </td>
                                        <td className={className}>
                                            <div className="flex gap-2">
                                                <IconButton variant="text" color="blue-gray" onClick={() => handleOpen(pkg)}>
                                                    <PencilIcon className="h-4 w-4" />
                                                </IconButton>
                                                <IconButton variant="text" color="red" onClick={() => handleDelete(pkg.id)}>
                                                    <TrashIcon className="h-4 w-4" />
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            <Dialog open={open} handler={handleClose} size="lg">
                <DialogHeader>{currentPackage.id ? 'Edit Package' : 'Add Package'}</DialogHeader>
                <DialogBody divider className="h-[30rem] overflow-y-scroll">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Input
                            label="Title"
                            value={currentPackage.title}
                            onChange={(e) => setCurrentPackage({ ...currentPackage, title: e.target.value })}
                            crossOrigin={undefined}
                        />
                        <Input
                            label="Subtitle"
                            value={currentPackage.subtitle}
                            onChange={(e) => setCurrentPackage({ ...currentPackage, subtitle: e.target.value })}
                            crossOrigin={undefined}
                        />
                        <Input
                            type="number"
                            label="Monthly Price"
                            value={currentPackage.price_monthly}
                            onChange={(e) => setCurrentPackage({ ...currentPackage, price_monthly: parseFloat(e.target.value) })}
                            crossOrigin={undefined}
                        />
                        <Input
                            type="number"
                            label="Yearly Price"
                            value={currentPackage.price_yearly}
                            onChange={(e) => setCurrentPackage({ ...currentPackage, price_yearly: parseFloat(e.target.value) })}
                            crossOrigin={undefined}
                        />
                        <div className="col-span-1 md:col-span-2">
                            <Switch
                                label="Featured Package"
                                checked={currentPackage.featured}
                                onChange={(e) => setCurrentPackage({ ...currentPackage, featured: e.target.checked })}
                                crossOrigin={undefined}
                            />
                        </div>

                        {/* Monthly Features */}
                        <div className="col-span-1 md:col-span-2">
                            <Typography variant="h6" color="blue-gray" className="mb-2">
                                Monthly Plan Features
                            </Typography>
                            <div className="flex gap-2 mb-4">
                                <Input
                                    label="Add Monthly Feature"
                                    value={featureInputMonthly}
                                    onChange={(e) => setFeatureInputMonthly(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddFeatureMonthly()}
                                    crossOrigin={undefined}
                                />
                                <Button onClick={handleAddFeatureMonthly} className="flex items-center">
                                    Add
                                </Button>
                            </div>
                            <List>
                                {currentPackage.features_monthly?.map((feature, index) => (
                                    <ListItem key={index} className="flex justify-between">
                                        {feature}
                                        <ListItemSuffix>
                                            <IconButton variant="text" color="red" onClick={() => handleRemoveFeatureMonthly(index)}>
                                                <TrashIcon className="h-4 w-4" />
                                            </IconButton>
                                        </ListItemSuffix>
                                    </ListItem>
                                ))}
                            </List>
                        </div>

                        {/* Yearly Features */}
                        <div className="col-span-1 md:col-span-2">
                            <Typography variant="h6" color="blue-gray" className="mb-2">
                                Yearly Plan Features
                            </Typography>
                            <div className="flex gap-2 mb-4">
                                <Input
                                    label="Add Yearly Feature"
                                    value={featureInputYearly}
                                    onChange={(e) => setFeatureInputYearly(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddFeatureYearly()}
                                    crossOrigin={undefined}
                                />
                                <Button onClick={handleAddFeatureYearly} className="flex items-center">
                                    Add
                                </Button>
                            </div>
                            <List>
                                {currentPackage.features_yearly?.map((feature, index) => (
                                    <ListItem key={index} className="flex justify-between">
                                        {feature}
                                        <ListItemSuffix>
                                            <IconButton variant="text" color="red" onClick={() => handleRemoveFeatureYearly(index)}>
                                                <TrashIcon className="h-4 w-4" />
                                            </IconButton>
                                        </ListItemSuffix>
                                    </ListItem>
                                ))}
                            </List>
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={handleClose} className="mr-1">
                        Cancel
                    </Button>
                    <Button variant="gradient" color="green" onClick={handleSave}>
                        Save
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

export default HealthPackages;
