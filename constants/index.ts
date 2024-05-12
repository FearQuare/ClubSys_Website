import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import NotificationsIcon from '@mui/icons-material/Notifications';

export const sidebarLinks = [
    {
        label: 'Home',
        IconComponent: HomeIcon,
        route: '/',
    },
    {
        label: 'Edit Club',
        IconComponent: EditIcon,
        route: '/edit-club',
    },
    {
        label: 'Club Statistics',
        IconComponent: AssessmentIcon,
        route: '/club-statistics',
    },
    {
        label: 'Events',
        IconComponent: EventIcon,
        route: '/events',
    },
    {
        label: 'Documents',
        IconComponent: DescriptionIcon,
        route: '/documents',
    },
    {
        label: 'Notifications',
        IconComponent: NotificationsIcon,
        route: '/notifications',
    },
];