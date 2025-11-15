import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  IconButton,
  Chip,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Tooltip,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export function DataTable({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  onView,
  searchable = true,
  filterable = false,
  exportable = false,
  addButtonLabel = "Add New",
  searchPlaceholder = "Search...",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      active: "green",
      inactive: "gray",
      pending: "yellow",
      confirmed: "green",
      completed: "blue",
      cancelled: "red",
      rescheduled: "orange",
      online: "green",
      offline: "gray",
      available: "green",
      busy: "red",
      in_stock: "green",
      low_stock: "yellow",
      out_of_stock: "red",
      new: "blue",
      in_progress: "orange",
      resolved: "green",
      closed: "gray",
      paid: "green",
      overdue: "red",
    };
    return statusColors[status?.toLowerCase()] || "gray";
  };

  const handleExport = () => {
    const headers = columns.map((col) => col.label).join(",");
    const rows = filteredData.map((row) =>
      columns.map((col) => `"${row[col.key] || ""}"`).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <Card className="border border-blue-gray-100 shadow-lg">
      <CardHeader
        variant="gradient"
        color="blue"
        className="mb-0 p-6 flex items-center justify-between"
      >
        <Typography variant="h6" color="white" className="font-bold">
          {title}
        </Typography>
        <div className="flex items-center gap-2">
          {exportable && (
            <Tooltip content="Export to CSV">
              <Button
                variant="text"
                color="white"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-1 capitalize font-semibold hover:bg-white/20"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export
              </Button>
            </Tooltip>
          )}
          {onAdd && (
            <Button
              variant="filled"
              color="white"
              size="sm"
              onClick={onAdd}
              className="capitalize font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {addButtonLabel}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
        {(searchable || filterable) && (
          <div className="px-6 py-4 bg-blue-gray-50/50 flex items-center gap-4 border-b border-blue-gray-100">
            {searchable && (
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  className="!border-blue-gray-200 focus:!border-blue-500 !bg-white rounded-lg"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  containerProps={{
                    className: "!min-w-0",
                  }}
                />
              </div>
            )}
            {filterable && (
              <Button
                variant="outlined"
                size="sm"
                className="flex items-center gap-2 border-blue-gray-300 font-semibold"
              >
                <FunnelIcon className="h-4 w-4" />
                Filters
              </Button>
            )}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr className="bg-blue-gray-50/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="border-b border-blue-gray-100 py-4 px-6 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-600 tracking-wider"
                    >
                      {col.label}
                    </Typography>
                  </th>
                ))}
                {(onEdit || onDelete || onView) && (
                  <th className="border-b border-blue-gray-100 py-4 px-6 text-left bg-blue-gray-50/50">
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-600 tracking-wider"
                    >
                      Actions
                    </Typography>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)}
                    className="py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <MagnifyingGlassIcon className="h-12 w-12 text-blue-gray-300 mb-2" />
                      <Typography variant="small" className="text-blue-gray-500 font-medium">
                        No data found
                      </Typography>
                      {searchTerm && (
                        <Typography variant="small" className="text-blue-gray-400 mt-1">
                          Try adjusting your search terms
                        </Typography>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-blue-gray-50/30 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-4 px-6 ${
                          rowIndex === filteredData.length - 1
                            ? ""
                            : "border-b border-blue-gray-100"
                        }`}
                      >
                        {col.render ? (
                          col.render(row[col.key], row)
                        ) : col.type === "status" ? (
                          <Chip
                            variant="gradient"
                            color={getStatusColor(row[col.key])}
                            value={row[col.key]}
                            className="py-1 px-3 text-[11px] font-semibold w-fit capitalize shadow-sm"
                          />
                        ) : col.type === "badge" ? (
                          <Chip
                            variant="gradient"
                            color={col.color || "blue"}
                            value={row[col.key]}
                            className="py-1 px-3 text-[11px] font-semibold w-fit shadow-sm"
                          />
                        ) : (
                          <Typography className="text-sm font-medium text-blue-gray-700">
                            {row[col.key] || "-"}
                          </Typography>
                        )}
                      </td>
                    ))}
                    {(onEdit || onDelete || onView) && (
                      <td
                        className={`py-4 px-6 ${
                          rowIndex === filteredData.length - 1
                            ? ""
                            : "border-b border-blue-gray-100"
                        }`}
                      >
                        <Menu placement="left-start">
                          <MenuHandler>
                            <IconButton
                              variant="text"
                              color="blue-gray"
                              size="sm"
                              className="rounded-full"
                            >
                              <EllipsisVerticalIcon className="h-5 w-5" />
                            </IconButton>
                          </MenuHandler>
                          <MenuList className="min-w-[150px] shadow-lg">
                            {onView && (
                              <MenuItem
                                onClick={() => onView(row)}
                                className="flex items-center gap-3 py-2"
                              >
                                <EyeIcon className="h-4 w-4" />
                                <Typography variant="small" className="font-medium">
                                  View
                                </Typography>
                              </MenuItem>
                            )}
                            {onEdit && (
                              <MenuItem
                                onClick={() => onEdit(row)}
                                className="flex items-center gap-3 py-2"
                              >
                                <PencilIcon className="h-4 w-4" />
                                <Typography variant="small" className="font-medium">
                                  Edit
                                </Typography>
                              </MenuItem>
                            )}
                            {onDelete && (
                              <MenuItem
                                onClick={() => onDelete(row)}
                                className="flex items-center gap-3 py-2 text-red-500 focus:text-red-500 focus:bg-red-50"
                              >
                                <TrashIcon className="h-4 w-4" />
                                <Typography variant="small" className="font-medium">
                                  Delete
                                </Typography>
                              </MenuItem>
                            )}
                          </MenuList>
                        </Menu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-blue-gray-100 bg-blue-gray-50/30">
            <div className="flex items-center justify-between">
              <Typography variant="small" className="text-blue-gray-600 font-medium">
                Showing <strong>{filteredData.length}</strong> of{" "}
                <strong>{data.length}</strong> entries
              </Typography>
              {searchTerm && (
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setFilteredData(data);
                  }}
                  className="text-blue-600 font-semibold"
                >
                  Clear search
                </Button>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default DataTable;
