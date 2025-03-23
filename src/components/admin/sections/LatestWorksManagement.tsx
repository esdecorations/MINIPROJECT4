import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit2, Trash2, Upload } from 'lucide-react';
import axios from 'axios';

interface LatestWork {
  _id?: string;
  title: string;
  thumbnail: string;
  category: string;
}

const LatestWorksManagement = () => {
  const [works, setWorks] = useState<LatestWork[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<LatestWork | null>(null);
  const [newWork, setNewWork] = useState<Omit<LatestWork, '_id'>>({
    title: '',
    thumbnail: '',
    category: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorks = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/latest-works');
      const transformedWorks = response.data.map((work: LatestWork) => ({
        ...work,
        thumbnail: work.thumbnail.startsWith('data:') 
          ? work.thumbnail 
          : `data:image/jpeg;base64,${work.thumbnail}`
      }));
      setWorks(transformedWorks);
      setError(null);
    } catch (err) {
      console.error('Error fetching works:', err);
      setError('Failed to load works');
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://127.0.0.1:8000/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setNewWork(prev => ({
        ...prev,
        thumbnail: `data:image/jpeg;base64,${response.data.image}`
      }));
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
    
    if (!newWork.title || !newWork.category || !newWork.thumbnail) {
      setError('Please fill in all fields and upload an image');
      return;
    }

    try {
      const workData = {
        ...newWork,
        thumbnail: newWork.thumbnail.split('base64,')[1]
      };

      if (editingWork?._id) {
        await axios.put(`http://127.0.0.1:8000/latest-works/${editingWork._id}`, workData);
      } else {
        await axios.post('http://127.0.0.1:8000/latest-works', workData);
      }
      
      setIsModalOpen(false);
      setEditingWork(null);
      setNewWork({
        title: '',
        thumbnail: '',
        category: '',
      });
      await fetchWorks();
    } catch (error: any) {
      console.error('Error saving work:', error);
      setError(error.response?.data?.detail || 'Failed to save work');
    }
  };

  const handleEdit = (work: LatestWork) => {
    setEditingWork(work);
    setNewWork({
      title: work.title,
      category: work.category,
      thumbnail: work.thumbnail,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      setError('Invalid work ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this work? This action cannot be undone.')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/latest-works/${id}`);
        await fetchWorks();
        setError(null);
      } catch (error: any) {
        console.error('Error deleting work:', error);
        setError(error.response?.data?.detail || 'Failed to delete work');
      }
    }
  };

  const resetForm = () => {
    setNewWork({
      title: '',
      thumbnail: '',
      category: '',
    });
    setEditingWork(null);
    setIsModalOpen(false);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h2 className="text-3xl font-bold">Latest Works Management</h2>
          <p className="text-neutral-400 mt-2">Manage and update your portfolio of works</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((work) => (
            <motion.div
              key={work._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative h-48 sm:h-64 md:h-96 w-full"
            >
              <div className="relative w-full h-full overflow-hidden rounded-xl">
                <img
                  src={work.thumbnail}
                  alt={work.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="text-lg font-medium text-white truncate">{work.title}</h4>
                    <p className="text-sm text-neutral-300">{work.category}</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(work)}
                    className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => work._id && handleDelete(work._id)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Work
          </motion.button>
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => resetForm()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-neutral-900 rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">
                    {editingWork ? 'Edit Work' : 'Add New Work'}
                  </h3>
                  <button
                    onClick={() => resetForm()}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newWork.title}
                      onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
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
                      value={newWork.category}
                      onChange={(e) => setNewWork({ ...newWork, category: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Image
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer block"
                      >
                        <div className="relative w-full h-40 bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
                          {newWork.thumbnail ? (
                            <img
                              src={newWork.thumbnail}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Upload className="w-8 h-8 text-neutral-500" />
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => resetForm()}
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
                      {uploadingImage ? 'Uploading...' : editingWork ? 'Update Work' : 'Add Work'}
                    </motion.button>
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

export default LatestWorksManagement;