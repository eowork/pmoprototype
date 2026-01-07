import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { LoadingSpinner } from './LoadingSpinner';
import { PagePermissionDialog } from './UserManagement/PagePermissionDialog';
import { DUMMY_ACCOUNTS, getAllDepartments, type User } from './UserManagement/dummyAccounts';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Shield,
  UserCheck,
  User as UserIcon,
  Settings,
  Eye,
  X,
  Loader2,
  Crown,
  RefreshCw,
  AlertTriangle,
  Lock,
  FileText
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner@2.0.3';

interface UserManagementProps {
  userRole: string;
  onUserUpdate?: (user: User) => void;
  userProfile?: any;
}

// CRITICAL FIX: Error boundary component to prevent crashes
class UserManagementErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('UserManagement Error:', error, errorInfo);
    toast.error('An error occurred in User Management. Please refresh the page.');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
              <p className="text-muted-foreground mb-4">
                User Management encountered an error. Please refresh the page to continue.
              </p>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// CRITICAL FIX: Simplified UserManagement component without complex memoization
function UserManagementCore({ userRole, onUserUpdate, userProfile }: UserManagementProps) {
  // CRITICAL FIX: Simplified state management
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Dialog states - CRITICAL FIX: Separate state for each dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form and loading states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<'Admin' | 'Staff' | 'Client'>('Client');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Client' as const,
    position: '',
    department: '',
    phone: ''
  });

  // CRITICAL FIX: Use refs to prevent infinite re-renders
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  // State for page permissions dialog
  const [isPagePermissionsOpen, setIsPagePermissionsOpen] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null);

  // CRITICAL FIX: Simplified initialization with comprehensive dummy accounts
  useEffect(() => {
    let mounted = true;
    
    const initUsers = () => {
      try {
        console.log('Initializing users with comprehensive dummy accounts...');
        
        // Load comprehensive dummy accounts from our centralized data
        const demoUsers: User[] = DUMMY_ACCOUNTS;

        if (mounted) {
          setUsers(demoUsers);
          setLoading(false);
          console.log(`Loaded ${demoUsers.length} dummy accounts successfully`);
        }
      } catch (error) {
        console.error('Error initializing users:', error);
        if (mounted) {
          toast.error('Failed to load user data');
          setLoading(false);
        }
      }
    };

    // CRITICAL FIX: Simple timeout instead of complex async
    const timeoutId = setTimeout(initUsers, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // CRITICAL FIX: Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // CRITICAL FIX: Simple search with timeout to prevent excessive filtering
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // CRITICAL FIX: Simple filtering without memoization
  const getFilteredUsers = () => {
    let filtered = users;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.position.toLowerCase().includes(searchLower) ||
        user.department.toLowerCase().includes(searchLower)
      );
    }

    if (roleFilter !== 'All') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    return filtered;
  };

  // CRITICAL FIX: Simplified utility functions
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'Staff': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Client': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return Shield;
      case 'Staff': return UserCheck;
      case 'Client': return UserIcon;
      default: return UserIcon;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // CRITICAL FIX: Simplified async operations with proper error handling
  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.position) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setFormLoading(true);
      console.log('Adding user...');
      
      // Simple timeout instead of complex async
      await new Promise(resolve => setTimeout(resolve, 800));

      if (!mountedRef.current) return;

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        password: 'default123', // Default password for new users
        role: formData.role,
        position: formData.position,
        department: formData.department,
        phone: formData.phone,
        status: 'active',
        createdAt: new Date().toISOString(),
        allowedPages: formData.role === 'Admin' ? ['*'] : ['overview', 'settings']
      };

      setUsers(prev => [...prev, newUser]);
      setIsAddDialogOpen(false);
      resetFormData();
      toast.success(`User ${newUser.name} added successfully`);

      if (onUserUpdate) {
        onUserUpdate(newUser);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    } finally {
      if (mountedRef.current) {
        setFormLoading(false);
      }
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !formData.name || !formData.email || !formData.position) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setFormLoading(true);
      console.log('Editing user...');
      
      await new Promise(resolve => setTimeout(resolve, 800));

      if (!mountedRef.current) return;

      const updatedUser = {
        ...selectedUser,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        position: formData.position,
        department: formData.department,
        phone: formData.phone
      };

      setUsers(prev => prev.map(user =>
        user.id === selectedUser.id ? updatedUser : user
      ));

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetFormData();
      toast.success(`User ${formData.name} updated successfully`);

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      if (mountedRef.current) {
        setFormLoading(false);
      }
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || userRole !== 'Admin') {
      toast.error('Only administrators can change user roles');
      return;
    }

    try {
      setActionLoading(true);
      console.log('Changing role...');
      
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!mountedRef.current) return;

      const updatedUser = { ...selectedUser, role: selectedNewRole };

      setUsers(prev => prev.map(user =>
        user.id === selectedUser.id ? updatedUser : user
      ));

      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      toast.success(`Role updated to ${selectedNewRole} successfully`);

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    } finally {
      if (mountedRef.current) {
        setActionLoading(false);
      }
    }
  };

  const handleChangeStatus = async (userId: string, newStatus: 'active' | 'inactive' | 'pending') => {
    if (userRole !== 'Admin') {
      toast.error('Only administrators can change user status');
      return;
    }

    try {
      setActionLoading(true);
      console.log('Changing status...');
      
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!mountedRef.current) return;

      const updatedUser = users.find(u => u.id === userId);
      if (updatedUser) {
        const newUser = { ...updatedUser, status: newStatus };
        setUsers(prev => prev.map(user =>
          user.id === userId ? newUser : user
        ));

        toast.success(`Status updated successfully`);

        if (onUserUpdate) {
          onUserUpdate(newUser);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update user status');
    } finally {
      if (mountedRef.current) {
        setActionLoading(false);
      }
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || userRole !== 'Admin') {
      toast.error('Only administrators can delete users');
      return;
    }

    try {
      setActionLoading(true);
      console.log('Deleting user...');
      
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!mountedRef.current) return;

      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast.success(`User ${selectedUser.name} deleted successfully`);

      if (onUserUpdate) {
        onUserUpdate({ ...selectedUser, status: 'inactive' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      if (mountedRef.current) {
        setActionLoading(false);
      }
    }
  };

  // CRITICAL FIX: Simplified dialog handlers
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      position: user.position,
      department: user.department,
      phone: user.phone || ''
    });
    setIsEditDialogOpen(true);
  };

  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedNewRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      email: '',
      role: 'Client',
      position: '',
      department: '',
      phone: ''
    });
  };

  const closeAllDialogs = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsRoleDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
    resetFormData();
  };

  // CRITICAL FIX: Early return for loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();
  const isAdmin = userRole === 'Admin';

  return (
    <div className="h-full overflow-auto">
      <div className="p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          
          {isAdmin && (
            <Button 
              className="gap-2" 
              onClick={() => setIsAddDialogOpen(true)}
              disabled={formLoading || actionLoading}
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          )}
        </div>

        {/* Documentation Alert */}
        <Alert className="border-emerald-200 bg-emerald-50">
          <FileText className="h-4 w-4 text-emerald-600" />
          <AlertDescription>
            <strong>Dummy Accounts Reference:</strong> This system includes {users.length} comprehensive dummy accounts for testing.
            View the complete account guide in <code className="bg-emerald-100 px-1 rounded">/DUMMY_ACCOUNTS_GUIDE.md</code> for login credentials and access scopes.
          </AlertDescription>
        </Alert>

        {/* Admin Access Alert */}
        {!isAdmin && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Limited Access:</strong> You can view user information but cannot modify user accounts or roles. 
              Contact an administrator for user management tasks.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, email, position, or department..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-32">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Roles</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-32">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table/Cards - Responsive */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Users ({filteredUsers.length})
              </span>
              {actionLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[250px]">User</TableHead>
                      <TableHead className="min-w-[120px]">Role</TableHead>
                      <TableHead className="min-w-[180px]">Position</TableHead>
                      <TableHead className="min-w-[200px]">Department</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[120px]">Last Login</TableHead>
                      {isAdmin && <TableHead className="text-right min-w-[80px]">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const RoleIcon = getRoleIcon(user.role);
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="font-medium truncate">{user.name}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <RoleIcon className="w-4 h-4 flex-shrink-0" />
                              <Badge variant="secondary" className={getRoleColor(user.role)}>
                                {user.role}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{user.position}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{user.department}</div>
                            {user.allowedPages && user.allowedPages.length > 0 && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {user.allowedPages[0] === '*' 
                                  ? '🌐 All pages' 
                                  : `🔒 ${user.allowedPages.length} pages`}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                            </div>
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    disabled={actionLoading}
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                                    <Crown className="w-4 h-4 mr-2" />
                                    Change Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedUserForPermissions(user);
                                    setIsPagePermissionsOpen(true);
                                  }}>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Assign Pages
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => openDeleteDialog(user)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile Card View - Visible on mobile only */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{user.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              disabled={actionLoading}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                              <Crown className="w-4 h-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedUserForPermissions(user);
                              setIsPagePermissionsOpen(true);
                            }}>
                              <Lock className="w-4 h-4 mr-2" />
                              Assign Pages
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}>
                              <Eye className="w-4 h-4 mr-2" />
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Role</span>
                        <div className="flex items-center gap-2">
                          <RoleIcon className="w-4 h-4" />
                          <Badge variant="secondary" className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant="secondary" className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Position</span>
                        <span className="text-sm text-right">{user.position}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Department</span>
                        <span className="text-sm text-right">{user.department}</span>
                      </div>
                      {user.allowedPages && user.allowedPages.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Access</span>
                          <Badge variant="outline" className="text-xs">
                            {user.allowedPages[0] === '*' 
                              ? '🌐 All pages' 
                              : `🔒 ${user.allowedPages.length} pages`}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || roleFilter !== 'All' || statusFilter !== 'All'
                    ? 'Try adjusting your search or filter criteria'
                    : 'No users have been added yet'
                  }
                </p>
                {(searchTerm || roleFilter !== 'All' || statusFilter !== 'All') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('All');
                      setStatusFilter('All');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* DIALOGS WITH FORMAL STYLING - Matching OverviewCRUDDialogs.tsx */}
        
        {/* Add User Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          if (!open) closeAllDialogs();
          else setIsAddDialogOpen(true);
        }}>
          <DialogContent 
            className="sm:max-w-2xl max-h-[95vh] flex flex-col" 
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with appropriate role and permissions
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      disabled={formLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                      disabled={formLoading}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Account Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                      disabled={formLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Client">Client - View only access</SelectItem>
                        <SelectItem value="Staff">Staff - Content management access</SelectItem>
                        <SelectItem value="Admin">Admin - Full system access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Job title or position"
                      disabled={formLoading}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(value: string) => setFormData({ ...formData, department: value })}
                      disabled={formLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllDepartments().map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                      disabled={formLoading}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t mt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={closeAllDialogs}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading} className="bg-emerald-600 hover:bg-emerald-700">
                  {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add User
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          if (!open) closeAllDialogs();
          else setIsEditDialogOpen(true);
        }}>
          <DialogContent 
            className="sm:max-w-2xl max-h-[95vh] flex flex-col"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => { e.preventDefault(); handleEditUser(); }} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      disabled={formLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email Address *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                      disabled={formLoading}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Account Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Role *</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                      disabled={formLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Client">Client - View only access</SelectItem>
                        <SelectItem value="Staff">Staff - Content management access</SelectItem>
                        <SelectItem value="Admin">Admin - Full system access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-position">Position *</Label>
                    <Input
                      id="edit-position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Job title or position"
                      disabled={formLoading}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-department">Department</Label>
                    <Input
                      id="edit-department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Department or organization"
                      disabled={formLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone Number</Label>
                    <Input
                      id="edit-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                      disabled={formLoading}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t mt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={closeAllDialogs}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading} className="bg-emerald-600 hover:bg-emerald-700">
                  {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update User
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Role Change Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={(open) => {
          if (!open) closeAllDialogs();
          else setIsRoleDialogOpen(true);
        }}>
          <DialogContent 
            className="sm:max-w-md"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Change User Role
              </DialogTitle>
              <DialogDescription>
                Select a new role for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {selectedUser ? getInitials(selectedUser.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser?.position}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Select New Role</Label>
                <Select 
                  value={selectedNewRole} 
                  onValueChange={(value: any) => setSelectedNewRole(value)}
                  disabled={actionLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Client">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        Client - View only access
                      </div>
                    </SelectItem>
                    <SelectItem value="Staff">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Staff - Content management access
                      </div>
                    </SelectItem>
                    <SelectItem value="Admin">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin - Full system access
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <RefreshCw className="h-4 w-4" />
                <AlertDescription>
                  <strong>Role Change Impact:</strong> This will immediately update the user's permissions and access level throughout the system.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={closeAllDialogs}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleChangeRole} 
                disabled={actionLoading || selectedNewRole === selectedUser?.role}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
          if (!open) closeAllDialogs();
          else setIsDeleteDialogOpen(true);
        }}>
          <DialogContent 
            className="sm:max-w-md"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Delete User
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {selectedUser ? getInitials(selectedUser.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser?.position}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                  </div>
                </div>
              </div>

              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This will permanently delete the user account and cannot be undone. The user will lose access to all systems immediately.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={closeAllDialogs}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteUser} 
                disabled={actionLoading}
              >
                {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Page Permissions Dialog */}
        <PagePermissionDialog
          user={selectedUserForPermissions}
          isOpen={isPagePermissionsOpen}
          onClose={() => {
            setIsPagePermissionsOpen(false);
            setSelectedUserForPermissions(null);
          }}
          onSave={() => {
            // Refresh user list or update specific user
            toast.success('Page permissions updated successfully');
          }}
          adminEmail={userProfile?.email || 'admin@carsu.edu.ph'}
        />
      </div>
    </div>
  );
}

// CRITICAL FIX: Export wrapped component with error boundary
export function UserManagement(props: UserManagementProps) {
  return (
    <UserManagementErrorBoundary>
      <UserManagementCore {...props} />
    </UserManagementErrorBoundary>
  );
}
