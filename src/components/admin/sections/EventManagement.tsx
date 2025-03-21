import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, X, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

// Add type safety for status
type EventStatus = 'upcoming' | 'completed' | 'cancelled';

interface Event {
  _id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: EventStatus;  // Use the specific type
  highlights: string[];
}

const EventManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Event>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    status: 'upcoming',
    highlights: ['']
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/events');
      setEvents(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      if (editingEvent?._id) {
        await axios.put(`http://127.0.0.1:8000/events/${editingEvent._id}`, newEvent);
      } else {
        await axios.post('http://127.0.0.1:8000/events', newEvent);
      }
      setIsAddingEvent(false);
      setEditingEvent(null);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        status: 'upcoming',
        highlights: ['']
      });
      await fetchEvents();  // Use await here
    } catch (error) {
      console.error('Error saving event:', error);
      setError('Failed to save event. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      setError('Invalid event ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/events/${id}`);
        await fetchEvents();  // Use await here
      } catch (error) {
        console.error('Error deleting event:', error);
        setError('Failed to delete event. Please try again.');
      }
    }
  };

  const addHighlight = () => {
    setNewEvent(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const updateHighlight = (index: number, value: string) => {
    setNewEvent(prev => ({
      ...prev,
      highlights: prev.highlights.map((highlight, i) => i === index ? value : highlight)
    }));
  };

  const removeHighlight = (index: number) => {
    setNewEvent(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-500/10 text-green-500';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-neutral-500/10 text-neutral-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Event Management</h2>
            <p className="text-neutral-400 mt-2">Manage upcoming and past events</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddingEvent(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Event
          </motion.button>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          {events.map((event) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900 rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-neutral-800 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <p className="text-neutral-400">{event.location}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-sm text-neutral-500">
                        {event.date} at {event.time}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(event.status)}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-neutral-400 mt-4">{event.description}</p>
                    {event.highlights && event.highlights.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-2">Highlights:</h4>
                        <ul className="list-disc list-inside text-neutral-400">
                          {event.highlights.map((highlight, index) => (
                            <li key={index}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditingEvent(event);
                      setNewEvent(event);
                      setIsAddingEvent(true);
                    }}
                    className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => event._id && handleDelete(event._id)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}

          {events.length === 0 && !error && (
            <div className="text-center py-10 text-neutral-400">
              No events found. Add your first event!
            </div>
          )}
        </div>

        <AnimatePresence>
          {isAddingEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsAddingEvent(false);
                  setEditingEvent(null);
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-neutral-900 rounded-xl p-6 max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">
                    {editingEvent ? 'Edit Event' : 'Add New Event'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsAddingEvent(false);
                      setEditingEvent(null);
                    }}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Event Description
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Event Time
                    </label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Event Location
                    </label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Event Status
                    </label>
                    <select
                      value={newEvent.status}
                      onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as EventStatus })}
                      className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Event Highlights
                    </label>
                    <input
                      type="text"
                      value={newEvent.highlights[0]}
                      onChange={(e) => updateHighlight(0, e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      {editingEvent ? 'Update Event' : 'Add Event'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default EventManagement;