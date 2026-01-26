import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Church as ChurchIcon,
  Event,
  People,
  Settings,
  Logout,
  HowToReg,
  Diversity3 as NetworkIcon,
  Map as MapIcon,
  AccountCircle,
} from '@mui/icons-material';

const drawerWidth = 260;

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Charger le nombre de demandes en attente (SUPER_ADMIN uniquement)
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (user?.role === 'SUPER_ADMIN') {
        try {
          const { data } = await api.get('/admin/stats');
          setPendingCount(data.kpi.pending_users);
        } catch (error) {
          console.error('Erreur lors du chargement du count pending:', error);
        }
      }
    };
    fetchPendingCount();
  }, [user?.role, location.pathname]);

  const navigation: NavigationItem[] = [
    {
      name: 'Tableau de bord',
      href: '/dashboard',
      icon: Dashboard,
      roles: ['SUPER_ADMIN', 'PASTOR', 'EVANGELIST'],
    },
    {
      name: 'Mon Église',
      href: '/dashboard/my-church',
      icon: ChurchIcon,
      roles: ['PASTOR'],
    },
    {
      name: 'Mes Événements',
      href: '/dashboard/events',
      icon: Event,
      roles: ['PASTOR', 'EVANGELIST'],
    },
    {
      name: 'Mon Profil',
      href: '/dashboard/my-profile',
      icon: AccountCircle,
      roles: ['PASTOR', 'EVANGELIST', 'SUPER_ADMIN'],
    },
    {
      name: 'Réseau Pastoral',
      href: '/dashboard/pastor-network',
      icon: NetworkIcon,
      roles: ['PASTOR'],
    },
    {
      name: 'Carte Publique',
      href: '/map',
      icon: MapIcon,
      roles: ['PASTOR', 'EVANGELIST', 'SUPER_ADMIN'],
    },
    {
      name: 'Demandes d\'inscription',
      href: '/dashboard/admin/registrations',
      icon: HowToReg,
      roles: ['SUPER_ADMIN'],
    },
    {
      name: 'Utilisateurs',
      href: '/dashboard/admin/users',
      icon: People,
      roles: ['SUPER_ADMIN'],
    },
    {
      name: 'Églises',
      href: '/dashboard/admin/churches',
      icon: ChurchIcon,
      roles: ['SUPER_ADMIN'],
    },
    {
      name: 'Événements',
      href: '/dashboard/admin/events',
      icon: Event,
      roles: ['SUPER_ADMIN'],
    },
    {
      name: 'Paramètres',
      href: '/dashboard/admin/settings',
      icon: Settings,
      roles: ['SUPER_ADMIN'],
    },
  ];

  const filteredNav = navigation.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigate = (href: string) => {
    navigate(href);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <ChurchIcon
          sx={{
            fontSize: 32,
            background: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mr: 1.5,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Light Church
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.href)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.href === '/dashboard/admin/registrations' && pendingCount > 0 ? (
                    <Badge badgeContent={pendingCount} color="error">
                      <Icon />
                    </Badge>
                  ) : (
                    <Icon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    fontSize: '0.9375rem',
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* User Profile */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            mb: 1,
            borderRadius: 2,
            backgroundColor: 'background.paper',
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {user?.first_name.charAt(0)}
            {user?.last_name.charAt(0)}
          </Avatar>
          <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              noWrap
              sx={{ color: 'text.primary' }}
            >
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {(user?.role || '').replace('_', ' ')}
            </Typography>
          </Box>
        </Box>

        {/* Logout Button */}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.main',
              color: 'error.contrastText',
              '& .MuiListItemIcon-root': {
                color: 'error.contrastText',
              },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Déconnexion"
            primaryTypographyProps={{ fontSize: '0.9375rem', fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar (Mobile only) */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            width: '100%',
            backgroundColor: 'background.paper',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Light Church
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 3, md: 4 },
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, lg: 0 }, // Account for mobile AppBar
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
