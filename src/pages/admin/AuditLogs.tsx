
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Audit log type definition
type AuditLog = {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userEmail: string;
  details: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
};

// Mock audit log data
const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    action: "LOGIN",
    userId: "1",
    userEmail: "admin@example.com",
    details: "User login successful",
    entityType: "user",
    entityId: "1",
    ipAddress: "192.168.1.1"
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    action: "CREATE_USER",
    userId: "1",
    userEmail: "admin@example.com",
    details: "Created new volunteer user",
    entityType: "user",
    entityId: "3",
    ipAddress: "192.168.1.1"
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    action: "UPDATE_SETTINGS",
    userId: "1",
    userEmail: "admin@example.com",
    details: "Modified system notification settings",
    entityType: "settings",
    entityId: "notifications",
    ipAddress: "192.168.1.1"
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
    action: "DELETE_USER",
    userId: "1",
    userEmail: "admin@example.com",
    details: "Removed inactive user account",
    entityType: "user",
    entityId: "5",
    ipAddress: "192.168.1.1"
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 1440 * 60000).toISOString(),
    action: "SYSTEM",
    userId: "system",
    userEmail: "system",
    details: "Scheduled database backup completed",
    entityType: "system",
    entityId: "backup",
    ipAddress: "localhost"
  }
];

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, replace with actual API call
        setLogs(mockAuditLogs);
        setError(null);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        setError("Failed to load audit logs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLogs();
  }, []);

  // Filter logs based on search query and action filter
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    }).format(date);
  };

  // Unique actions for filter dropdown
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            View and monitor system activity logs
          </p>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>
              Comprehensive audit trail of all system activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={actionFilter}
                  onValueChange={setActionFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {uniqueActions.map(action => (
                      <SelectItem key={action} value={action}>
                        {action.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="w-full md:w-auto">
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            {isLoading ? (
              <div className="h-60 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No logs match your search criteria
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">Entity</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.action === 'LOGIN' ? 'bg-blue-100 text-blue-800' :
                            log.action === 'CREATE_USER' ? 'bg-green-100 text-green-800' :
                            log.action === 'UPDATE_SETTINGS' ? 'bg-amber-100 text-amber-800' :
                            log.action === 'DELETE_USER' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell>{log.userEmail}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {log.entityType}/{log.entityId}
                        </TableCell>
                        <TableCell>{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
