import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit2, Trash2, Upload } from 'lucide-react';
import axios from 'axios';

interface GalleryEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendees: number;
  category: string;
  thumbnail: string;
  images: string[];
  details: string;
  type: string;
}

const GalleryManagement = () => {
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GalleryEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<GalleryEvent, '_id'>>({
    title: '',
    description: '',
    date: '',
    location: '',
    attendees: 0,
    category: '',
    thumbnail: '',
    images: [],
    details: '',
    type: 'gallery'
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/gallery-events');
      setEvents(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleImageUpload = async (file: File, isThumb: boolean = false) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://127.0.0.1:8000/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageData = `data:image/jpeg;base64,${response.data.image}`;

      if (isThumb) {
        setNewEvent(prev => ({ ...prev, thumbnail: imageData }));
      } else {
        setNewEvent(prev => ({
          ...prev,
          images: [...prev.images, imageData],
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (editingEvent) {
        await axios.put(`http://127.0.0.1:8000/gallery-events/${editingEvent._id}`, newEvent);
      } else {
        await axios.post('http://127.0.0.1:8000/gallery-events', newEvent);
      }
      
      await fetchEvents();
      setIsAddingEvent(false);
      setEditingEvent(null);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        location: '',
        attendees: 0,
        category: '',
        thumbnail: '',
        images: [],
        details: '',
        type: 'gallery'
      });
    } catch (error) {
      console.error('Error saving event:', error);
      setError('Failed to save event');
    }
  };

  const handleEdit = (event: GalleryEvent) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      attendees: event.attendees,
      category: event.category,
      thumbnail: event.thumbnail,
      images: event.images,
      details: event.details,
      type: 'gallery'
    });
    setIsAddingEvent(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/gallery-events/${id}`);
        await fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        setError('Failed to delete event');
      }
    }
  };

  const removeImage = (index: number) => {
    setNewEvent(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Gallery Management</h2>
            <p className="text-neutral-400 mt-2">Manage event gallery cards and their details</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative"
            >
              <div className="relative h-48 sm:h-64 md:h-96 w-full">
                <img
                  src={event.thumbnail}
                  alt={event.title}
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="text-lg font-medium text-white truncate">{event.title}</h4>
                    <p className="text-sm text-neutral-300">{event.category}</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(event)}
                    className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(event._id)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {isAddingEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
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
                className="bg-neutral-900 rounded-xl p-6 w-full max-w-4xl my-8 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="max-h-[85vh] overflow-y-auto px-2 custom-scrollbar">
                  <div className="sticky top-0 bg-neutral-900 z-10 pb-4 mb-4 border-b border-neutral-800">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold">
                        {editingEvent ? 'Edit Event' : 'Add New Event'}
                      </h3>
                      <button
                        onClick={() => {
                          setIsAddingEvent(false);
                          setEditingEvent(null);
                        }}
                        className="text-neutral-400 hover:text-white p-2"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Category
                        </label>
                        <input
                          type="text"
                          value={newEvent.category}
                          onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={newEvent.location}
                          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Attendees
                        </label>
                        <input
                          type="number"
                          value={newEvent.attendees}
                          onChange={(e) => setNewEvent({ ...newEvent, attendees: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Detailed Description
                      </label>
                      <textarea
                        value={newEvent.details}
                        onChange={(e) => setNewEvent({ ...newEvent, details: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Thumbnail Image
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer">
                          <div className="relative w-full h-40 bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
                            {newEvent.thumbnail ? (
                              <img
                                src={newEvent.thumbnail}
                                alt="Thumbnail"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Upload className="w-8 h-8 text-neutral-500" />
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, true);
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Additional Images
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {newEvent.images?.map((image, index) => (
                          <div key={index} className="relative h-40">
                            <img
                              src={image}
                              alt={`Additional ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <label className="cursor-pointer">
                          <div className="relative w-full h-40 bg-neutral-800 rounded-lg border border-neutral-700 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-neutral-500" />
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="sticky bottom-0 bg-neutral-900 pt-4 border-t border-neutral-800 mt-8">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingEvent(false);
                            setEditingEvent(null);
                          }}
                          className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={uploadingImage}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {uploadingImage ? 'Uploading...' : editingEvent ? 'Update Event' : 'Create Event'}
                        </motion.button>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GalleryManagement;