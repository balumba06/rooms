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
} from "@mui/material";
import { Delete, Add, Edit, Refresh } from "@mui/icons-material";
import { Header } from "./components/Header";

interface Auditorium {
  id: string;
  name: string;
  capacity: number;
}

function App() {
  const [active, setActive] = useState("catalog");

  const [auditoriums, setAuditoriums] = useState<Auditorium[]>([]);
  const [loading, setLoading] = useState(false);

  const [newAud, setNewAud] = useState({ name: "", cap: 1 });

  const [editAuditoriumOpen, setEditAuditoriumOpen] = useState(false);
  const [editingAuditorium, setEditingAuditorium] =
    useState<Auditorium | null>(null);

  const API = useMemo(() => {
    let base = "http://localhost/api";
    if (import.meta.env.PROD) base = "https://rooms-a.onrender.com/api";
    return base;
  }, []);

  const loadAuditoriums = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auditoriums`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Ошибка загрузки");
      setAuditoriums(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditoriums();
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
      await loadAuditoriums();
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
      await loadAuditoriums();
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
    if (!editingAuditorium.name.trim())
      return alert("Введите название аудитории");
    if (Number(editingAuditorium.capacity) <= 0)
      return alert("Вместимость должна быть > 0");

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
      await loadAuditoriums();
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
              Добавление, редактирование и удаление аудиторий
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`Всего: ${auditoriums.length}`}
              variant="outlined"
              color="primary"
            />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadAuditoriums}
              disabled={loading}
            >
              Обновить
            </Button>
          </Stack>
        </Stack>

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
              onChange={(e) =>
                setNewAud({ ...newAud, cap: Number(e.target.value) })
              }
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
            Список
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
                    <IconButton
                      onClick={() => deleteAuditorium(a.id)}
                      color="error"
                    >
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
      </Container>

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
