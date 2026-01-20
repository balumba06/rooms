import { useEffect, useState } from 'react'
import {
  Container, Box, TextField, Button, Table, TableHead, TableRow, 
  TableCell, TableBody, IconButton, Typography, MenuItem, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { Delete, Add, Edit } from "@mui/icons-material";
import { Header } from './components/Header';

interface Device { id: string; name: string; }
interface Auditorium { id: string; name: string; capacity: number; }
interface Booking {
  id: string;
  deviceId: string;
  auditoriumId: string;
  startTime: string;
  endTime: string;
  device?: Device;
  auditorium?: Auditorium;
}

function App() {
  const [active, setActive] = useState("catalog")
  const [devices, setDevices] = useState<Device[]>([])
  const [auditoriums, setAuditoriums] = useState<Auditorium[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])

  const [bookingForm, setBookingForm] = useState({ devId: "", audId: "", end: "" })
  const [newDevName, setNewDevName] = useState("")
  const [newAud, setNewAud] = useState({ name: "", cap: 1 })

  const [editDeviceOpen, setEditDeviceOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [editAuditoriumOpen, setEditAuditoriumOpen] = useState(false)
  const [editingAuditorium, setEditingAuditorium] = useState<Auditorium | null>(null)
  const [editBookingOpen, setEditBookingOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  let API: string  = "http://localhost/api"
  if(import.meta.env.PROD)
  {

    API = "https://rooms-a.onrender.com/api"
  }

  const loadData = async () => {
    try {
      const [d, a, b] = await Promise.all([
        fetch(`${API}/devices`).then(r => r.json()),
        fetch(`${API}/auditoriums`).then(r => r.json()),
        fetch(`${API}/bookings`).then(r => r.json())
      ])
      setDevices(d); setAuditoriums(a); setBookings(b)
    } catch (e) { console.error(e) }
  }

  useEffect(() => { loadData() }, [])

  const handleBooking = async () => {
    try {
      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          deviceId: bookingForm.devId, 
          auditoriumId: bookingForm.audId, 
          endTime: new Date(bookingForm.end).toISOString() 
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Ошибка")
      setBookings([data, ...bookings])
      setBookingForm({ devId: "", audId: "", end: "" })
    } catch (e: any) { alert(e.message) }
  }

  const addDevice = async () => {
    await fetch(`${API}/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDevName })
    })
    setNewDevName(""); loadData()
  }

  const addAuditorium = async () => {
    await fetch(`${API}/auditoriums`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newAud.name, capacity: Number(newAud.cap) })
    })
    setNewAud({ name: "", cap: 1 }); loadData()
  }

  const deleteItem = async (path: string, id: string) => {
    await fetch(`${API}/${path}/${id}`, { method: "DELETE" })
    loadData()
  }

  const getLocalDatetime = (iso: string) => {
    const date = new Date(iso)
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  const saveDevice = async () => {
    if (!editingDevice) return
    await fetch(`${API}/devices/${editingDevice.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingDevice.name })
    })
    setEditDeviceOpen(false); loadData()
  }

  const saveAuditorium = async () => {
    if (!editingAuditorium) return
    await fetch(`${API}/auditoriums/${editingAuditorium.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingAuditorium.name, capacity: editingAuditorium.capacity })
    })
    setEditAuditoriumOpen(false); loadData()
  }

  const saveBooking = async () => {
    if (!editingBooking) return
    await fetch(`${API}/bookings/${editingBooking.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        deviceId: editingBooking.deviceId, 
        auditoriumId: editingBooking.auditoriumId, 
        endTime: editingBooking.endTime 
      })
    })
    setEditBookingOpen(false); loadData()
  }

  return (
    <>
      <Header activeNavId={active} onNavigate={setActive} onBellClick={() => {}} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Бронирование</Typography>
        <Paper sx={{ p: 3, mb: 4, display: 'flex', gap: 2, alignItems: 'center', bgcolor: '#f5f5f5' }}>
          <TextField select label="Устройство" value={bookingForm.devId} onChange={e => setBookingForm({...bookingForm, devId: e.target.value})} sx={{ flex: 1 }}>
            {devices.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
          </TextField>
          <TextField select label="Аудитория" value={bookingForm.audId} onChange={e => setBookingForm({...bookingForm, audId: e.target.value})} sx={{ flex: 1 }}>
            {auditoriums.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
          </TextField>
          <TextField type="datetime-local" label="До" InputLabelProps={{ shrink: true }} value={bookingForm.end} onChange={e => setBookingForm({...bookingForm, end: e.target.value})} sx={{ flex: 1 }} />
          <Button variant="contained" onClick={handleBooking} size="large">Занять</Button>
        </Paper>

        <Typography variant="h6" gutterBottom>Устройства</Typography>
        <Table sx={{ mb: 4 }}>
          <TableHead><TableRow><TableCell>Название</TableCell><TableCell align="right">Действия</TableCell></TableRow></TableHead>
          <TableBody>
            {devices.map(d => (
              <TableRow key={d.id}>
                <TableCell>{d.name}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => { setEditingDevice(d); setEditDeviceOpen(true); }}><Edit /></IconButton>
                  <IconButton onClick={() => deleteItem('devices', d.id)} color="error"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Typography variant="h6" gutterBottom>Аудитории</Typography>
        <Table sx={{ mb: 4 }}>
          <TableHead><TableRow><TableCell>Название</TableCell><TableCell>Мест</TableCell><TableCell align="right">Действия</TableCell></TableRow></TableHead>
          <TableBody>
            {auditoriums.map(a => (
              <TableRow key={a.id}>
                <TableCell>{a.name}</TableCell><TableCell>{a.capacity}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => { setEditingAuditorium(a); setEditAuditoriumOpen(true); }}><Edit /></IconButton>
                  <IconButton onClick={() => deleteItem('auditoriums', a.id)} color="error"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle1" gutterBottom>Добавить устройство</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size="small" fullWidth value={newDevName} onChange={e => setNewDevName(e.target.value)} />
              <Button variant="outlined" onClick={addDevice}><Add /></Button>
            </Box>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle1" gutterBottom>Добавить аудиторию</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size="small" placeholder="Имя" value={newAud.name} onChange={e => setNewAud({...newAud, name: e.target.value})} />
              <TextField size="small" type="number" value={newAud.cap} onChange={e => setNewAud({...newAud, cap: Number(e.target.value)})} sx={{ width: 80 }} />
              <Button variant="outlined" onClick={addAuditorium}><Add /></Button>
            </Box>
          </Paper>
        </Box>

        <Typography variant="h6" gutterBottom>Журнал бронирований</Typography>
        <Table>
          <TableHead><TableRow><TableCell>Устройство</TableCell><TableCell>Аудитория</TableCell><TableCell>Начало</TableCell><TableCell>Окончание</TableCell><TableCell align="right">Действия</TableCell></TableRow></TableHead>
          <TableBody>
            {bookings.map(b => (
              <TableRow key={b.id}>
                <TableCell>{b.device?.name}</TableCell>
                <TableCell>{b.auditorium?.name}</TableCell>
                <TableCell>{new Date(b.startTime).toLocaleString()}</TableCell>
                <TableCell>{new Date(b.endTime).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => { setEditingBooking(b); setEditBookingOpen(true); }}><Edit /></IconButton>
                  <IconButton onClick={() => deleteItem('bookings', b.id)} color="error"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>

      {/* Диалоги редактирования */}
      <Dialog open={editDeviceOpen} onClose={() => setEditDeviceOpen(false)}>
        <DialogTitle>Редактировать устройство</DialogTitle>
        <DialogContent><TextField fullWidth sx={{mt:1}} value={editingDevice?.name || ''} onChange={e => setEditingDevice({...editingDevice!, name: e.target.value})} /></DialogContent>
        <DialogActions><Button onClick={() => setEditDeviceOpen(false)}>Отмена</Button><Button onClick={saveDevice} variant="contained">Ок</Button></DialogActions>
      </Dialog>

      <Dialog open={editAuditoriumOpen} onClose={() => setEditAuditoriumOpen(false)}>
        <DialogTitle>Редактировать аудиторию</DialogTitle>
        <DialogContent sx={{display:'flex', flexDirection:'column', gap:2, mt:1}}>
          <TextField label="Имя" value={editingAuditorium?.name || ''} onChange={e => setEditingAuditorium({...editingAuditorium!, name: e.target.value})} />
          <TextField label="Мест" type="number" value={editingAuditorium?.capacity || 1} onChange={e => setEditingAuditorium({...editingAuditorium!, capacity: Number(e.target.value)})} />
        </DialogContent>
        <DialogActions><Button onClick={() => setEditAuditoriumOpen(false)}>Отмена</Button><Button onClick={saveAuditorium} variant="contained">Ок</Button></DialogActions>
      </Dialog>

      <Dialog open={editBookingOpen} onClose={() => setEditBookingOpen(false)}>
        <DialogTitle>Редактировать бронирование</DialogTitle>
        <DialogContent sx={{display:'flex', flexDirection:'column', gap:2, mt:1}}>
          <TextField select label="Устройство" value={editingBooking?.deviceId || ''} onChange={e => setEditingBooking({...editingBooking!, deviceId: e.target.value})}>
            {devices.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
          </TextField>
          <TextField select label="Аудитория" value={editingBooking?.auditoriumId || ''} onChange={e => setEditingBooking({...editingBooking!, auditoriumId: e.target.value})}>
            {auditoriums.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
          </TextField>
          <TextField type="datetime-local" label="Конец" value={editingBooking ? getLocalDatetime(editingBooking.endTime) : ''} onChange={e => setEditingBooking({...editingBooking!, endTime: new Date(e.target.value).toISOString()})} InputLabelProps={{shrink:true}} />
        </DialogContent>
        <DialogActions><Button onClick={() => setEditBookingOpen(false)}>Отмена</Button><Button onClick={saveBooking} variant="contained">Ок</Button></DialogActions>
      </Dialog>
    </>
  )
}

export default App;