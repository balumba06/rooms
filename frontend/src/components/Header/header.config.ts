import type { NavItem } from './header.types';
import { ListAltOutlined, EventNoteOutlined, SettingsOutlined } from '@mui/icons-material';

export const DEFAULT_NAV: NavItem[] = [
    {
        id: 'catalog',
        label: 'Каталог',
        icon: ListAltOutlined
    },
    {
        id: 'bookings',
        label: 'Бронирования',
        icon: EventNoteOutlined
    },
    {
        id: 'settings',
        label: 'Настройки',
        icon: SettingsOutlined
    }
];
