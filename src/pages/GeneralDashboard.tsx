import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { apiService } from "@/services/api";

const GeneralDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!user) return;
      
      try {
        const response = await apiService.getDashboardStats();
        if (response.data) {
          setDashboardStats(response.data);
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, [user]);

  const getDashboardContent = () => {
    if (!user) return null;

    switch (user.role) {
      case "Employee":
        return {
          title: "Employee Dashboard",
          description: "Manage your performance review process",
          cards: [
            {
              title: "Select Reviewers",
              description: "Choose reviewers for your performance feedback",
              icon: Users,
              action: "Go to Select Reviewers",
              route: "/dashboard/select-reviewers",
              color: "bg-blue-500",
            },
            {
              title: "Review Status",
              description: "Track your review submission status",
              icon: CheckCircle,
              action: "View Status",
              route: "/dashboard/select-reviewers",
              color: "bg-green-500",
            },
          ],
          stats: [
            { label: "Reviewers Selected", value: dashboardStats?.reviewers_selected || "0", icon: Users },
            { label: "Submission Status", value: dashboardStats?.submission_status || "Not Submitted", icon: Clock },
          ]
        };

      case "Mentor":
        return {
          title: "Mentor Dashboard",
          description: "Review and approve mentee submissions",
          cards: [
            {
              title: "Review & Approve",
              description: "Review and approve reviewer selections from mentees",
              icon: FileText,
              action: "Go to Review & Approve",
              route: "/dashboard/review-approve",
              color: "bg-purple-500",
            },
            {
              title: "Pending Approvals",
              description: "View submissions waiting for your approval",
              icon: Clock,
              action: "View Pending",
              route: "/dashboard/review-approve",
              color: "bg-yellow-500",
            },
          ],
          stats: [
            { label: "Pending Approvals", value: dashboardStats?.pending_approvals || "0", icon: Clock },
            { label: "Approved Today", value: dashboardStats?.approved_today || "0", icon: CheckCircle },
          ]
        };

      case "People Committee":
        return {
          title: "Reviewer Dashboard",
          description: "Provide feedback for assigned employees",
          cards: [
            {
              title: "Provide Feedback",
              description: "Review and provide feedback for assigned employees",
              icon: FileText,
              action: "Go to Feedback",
              route: "/dashboard/feedback",
              color: "bg-indigo-500",
            },
            {
              title: "Draft Reviews",
              description: "Continue working on draft reviews",
              icon: AlertCircle,
              action: "View Drafts",
              route: "/dashboard/feedback",
              color: "bg-orange-500",
            },
          ],
          stats: [
            { label: "Pending Reviews", value: dashboardStats?.pending_reviews || "0", icon: Clock },
            { label: "Draft Reviews", value: dashboardStats?.draft_reviews || "0", icon: AlertCircle },
          ]
        };

      default:
        return {
          title: "Dashboard",
          description: "Welcome to the performance review system",
          cards: [],
          stats: []
        };
    }
  };

  const content = getDashboardContent();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900">Loading Dashboard...</h3>
          <p className="text-gray-500">Please wait while we load your dashboard data.</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
        <p className="text-gray-600 mt-2">{content.description}</p>
      </div>

      {/* Stats */}
      {content.stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.icon === Clock ? 'bg-yellow-100' : stat.icon === CheckCircle ? 'bg-green-100' : 'bg-blue-100'}`}>
                    <stat.icon className={`h-6 w-6 ${stat.icon === Clock ? 'text-yellow-600' : stat.icon === CheckCircle ? 'text-green-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {content.cards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${card.color} bg-opacity-10`}>
                    <card.icon className={`h-5 w-5 ${card.color.replace('bg-', 'text-')}`} />
                  </div>
                  {card.title}
                </CardTitle>
              </div>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate(card.route)}
                className="w-full"
                variant="outline"
              >
                {card.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Cycle Info */}
      {dashboardStats?.performance_cycle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Current Performance Cycle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Cycle Name</p>
                <p className="text-lg font-semibold">{dashboardStats.performance_cycle.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p className="text-lg font-semibold">{new Date(dashboardStats.performance_cycle.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">End Date</p>
                <p className="text-lg font-semibold">{new Date(dashboardStats.performance_cycle.end_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="default" className="bg-green-100 text-green-800">
                {dashboardStats.performance_cycle.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeneralDashboard;
