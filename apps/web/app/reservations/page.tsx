"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, App, Button, Card, DatePicker, Descriptions, Drawer, Empty, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Statistic, Table, Tag, Tabs } from "antd";
import { CalendarDays, Plus, RefreshCw, Search } from "lucide-react";
import dayjs from "dayjs";
import { PortalShell } from "@/components/portal-shell";
import { useAuth } from "@/components/auth-provider";

type Row = Record<string, any>;
const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api") + "/v1/reservations";
const label = (v: any) => String(v ?? "—").replaceAll("_", " ");
const money = (v: any, currency = "") => `${currency} ${Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();
const date = (v: any) => v ? new Date(v).toLocaleString() : "—";
const overnight = (stayType: string) => stayType === "OVERNIGHT";

export default function ReservationsPage() {
  const { token } = useAuth();
  const { message, modal } = App.useApp();
  const [properties, setProperties] = useState<Row[]>([]), [propertyId, setPropertyId] = useState(""), [branchId, setBranchId] = useState("");
  const [options, setOptions] = useState<Row>({}), [rows, setRows] = useState<Row[]>([]), [total, setTotal] = useState(0), [filters, setFilters] = useState<Row>({});
  const [loading, setLoading] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState("");
  const [availability, setAvailability] = useState<Row | null>(null), [searchForm] = Form.useForm(), [bookingForm] = Form.useForm(), [guaranteeForm] = Form.useForm(), [requestForm] = Form.useForm();
  const [createOpen, setCreateOpen] = useState(false), [detail, setDetail] = useState<Row | null>(null), [detailOpen, setDetailOpen] = useState(false), [history, setHistory] = useState<Row[]>([]), [roomChoices, setRoomChoices] = useState<Row[]>([]), [assignOpen, setAssignOpen] = useState(false), [assignForm] = Form.useForm();

  const request = useCallback(async (path = "", method = "GET", body?: Row, extra: Row = {}) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries({ propertyId, branchId, ...extra })) if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
    const response = await fetch(API + path + "?" + query, { method, headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const data = await response.json();
    if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(", ") : data.message || "Request failed");
    return data;
  }, [token, propertyId, branchId]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    fetch(API + "/properties", { headers: { Authorization: "Bearer " + token } }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message); return d; })
      .then(d => { if (active) { setProperties(d); setPropertyId(d[0]?.id || ""); setBranchId(d[0]?.branches?.[0]?.id || ""); } })
      .catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [token]);
  const load = useCallback(async () => {
    if (!propertyId || !token) return;
    setLoading(true); setError("");
    try {
      const [list, settings] = await Promise.all([request("", "GET", undefined, filters), request("/options")]);
      setRows(list.items || []); setTotal(list.total || 0); setOptions(settings);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [request, propertyId, token, filters]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setAvailability(null); setDetail(null); setOptions({}); setRows([]); setTotal(0); }, [propertyId, branchId]);
  const can = (p: string) => (options.permissions || []).includes(p);
  const stayType = Form.useWatch("stayType", searchForm) || "OVERNIGHT";
  const chosenRoomType = Form.useWatch("roomTypeId", bookingForm);

  async function search(values: Row) {
    setSaving(true);
    try {
      const body: Row = { ...values, propertyId, branchId, adults: values.adults || 1, children: values.children || 0, infants: values.infants || 0, rooms: 1 };
      if (overnight(values.stayType)) { body.arrivalDate = values.dates[0].format("YYYY-MM-DD"); body.departureDate = values.dates[1].format("YYYY-MM-DD"); }
      else { body.arrivalDateTime = values.start.format("YYYY-MM-DDTHH:mm"); body.departureDateTime = values.end.format("YYYY-MM-DDTHH:mm"); }
      delete body.dates; delete body.start; delete body.end;
      const found = await request("/availability/search", "POST", body);
      setAvailability({ ...found, search: body });
      if (!found.roomTypes?.length) message.info("No rooms and rates are available for those dates.");
    } catch (e: any) { message.error(e.message); }
    finally { setSaving(false); }
  }
  function startBooking(rt: Row, rate: Row) {
    bookingForm.resetFields(); bookingForm.setFieldsValue({ roomTypeId: rt.roomType.id, ratePlanId: rate.ratePlan.id, adults: availability!.search.adults, children: availability!.search.children, infants: availability!.search.infants, stayType: availability!.stayType, bookingSource: "Hotel Website", reservationType: "Individual", marketSegment: "Leisure" });
    setCreateOpen(true);
  }
  async function create(values: Row) {
    if (!availability) return;
    const body: Row = { ...availability.search, ...values, roomCount: 1 };
    setSaving(true);
    try {
      const saved = await request("", "POST", body);
      setCreateOpen(false); setAvailability(null); message.success(`Reservation ${saved.reservationNumber} created`); await load(); await open(saved.id);
    } catch (e: any) { message.error(e.message); }
    finally { setSaving(false); }
  }
  async function open(id: string) {
    try { const item = await request("/" + id); setDetail(item); setDetailOpen(true); setHistory([]); guaranteeForm.setFieldsValue({ requiredAmount: Number(item.depositRequiredAmount), depositStatus: item.depositStatus, guaranteeStatus: item.guaranteeStatus, guaranteeMethod: item.guaranteeMethod, reference: item.depositReference }); if (can("ROOM.ASSIGN")) { try { setRoomChoices(await request("/" + id + "/rooms")); } catch { setRoomChoices([]); } } }
    catch (e: any) { message.error(e.message); }
  }
  async function addChild(path: string, body: Row) {
    if (!detail) return; setSaving(true);
    try { await request("/" + detail.id + path, "POST", body); setDetail(await request("/" + detail.id)); message.success("Saved"); }
    catch (e: any) { message.error(e.message); } finally { setSaving(false); }
  }
  async function action(path: string, body?: Row, method = "POST") {
    if (!detail) return;
    setSaving(true);
    try { const updated = await request("/" + detail.id + path, method, { ...body, version: detail.version }); setDetail(updated); message.success("Reservation updated"); await load(); }
    catch (e: any) { message.error(e.message); }
    finally { setSaving(false); }
  }
  function confirmCancel() {
    let reason = "";
    modal.confirm({ title: "Cancel reservation", content: <Input.TextArea autoSize placeholder="Cancellation reason" onChange={e => reason = e.target.value}/>, okText: "Cancel reservation", okButtonProps: { danger: true }, onOk: () => action("/cancel", { reason }) });
  }
  const columns: any[] = [
    { title: "Reservation", render: (_: any, r: Row) => <button className="text-left" onClick={() => void open(r.id)}><span className="block font-semibold text-blue-700">{r.reservationNumber}</span><span className="text-xs text-slate-400">{label(r.stayType)}</span></button> },
    { title: "Guest", dataIndex: "guestNameSnapshot", render: (v: string, r: Row) => <><div className="font-medium">{v}</div><div className="text-xs text-slate-400">{r.contactPhoneSnapshot || r.contactEmailSnapshot || ""}</div></> },
    { title: "Stay", render: (_: any, r: Row) => <><div>{date(r.arrivalDateTime)}</div><div className="text-xs text-slate-400">to {date(r.departureDateTime)}</div></> },
    { title: "Room type", render: (_: any, r: Row) => r.roomType?.name || "—" },
    { title: "Total", render: (_: any, r: Row) => money(r.total, r.currencyCode) },
    { title: "Status", dataIndex: "status", render: (v: string) => <Tag color={v === "CONFIRMED" ? "green" : v === "CANCELLED" ? "default" : v === "TENTATIVE" ? "gold" : "blue"}>{label(v)}</Tag> },
  ];
  return <PortalShell pageTitle="Reservation management">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-sm font-medium text-blue-600">Hotel operations</p><h1 className="text-3xl font-bold tracking-tight">Reservation management</h1><p className="mt-2 text-slate-500">Check availability, capture a price snapshot, and manage booking status.</p></div>
      <Space wrap><Select aria-label="Property" placeholder="Select property" value={propertyId || undefined} style={{ minWidth: 220 }} options={properties.map(p => ({ value: p.id, label: p.name }))} onChange={v => { setPropertyId(v); setBranchId(properties.find(p => p.id === v)?.branches?.[0]?.id || ""); }}/><Select aria-label="Branch" placeholder="Select branch" value={branchId || undefined} style={{ minWidth: 180 }} options={(properties.find(p => p.id === propertyId)?.branches || []).map((b: Row) => ({ value: b.id, label: b.name }))} onChange={setBranchId}/><Button icon={<RefreshCw size={15}/>} onClick={() => void load()}>Refresh</Button></Space></div>
    {error && <Alert className="mb-5" showIcon type="error" message={error}/>}
    {!properties.length ? <Card><Empty description="No accessible properties. Assign a role with RESERVATION.BOOKING.VIEW in Security."/></Card> : <>
      <div className="mb-5 grid gap-4 sm:grid-cols-3"><Card><Statistic title="Reservations" value={total} prefix={<CalendarDays size={20}/>} /></Card><Card><div className="text-sm text-slate-500">Booking scope</div><div className="mt-2 text-lg font-semibold">{options.property?.name || "Selected property"}</div><p className="mt-2 text-xs text-slate-400">Times are evaluated in {options.property?.timeZone || "the property time zone"}.</p></Card><Card><div className="text-sm text-slate-500">Price capture</div><div className="mt-2 text-lg font-semibold">Quoted at booking</div><p className="mt-2 text-xs text-slate-400">Changes require an explicit reprice action.</p></Card></div>
      <Card className="rounded-2xl shadow-sm"><div className="mb-5 flex flex-wrap justify-between gap-3"><Space wrap><Input.Search aria-label="Search reservations" placeholder="Booking number, guest or reference" allowClear style={{ width: 320, maxWidth: "100%" }} onSearch={v => setFilters(x => ({ ...x, q: v }))}/><Select aria-label="Status" placeholder="All statuses" allowClear style={{ width: 170 }} options={["TENTATIVE", "PENDING_GUARANTEE", "CONFIRMED", "CANCELLED", "NO_SHOW", "EXPIRED"].map(x => ({ value: x, label: label(x) }))} onChange={v => setFilters(x => ({ ...x, status: v }))}/><Select aria-label="Stay type" placeholder="All stay types" allowClear style={{ width: 160 }} options={["OVERNIGHT", "HOURLY", "DAY_USE"].map(x => ({ value: x, label: label(x) }))} onChange={v => setFilters(x => ({ ...x, stayType: v }))}/></Space><Button type="primary" icon={<Search size={15}/>} onClick={() => { document.getElementById("availability-search")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>New reservation</Button></div>
        <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} pagination={{ pageSize: 20, total, showSizeChanger: false }}/></Card>
      <Card id="availability-search" className="mt-5" title="Find available rooms" extra={<span className="text-xs text-slate-400">One room per reservation in this release</span>}>
        <Form form={searchForm} layout="vertical" initialValues={{ stayType: "OVERNIGHT", adults: 1, children: 0, infants: 0 }} onFinish={search}>
          <div className="grid gap-3 md:grid-cols-6"><Form.Item name="stayType" label="Stay type"><Select options={["OVERNIGHT", "HOURLY", "DAY_USE"].map(x => ({ value: x, label: label(x) }))}/></Form.Item>
            {overnight(stayType) ? <Form.Item className="md:col-span-2" name="dates" label="Arrival and departure" rules={[{ required: true }]}><DatePicker.RangePicker className="w-full" disabledDate={d => d.isBefore(dayjs().startOf("day"))}/></Form.Item> : <><Form.Item name="start" label="Arrival" rules={[{ required: true }]}><DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full"/></Form.Item><Form.Item name="end" label="Departure" rules={[{ required: true }]}><DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full"/></Form.Item></>}
            <Form.Item name="adults" label="Adults"><InputNumber min={1} max={20} className="w-full"/></Form.Item><Form.Item name="children" label="Children"><InputNumber min={0} max={20} className="w-full"/></Form.Item><Form.Item name="infants" label="Infants"><InputNumber min={0} max={20} className="w-full"/></Form.Item></div>
          <Button type="primary" htmlType="submit" loading={saving}>Search availability</Button>
        </Form>
        {availability && <div className="mt-6 space-y-4">{availability.roomTypes.map((entry: Row) => <Card key={entry.roomType.id} size="small" title={`${entry.roomType.name} · ${entry.inventory.availableRooms} available`}>
          <div className="grid gap-3 md:grid-cols-2">{entry.rates.map((rate: Row) => <Card key={rate.ratePlan.id} size="small" className="bg-slate-50" title={rate.ratePlan.name} extra={<strong>{money(rate.stayTotal, rate.ratePlan.currencyCode)}</strong>}>
            <p className="mb-3 text-xs text-slate-500">{rate.ratePlan.mealPlan || "Rate plan"} · {rate.nightlyRates?.length || 0} charge line(s)</p><Button type="primary" size="small" disabled={!can("BOOKING.CREATE")} onClick={() => startBooking(entry, rate)}>Select rate</Button>
          </Card>)}</div>{!entry.rates.length && <Alert type="warning" showIcon message="No visible rate plan is available for your permissions."/>}</Card>)}</div>}
      </Card>
    </>}
    <Drawer title="Create reservation" open={createOpen} width={560} onClose={() => setCreateOpen(false)} extra={<Button type="primary" loading={saving} onClick={() => bookingForm.submit()}>Create tentative</Button>}>
      {availability && <Alert className="mb-4" type="info" showIcon message={`Price snapshot: ${options.ratePlans?.find((p: Row) => p.id === bookingForm.getFieldValue("ratePlanId"))?.currencyCode || ""} · Room availability will be checked again before saving.`}/>}
      <Form form={bookingForm} layout="vertical" onFinish={create} initialValues={{ adults: 1, children: 0, infants: 0 }}>
        <Form.Item name="primaryGuestId" label="Primary guest" rules={[{ required: true }]}><Select showSearch optionFilterProp="label" options={(options.guests || []).map((g: Row) => ({ value: g.id, label: `${g.fullName} · ${g.guestNumber}${g.phone ? " · " + g.phone : ""}` }))}/></Form.Item>
        <Form.Item name="roomTypeId" label="Room type" rules={[{ required: true }]}><Select disabled options={(availability?.roomTypes || []).map((x: Row) => ({ value: x.roomType.id, label: x.roomType.name }))}/></Form.Item>
        <Form.Item name="ratePlanId" label="Rate plan" rules={[{ required: true }]}><Select disabled options={(options.ratePlans || []).filter((p: Row) => p.roomRates?.some((x: Row) => x.roomTypeId === chosenRoomType)).map((p: Row) => ({ value: p.id, label: p.name }))}/></Form.Item>
        <div className="grid grid-cols-3 gap-3"><Form.Item name="adults" label="Adults"><InputNumber min={1} max={20} className="w-full"/></Form.Item><Form.Item name="children" label="Children"><InputNumber min={0} max={20} className="w-full"/></Form.Item><Form.Item name="infants" label="Infants"><InputNumber min={0} max={20} className="w-full"/></Form.Item></div>
        <Form.Item name="bookingSource" label="Booking source" rules={[{ required: true }]}><Select options={(options.bookingSources || []).map((x: string) => ({ value: x, label: label(x) }))}/></Form.Item>
        <Form.Item name="marketSegment" label="Market segment"><Select allowClear options={(options.marketSegments || []).map((x: string) => ({ value: x, label: label(x) }))}/></Form.Item>
        <Form.Item name="reservationType" label="Reservation type"><Select options={(options.reservationTypes || []).map((x: string) => ({ value: x, label: label(x) }))}/></Form.Item>
        <Form.Item name="externalReference" label="External reference"><Input maxLength={100}/></Form.Item><Form.Item name="specialRequests" label="Special requests"><Input.TextArea maxLength={2000} rows={3}/></Form.Item>
        <Form.Item name="notes" label="Internal note"><Input.TextArea maxLength={4000} rows={3}/></Form.Item>
      </Form>
    </Drawer>
    <Drawer title={detail?.reservationNumber || "Reservation"} open={detailOpen} width={720} onClose={() => setDetailOpen(false)} extra={<Space wrap>
      {detail?.status === "TENTATIVE" && can("BOOKING.CONFIRM") && <Button type="primary" loading={saving} onClick={() => void action("/confirm")}>Confirm</Button>}
      {detail && ["TENTATIVE", "PENDING_GUARANTEE", "CONFIRMED"].includes(detail.status) && can("BOOKING.CANCEL") && <Button danger loading={saving} onClick={confirmCancel}>Cancel</Button>}
      {detail?.status === "CONFIRMED" && can("BOOKING.NO_SHOW") && <Button loading={saving} onClick={() => void action("/no-show")}>Mark no-show</Button>}
      {detail && can("RATE.REPRICE") && <Button loading={saving} onClick={() => void action("/reprice")}>Reprice</Button>}
      {detail && can("ROOM.ASSIGN") && <Button onClick={() => { assignForm.setFieldsValue({ roomId: detail.assignedRoomId }); setAssignOpen(true); }}>Assign room</Button>}
    </Space>}>
      {detail && <><Descriptions bordered size="small" column={2} items={[{ key: "guest", label: "Guest", children: detail.guestNameSnapshot }, { key: "status", label: "Status", children: <Tag>{label(detail.status)}</Tag> }, { key: "arrival", label: "Arrival", children: date(detail.arrivalDateTime) }, { key: "departure", label: "Departure", children: date(detail.departureDateTime) }, { key: "room", label: "Room type / assigned", children: `${detail.roomType?.name || "—"} / ${detail.assignedRoom?.roomNumber || "Unassigned"}` }, { key: "rate", label: "Rate plan", children: detail.ratePlan?.name || "—" }, { key: "total", label: "Total", children: money(detail.total, detail.currencyCode) }, { key: "deposit", label: "Deposit", children: `${label(detail.depositStatus)} · ${money(detail.depositRequiredAmount, detail.currencyCode)}` }, { key: "source", label: "Source", children: label(detail.bookingSource) }, { key: "request", label: "Special requests", children: detail.specialRequestSummary || "—" }]}/>
        <Tabs className="mt-5" items={[
          { key: "charges", label: "Rate snapshot", children: <Table rowKey="id" size="small" pagination={false} dataSource={detail.rateDetails || []} columns={[{ title: "Date", dataIndex: "stayDate", render: date }, { title: "Base", dataIndex: "baseRate", render: v => money(v, detail.currencyCode) }, { title: "Tax / service", render: (_: any, r: Row) => money(Number(r.taxAmount) + Number(r.serviceCharge), detail.currencyCode) }, { title: "Total", dataIndex: "totalAmount", render: v => money(v, detail.currencyCode) }]}/> },
          { key: "guarantee", label: "Guarantee", children: <Form form={guaranteeForm} layout="inline" initialValues={{ requiredAmount: Number(detail.depositRequiredAmount), depositStatus: detail.depositStatus, guaranteeStatus: detail.guaranteeStatus }} onFinish={v => void action("/guarantee", { ...v, reference: v.depositReference }, "PUT")}><Form.Item name="requiredAmount" label="Required"><InputNumber min={0}/></Form.Item><Form.Item name="depositStatus" label="Deposit"><Select style={{ width: 170 }} options={["NOT_REQUIRED", "PENDING", "PARTIALLY_PAID", "PAID", "WAIVED", "EXPIRED"].map(x => ({ value: x, label: label(x) }))}/></Form.Item><Form.Item name="guaranteeStatus" label="Guarantee"><Select style={{ width: 150 }} options={["NOT_REQUIRED", "PENDING", "GUARANTEED", "EXPIRED"].map(x => ({ value: x, label: label(x) }))}/></Form.Item><Form.Item name="guaranteeMethod" label="Method"><Input/></Form.Item><Form.Item name="reference" label="Reference"><Input/></Form.Item><Button htmlType="submit" loading={saving}>Save</Button></Form> },
          { key: "requests", label: "Requests", children: <><Form form={requestForm} layout="inline" onFinish={async v => { await addChild("/requests", v); requestForm.resetFields(); }}><Form.Item name="requestType" rules={[{ required: true }]}><Input placeholder="Type"/></Form.Item><Form.Item name="requestText" rules={[{ required: true }]}><Input placeholder="Request"/></Form.Item><Button htmlType="submit">Add request</Button></Form><Table className="mt-4" rowKey="id" size="small" pagination={false} dataSource={detail.requests || []} columns={[{ title: "Type", dataIndex: "requestType" }, { title: "Request", dataIndex: "requestText" }, { title: "Status", dataIndex: "status" }]}/></> },
          { key: "notes", label: "Notes", children: <><Form layout="inline" onFinish={async v => { await addChild("/notes", v); }}><Form.Item name="text" rules={[{ required: true }]}><Input placeholder="Reservation note" maxLength={4000}/></Form.Item><Form.Item name="visibilityScope" initialValue="RESERVATION_TEAM"><Select style={{ width: 190 }} options={["RESERVATION_TEAM", "FRONT_DESK", "MANAGEMENT", "HOUSEKEEPING", "ALL_OPERATIONAL"].map(x => ({ value: x, label: label(x) }))}/></Form.Item><Button htmlType="submit">Add note</Button></Form><div className="mt-4 space-y-2">{(detail.notes || []).map((n: Row) => <Card key={n.id} size="small"><p className="whitespace-pre-wrap">{n.text}</p><p className="mt-2 text-xs text-slate-400">{label(n.visibilityScope)} · {date(n.createdAt)}</p></Card>)}</div></> },
          { key: "history", label: "History", children: <><Button onClick={async () => { const h = await request("/" + detail.id + "/history"); setHistory(h); }}>Load history</Button><Table className="mt-3" rowKey="id" size="small" pagination={{ pageSize: 8 }} dataSource={history} columns={[{ title: "When", dataIndex: "changedAt", render: date }, { title: "Action", dataIndex: "action" }, { title: "By", dataIndex: "changedBy" }]}/></> },
        ]}/></>}
    </Drawer>
  </PortalShell>;
}
