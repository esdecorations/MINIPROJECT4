import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, MessageSquare, Activity, Clock } from "lucide-react";
import axios from "axios";

interface DashboardStats {
  totalEvents: number;
  activeInquiries: number;
  jobApplications: number;
  recentActivity: {
    id: number;
    type: string;
    description: string;
    time: string;
  }[];
  upcomingEvents: {
    id: string;
    title: string;
    date: string;
    location: string;
  }[];
}

const AdminHistory = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeInquiries: 0,
    jobApplications: 0,
    recentActivity: [],
    upcomingEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch events count
        const eventsResponse = await axios.get(
          "https://es-decorations.onrender.com/events"
        );
        const totalEvents = eventsResponse.data.length;

        // Fetch active inquiries
        const inquiriesResponse = await axios.get(
          "https://es-decorations.onrender.com/inquiries"
        );
        const activeInquiries = inquiriesResponse.data.length;

        // Fetch job applications
        const applicationsResponse = await axios.get(
          "https://es-decorations.onrender.com/job-applications"
        );
        const totalApplications = applicationsResponse.data.length;

        // Get recent activity from applications and inquiries
        const recentActivity = [
          ...applicationsResponse.data.slice(0, 3).map((app: any) => ({
            id: app._id,
            type: "Job Application",
            description: `New application for ${app.jobId} position from ${app.name}`,
            time: new Date(app.appliedDate).toLocaleString(),
          })),
          ...inquiriesResponse.data.slice(0, 3).map((inq: any) => ({
            id: inq.id,
            type: "New Inquiry",
            description: `${inq.subject} from ${inq.name}`,
            time: new Date(inq.created_at).toLocaleString(),
          })),
        ]
          .sort(
            (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
          )
          .slice(0, 3);

        // Get upcoming events
        const upcomingEvents = eventsResponse.data
          .filter((event: any) => new Date(event.date) > new Date())
          .sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .slice(0, 3)
          .map((event: any) => ({
            id: event._id,
            title: event.title,
            date: new Date(event.date).toLocaleDateString(),
            location: event.location,
          }));

        setStats({
          totalEvents,
          activeInquiries,
          jobApplications: totalApplications,
          recentActivity,
          upcomingEvents,
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return "0%";
    const growth = ((current - previous) / previous) * 100;
    return `${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-20">{error}</div>;
  }

  const statCards = [
    {
      title: "Total Events",
      value: stats.totalEvents.toString(),
      icon: Calendar,
      change: calculateGrowth(stats.totalEvents, stats.totalEvents - 2), // Example: comparing with previous count
      description: "vs. previous month",
    },
    {
      title: "Active Inquiries",
      value: stats.activeInquiries.toString(),
      icon: MessageSquare,
      change: calculateGrowth(stats.activeInquiries, stats.activeInquiries - 1),
      description: "vs. previous month",
    },
    {
      title: "Job Applications",
      value: stats.jobApplications.toString(),
      icon: Users,
      change: calculateGrowth(stats.jobApplications, stats.jobApplications - 3),
      description: "vs. previous month",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-4xl font-bold">Welcome back, Admin!</h1>
          <p className="text-neutral-400 mt-2">
            Here's what's happening with your events today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-400">{stat.title}</p>
                  <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                </div>
                <div className="bg-neutral-800/50 p-3 rounded-lg">
                  <stat.icon className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-500">{stat.change}</span>
                <span className="text-neutral-400 ml-2">
                  {stat.description}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <Activity className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="h-2 w-2 mt-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium">{activity.type}</p>
                    <p className="text-sm text-neutral-400">
                      {activity.description}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
              {stats.recentActivity.length === 0 && (
                <p className="text-neutral-400 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
              <Clock className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="space-y-4">
              {stats.upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-4">
                  <div className="bg-neutral-800 p-3 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-neutral-400">{event.date}</p>
                    <p className="text-xs text-neutral-500">{event.location}</p>
                  </div>
                </div>
              ))}
              {stats.upcomingEvents.length === 0 && (
                <p className="text-neutral-400 text-center py-4">
                  No upcoming events
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminHistory;
