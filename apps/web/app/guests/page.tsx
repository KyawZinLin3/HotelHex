"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, App, Button, Card, Checkbox, Descriptions, Drawer, Empty, Form, Input, Modal, Popconfirm, Select, Space, Statistic, Table, Tabs, Tag } from 'antd';
import { Download, Plus, RefreshCw, Search, Users } from 'lucide-react';
import { PortalShell } from '@/components/portal-shell';
import { useAuth } from '@/components/auth-provider';

type Row = Record<string, any>;
const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api') + '/v1/guests';
const opts = (values: string[] = []) => values.map(value => ({ value, label: value.replaceAll('_', ' ') }));
const date = (value: any) => value ? String(value).slice(0, 10) : '—';
const sections: Record<string, { label: string; view: string; edit: string; create?: string }> = {
  contacts: { label: 'Contacts', view: 'CONTACT.VIEW', edit: 'CONTACT.UPDATE' },
  addresses: { label: 'Addresses', view: 'CONTACT.VIEW', edit: 'CONTACT.UPDATE' },
  identities: { label: 'Identity documents', view: 'IDENTITY.VIEW', edit: 'IDENTITY.UPDATE', create: 'IDENTITY.CREATE' },
  preferences: { label: 'Preferences', view: 'PREFERENCE.VIEW', edit: 'PREFERENCE.UPDATE' },
  vip: { label: 'VIP', view: 'VIP.VIEW', edit: 'VIP.MANAGE' },
  notes: { label: 'Internal notes', view: 'NOTE.VIEW', edit: 'NOTE.UPDATE', create: 'NOTE.CREATE' },
};

export default function GuestsPage() {
  const { token } = useAuth(), { message } = App.useApp();
  const [properties, setProperties] = useState<Row[]>([]), [propertyId, setPropertyId] = useState(''), [branchId, setBranchId] = useState('');
  const [options, setOptions] = useState<Row>({}), [rows, setRows] = useState<Row[]>([]), [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Row>({}), [page, setPage] = useState(1), [loading, setLoading] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState('');
  const [guest, setGuest] = useState<Row | null>(null), [revealed, setRevealed] = useState(false), [audit, setAudit] = useState<Row[]>([]);
  const [editor, setEditor] = useState<{ section: string; row?: Row } | null>(null);
  const [form] = Form.useForm(), [configForm] = Form.useForm();
  const [duplicates, setDuplicates] = useState<Row[] | null>(null), [pending, setPending] = useState<(() => Promise<void>) | null>(null), [duplicateReason, setDuplicateReason] = useState('');
  const [report, setReport] = useState<Row | null>(null), [configOpen, setConfigOpen] = useState(false);
  const requestGeneration = useRef(0), detailGeneration = useRef(0);
  const can = (p: string) => (options.permissions || []).includes(p);
  const request = useCallback(async (path = '', method = 'GET', body?: Row, extra: Row = {}) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries({ propertyId, branchId, ...extra })) if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
    const response = await fetch(API + path + '?' + query, { method, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const data = await response.json();
    if (!response.ok) { const e: any = new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Request failed'); e.candidates = data.candidates; throw e; }
    return data;
  }, [token, propertyId, branchId]);
  useEffect(() => {
    if (!token) return;
    let active = true;
    fetch(API + '/properties', { headers: { Authorization: 'Bearer ' + token } }).then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.message); return data; })
      .then(data => { if (active) { setProperties(data); setPropertyId(data[0]?.id || ''); setBranchId(data[0]?.branchOnly ? data[0].branches[0]?.id || '' : ''); } })
      .catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [token]);
  const load = useCallback(async () => {
    if (!propertyId || !token) return;
    const generation = ++requestGeneration.current; setLoading(true); setError('');
    try {
      const [list, settings] = await Promise.all([request('', 'GET', undefined, { ...filters, page }), request('/options')]);
      if (generation !== requestGeneration.current) return;
      setRows(list.items); setTotal(list.total); setOptions(settings);
    } catch (e: any) { if (generation === requestGeneration.current) setError(e.message); }
    finally { if (generation === requestGeneration.current) setLoading(false); }
  }, [request, propertyId, token, filters, page]);
  useEffect(() => { void load(); return () => { requestGeneration.current++; }; }, [load]);
  useEffect(() => { detailGeneration.current++; setGuest(null); setEditor(null); setRevealed(false); setReport(null); setOptions({}); setRows([]); setTotal(0); setDuplicates(null); setPending(null); }, [propertyId, branchId]);
  function filter(key: string, value: any) { setFilters(old => ({ ...old, [key]: value })); setPage(1); }
  async function openGuest(id: string, reveal = false) {
    const generation = ++detailGeneration.current;
    try {
      const result = await request('/' + id, 'GET', undefined, { reveal: reveal ? 'true' : undefined });
      if (generation !== detailGeneration.current) return;
      setGuest(result); setRevealed(reveal); setAudit([]);
    } catch (e: any) { message.error(e.message); }
  }
  function edit(section: string, row?: Row) {
    form.resetFields(); setEditor({ section, row });
    const values: Row = row ? { ...row } : section === 'profile' ? { guestType: 'Individual', status: 'ACTIVE', preferredContactMethod: 'None' } : { isActive: true, isPrimary: false, visibility: 'PROPERTY', priority: 'Normal', scope: 'PROPERTY' };
    for (const key of ['dateOfBirth', 'issueDate', 'expiryDate', 'effectiveFrom', 'effectiveTo']) if (values[key]) values[key] = date(values[key]);
    if (section === 'identities') delete values.number;
    if (section === 'contacts' && !revealed) delete values.value;
    if (section === 'addresses' && !revealed) for (const key of ['line1', 'line2', 'stateRegion', 'postalCode']) delete values[key];
    form.setFieldsValue(values);
  }
  async function submit(values: Row, reason?: string) {
    if (!editor) return;
    const currentEditor = editor;
    const body: Row = { ...values, ...(reason ? { duplicateReason: reason } : {}), ...(guest ? { version: guest.version } : {}) };
    if (currentEditor.section === 'identities' && currentEditor.row && !body.number) delete body.number;
    if (currentEditor.section === 'contacts' && currentEditor.row && !body.value) delete body.value;
    if (currentEditor.section === 'addresses' && currentEditor.row && !revealed) for (const key of ['line1', 'line2', 'stateRegion', 'postalCode']) if (!body[key]) delete body[key];
    setSaving(true);
    try {
      let result;
      if (currentEditor.section === 'profile') result = await request(currentEditor.row ? '/' + currentEditor.row.id : '', currentEditor.row ? 'PUT' : 'POST', body);
      else result = await request('/' + guest!.id + '/' + currentEditor.section + (currentEditor.row ? '/' + currentEditor.row.id : ''), currentEditor.row ? 'PUT' : 'POST', body);
      setGuest(result); setRevealed(false); setEditor(null); setDuplicates(null); setPending(null); message.success('Guest saved'); await load();
    } catch (e: any) {
      if (e.candidates) { setDuplicates(e.candidates); setDuplicateReason(''); setPending(() => async () => submit(values, form.getFieldValue('_duplicateReason'))); }
      else message.error(e.message);
    } finally { setSaving(false); }
  }
  async function archive() {
    if (!guest) return; setSaving(true);
    try { setGuest(await request('/' + guest.id + '/archive', 'POST', { version: guest.version })); message.success('Guest archived'); await load(); }
    catch (e: any) { message.error(e.message); } finally { setSaving(false); }
  }
  async function previewDuplicates() {
    const values = form.getFieldsValue();
    try { const candidates = await request('/duplicates', 'POST', { fullName: values.fullName, phone: values.phone, email: values.email }); setPending(null); setDuplicates(candidates); }
    catch (e: any) { message.error(e.message); }
  }
  async function exportCsv() {
    try {
      const result = await request('/export', 'GET', undefined, filters);
      const url = URL.createObjectURL(new Blob(['\uFEFF' + result.csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = result.filename; link.click(); URL.revokeObjectURL(url);
    } catch (e: any) { message.error(e.message); }
  }
  const input = (name: string, label: string, required = false, type?: string) => <Form.Item key={name} name={name} label={label} rules={required ? [{ required: true, whitespace: true, message: label + ' is required' }] : []}><Input type={type} maxLength={500}/></Form.Item>;
  const select = (name: string, label: string, choices: string[], required = false) => <Form.Item key={name} name={name} label={label} rules={required ? [{ required: true }] : []}><Select allowClear={!required} options={opts(choices)}/></Form.Item>;
  const section = editor?.section;
  const columns: any[] = [
    { title: 'Guest', render: (_: any, r: Row) => <button className="text-left" onClick={() => void openGuest(r.id)}><span className="block font-semibold text-blue-700">{r.fullName}</span><span className="text-xs text-slate-400">{r.guestNumber}</span></button> },
    { title: 'Contact', render: (_: any, r: Row) => r.contacts.filter((c: Row) => c.isActive).map((c: Row) => <div key={c.id} className="text-sm">{c.value}</div>) },
    { title: 'Nationality', dataIndex: 'nationality', render: (v: string) => v || '—' },
    { title: 'Type', dataIndex: 'guestType' },
    { title: 'VIP', render: (_: any, r: Row) => r.vip?.isActive && (!r.vip.effectiveFrom || date(r.vip.effectiveFrom) <= date(new Date().toISOString())) && (!r.vip.effectiveTo || date(r.vip.effectiveTo) >= date(new Date().toISOString())) ? <Tag color="gold">{r.vip.level}</Tag> : '—' },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={v === 'ACTIVE' ? 'green' : 'default'}>{v}</Tag> },
    { title: 'Created', dataIndex: 'createdAt', render: date },
  ];
  function resourceContent(key: string) {
    if (!guest) return null;
    const def = sections[key], items: Row[] = key === 'vip' ? guest.vip ? [guest.vip] : [] : guest[key] || [];
    const writable = guest.status !== 'ARCHIVED';
    return <div className="space-y-4">
      {key === 'preferences' && <Alert showIcon type="info" message="Preferences are requests, not guarantees."/>}
      {key === 'identities' && <Alert showIcon type="info" message="Identity numbers are masked by default. Expired documents are flagged for review."/>}
      {writable && can(def.create || def.edit) && (key !== 'vip' || !guest.vip) && <Button icon={<Plus size={15}/>} onClick={() => edit(key)}>Add {def.label.toLowerCase()}</Button>}
      {!items.length ? <Empty description={'No ' + def.label.toLowerCase() + ' recorded'}/> : items.map(row => <Card key={row.id} size="small" title={<Space wrap><span>{row.type || row.level}</span>{row.isPrimary && <Tag color="blue">Primary</Tag>}{row.isActive === false && <Tag>Inactive</Tag>}{row.isResolved && <Tag>Resolved</Tag>}{row.expired && <Tag color="red">Expired</Tag>}</Space>}
        extra={writable && can(def.edit) ? <Button type="link" onClick={() => edit(key, row)}>Edit</Button> : null}>
        {key === 'contacts' && <p>{row.value}</p>}
        {key === 'addresses' && <p>{[row.line1, row.line2, row.city, row.stateRegion, row.postalCode, row.country].filter(Boolean).join(', ')}</p>}
        {key === 'identities' && <Descriptions size="small" column={2} items={[{ key: 'number', label: 'Number', children: row.number }, { key: 'country', label: 'Issued by', children: row.countryOfIssue || '—' }, { key: 'issue', label: 'Issued', children: date(row.issueDate) }, { key: 'expiry', label: 'Expires', children: date(row.expiryDate) }]}/>}
        {key === 'preferences' && <><p>{row.value}</p><p className="mt-2 text-sm text-slate-500">{row.priority} priority · {row.propertyId ? row.branchId ? 'Branch' : 'Property' : 'Group-wide'}</p>{row.notes && <p className="mt-2">{row.notes}</p>}</>}
        {key === 'notes' && <><p className="whitespace-pre-wrap">{row.text}</p><p className="mt-3 text-xs text-slate-400">{row.visibility} · {date(row.createdAt)} · {row.createdBy}</p></>}
        {key === 'vip' && <><p>{date(row.effectiveFrom)} — {date(row.effectiveTo)}</p><p className="mt-2">{row.reason || 'No additional note'}</p></>}
      </Card>)}
    </div>;
  }
  return <PortalShell pageTitle="Guest management">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-sm font-medium text-blue-600">Hotel operations</p><h1 className="text-3xl font-bold tracking-tight">Guest management</h1><p className="mt-2 text-slate-500">Recognize returning guests and keep their details in one place.</p></div>
      <Space wrap><Select aria-label="Property" disabled={saving} placeholder="Select property" value={propertyId || undefined} style={{ minWidth: 220 }} options={properties.map(p => ({ value: p.id, label: p.name }))} onChange={value => { setPropertyId(value); setBranchId(properties.find(p => p.id === value)?.branchOnly ? properties.find(p => p.id === value)?.branches[0]?.id || '' : ''); setPage(1); }}/>
        <Select aria-label="Branch" disabled={saving} allowClear={!properties.find(p => p.id === propertyId)?.branchOnly} placeholder="Property scope" value={branchId || undefined} style={{ minWidth: 180 }} options={properties.find(p => p.id === propertyId)?.branches.map((b: Row) => ({ value: b.id, label: b.name }))} onChange={v => { setBranchId(v || ''); setPage(1); }}/>
        <Button icon={<RefreshCw size={15}/>} onClick={() => void load()}>Refresh</Button></Space></div>
    {error && <Alert className="mb-5" showIcon type="error" message={error}/>}
    {!properties.length ? <Card><Empty description="No accessible properties. Assign a role with GUEST.PROFILE.VIEW in Security."/></Card> : <>
      <div className="mb-5 grid gap-4 sm:grid-cols-3"><Card><Statistic title="Matching guests" value={total} prefix={<Users size={20}/>}/></Card><Card><div className="text-sm text-slate-500">Profile recognition</div><div className="mt-2 text-lg font-semibold">Across your hotel group</div><p className="mt-2 text-xs text-slate-400">Notes and preferences retain their operational scope.</p></Card><Card><div className="text-sm text-slate-500">Sensitive information</div><div className="mt-2 text-lg font-semibold">Masked by default</div><p className="mt-2 text-xs text-slate-400">Full access requires dedicated permissions.</p></Card></div>
      <Card className="rounded-2xl shadow-sm">
        <div className="mb-5 flex flex-wrap justify-between gap-3"><Space wrap>
          <Input.Search aria-label="Search guests" placeholder="Name, guest number, phone, email or company" allowClear style={{ width: 340, maxWidth: '100%' }} onSearch={v => filter('q', v)}/>
          <Select aria-label="Status filter" placeholder="All statuses" allowClear style={{ width: 150 }} options={opts(['ACTIVE', 'INACTIVE', 'ARCHIVED'])} onChange={v => filter('status', v)}/>
          <Select aria-label="Guest type filter" placeholder="All guest types" allowClear style={{ width: 170 }} options={opts(options.guestType)} onChange={v => filter('guestType', v)}/>
          {can('VIP.VIEW') && <Checkbox checked={filters.vip === 'true'} onChange={e => filter('vip', e.target.checked ? 'true' : '')}>VIP only</Checkbox>}
        </Space><Space wrap>{can('CONFIG.MANAGE') && <Button onClick={() => { configForm.resetFields(); setConfigOpen(true); }}>Configuration</Button>}{can('PROFILE.CREATE') && <Button type="primary" icon={<Plus size={15}/>} onClick={() => edit('profile')}>New guest</Button>}</Space></div>
        <details className="mb-5"><summary className="cursor-pointer text-sm text-blue-600">More filters and reports</summary><Space wrap className="mt-3">
          {can('IDENTITY.VIEW') && <Input.Search aria-label="Exact identity search" placeholder="Exact NRC / passport number" allowClear onSearch={v => filter('identity', v)}/>}
          <Input aria-label="Nationality filter" placeholder="Nationality" value={filters.nationality || ''} onChange={e => filter('nationality', e.target.value)}/>
          <label className="text-sm">Created from <Input type="date" value={filters.from || ''} onChange={e => filter('from', e.target.value)}/></label><label className="text-sm">Created to <Input type="date" value={filters.to || ''} onChange={e => filter('to', e.target.value)}/></label>
          <Checkbox checked={filters.createdProperty === 'true'} onChange={e => filter('createdProperty', e.target.checked ? 'true' : '')}>Created at this property</Checkbox>
          {can('REPORT.VIEW') && <Button onClick={async () => { try { setReport(await request('/reports', 'GET', undefined, filters)); } catch (e: any) { message.error(e.message); } }}>View report</Button>}
          {can('REPORT.EXPORT') && <Button icon={<Download size={15}/>} onClick={() => void exportCsv()}>Export CSV</Button>}
        </Space></details>
        <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} scroll={{ x: 1000 }} pagination={{ current: page, pageSize: 20, total, showSizeChanger: false, onChange: setPage, showTotal: n => n + ' guests' }} locale={{ emptyText: <Empty description="No guests match your filters. Search existing guests before creating a new profile."/> }}/>
      </Card></>}
    <Drawer title={guest ? <><span className="font-semibold">{guest.fullName}</span><span className="ml-3 text-sm text-slate-400">{guest.guestNumber}</span></> : ''} width={860} open={!!guest} onClose={() => { detailGeneration.current++; setGuest(null); setRevealed(false); }}>
      {guest && <><div className="mb-5 flex flex-wrap items-center gap-2"><Tag color={guest.status === 'ACTIVE' ? 'green' : 'default'}>{guest.status}</Tag><Button onClick={() => void openGuest(guest.id)}>Refresh profile</Button>
        {guest.status !== 'ARCHIVED' && can('PROFILE.UPDATE') && <Button onClick={() => edit('profile', guest)}>Edit profile</Button>}
        {(can('CONTACT.VIEW_FULL') || can('IDENTITY.VIEW_FULL')) && <Button onClick={() => void openGuest(guest.id, !revealed)}>{revealed ? 'Mask sensitive data' : 'Reveal sensitive data'}</Button>}
        {guest.status !== 'ARCHIVED' && can('PROFILE.DEACTIVATE') && <Popconfirm title="Archive this guest?" description="History is preserved. Archived profiles cannot be edited." onConfirm={archive}><Button danger loading={saving}>Archive</Button></Popconfirm>}</div>
        <Tabs destroyOnHidden items={[
          { key: 'summary', label: 'Summary', children: <Descriptions bordered column={2} size="small" items={['fullName', 'displayName', 'title', 'firstName', 'middleName', 'lastName', 'guestType', 'nationality', 'dateOfBirth', 'preferredLanguage', 'preferredContactMethod', 'company', 'occupation', 'gender'].map(key => ({ key, label: key.replace(/([A-Z])/g, ' $1'), children: key === 'dateOfBirth' ? date(guest[key]) : guest[key] || '—' }))}/> },
          ...Object.entries(sections).filter(([, def]) => can(def.view)).map(([key, def]) => ({ key, label: def.label, children: resourceContent(key) })),
          { key: 'history', label: 'Stay history', children: <Empty description="Stay history will appear when Reservation and Front Desk are connected. No stay records are available yet."/> },
          ...(can('AUDIT.VIEW') ? [{ key: 'audit', label: 'Audit', children: <><Button className="mb-4" onClick={async () => { try { setAudit(await request('/' + guest.id + '/audit')); } catch (e: any) { message.error(e.message); } }}>Load audit history</Button><Table size="small" rowKey="id" dataSource={audit} pagination={{ pageSize: 10 }} columns={[{ title: 'When', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString() }, { title: 'Action', dataIndex: 'action' }, { title: 'Section', dataIndex: 'resource' }, { title: 'By', dataIndex: 'performedBy' }]} expandable={{ expandedRowRender: (r: Row) => <pre className="overflow-auto text-xs">{JSON.stringify({ before: r.oldValue, after: r.newValue }, null, 2)}</pre> }}/></> }] : []),
        ]}/></>}
    </Drawer>
    <Modal title={section === 'profile' ? editor?.row ? 'Edit guest profile' : 'Create guest profile' : (editor?.row ? 'Edit ' : 'Add ') + (sections[section || '']?.label.toLowerCase() || '')} width={720} open={!!editor} confirmLoading={saving} onCancel={() => { if (!saving) setEditor(null); }} onOk={() => form.submit()} okText="Save">
      <Form form={form} layout="vertical" onFinish={values => void submit(values)} className="mt-5">
        {section === 'profile' && <>{!editor?.row && <Alert className="mb-5" showIcon type="info" message="Search before creating a guest" description="Enter a name or contact, then check for existing profiles."/>}<div className="grid gap-x-4 sm:grid-cols-2">
          {input('fullName', 'Full name', true)}{input('displayName', 'Display name')}{select('guestType', 'Guest type', options.guestType, true)}{select('status', 'Status', editor?.row && !can('PROFILE.DEACTIVATE') ? [editor.row.status] : ['ACTIVE', 'INACTIVE'], true)}
          {input('title', 'Title')}{input('firstName', 'First name')}{input('middleName', 'Middle name')}{input('lastName', 'Last name')}{input('dateOfBirth', 'Date of birth', false, 'date')}{input('nationality', 'Nationality')}{input('preferredLanguage', 'Preferred language')}{select('preferredContactMethod', 'Preferred contact method', ['Phone', 'Email', 'SMS', 'Messaging App', 'None'])}
          {input('company', 'Company')}{input('occupation', 'Occupation')}{input('gender', 'Gender (optional)')}
          {!editor?.row && can('CONTACT.UPDATE') && <>{input('phone', 'Phone (include country code when known)')}{input('email', 'Email', false, 'email')}</>}
        </div>{!editor?.row && <Button icon={<Search size={15}/>} onClick={() => void previewDuplicates()}>Check for existing guest</Button>}</>}
        {section === 'contacts' && <>{select('type', 'Contact type', ['Phone', 'Email'], true)}{input('value', editor?.row ? 'Contact value (leave blank to keep existing)' : 'Contact value', !editor?.row)}</>}
        {section === 'addresses' && <>{select('type', 'Address type', ['Home', 'Work', 'Billing', 'Other'], true)}{editor?.row && !revealed && <Alert className="mb-4" type="info" message="Blank masked fields retain their saved values."/>}{input('line1', 'Address line 1', !editor?.row)}{input('line2', 'Address line 2')}<div className="grid gap-x-4 sm:grid-cols-2">{input('city', 'Township / City')}{input('stateRegion', 'State / Region')}{input('postalCode', 'Postal code')}{input('country', 'Country')}</div></>}
        {section === 'identities' && <>{select('type', 'Document type', options.identityType, true)}{input('number', editor?.row ? 'New identity number (leave blank to keep existing)' : 'Identity number', !editor?.row)}{input('countryOfIssue', 'Country of issue')}<div className="grid gap-x-4 sm:grid-cols-2">{input('issueDate', 'Issue date', false, 'date')}{input('expiryDate', 'Expiry date', false, 'date')}</div></>}
        {section === 'preferences' && <>{select('type', 'Preference type', options.preferenceType, true)}{input('value', 'Requested preference', true)}{select('priority', 'Priority', ['Low', 'Normal', 'High'])}{!editor?.row && select('scope', 'Scope', branchId ? ['PROPERTY'] : ['PROPERTY', 'GROUP'])}{input('notes', 'Additional notes')}</>}
        {section === 'notes' && <>{select('type', 'Note type', ['General', 'Front Desk', 'Housekeeping', 'Billing', 'Service', 'Management'], true)}
          {select('visibility', 'Visibility', [...(editor?.row?.visibility === 'GROUP' ? ['GROUP'] : ['PROPERTY', ...(editor?.row || branchId ? [] : ['GROUP']), 'DEPARTMENT', ...(can('NOTE.MANAGEMENT') ? ['MANAGEMENT'] : [])])], true)}
          <Form.Item name="text" label="Note" rules={[{ required: true, whitespace: true }]}><Input.TextArea rows={5} maxLength={4000}/></Form.Item><Form.Item name="isResolved" valuePropName="checked"><Checkbox>Resolved</Checkbox></Form.Item></>}
        {section === 'vip' && <>{select('level', 'VIP level', options.vipLevel, true)}<div className="grid gap-x-4 sm:grid-cols-2">{input('effectiveFrom', 'Effective from', false, 'date')}{input('effectiveTo', 'Effective to', false, 'date')}</div>{input('reason', 'Reason / note')}</>}
        {['contacts', 'addresses', 'identities'].includes(section || '') && <Form.Item name="isPrimary" valuePropName="checked"><Checkbox>Primary</Checkbox></Form.Item>}
        {section && section !== 'profile' && <Form.Item name="isActive" valuePropName="checked"><Checkbox>Active</Checkbox></Form.Item>}
      </Form>
    </Modal>
    <Modal title="Review possible duplicates" width={650} open={duplicates !== null} onCancel={() => { setDuplicates(null); setPending(null); }} footer={pending ? <Button type="primary" loading={saving} disabled={!duplicateReason.trim()} onClick={() => { form.setFieldValue('_duplicateReason', duplicateReason); void pending(); }}>Create / save anyway with reason</Button> : <Button onClick={() => setDuplicates(null)}>Continue editing</Button>}>
      <Alert className="mb-4" type="warning" showIcon message="Review existing profiles before continuing. Profiles are never merged automatically."/>
      {duplicates?.length ? duplicates.map(r => <Card key={r.id} size="small" className="mb-3" title={r.fullName} extra={<Button type="link" onClick={() => { setDuplicates(null); setPending(null); setEditor(null); void openGuest(r.id); }}>Use existing guest</Button>}><p>{r.guestNumber} · {r.reason} · {r.status}</p>{r.contacts?.map((c: Row) => <p key={c.id}>{c.value}</p>)}</Card>) : <Empty description="No potential duplicates found"/>}
      {pending && <label className="block mt-4">Reason for keeping a separate profile<Input.TextArea className="mt-2" value={duplicateReason} onChange={e => setDuplicateReason(e.target.value)} maxLength={1000}/></label>}
    </Modal>
    <Modal title="Guest report — current filters" open={!!report} footer={<Button onClick={() => setReport(null)}>Close</Button>} onCancel={() => setReport(null)} width={650}>
      {report && <><Statistic className="mb-4" title="Matching guests" value={report.total}/><Table size="small" pagination={false} rowKey={r => r.nationality || 'unknown'} dataSource={report.nationality} columns={[{ title: 'Nationality', dataIndex: 'nationality', render: (v: string) => v || 'Not recorded' }, { title: 'Guests', render: (_: any, r: Row) => r._count._all }]}/><div className="mt-5">{report.status.map((r: Row) => <Tag key={r.status}>{r.status}: {r._count._all}</Tag>)}</div><p className="mt-4 text-sm text-slate-500">Returning-guest and stay reports require the future Reservation module.</p></>}
    </Modal>
    <Modal title="Guest configuration" open={configOpen} onCancel={() => setConfigOpen(false)} onOk={() => configForm.submit()} okText="Add option">
      <p className="my-4 text-slate-500">Add a classification option for this hotel group.</p><Form form={configForm} layout="vertical" onFinish={async values => { try { await request('/configuration', 'POST', values); await load(); configForm.resetFields(); message.success('Option added'); } catch (e: any) { message.error(e.message); } }}>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}><Select options={[{ value: 'guestType', label: 'Guest types' }, { value: 'identityType', label: 'Document types' }, { value: 'vipLevel', label: 'VIP levels' }, { value: 'preferenceType', label: 'Preference types' }]}/></Form.Item><Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true }]}><Input maxLength={200}/></Form.Item>
      </Form>
    </Modal>
  </PortalShell>;
}
