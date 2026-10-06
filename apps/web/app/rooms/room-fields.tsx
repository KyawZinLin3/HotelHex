"use client";
import { Form, Input, InputNumber, Select, Switch } from 'antd';

export type RecordData = Record<string, any>;
export const label = (value: string = '') => value.toLowerCase().split('_').map(word => word[0]?.toUpperCase() + word.slice(1)).join(' ');
export const statuses = ['VACANT_CLEAN', 'VACANT_DIRTY', 'OCCUPIED_CLEAN', 'OCCUPIED_DIRTY', 'CLEANING', 'INSPECTED'];
export const smoking = ['NON_SMOKING', 'SMOKING', 'NOT_SPECIFIED'];
const required = [{ required: true }];

export function RoomFields({ kind, options, editing }: { kind: string; options: RecordData; editing: boolean }) {
  const form = Form.useFormInstance();
  const branch = Form.useWatch('branchId', form);
  const building = Form.useWatch('buildingId', form);
  const extra = Form.useWatch('extraBedAllowed', form);
  const pick = (name: string, title: string, rows: RecordData[], mandatory = false, multiple = false, onChange?: () => void) => <Form.Item key={name} name={name} label={title} rules={mandatory ? required : []}><Select allowClear={!mandatory} mode={multiple ? 'multiple' : undefined} showSearch optionFilterProp='label' onChange={onChange} options={rows.map(r => ({ value: r.id, label: (r.name || r.code) + (r.isActive === false ? ' (inactive)' : ''), disabled: r.isActive === false || (!!r.status && r.status !== 'ACTIVE') }))} /></Form.Item>;
  const text = (name: string, title: string, mandatory = false) => <Form.Item key={name} name={name} label={title} rules={mandatory ? required : []}><Input maxLength={200} /></Form.Item>;
  const number = (name: string, title: string, min = 0) => <Form.Item key={name} name={name} label={title} rules={required}><InputNumber min={min} max={10000} precision={0} style={{ width: '100%' }} /></Form.Item>;
  const room = kind === 'rooms' || kind === 'bulk';
  return <div className='grid gap-x-5 sm:grid-cols-2'>
    {room ? <>
      <Form.Item name='branchId' label='Branch' rules={required}><Select disabled={editing} options={(options.branches || []).filter((b: RecordData) => b.status === 'ACTIVE').map((b: RecordData) => ({ value: b.id, label: b.name }))} onChange={() => form.setFieldsValue({ buildingId: undefined, floorId: undefined, roomTypeId: undefined })} /></Form.Item>
      {pick('buildingId', 'Building', (options.buildings || []).filter((b: RecordData) => !b.branchId || b.branchId === branch), true, false, () => form.setFieldValue('floorId', undefined))}
      {pick('floorId', 'Floor', (options.floors || []).filter((f: RecordData) => f.buildingId === building), true)}
      {pick('roomTypeId', 'Room type', (options.roomTypes || []).filter((r: RecordData) => !r.branchId || r.branchId === branch), true)}
      {kind === 'bulk' ? <>{text('prefix', 'Number prefix (optional)')}{number('padding', 'Number of digits')}{number('start', 'First room number', 1)}{number('end', 'Last room number', 1)}<p className='sm:col-span-2 text-sm text-slate-500'>Up to 200 rooms. Existing numbers reject the entire batch; no rooms are partially created.</p></> : <>{text('roomNumber', 'Room number', true)}{text('roomName', 'Room name')}{text('internalCode', 'Internal code')}{text('phoneExtension', 'Phone extension')}</>}
      <Form.Item name='smokingType' label='Smoking classification'><Select options={smoking.map(v => ({ value: v, label: label(v) }))} /></Form.Item>
      <Form.Item name='isAccessible' label='Accessible room' valuePropName='checked'><Switch /></Form.Item>
      {text('viewType', 'View')}{text('housekeepingZone', 'Housekeeping zone')}{text('maintenanceZone', 'Maintenance zone')}
      {pick('featureIds', 'Features', options.features || [], false, true)}
      <p className='sm:col-span-2 text-sm text-slate-500'>Capacity and amenities are inherited from the room type. New rooms start Vacant Dirty and need cleaning before use.</p>
    </> : <>
      {text('code', 'Code', true)}{text('name', 'Name', true)}
      <Form.Item name='description' label='Description' className='sm:col-span-2'><Input.TextArea rows={2} maxLength={2000} /></Form.Item>
      {kind === 'bed-types' && number('capacity', 'Bed capacity', 1)}
      {kind === 'amenities' && <Form.Item name='category' label='Category'><Select options={['Bathroom', 'Entertainment', 'Comfort', 'Kitchen', 'Connectivity', 'Safety', 'Accessibility', 'View', 'Other'].map(v => ({ value: v, label: v }))} /></Form.Item>}
      {kind === 'room-types' && <>
        {pick('branchId', 'Branch (optional)', options.branches || [])}{pick('bedTypeId', 'Default bed type', options.bedTypes || [])}
        {number('numberOfBeds', 'Number of beds', 1)}{number('maxOccupancy', 'Maximum occupancy', 1)}{number('maxAdults', 'Maximum adults', 1)}{number('maxChildren', 'Maximum children')}
        {number('baseAdults', 'Base adults')}{number('baseChildren', 'Base children')}
        <Form.Item name='extraBedAllowed' label='Extra beds allowed' valuePropName='checked'><Switch onChange={enabled => { if (!enabled) form.setFieldValue('maxExtraBeds', 0); }} /></Form.Item>
        <Form.Item name='maxExtraBeds' label='Maximum extra beds'><InputNumber min={0} max={20} precision={0} disabled={!extra} /></Form.Item>
        <Form.Item name='smokingPolicy' label='Smoking policy'><Select options={smoking.map(v => ({ value: v, label: label(v) }))} /></Form.Item>
        <Form.Item name='roomSize' label='Room size'><InputNumber min={0.1} max={100000} /></Form.Item>
        <Form.Item name='roomSizeUnit' label='Size unit'><Select options={[{ value: 'SQM', label: 'Square metres' }, { value: 'SQFT', label: 'Square feet' }]} /></Form.Item>
        {number('displayOrder', 'Display order')}{pick('amenityIds', 'Included amenities', options.amenities || [], false, true)}
      </>}
      <Form.Item name='isActive' label='Active' valuePropName='checked'><Switch /></Form.Item>
    </>}
  </div>;
}
