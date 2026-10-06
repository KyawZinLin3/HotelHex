"use client";

import { useEffect, useMemo, useState } from "react";
import { App as AntdApp, Button, Card, Form, Input, Modal, Select, Space, Statistic, Table, Tag } from "antd";
import { Plus, RefreshCw, Search, Building2, Hotel, GitBranch, Users, Layers3, Coins, CalendarDays } from "lucide-react";
import { PortalShell } from "@/components/portal-shell";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const resources = [
  { key: "groups", label: "Groups", icon: Building2, fields: ["code", "name"] },
  { key: "companies", label: "Companies", icon: Building2, fields: ["code", "legalName", "groupId"] },
  { key: "properties", label: "Properties", icon: Hotel, fields: ["code", "name", "companyId", "type"] },
  { key: "branches", label: "Branches", icon: GitBranch, fields: ["code", "name", "propertyId", "type"] },
  { key: "buildings", label: "Buildings", icon: Layers3, fields: ["code", "name", "propertyId", "branchId"] },
  { key: "floors", label: "Floors", icon: Layers3, fields: ["code", "name", "buildingId", "floorNumber"] },
  { key: "departments", label: "Departments", icon: Users, fields: ["code", "name", "companyId", "branchId"] },
  { key: "currencies", label: "Currencies", icon: Coins, fields: ["code", "name", "symbol"] },
  { key: "taxes", label: "Taxes", icon: Coins, fields: ["code", "name", "rate", "calculation"] },
  { key: "businessDates", label: "Business dates", icon: CalendarDays, fields: ["propertyId", "branchId", "date"] },
] as const;

type ResourceKey = typeof resources[number]["key"];
type RecordValue = Record<string, any>;

const labels: Record<string, string> = { date: "Business date", floorNumber: "Floor number", rate: "Tax rate", calculation: "Calculation", code: "Code", name: "Name", legalName: "Legal name", groupId: "Business group", companyId: "Company", propertyId: "Property", branchId: "Branch", buildingId: "Building", type: "Type", symbol: "Symbol" };

export default function OrganizationPage() {
  const [active, setActive] = useState<ResourceKey>("companies");
  const [items, setItems] = useState<RecordValue[]>([]);
  const [options, setOptions] = useState<Record<string, RecordValue[]>>({});
  const [dashboard, setDashboard] = useState<RecordValue>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { message } = AntdApp.useApp();

  const activeResource = useMemo(() => resources.find((item) => item.key === active)!, [active]);

  async function load() {
    setLoading(true);
    try {
      const [list, stats] = await Promise.all([
        fetch(API + "/v1/organization/" + active + (search ? "?search=" + encodeURIComponent(search) : "")).then((r) => r.json()),
        fetch(API + "/v1/organization/dashboard").then((r) => r.json()),
      ]);
      setItems(Array.isArray(list) ? list : []);
      setDashboard(stats);
    } catch {
      message.error("Could not load organization data. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [active, search]);

  useEffect(() => {
    const needed = new Set(activeResource.fields.filter((field) => ["groupId", "companyId", "propertyId", "branchId", "buildingId"].includes(field)));
    Promise.all(Array.from(needed).map(async (field) => {
      const endpoint = ({ groupId: "groups", companyId: "companies", propertyId: "properties", branchId: "branches", buildingId: "buildings" } as Record<string, string>)[field];
      const response = await fetch(API + "/v1/organization/" + endpoint);
      return [field, await response.json()] as const;
    })).then((entries) => setOptions(Object.fromEntries(entries))).catch(() => undefined);
  }, [activeResource]);

  async function submit(values: RecordValue) {
    const response = await fetch(API + "/v1/organization/" + active, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      message.error(error.message ?? "Could not save record");
      return;
    }
    message.success(activeResource.label.slice(0, -1) + " created");
    setModalOpen(false);
    form.resetFields();
    load();
  }

  const columns = [
    { title: "Code", dataIndex: "code", key: "code", render: (value: string) => <span className="font-semibold text-slate-700">{value}</span> },
    { title: "Name", key: "name", render: (_: unknown, record: RecordValue) => record.name ?? record.legalName ?? "—" },
    { title: "Parent", key: "parent", render: (_: unknown, record: RecordValue) => record.company?.legalName ?? record.property?.name ?? record.branch?.name ?? record.group?.name ?? "—" },
    { title: "Status", key: "status", render: (_: unknown, record: RecordValue) => <Tag color={(record.status === "ACTIVE" || record.isActive) ? "green" : "default"}>{record.status ?? (record.isActive ? "ACTIVE" : "INACTIVE")}</Tag> },
    { title: "Actions", key: "actions", render: (_: unknown, record: RecordValue) => <Button size="small" onClick={() => deactivate(record.id)} disabled={record.status === "INACTIVE" || record.isActive === false}>Deactivate</Button> },
  ];

  async function deactivate(id: string) {
    await fetch(API + "/v1/organization/" + active + "/" + id + "/deactivate", { method: "PATCH" });
    message.success("Record deactivated");
    load();
  }

  return <PortalShell pageTitle="Organization setup">
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {[["Companies", dashboard.companies, "blue"], ["Properties", dashboard.properties, "violet"], ["Branches", dashboard.branches, "emerald"], ["Departments", dashboard.departments, "amber"], ["Rooms", dashboard.totalRooms, "cyan"], ["Active users", dashboard.users, "pink"]].map(([label, value, color]) => <Card key={label as string} bordered={false} className="rounded-2xl shadow-sm"><Statistic title={label as string} value={value as number ?? 0} valueStyle={{ color: color === "blue" ? "#2563eb" : undefined }} /></Card>)}
    </div>
    <Card bordered={false} className="rounded-2xl shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><Space wrap>{resources.map((item) => <Button key={item.key} type={item.key === active ? "primary" : "default"} icon={<item.icon size={15} />} onClick={() => setActive(item.key)}>{item.label}</Button>)}</Space><Space><Button type="primary" icon={<Plus size={15} />} onClick={() => setModalOpen(true)}>New {activeResource.label.slice(0, -1)}</Button><Input allowClear prefix={<Search size={15} />} placeholder="Search code or name" onChange={(event) => setSearch(event.target.value)} /><Button icon={<RefreshCw size={15} />} onClick={load} /></Space></div>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={items} pagination={{ pageSize: 10 }} scroll={{ x: 700 }} />
    </Card>
    <Modal title={"Create " + activeResource.label.slice(0, -1)} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="Create">
      <Form form={form} layout="vertical" onFinish={submit} className="pt-4">
        {activeResource.fields.map((field) => <Form.Item key={field} name={field} label={labels[field] ?? field} rules={["code", "name", "legalName", "groupId", "companyId", "propertyId"].includes(field) ? [{ required: true, message: labels[field] + " is required" }] : []}>
          {field.endsWith("Id") ? <Select options={(Array.isArray(options[field]) ? options[field] : []).map((option) => ({ value: option.id, label: option.name ?? option.legalName ?? option.code }))} placeholder={"Select " + labels[field]} /> : field === "type" ? <Select options={[{ value: "HOTEL", label: "Hotel" }, { value: "RESORT", label: "Resort" }, { value: "RESTAURANT", label: "Restaurant" }]} /> : <Input />}
        </Form.Item>)}
      </Form>
    </Modal>
  </PortalShell>;
}
