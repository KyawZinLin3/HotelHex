"use client";

import { useEffect, useRef, useState } from 'react';
import { Alert, App, Button, Card, Checkbox, Descriptions, Drawer, Empty, Form, Input, Modal, Popconfirm, Select, Space, Spin, Statistic, Table, Tabs, Tag, Timeline } from 'antd';
import { BedDouble, Download, Plus, RefreshCw } from 'lucide-react';
import { PortalShell } from '@/components/portal-shell';
import { useAuth } from '@/components/auth-provider';
import { label, RecordData as Row, RoomFields, statuses } from './room-fields';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const ROOT = '/v1/room-management';
const sections = [
  ['rooms', 'Rooms', 'ROOM.ROOM.VIEW'], ['board', 'Status board', 'ROOM.ROOM.VIEW'],
  ['room-types', 'Room types', 'ROOM.TYPE.VIEW'], ['bed-types', 'Bed types', 'ROOM.BEDTYPE.VIEW'],
  ['amenities', 'Amenities', 'ROOM.AMENITY.VIEW'], ['features', 'Features', 'ROOM.FEATURE.VIEW'],
  ['out-of-order', 'Out of order', 'ROOM.OOO.VIEW'], ['out-of-service', 'Out of service', 'ROOM.OOS.VIEW'], ['reports', 'Reports', 'ROOM.REPORT.VIEW'],
];
const defaults = { isActive: true, maxOccupancy: 2, maxAdults: 2, maxChildren: 0, baseAdults: 1, baseChildren: 0, numberOfBeds: 1, extraBedAllowed: false, maxExtraBeds: 0, roomSizeUnit: 'SQM', displayOrder: 0, smokingPolicy: 'NON_SMOKING', smokingType: 'NON_SMOKING', capacity: 1, category: 'Other', isAccessible: false, start: 101, end: 110, padding: 0 };
const tint = (value: string) => ['VACANT_CLEAN', 'INSPECTED', 'SELLABLE'].includes(value) ? 'green' : value.includes('OCCUPIED') ? 'blue' : value === 'INACTIVE' ? 'default' : value.includes('OUT_OF') ? 'red' : 'gold';
const stamp = (v?: string) => v ? new Date(v).toLocaleString() : '?';

export default function RoomsPage() {
  const { message } = App.useApp();
  const { token, logout } = useAuth();
  const [properties, setProperties] = useState<Row[]>([]); const [propertyId, setPropertyId] = useState(''); const [options, setOptions] = useState<Row>({});
  const [section, setSection] = useState('rooms'); const [rows, setRows] = useState<Row[]>([]); const [filters, setFilters] = useState<Row>({});
  const [loading, setLoading] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [editor, setEditor] = useState<{ kind: string; record?: Row } | null>(null);
  const [detail, setDetail] = useState<Row | null>(null); const [history, setHistory] = useState<Row[]>([]); const [notes, setNotes] = useState<Row[]>([]);
  const [action, setAction] = useState<{ kind: string; record: Row } | null>(null);
  const [form] = Form.useForm(); const [actionForm] = Form.useForm();
  const generation = useRef(0); const selection = useRef(0);

  async function request(path: string, method = 'GET', body?: Row, auth = token) {
    const response = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: 'Bearer ' + auth } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401 && auth) void logout();
      throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Request failed');
    }
    return data;
  }
  const can = (permission: string, branchId?: string) => (options.permissions || []).includes(permission) || (branchId
    ? options.branches?.find((b: Row) => b.id === branchId)?.permissions.includes(permission)
    : options.branches?.some((b: Row) => b.permissions.includes(permission)));
  const propertyCan = (permission: string) => (options.permissions || []).includes(permission);
  const visibleSections = sections.filter(([key, , permission]) => ['room-types', 'bed-types', 'amenities', 'features'].includes(key) ? propertyCan(permission) : can(permission));
  const query = () => new URLSearchParams(Object.fromEntries(Object.entries({ propertyId, ...filters }).filter(([, v]) => v !== '' && v != null).map(([k, v]) => [k, String(v)]))).toString();

  useEffect(() => {
    if (!token) return;
    let current = true;
    request(ROOT + '/properties').then((items: Row[]) => { if (current) { setProperties(items); setPropertyId(previous => items.some(p => p.id === previous) ? previous : items[0]?.id || ''); setError(''); } }).catch(e => { if (current) setError(e.message); });
    return () => { current = false; };
  }, [token]);
  useEffect(() => {
    setOptions({}); setRows([]); if (!propertyId || !token) return;
    let current = true;
    request(ROOT + '/options?propertyId=' + encodeURIComponent(propertyId)).then(data => { if (current) setOptions(data); }).catch(e => { if (current) setError(e.message); });
    return () => { current = false; };
  }, [propertyId, token]);
  useEffect(() => { if (visibleSections.length && !visibleSections.some(([key]) => key === section)) setSection(visibleSections[0][0]); }, [options, section]);
  async function load() {
    const run = ++generation.current;
    if (!token || !propertyId || options.property?.id !== propertyId || !visibleSections.some(([key]) => key === section)) { setRows([]); return; }
    setLoading(true); setError('');
    try { const data = await request(ROOT + '/' + (section === 'board' ? 'rooms' : section) + '?' + query()); if (run === generation.current) setRows(data); }
    catch (e: any) { if (run === generation.current) { setError(e.message); setRows([]); } }
    finally { if (run === generation.current) setLoading(false); }
  }
  useEffect(() => { load(); return () => { generation.current++; }; }, [token, propertyId, section, JSON.stringify(filters), options]);
  async function refresh() {
    try { const data = await request(ROOT + '/options?propertyId=' + encodeURIComponent(propertyId)); setOptions(data); }
    catch (e: any) { message.error(e.message); }
  }
  function edit(kind: string, record?: Row) {
    setEditor({ kind, record }); form.resetFields();
    form.setFieldsValue({ ...defaults, ...record, amenityIds: record?.amenities?.map((a: Row) => a.id) || [], featureIds: record?.features?.map((f: Row) => f.id) || [] });
  }
  async function save(values: Row) {
    if (!editor) return; setBusy(true);
    try {
      const endpoint = editor.kind === 'bulk' ? 'rooms/bulk' : editor.kind + (editor.record ? '/' + editor.record.id : '');
      const result = await request(ROOT + '/' + endpoint, editor.record ? 'PUT' : 'POST', { ...values, propertyId, version: editor.record?.version });
      message.success(editor.kind === 'bulk' ? result.created + ' rooms created' : 'Saved successfully'); setEditor(null); await refresh();
    } catch (e: any) { message.error(e.message); } finally { setBusy(false); }
  }
  async function view(room: Row) {
    const run = ++selection.current; setDetail(null); setHistory([]); setNotes([]);
    try {
      const data = await request(ROOT + '/rooms/' + room.id);
      const [events, roomNotes] = await Promise.all([
        can('ROOM.STATUS.VIEW', room.branchId) ? request(ROOT + '/rooms/' + room.id + '/status-history') : [],
        can('ROOM.NOTE.VIEW', room.branchId) ? request(ROOT + '/rooms/' + room.id + '/notes') : [],
      ]);
      if (run === selection.current) { setDetail(data); setHistory(events); setNotes(roomNotes); }
    } catch (e: any) { message.error(e.message); }
  }
  function openAction(kind: string, record: Row) {
    actionForm.resetFields(); setAction({ kind, record });
    if (kind === 'edit-hold') {
      const localTime = (value?: string) => { if (!value) return undefined; const d = new Date(value); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
      actionForm.setFieldsValue({ reason: record.reason, description: record.description, maintenanceReference: record.maintenanceReference, expectedEndAt: localTime(record.expectedEndAt) });
    }
  }
  async function perform(values: Row) {
    if (!action) return; setBusy(true);
    try {
      const { kind, record } = action;
      if (kind === 'status') await request(ROOT + '/rooms/' + record.id + '/status', 'POST', { ...values, version: record.version });
      else if (kind === 'note') await request(ROOT + '/rooms/' + record.id + '/notes', 'POST', values);
      else if (kind.startsWith('release:')) await request(ROOT + '/' + kind.split(':')[1] + '/' + record.id + '/release', 'POST', { ...values, version: record.room.version });
      else if (kind === 'edit-hold') await request(ROOT + '/out-of-order/' + record.id, 'PUT', { ...values, version: record.room.version, expectedEndAt: values.expectedEndAt ? new Date(values.expectedEndAt).toISOString() : null });
      else await request(ROOT + '/' + kind, 'POST', { ...values, roomId: record.id, version: record.version, startAt: new Date(values.startAt).toISOString(), expectedEndAt: values.expectedEndAt ? new Date(values.expectedEndAt).toISOString() : null });
      message.success('Saved successfully'); setAction(null); setDetail(null); await load();
    } catch (e: any) { message.error(e.message); } finally { setBusy(false); }
  }
  async function toggleRoom(room: Row) {
    setBusy(true); try { await request(ROOT + '/rooms/' + room.id + '/' + (room.isActive ? 'deactivate' : 'activate'), 'POST', { version: room.version }); message.success('Room updated'); await load(); } catch (e: any) { message.error(e.message); } finally { setBusy(false); }
  }
  async function exportCsv() {
    try {
      const data: Row[] = await request(ROOT + '/reports?' + query() + '&export=true');
      const csvCell = (v: unknown) => '"' + String(v ?? '').replace(/^[=+@\-\t\r]/, "'PATCH").replace(/"/g, '""') + '"';
      const csv = [['Room', 'Type', 'Branch', 'Building', 'Floor', 'Operational status', 'Sellability', 'Max occupancy'], ...data.map(r => [r.roomNumber, r.roomType.name, r.branch.name, r.building.name, r.floor.name, r.operationalStatus, r.sellabilityStatus, r.capacity.maxOccupancy])].map(row => row.map(csvCell).join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'room-inventory.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e: any) { message.error(e.message); }
  }

  const roomActions = (room: Row) => <Space wrap size={0}>
    {can('ROOM.ROOM.VIEW', room.branchId) && <Button type='link' size='small' onClick={() => view(room)}>Details</Button>}
    {can('ROOM.ROOM.UPDATE', room.branchId) && <Button type='link' size='small' onClick={() => edit('rooms', room)}>Edit</Button>}
    {can('ROOM.STATUS.UPDATE', room.branchId) && <Button type='link' size='small' onClick={() => openAction('status', room)}>Status</Button>}
    {can('ROOM.OOO.CREATE', room.branchId) && <Button type='link' size='small' onClick={() => openAction('out-of-order', room)}>OOO</Button>}
    {can('ROOM.OOS.CREATE', room.branchId) && <Button type='link' size='small' onClick={() => openAction('out-of-service', room)}>OOS</Button>}
    {can('ROOM.NOTE.CREATE', room.branchId) && <Button type='link' size='small' onClick={() => openAction('note', room)}>Note</Button>}
    {can('ROOM.ROOM.' + (room.isActive ? 'DEACTIVATE' : 'ACTIVATE'), room.branchId) && <Popconfirm title={(room.isActive ? 'Deactivate' : 'Activate') + ' room ' + room.roomNumber + '?'} onConfirm={() => toggleRoom(room)}><Button type='link' size='small' danger={room.isActive} disabled={busy}>{room.isActive ? 'Deactivate' : 'Activate'}</Button></Popconfirm>}
  </Space>;
  const roomColumns: any[] = [
    { title: 'Room', dataIndex: 'roomNumber', render: (v: string) => <strong>{v}</strong> }, { title: 'Room type', dataIndex: ['roomType', 'name'] },
    { title: 'Building / floor', render: (_: unknown, r: Row) => <>{r.building.name}<div className='text-xs text-slate-400'>{r.floor.name}</div></> },
    { title: 'Condition', dataIndex: 'operationalStatus', render: (v: string) => <Tag color={tint(v)}>{label(v)}</Tag> },
    { title: 'Sellability', dataIndex: 'sellabilityStatus', render: (v: string) => <Tag color={tint(v)}>{label(v)}</Tag> },
    { title: 'Capacity', dataIndex: ['capacity', 'maxOccupancy'] },
    ...(section !== 'reports' ? [{ title: 'Actions', render: (_: unknown, r: Row) => roomActions(r) }] : []),
  ];
  const catalogResource = ({ 'room-types': 'TYPE', 'bed-types': 'BEDTYPE', amenities: 'AMENITY', features: 'FEATURE' } as Row)[section];
  const managePermission = `ROOM.${catalogResource}.${section === 'room-types' ? 'UPDATE' : 'MANAGE'}`;
  const catalogColumns = [{ title: 'Code', dataIndex: 'code' }, { title: 'Name', dataIndex: 'name' },
    { title: 'Details', render: (_: unknown, r: Row) => section === 'room-types' ? `${r.maxOccupancy} guests ? ${r.maxAdults} adults ? ${r.maxChildren} children` : r.category || r.description || (r.capacity ? r.capacity + ' guests' : '?') },
    { title: 'Status', dataIndex: 'isActive', render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Inactive'}</Tag> },
    { title: 'Actions', render: (_: unknown, r: Row) => propertyCan(managePermission) && <Button type='link' onClick={() => edit(section, r)}>Edit</Button> }];
  const holdColumns = [{ title: 'Room', dataIndex: ['room', 'roomNumber'] }, { title: 'Reason', dataIndex: 'reason' },
    { title: 'From', dataIndex: 'startAt', render: stamp }, { title: 'Expected until', dataIndex: 'expectedEndAt', render: stamp },
    { title: 'Status', render: (_: unknown, r: Row) => <Tag color={r.releasedAt ? 'green' : 'red'}>{r.releasedAt ? 'Released' : new Date(r.startAt) > new Date() ? 'Scheduled' : 'Active'}</Tag> },
    { title: 'Actions', render: (_: unknown, r: Row) => !r.releasedAt && <Space>{section === 'out-of-order' && can('ROOM.OOO.UPDATE', r.room.branchId) && <Button onClick={() => openAction('edit-hold', r)}>Edit</Button>}{can(`ROOM.${section === 'out-of-order' ? 'OOO' : 'OOS'}.RELEASE`, r.room.branchId) && <Button onClick={() => openAction('release:' + section, r)}>Release</Button>}</Space> }];
  const inventory = ['rooms', 'board', 'reports'].includes(section);
  const holds = section === 'out-of-order' || section === 'out-of-service';
  const newAllowed = inventory ? can('ROOM.ROOM.CREATE') : propertyCan(`ROOM.${catalogResource}.${section === 'room-types' ? 'CREATE' : 'MANAGE'}`);
  const filterSelect = (key: string, placeholder: string, list: Row[]) => <Select key={key} style={{ minWidth: 155 }} allowClear placeholder={placeholder} value={filters[key]} options={list.map(r => ({ value: r.id, label: r.name }))} onChange={value => setFilters(f => ({ ...f, [key]: value, ...(key === 'buildingId' ? { floorId: undefined } : {}) }))} />;

  return <PortalShell pageTitle='Room management'>
    <div className='mb-6 flex flex-wrap items-end justify-between gap-4'><div><p className='mb-2 text-sm font-medium text-blue-600'>Hotel operations</p><h1 className='text-3xl font-bold tracking-tight'>Room management</h1><p className='mt-2 text-slate-500'>Inventory, room configuration and operational readiness.</p></div><Space wrap><Select placeholder='Select property' style={{ minWidth: 230 }} value={propertyId || undefined} options={properties.map(p => ({ value: p.id, label: p.name }))} onChange={v => { generation.current++; selection.current++; setPropertyId(v); setFilters({}); setEditor(null); setAction(null); setDetail(null); }} /></Space></div>
    {error && <Alert type='error' showIcon message={error} className='mb-5' />}
    {!properties.length ? <Empty description='No accessible properties. Assign a role with Room permissions and a valid property or branch scope in Security.' /> : <>
      <Tabs activeKey={section} onChange={v => { setSection(v); setFilters({}); setRows([]); }} items={visibleSections.map(([key, title]) => ({ key, label: title }))} />
      {!visibleSections.length && options.property && <Alert type='info' message='Your role has no view permissions. Ask your administrator for the relevant Room View permissions.' />}
      {visibleSections.some(([key]) => key === section) && <>
      {inventory && <div className='mb-5 grid gap-4 grid-cols-2 lg:grid-cols-4'>{[['Rooms in view', rows.length], ['Sellable', rows.filter(r => r.sellabilityStatus === 'SELLABLE').length], ['Ready / inspected', rows.filter(r => ['VACANT_CLEAN', 'INSPECTED'].includes(r.operationalStatus) && r.sellabilityStatus === 'SELLABLE').length], ['Held', rows.filter(r => ['OUT_OF_ORDER', 'OUT_OF_SERVICE'].includes(r.sellabilityStatus)).length]].map(([title, value]) => <Card key={String(title)}><Statistic title={title} value={value} /></Card>)}</div>}
      <Card>
        <div className='mb-5 flex flex-wrap justify-between gap-3'><Space wrap>
          {(inventory || holds) && filterSelect('branchId', 'All branches', options.branches || [])}
          {inventory && <><Input.Search allowClear placeholder='Room number or name' onSearch={value => setFilters(f => ({ ...f, search: value }))} style={{ width: 220 }} />{filterSelect('buildingId', 'All buildings', options.buildings || [])}{filterSelect('floorId', 'All floors', (options.floors || []).filter((f: Row) => !filters.buildingId || f.buildingId === filters.buildingId))}{filterSelect('roomTypeId', 'All room types', options.roomTypes || [])}<Select allowClear placeholder='Room condition' style={{ width: 180 }} value={filters.operationalStatus} options={statuses.map(v => ({ value: v, label: label(v) }))} onChange={v => setFilters(f => ({ ...f, operationalStatus: v }))} /><Select allowClear placeholder='Sellability' style={{ width: 160 }} value={filters.sellabilityStatus} options={['SELLABLE', 'OUT_OF_ORDER', 'OUT_OF_SERVICE', 'INACTIVE'].map(v => ({ value: v, label: label(v) }))} onChange={v => setFilters(f => ({ ...f, sellabilityStatus: v }))} /><Checkbox checked={filters.isAccessible === 'true'} onChange={e => setFilters(f => ({ ...f, isAccessible: e.target.checked ? 'true' : undefined }))}>Accessible</Checkbox></>}
        </Space><Space wrap><Button icon={<RefreshCw size={15} />} onClick={refresh} loading={loading}>Refresh</Button>{section === 'reports' && can('ROOM.REPORT.EXPORT') && <Button icon={<Download size={15} />} onClick={exportCsv}>Export CSV</Button>}{!holds && section !== 'reports' && newAllowed && <><Button type='primary' icon={<Plus size={15} />} onClick={() => edit(inventory ? 'rooms' : section)}>New {inventory ? 'room' : section === 'room-types' ? 'room type' : section === 'bed-types' ? 'bed type' : section === 'amenities' ? 'amenity' : 'feature'}</Button>{inventory && <Button onClick={() => edit('bulk')}>Bulk create</Button>}</>}</Space></div>
        {holds && <p className='mb-4 text-sm text-slate-500'>Create holds from the Rooms list. Holds stay active until released, then rooms return to Vacant Dirty.</p>}
        {section === 'board' ? <Spin spinning={loading}>{!rows.length ? <Empty description='No rooms match your filters' /> : Array.from(new Set(rows.map(r => r.floorId))).map(floorId => <section key={floorId} className='mb-6'><h3 className='mb-3 font-semibold'>{rows.find(r => r.floorId === floorId)?.building.name} / {rows.find(r => r.floorId === floorId)?.floor.name}</h3><div className='grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-5'>{rows.filter(r => r.floorId === floorId).map(r => <button key={r.id} onClick={() => view(r)} className='rounded-xl border border-slate-200 p-4 text-left hover:border-blue-500 focus-visible:outline-blue-500'><BedDouble size={20} className='mb-3 text-blue-600' /><div className='mb-1 text-xl font-semibold'>{r.roomNumber}</div><p className='mb-3 text-xs text-slate-500'>{r.roomType.name}</p><Tag color={tint(r.operationalStatus)}>{label(r.operationalStatus)}</Tag>{r.sellabilityStatus !== 'SELLABLE' && <Tag color={tint(r.sellabilityStatus)}>{label(r.sellabilityStatus)}</Tag>}</button>)}</div></section>)}</Spin> : <Table rowKey='id' dataSource={rows} loading={loading} columns={inventory ? roomColumns : holds ? holdColumns : catalogColumns} scroll={{ x: 1000 }} pagination={{ pageSize: 15, showSizeChanger: true }} />}
      </Card></>}
    </>}
    <Drawer width={760} title={(editor?.record ? 'Edit ' : 'Create ') + (editor?.kind === 'bulk' ? 'rooms in bulk' : label(editor?.kind.replace(/-/g, '_') || ''))} open={!!editor} onClose={() => !busy && setEditor(null)} footer={<Space><Button onClick={() => setEditor(null)} disabled={busy}>Cancel</Button><Button type='primary' loading={busy} onClick={() => form.submit()}>Save</Button></Space>}>
      {editor && <Form form={form} layout='vertical' onFinish={save}><RoomFields kind={editor.kind} options={options} editing={!!editor.record} /></Form>}
    </Drawer>
    <Drawer width={720} title={'Room ' + (detail?.roomNumber || '')} open={!!detail} onClose={() => { selection.current++; setDetail(null); }}>
      {detail && <><Space wrap className='mb-5'><Tag color={tint(detail.operationalStatus)}>{label(detail.operationalStatus)}</Tag><Tag color={tint(detail.sellabilityStatus)}>{label(detail.sellabilityStatus)}</Tag></Space><Descriptions bordered size='small' column={1} items={[
        { key: 'type', label: 'Room type', children: detail.roomType.name }, { key: 'location', label: 'Location', children: `${detail.branch.name} / ${detail.building.name} / ${detail.floor.name}` },
        { key: 'capacity', label: 'Capacity', children: `${detail.capacity.maxOccupancy} total; up to ${detail.capacity.maxAdults} adults, ${detail.capacity.maxChildren} children` },
        { key: 'bed', label: 'Beds', children: `${detail.roomType.numberOfBeds} ? ${detail.roomType.bedType?.name || 'Unspecified'}` },
        { key: 'smoking', label: 'Smoking / accessibility', children: `${label(detail.smokingType)} / ${detail.isAccessible ? 'Accessible' : 'Standard'}` },
        { key: 'amenities', label: 'Amenities', children: detail.roomType.amenities.map((a: Row) => a.name).join(', ') || 'None' }, { key: 'features', label: 'Features', children: detail.features.map((f: Row) => f.name).join(', ') || 'None' },
        { key: 'holds', label: 'Unreleased holds', children: detail.holds.map((h: Row) => `${h.kind}: ${h.reason} (${stamp(h.startAt)})`).join('; ') || 'None' },
      ]} /><div className='my-5'>{roomActions(detail)}</div>
      <Tabs items={[...(can('ROOM.STATUS.VIEW', detail.branchId) ? [{ key: 'history', label: 'Status history', children: history.length ? <Timeline items={history.map(h => ({ children: <><b>{label(h.previousStatus || '')} ? {label(h.newStatus)}</b><p>{h.reason}</p><small>{stamp(h.changedAt)} ? {h.sourceModule} ? {h.changedBy}</small></> }))} /> : <Empty description='No status changes yet' /> }] : []), ...(can('ROOM.NOTE.VIEW', detail.branchId) ? [{ key: 'notes', label: 'Internal notes', children: notes.length ? notes.map(n => <Card key={n.id} size='small' className='mb-3'><Tag>{n.noteType}</Tag><p className='my-2 whitespace-pre-wrap'>{n.text}</p><small className='text-slate-400'>{stamp(n.createdAt)} ? {n.createdBy}</small></Card>) : <Empty description='No notes yet' /> }] : [])]} /></>}
    </Drawer>
    <Modal title={action?.kind === 'status' ? 'Change room condition' : action?.kind === 'note' ? 'Add internal note' : action?.kind === 'edit-hold' ? 'Edit out-of-order hold' : action?.kind.startsWith('release:') ? 'Release room hold' : 'Create room hold'} open={!!action} onCancel={() => !busy && setAction(null)} onOk={() => actionForm.submit()} confirmLoading={busy}>
      <Form form={actionForm} layout='vertical' onFinish={perform} className='pt-4'>
        {action?.kind === 'status' ? <><p className='mb-4 text-slate-500'>Current: {label(action.record.operationalStatus)}</p><Form.Item name='status' label='New condition' rules={[{ required: true }]}><Select options={statuses.filter(v => v !== action.record.operationalStatus).map(v => ({ value: v, label: label(v) }))} /></Form.Item><Form.Item name='reason' label='Reason' rules={[{ required: true }]}><Input.TextArea maxLength={2000} /></Form.Item>{can('ROOM.STATUS.OVERRIDE', action.record.branchId) && <Form.Item name='override' valuePropName='checked'><Checkbox>Administrative override (audited)</Checkbox></Form.Item>}</> : action?.kind === 'note' ? <><Form.Item name='noteType' label='Note type' initialValue='GENERAL'><Select options={['GENERAL', 'MAINTENANCE', 'ASSIGNMENT'].map(v => ({ value: v, label: label(v) }))} /></Form.Item><Form.Item name='text' label='Internal note' rules={[{ required: true }]}><Input.TextArea rows={4} maxLength={2000} /></Form.Item></> : action?.kind.startsWith('release:') ? <><Alert type='info' message='The room will return to Vacant Dirty and require cleaning.' className='mb-4' /><Form.Item name='releaseNotes' label='Release notes' rules={[{ required: true }]}><Input.TextArea maxLength={2000} /></Form.Item></> : <>{action?.kind !== 'edit-hold' && <Form.Item name='startAt' label='Start (local time)' rules={[{ required: true }]}><Input type='datetime-local' /></Form.Item>}<Form.Item name='expectedEndAt' label='Expected end (local time)'><Input type='datetime-local' /></Form.Item><Form.Item name='reason' label='Reason' rules={[{ required: true }]}><Input.TextArea maxLength={2000} /></Form.Item>{action?.kind !== 'edit-hold' && <Form.Item name='reasonCode' label='Reason code'><Input /></Form.Item>}<Form.Item name='maintenanceReference' label='Maintenance reference'><Input /></Form.Item><Form.Item name='description' label='Description'><Input.TextArea maxLength={2000} /></Form.Item></>}
      </Form>
    </Modal>
  </PortalShell>;
}
