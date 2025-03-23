import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  MessageSquare,
  Activity,
  Clock
} from 'lucide-react';

const AdminHistory = () => {
  const stats = [
    {
      title: "Total Events",
      value: "124",
      icon: Calendar,
      change: "+12%",
      description: "vs. previous month"
    },
    {
      title: "Active Inquiries",
      value: "32",
      icon: MessageSquare,
      change: "+8%",
      description: "vs. previous month"
    },
    {
      title: "Job Applications",
      value: "56",
      icon: Users,
      change: "+24%",
      description: "vs. previous month"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "New Inquiry",
      description: "Wedding decoration inquiry from John Doe",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "Job Application",
      description: "New application for Event Coordinator position",
      time: "4 hours ago"
    },
    {
      id: 3,
      type: "Event Update",
      description: "Corporate event details updated by admin",
      time: "6 hours ago"
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Corporate Gala Dinner",
      date: "March 25, 2024",
      location: "Grand Hotel"
    },
    {
      id: 2,
      title: "Wedding Ceremony",
      date: "March 28, 2024",
      location: "Beach Resort"
    },
    {
      id: 3,
      title: "Tech Conference",
      date: "April 2, 2024",
      location: "Convention Center"
    }
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
          <p className="text-neutral-400 mt-2">Here's what's happening with your events today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
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
                <span className="text-neutral-400 ml-2">{stat.description}</span>
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
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="h-2 w-2 mt-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium">{activity.type}</p>
                    <p className="text-sm text-neutral-400">{activity.description}</p>
                    <p className="text-xs text-neutral-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
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
              {upcomingEvents.map((event) => (
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
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminHistory;