import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  Divider,
  MenuItem,
} from "@mui/material";
import { Delete, Add, Edit, Refresh } from "@mui/icons-material";
import { Header } from "./components/Header";

interface Auditorium {
  id: string;
  name: string;
  capacity: number;
}

interface Booking {
  id: string;
  auditoriumId: string;
  startTime: string;
  endTime: string;
  auditorium?: Auditorium;
}

function App() {
  const [active, setActive] = useState("catalog");

  const [auditoriums, setAuditoriums] = useState<Auditorium[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const [newAud, setNewAud] = useState({ name: "", cap: 1 });

  const [bookingForm, setBookingForm] = useState({
    audId: "",
    end: "",
  });

  const [editAuditoriumOpen, setEditAuditoriumOpen] = useState(false);
  const [editingAuditorium, setEditingAuditorium] =
    useState<Auditorium | null>(null);

  const API = useMemo(() => {
    let base = "http://localhost/api";
    if (import.meta.env.PROD) base = "https://rooms-a.onrender.com/api";
    return base;
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [aRes, bRes] = await Promise.all([
        fetch(`${API}/auditoriums`),
        fetch(`${API}/bookings`),
      ]);

      const aData = await aRes.json();
      const bData = await bRes.json();

      if (!aRes.ok) throw new Error(aData?.detail || "Ошибка загрузки аудиторий");
      if (!bRes.ok) throw new Error(bData?.detail || "Ошибка загрузки бронирований");

      setAuditoriums(Array.isArray(aData) ? aData : []);
      setBookings(Array.isArray(bData) ? bData : []);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const addAuditorium = async () => {
    if (!newAud.name.trim()) return alert("Введите название аудитории");
    if (Number(newAud.cap) <= 0) return alert("Вместимость должна быть > 0");

    try {
      const res = await fetch(`${API}/auditoriums`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAud.name.trim(),
          capacity: Number(newAud.cap),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Ошибка добавления");

      setNewAud({ name: "", cap: 1 });
      await loadAll();
    } catch (e: any) {
      alert(e.message || "Ошибка");
    }
  };

  const deleteAuditorium = async (id: string) => {
    if (!confirm("Удалить аудиторию?")) return;

    try {
      const res = await fetch(`${API}/auditoriums/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Ошибка удаления");
      await loadAll();
    } catch (e: any) {
      alert(e.message || "Ошибка");
    }
  };

  const openEditAuditorium = (a: Auditorium) => {
    setEditingAuditorium({ ...a });
    setEditAuditoriumOpen(true);
  };

  const saveAuditorium = async () => {
    if (!editingAuditorium) return;
    if (!editingAuditorium.name.trim()) return alert("Введите название аудитории");
    if (Number(editingAuditorium.capacity) <= 0) return alert("Вместимость должна быть > 0");

    try {
      const res = await fetch(`${API}/auditoriums/${editingAuditorium.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingAuditorium.name.trim(),
          capacity: Number(editingAuditorium.capacity),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Ошибка сохранения");

      setEditAuditoriumOpen(false);
      setEditingAuditorium(null);
      await loadAll();
    } catch (e: any) {
      alert(e.message || "Ошибка");
    }
  };

  const handleBooking = async () => {
    if (!bookingForm.audId) return alert("Выберите аудиторию");
    if (!bookingForm.end) return alert("Выберите дату/время окончания");

    try {
      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditoriumId: bookingForm.audId,
          endTime: new Date(bookingForm.end).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Ошибка бронирования");

      setBookingForm({ audId: "", end: "" });
      await loadAll();
    } catch (e: any) {
      alert(e.message || "Ошибка");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Удалить бронирование?")) return;

    try {
      const res = await fetch(`${API}/bookings/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Ошибка удаления бронирования");
      await loadAll();
    } catch (e: any) {
      alert(e.message || "Ошибка");
    }
  };

  return (
    <>
      <Header activeNavId={active} onNavigate={setActive} onBellClick={() => {}} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Аудитории
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Управление аудиториями и бронированиями
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={`Аудиторий: ${auditoriums.length}`} variant="outlined" color="primary" />
            <Chip label={`Бронирований: ${bookings.length}`} variant="outlined" />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadAll}
              disabled={loading}
            >
              Обновить
            </Button>
          </Stack>
        </Stack>

        {/* Бронирование */}
        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Бронирование аудитории
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
            <TextField
              select
              label="Аудитория"
              value={bookingForm.audId}
              onChange={(e) => setBookingForm({ ...bookingForm, audId: e.target.value })}
              fullWidth
            >
              {auditoriums.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name} (мест: {a.capacity})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="datetime-local"
              label="До"
              InputLabelProps={{ shrink: true }}
              value={bookingForm.end}
              onChange={(e) => setBookingForm({ ...bookingForm, end: e.target.value })}
              sx={{ width: { xs: "100%", sm: 260 } }}
            />

            <Button variant="contained" onClick={handleBooking} sx={{ px: 3 }}>
              Занять
            </Button>
          </Stack>
        </Paper>

        {/* Аудитории */}
        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Добавить аудиторию
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="Название"
              value={newAud.name}
              onChange={(e) => setNewAud({ ...newAud, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Мест"
              type="number"
              value={newAud.cap}
              onChange={(e) => setNewAud({ ...newAud, cap: Number(e.target.value) })}
              sx={{ width: { xs: "100%", sm: 150 } }}
              inputProps={{ min: 1 }}
            />
            <Button
              variant="contained"
              onClick={addAuditorium}
              startIcon={<Add />}
              sx={{ px: 3 }}
            >
              Добавить
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Список аудиторий
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell width={140}>Мест</TableCell>
                <TableCell align="right" width={140}>
                  Действия
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditoriums.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{a.name}</TableCell>
                  <TableCell>{a.capacity}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => openEditAuditorium(a)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => deleteAuditorium(a.id)} color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {!auditoriums.length && (
                <TableRow>
                  <TableCell colSpan={3} sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Пока нет аудиторий — добавь первую.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* Журнал бронирований */}
        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Бронь
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Аудитория</TableCell>
                <TableCell>Начало</TableCell>
                <TableCell>Окончание</TableCell>
                <TableCell align="right" width={120}>
                  Действия
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell>{b.auditorium?.name || b.auditoriumId}</TableCell>
                  <TableCell>{new Date(b.startTime).toLocaleString()}</TableCell>
                  <TableCell>{new Date(b.endTime).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => deleteBooking(b.id)} color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {!bookings.length && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Бронирований пока нет.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Container>

      {/* Диалог редактирования аудитории */}
      <Dialog
        open={editAuditoriumOpen}
        onClose={() => setEditAuditoriumOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Редактировать аудиторию</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Название"
            value={editingAuditorium?.name || ""}
            onChange={(e) =>
              setEditingAuditorium((prev) =>
                prev ? { ...prev, name: e.target.value } : prev
              )
            }
          />
          <TextField
            label="Мест"
            type="number"
            inputProps={{ min: 1 }}
            value={editingAuditorium?.capacity ?? 1}
            onChange={(e) =>
              setEditingAuditorium((prev) =>
                prev ? { ...prev, capacity: Number(e.target.value) } : prev
              )
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditAuditoriumOpen(false)}>Отмена</Button>
          <Button onClick={saveAuditorium} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default App;
