"use client";
import { useEffect, useMemo, useState } from "react";
import { Alert, App as AntdApp, Button, Card, Checkbox, DatePicker, Divider, Drawer, Empty, Form, Input, Modal, Popconfirm, Select, Space, Table, Tabs, Tag } from "antd";
import { Plus, RefreshCw, ShieldCheck, Users, KeyRound, Settings2, Check, UserCog, Trash2 } from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { useAuth } from "@/components/auth-provider";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
type Row = Record<string, any>;

export default function SecurityPage() {
  const { token, ready, logout } = useAuth();
  const [tab, setTab] = useState("users");
  const [rows, setRows] = useState<Row[]>([]);
  const [permissions, setPermissions] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [configureOpen, setConfigureOpen] = useState(false);
  const [configureLoading, setConfigureLoading] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Row | null>(null);
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [roleRecords, setRoleRecords] = useState<Row[]>([]);
  const [organization, setOrganization] = useState<Record<string, Row[]>>({ companies: [], properties: [], branches: [] });
  const [assignmentUser, setAssignmentUser] = useState<Row | null>(null);
  const [assignments, setAssignments] = useState<Row[]>([]);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [form] = Form.useForm();
  const [assignmentForm] = Form.useForm();
  const companyId = Form.useWatch("companyId", assignmentForm);
  const propertyId = Form.useWatch("propertyId", assignmentForm);
  const roleId = Form.useWatch("roleId", assignmentForm);
  const chosenRole = roleRecords.find((role) => role.id === roleId);
  const { message } = AntdApp.useApp();

  function api(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    return fetch(API + path, { ...init, headers }).then((response) => {
      if (response.status === 401 && token) void logout();
      return response;
    });
  }

  async function load() {
    if (!ready || !token) return;
    setLoading(true);
    try {
      const [data, roles, perms, companies, properties, branches] = await Promise.all([
        api("/v1/security/" + (tab === "users" ? "users" : "roles")).then((response) => response.json()),
        api("/v1/security/roles").then((response) => response.json()),
        api("/v1/security/permissions").then((response) => response.json()),
        api("/v1/organization/companies").then((response) => response.json()),
        api("/v1/organization/properties").then((response) => response.json()),
        api("/v1/organization/branches").then((response) => response.json()),
      ]);
      setRows(Array.isArray(data) ? data : []);
      setRoleRecords(Array.isArray(roles) ? roles : []);
      setPermissions(Array.isArray(perms) ? perms : []);
      setOrganization({ companies: Array.isArray(companies) ? companies : [], properties: Array.isArray(properties) ? properties : [], branches: Array.isArray(branches) ? branches : [] });
    } catch {
      message.error("Could not load security data. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [tab, token, ready]);

  async function submit(values: Row) {
    const endpoint = tab === "users" ? "users" : "roles";
    const response = await api("/v1/security/" + endpoint, { method: "POST", body: JSON.stringify(values) });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      message.error(error.message ?? "Could not save record");
      return;
    }
    message.success((tab === "users" ? "User" : "Role") + " created");
    setOpen(false); form.resetFields(); load();
  }

  async function openPermissionDesigner(role: Row) {
    setSelectedRole(role); setConfigureOpen(true); setConfigureLoading(true);
    try {
      const response = await api("/v1/security/roles/" + role.id + "/permissions");
      const detail = await response.json();
      setSelectedPermissionIds((detail.permissions ?? []).map((item: Row) => item.permissionId));
      setSelectedModule((permissions[0]?.module ?? ""));
    } catch { message.error("Could not load role permissions"); }
    finally { setConfigureLoading(false); }
  }

  async function savePermissions() {
    if (!selectedRole) return;
    setSavingPermissions(true);
    try {
      const response = await api("/v1/security/roles/" + selectedRole.id + "/permissions", { method: "PUT", body: JSON.stringify({ permissionIds: selectedPermissionIds }) });
      if (!response.ok) throw new Error();
      message.success("Permissions saved"); setConfigureOpen(false); load();
    } catch { message.error("Could not save permissions"); }
    finally { setSavingPermissions(false); }
  }

  async function openAssignments(user: Row) {
    setAssignmentUser(user); setAssignmentOpen(true); setAssignmentLoading(true);
    try {
      const response = await api("/v1/security/users/" + user.id + "/assignments");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load assignments");
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error: any) { message.error(error.message || "Could not load user assignments"); }
    finally { setAssignmentLoading(false); }
  }

  async function grantRole(values: Row) {
    if (!assignmentUser) return;
    setAssignmentSaving(true);
    try {
      const response = await api("/v1/security/users/" + assignmentUser.id + "/assignments", {
        method: "POST",
        body: JSON.stringify({ roleId: values.roleId, companyId: values.companyId || undefined, propertyId: values.propertyId || undefined, branchId: values.branchId || undefined, effectiveFrom: values.effectiveFrom?.toISOString(), effectiveTo: values.effectiveTo?.toISOString() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not assign role");
      message.success("Role assigned to " + assignmentUser.name);
      setGrantOpen(false); assignmentForm.resetFields();
      await Promise.all([openAssignments(assignmentUser), load()]);
    } catch (error: any) { message.error(error.message || "Could not assign role"); }
    finally { setAssignmentSaving(false); }
  }

  async function revokeRole(assignment: Row) {
    try {
      const response = await api("/v1/security/users/" + assignmentUser?.id + "/assignments/" + assignment.id, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not remove role");
      message.success("Role assignment removed");
      if (assignmentUser) await Promise.all([openAssignments(assignmentUser), load()]);
    } catch (error: any) { message.error(error.message || "Could not remove role"); }
  }

  const modules = useMemo(() => [...new Set(permissions.map((permission) => permission.module))], [permissions]);
  const modulePermissions = permissions.filter((permission) => permission.module === selectedModule);
  const resources = [...new Set(modulePermissions.map((permission) => permission.resource))];
  const userColumns = [
    { title: "Username", dataIndex: "username", render: (value: string) => <span className="font-semibold">{value}</span> },
    { title: "Name", dataIndex: "name" },
    { title: "Roles", dataIndex: "roleAssignments", render: (value: Row[]) => value?.filter((item) => item.isActive && item.role?.status === "ACTIVE").map((item) => item.role?.name).join(", ") || "?" },
    { title: "Last login", dataIndex: "lastLoginAt", render: (value: string) => value ? new Date(value).toLocaleString() : "Never" },
    { title: "Status", dataIndex: "status", render: (value: string) => <Tag color={value === "ACTIVE" ? "green" : value === "LOCKED" ? "red" : "default"}>{value}</Tag> },
    { title: "Actions", key: "actions", render: (_: unknown, record: Row) => <Button type="link" icon={<UserCog size={14} />} onClick={() => openAssignments(record)}>Assign roles</Button> },
  ];
  const roleColumns = [
    { title: "Code", dataIndex: "code", render: (value: string) => <span className="font-semibold">{value}</span> },
    { title: "Role name", dataIndex: "name" },
    { title: "Scope", dataIndex: "scope" },
    { title: "Permissions", dataIndex: "permissions", render: (value: Row[]) => <Tag color="blue">{value?.length ?? 0}</Tag> },
    { title: "Users", dataIndex: ["_count", "assignments"] },
    { title: "Status", dataIndex: "status", render: (value: string) => <Tag color={value === "ACTIVE" ? "green" : "default"}>{value}</Tag> },
    { title: "Actions", key: "actions", render: (_: unknown, record: Row) => <Button size="small" type="link" icon={<Settings2 size={14} />} onClick={() => openPermissionDesigner(record)}>Configure permissions</Button> },
  ];

  return <PortalShell pageTitle="Security administration">
    <div className="mb-6 flex items-end justify-between"><div><p className="mb-2 text-sm font-medium text-blue-600">Access control</p><h1 className="text-3xl font-bold tracking-tight">Users, roles & permissions</h1><p className="mt-2 text-sm text-slate-500">Manage who can access HotelHex and what they can do.</p></div><Space><Button icon={<RefreshCw size={15} />} onClick={load}>Refresh</Button><Button type="primary" icon={<Plus size={15} />} onClick={() => setOpen(true)}>New {tab === "users" ? "user" : "role"}</Button></Space></div>
    <div className="mb-6 grid gap-4 md:grid-cols-3"><Card bordered={false} className="rounded-2xl shadow-sm"><Users size={20} className="text-blue-600" /><p className="mt-3 text-sm text-slate-500">User accounts</p><p className="text-2xl font-bold">{tab === "users" ? rows.length : "?"}</p></Card><Card bordered={false} className="rounded-2xl shadow-sm"><ShieldCheck size={20} className="text-emerald-600" /><p className="mt-3 text-sm text-slate-500">Active roles</p><p className="text-2xl font-bold">{tab === "roles" ? rows.filter((row) => row.status === "ACTIVE").length : "?"}</p></Card><Card bordered={false} className="rounded-2xl shadow-sm"><KeyRound size={20} className="text-violet-600" /><p className="mt-3 text-sm text-slate-500">Permission catalog</p><p className="text-2xl font-bold">{permissions.length}</p></Card></div>
    <Card bordered={false} className="rounded-2xl shadow-sm"><Tabs activeKey={tab} onChange={setTab} items={[{ key: "users", label: "Users" }, { key: "roles", label: "Roles" }]} /><Table rowKey="id" loading={loading} columns={tab === "users" ? userColumns : roleColumns} dataSource={rows} pagination={{ pageSize: 10 }} scroll={{ x: 950 }} /></Card>
    <Modal title={tab === "users" ? "Create user" : "Create role"} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()}><Form form={form} layout="vertical" onFinish={submit} className="pt-4">{tab === "users" ? <><Form.Item name="username" label="Username" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="name" label="Full name" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="email" label="Email"><Input type="email" /></Form.Item><Form.Item name="password" label="Temporary password" rules={[{ required: true, min: 8 }]}><Input.Password /></Form.Item><Form.Item name="status" label="Status" initialValue="ACTIVE"><Select options={["ACTIVE", "PENDING", "INACTIVE"].map((value) => ({ value, label: value }))} /></Form.Item></> : <><Form.Item name="code" label="Role code" rules={[{ required: true }]}><Input placeholder="FRONT_DESK" /></Form.Item><Form.Item name="name" label="Role name" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="description" label="Description"><Input.TextArea /></Form.Item><Form.Item name="scope" label="Scope" initialValue="TENANT"><Select options={["TENANT", "GROUP", "COMPANY", "PROPERTY", "BRANCH"].map((value) => ({ value, label: value }))} /></Form.Item></>}</Form></Modal>
    <Drawer width={760} open={assignmentOpen} onClose={() => !assignmentSaving && setAssignmentOpen(false)} title={<div><p className="mb-1 text-xs font-medium uppercase tracking-widest text-slate-400">User access</p><h2 className="m-0 text-xl font-semibold">{assignmentUser?.name}</h2><p className="mb-0 mt-1 text-sm text-slate-500">{assignmentUser?.username} ? manage role and organization assignments</p></div>} extra={<Button type="primary" icon={<Plus size={15} />} onClick={() => { assignmentForm.resetFields(); setGrantOpen(true); }}>Assign role</Button>}>
      <Table rowKey="id" loading={assignmentLoading} dataSource={assignments} pagination={false} scroll={{ x: 650 }} columns={[
        { title: "Role", dataIndex: ["role", "name"], render: (value: string, record: Row) => <Space>{value}<Tag color={record.isActive && record.role?.status === "ACTIVE" ? "green" : "default"}>{record.isActive && record.role?.status === "ACTIVE" ? "Active" : "Inactive"}</Tag></Space> },
        { title: "Scope", render: (_: unknown, r: Row) => r.branch?.name || r.property?.name || r.company?.legalName || (r.role?.scope === "TENANT" ? "All installation" : r.role?.scope) },
        { title: "Effective", render: (_: unknown, r: Row) => <span>{r.effectiveFrom ? new Date(r.effectiveFrom).toLocaleDateString() : "Immediately"}<br />{r.effectiveTo ? "Until " + new Date(r.effectiveTo).toLocaleDateString() : "No expiry"}</span> },
        { title: "Actions", render: (_: unknown, r: Row) => r.isActive && <Popconfirm title={`Remove ${r.role?.name} from ${assignmentUser?.name}?`} description="This ends the assignment. Its history is retained." onConfirm={() => revokeRole(r)}><Button danger type="text" icon={<Trash2 size={14} />}>Remove</Button></Popconfirm> },
      ]} />
      {!assignments.length && !assignmentLoading && <Empty className="mt-8" description="This user has no role assignments yet. Assign a role to grant access." />}
    </Drawer>
    <Modal title={"Assign a role" + (assignmentUser ? " to " + assignmentUser.name : "")} open={grantOpen} confirmLoading={assignmentSaving} onCancel={() => !assignmentSaving && setGrantOpen(false)} onOk={() => assignmentForm.submit()} okText="Assign role">
      <Form form={assignmentForm} layout="vertical" onFinish={grantRole} className="pt-4">
        <Form.Item name="roleId" label="Role" rules={[{ required: true, message: "Select an active role" }]}><Select showSearch optionFilterProp="label" placeholder="Select a role" onChange={() => assignmentForm.resetFields(["companyId", "propertyId", "branchId"])} options={roleRecords.filter((role) => role.status === "ACTIVE").map((role) => ({ value: role.id, label: role.name + " ? " + role.scope, disabled: role.scope === "GROUP" }))} /></Form.Item>
        {chosenRole?.scope === "GROUP" && <Alert type="warning" showIcon message="Group-scoped role assignment is not available until group access is added to the security model." className="mb-4" />}
        <Alert type="info" showIcon message={chosenRole?.scope === "TENANT" ? "Tenant scope reaches the entire current HotelHex installation. Add an organization scope below to narrow access." : `This ${chosenRole?.scope?.toLowerCase() || "role"} role needs a matching organization assignment.`} className="mb-4" />
        <Form.Item name="companyId" label="Company" rules={chosenRole?.scope === "COMPANY" ? [{ required: true, message: "Select the company this role covers" }] : []}><Select allowClear showSearch optionFilterProp="label" placeholder="All companies / choose one" options={organization.companies.map((item) => ({ value: item.id, label: item.tradingName || item.legalName }))} onChange={() => { assignmentForm.setFieldsValue({ propertyId: undefined, branchId: undefined }); }} /></Form.Item>
        <Form.Item name="propertyId" label="Property" rules={chosenRole?.scope === "PROPERTY" ? [{ required: true, message: "Select the property this role covers" }] : []}><Select allowClear showSearch optionFilterProp="label" placeholder="All properties / choose one" options={organization.properties.filter((item) => !companyId || item.companyId === companyId).map((item) => ({ value: item.id, label: item.name }))} onChange={() => assignmentForm.setFieldValue("branchId", undefined)} /></Form.Item>
        <Form.Item name="branchId" label="Branch" rules={chosenRole?.scope === "BRANCH" ? [{ required: true, message: "Select the branch this role covers" }] : []}><Select allowClear showSearch optionFilterProp="label" placeholder="All branches / choose one" options={organization.branches.filter((item) => (!propertyId || item.propertyId === propertyId) && (!companyId || organization.properties.some((p) => p.id === item.propertyId && p.companyId === companyId))).map((item) => ({ value: item.id, label: item.name }))} /></Form.Item>
        <Divider />
        <div className="grid gap-4 sm:grid-cols-2"><Form.Item name="effectiveFrom" label="Starts (optional)"><DatePicker showTime className="w-full" /></Form.Item><Form.Item name="effectiveTo" label="Expires (optional)"><DatePicker showTime className="w-full" /></Form.Item></div>
        <p className="text-xs text-slate-500">An expired assignment stops granting access automatically. The role?s permissions combine with this organization scope.</p>
      </Form>
    </Modal>
    <Drawer title={<div><p className="mb-1 text-xs font-medium uppercase tracking-widest text-slate-400">Role permissions</p><h2 className="m-0 text-xl font-semibold">{selectedRole?.name ?? "Configure permissions"}</h2></div>} width={760} open={configureOpen} onClose={() => setConfigureOpen(false)} destroyOnClose footer={<div className="flex items-center justify-between"><span className="text-sm text-slate-500">{selectedPermissionIds.length} permissions selected</span><Space><Button onClick={() => setConfigureOpen(false)}>Cancel</Button><Button type="primary" loading={savingPermissions} onClick={savePermissions}>Save permissions</Button></Space></div>}>
      {configureLoading ? <div className="py-20 text-center text-slate-500">Loading permissions?</div> : <div className="flex min-h-[500px] overflow-hidden rounded-xl border border-slate-200"><div className="w-56 shrink-0 border-r border-slate-200 bg-slate-50 p-3"><p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Modules</p>{modules.map((module) => <button key={module} className={"mb-1 flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium transition " + (selectedModule === module ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-100" : "text-slate-600 hover:bg-white")} onClick={() => setSelectedModule(module)}>{module}<span className="text-xs text-slate-400">{permissions.filter((permission) => permission.module === module).length}</span></button>)}</div><div className="flex-1 overflow-y-auto p-6"><div className="mb-6 flex items-start justify-between"><div><p className="text-sm text-slate-500">Module</p><h3 className="mt-1 text-xl font-semibold">{selectedModule || "No permissions"}</h3></div>{selectedModule && <Button size="small" onClick={() => { const ids = modulePermissions.map((permission) => permission.id); const allSelected = ids.every((id) => selectedPermissionIds.includes(id)); setSelectedPermissionIds(allSelected ? selectedPermissionIds.filter((id) => !ids.includes(id)) : [...new Set([...selectedPermissionIds, ...ids])]); }}>{modulePermissions.every((permission) => selectedPermissionIds.includes(permission.id)) ? "Clear module" : "Select all"}</Button>}</div>{resources.map((resource) => { const resourcePermissions = modulePermissions.filter((permission) => permission.resource === resource); return <div key={resource} className="mb-6"><p className="mb-3 text-sm font-semibold text-slate-700">{resource}</p><div className="grid gap-3 sm:grid-cols-2">{resourcePermissions.map((permission) => <label key={permission.id} className={"flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition " + (selectedPermissionIds.includes(permission.id) ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-blue-200")}><Checkbox checked={selectedPermissionIds.includes(permission.id)} onChange={(event) => setSelectedPermissionIds(event.target.checked ? [...selectedPermissionIds, permission.id] : selectedPermissionIds.filter((id) => id !== permission.id))} /><span className="flex-1"><span className="block text-sm font-medium text-slate-700">{permission.action}</span><span className="block text-xs text-slate-400">{permission.code}</span></span>{selectedPermissionIds.includes(permission.id) && <Check size={15} className="text-blue-600" />}</label>)}</div></div>})}{!modulePermissions.length && <Empty description="No permissions in this module" />}</div></div>}
    </Drawer>
  </PortalShell>;
}
