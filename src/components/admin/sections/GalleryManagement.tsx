import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Edit2,
  Trash2,
  Upload,
  RotateCcw,
  Check,
  ZoomIn,
  ZoomOut,
  Move,
} from "lucide-react";
import axios from "axios";

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

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  onCrop: (croppedImage: string) => void;
  originalImage: string;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  onCrop,
  originalImage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Crop area state
  const [cropArea, setCropArea] = useState({
    x: 50,
    y: 50,
    width: 200,
    height: 150,
  });

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState("");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCrop, setInitialCrop] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const handleImageLoad = () => {
    setImageLoaded(true);
    const image = imageRef.current;
    if (!image) return;

    // Set image display dimensions (scaled to fit container)
    const maxWidth = 500;
    const maxHeight = 350;
    const imageAspect = image.naturalWidth / image.naturalHeight;

    let displayWidth, displayHeight;
    if (imageAspect > maxWidth / maxHeight) {
      displayWidth = maxWidth;
      displayHeight = maxWidth / imageAspect;
    } else {
      displayHeight = maxHeight;
      displayWidth = maxHeight * imageAspect;
    }

    setImageDimensions({ width: displayWidth, height: displayHeight });

    // Center initial crop area
    setCropArea({
      x: (displayWidth - 200) / 2,
      y: (displayHeight - 150) / 2,
      width: 200,
      height: 150,
    });
  };

  const handleMouseDown = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (type === "drag") {
      setIsDragging(true);
      setDragStart({ x: mouseX - cropArea.x, y: mouseY - cropArea.y });
    } else {
      setIsResizing(true);
      setResizeHandle(type);
      setDragStart({ x: mouseX, y: mouseY });
      setInitialCrop({ ...cropArea });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      const newX = Math.max(
        0,
        Math.min(imageDimensions.width - cropArea.width, mouseX - dragStart.x)
      );
      const newY = Math.max(
        0,
        Math.min(imageDimensions.height - cropArea.height, mouseY - dragStart.y)
      );
      setCropArea((prev) => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing) {
      const deltaX = mouseX - dragStart.x;
      const deltaY = mouseY - dragStart.y;
      let newCrop = { ...initialCrop };

      // Calculate the initial aspect ratio
      const aspectRatio = initialCrop.width / initialCrop.height;

      switch (resizeHandle) {
        case "nw":
        case "ne":
        case "sw":
        case "se":
          // For corner handles, maintain aspect ratio
          let newWidth, newHeight;

          if (resizeHandle === "se") {
            // Bottom-right: expand/contract from top-left
            newWidth = Math.max(50, initialCrop.width + deltaX);
            newHeight = newWidth / aspectRatio;
          } else if (resizeHandle === "nw") {
            // Top-left: expand/contract from bottom-right
            newWidth = Math.max(50, initialCrop.width - deltaX);
            newHeight = newWidth / aspectRatio;
            newCrop.x = Math.max(
              0,
              initialCrop.x + initialCrop.width - newWidth
            );
            newCrop.y = Math.max(
              0,
              initialCrop.y + initialCrop.height - newHeight
            );
          } else if (resizeHandle === "ne") {
            // Top-right: expand/contract from bottom-left
            newWidth = Math.max(50, initialCrop.width + deltaX);
            newHeight = newWidth / aspectRatio;
            newCrop.y = Math.max(
              0,
              initialCrop.y + initialCrop.height - newHeight
            );
          } else if (resizeHandle === "sw") {
            // Bottom-left: expand/contract from top-right
            newWidth = Math.max(50, initialCrop.width - deltaX);
            newHeight = newWidth / aspectRatio;
            newCrop.x = Math.max(
              0,
              initialCrop.x + initialCrop.width - newWidth
            );
          }

          newCrop.width = newWidth;
          newCrop.height = newHeight;
          break;

        case "n":
        case "s":
          // For top/bottom handles, adjust height and maintain ratio
          if (resizeHandle === "s") {
            newCrop.height = Math.max(50, initialCrop.height + deltaY);
          } else {
            newCrop.height = Math.max(50, initialCrop.height - deltaY);
            newCrop.y = Math.max(
              0,
              initialCrop.y + initialCrop.height - newCrop.height
            );
          }
          newCrop.width = newCrop.height * aspectRatio;

          // Center horizontally when adjusting height
          const widthDiff = newCrop.width - initialCrop.width;
          newCrop.x = Math.max(0, initialCrop.x - widthDiff / 2);
          break;

        case "w":
        case "e":
          // For left/right handles, adjust width and maintain ratio
          if (resizeHandle === "e") {
            newCrop.width = Math.max(50, initialCrop.width + deltaX);
          } else {
            newCrop.width = Math.max(50, initialCrop.width - deltaX);
            newCrop.x = Math.max(
              0,
              initialCrop.x + initialCrop.width - newCrop.width
            );
          }
          newCrop.height = newCrop.width / aspectRatio;

          // Center vertically when adjusting width
          const heightDiff = newCrop.height - initialCrop.height;
          newCrop.y = Math.max(0, initialCrop.y - heightDiff / 2);
          break;
      }

      // Ensure crop area stays within image bounds
      if (newCrop.x + newCrop.width > imageDimensions.width) {
        const scale = (imageDimensions.width - newCrop.x) / newCrop.width;
        newCrop.width *= scale;
        newCrop.height *= scale;
      }
      if (newCrop.y + newCrop.height > imageDimensions.height) {
        const scale = (imageDimensions.height - newCrop.y) / newCrop.height;
        newCrop.width *= scale;
        newCrop.height *= scale;
      }

      setCropArea(newCrop);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle("");
  };

  const handleReset = () => {
    setCropArea({
      x: (imageDimensions.width - 200) / 2,
      y: (imageDimensions.height - 150) / 2,
      width: 200,
      height: 150,
    });
  };

  const handleCrop = () => {
    const image = imageRef.current;
    if (!image || !imageLoaded) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate scale between display size and natural size
    const scaleX = image.naturalWidth / imageDimensions.width;
    const scaleY = image.naturalHeight / imageDimensions.height;

    // Set canvas size to crop area size
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Draw the cropped portion
    ctx.drawImage(
      image,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onCrop(croppedDataUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-xl p-6 max-w-5xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Crop Thumbnail</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image Container */}
          <div className="flex-1">
            <div className="relative bg-neutral-800 rounded-lg p-4">
              <div
                ref={containerRef}
                className="relative bg-neutral-700 rounded overflow-hidden mx-auto select-none"
                style={{
                  width: imageDimensions.width,
                  height: imageDimensions.height,
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {imageLoaded && (
                  <img
                    ref={imageRef}
                    src={originalImage}
                    alt="Crop"
                    className="block w-full h-full object-contain"
                    style={{
                      width: imageDimensions.width,
                      height: imageDimensions.height,
                    }}
                    draggable={false}
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60" />

                {/* Crop Area */}
                {imageLoaded && (
                  <div
                    className="absolute bg-transparent border-2 border-blue-500"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y,
                      width: cropArea.width,
                      height: cropArea.height,
                      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
                    }}
                  >
                    {/* Grid lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute left-1/3 top-0 bottom-0 w-px bg-blue-400/50" />
                      <div className="absolute left-2/3 top-0 bottom-0 w-px bg-blue-400/50" />
                      <div className="absolute top-1/3 left-0 right-0 h-px bg-blue-400/50" />
                      <div className="absolute top-2/3 left-0 right-0 h-px bg-blue-400/50" />
                    </div>

                    {/* Center drag handle */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 cursor-move flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/40 rounded transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, "drag")}
                      title="Drag to move crop area"
                    >
                      <Move className="w-4 h-4 text-white" />
                    </div>

                    {/* Resize handles */}
                    {/* Corners */}
                    <div
                      className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize"
                      onMouseDown={(e) => handleMouseDown(e, "nw")}
                    />
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize"
                      onMouseDown={(e) => handleMouseDown(e, "ne")}
                    />
                    <div
                      className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize"
                      onMouseDown={(e) => handleMouseDown(e, "sw")}
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize"
                      onMouseDown={(e) => handleMouseDown(e, "se")}
                    />

                    {/* Edges */}
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-n-resize"
                      onMouseDown={(e) => handleMouseDown(e, "n")}
                    />
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-s-resize"
                      onMouseDown={(e) => handleMouseDown(e, "s")}
                    />
                    <div
                      className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white cursor-w-resize"
                      onMouseDown={(e) => handleMouseDown(e, "w")}
                    />
                    <div
                      className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white cursor-e-resize"
                      onMouseDown={(e) => handleMouseDown(e, "e")}
                    />
                  </div>
                )}
              </div>

              {/* Hidden image for loading */}
              {!imageLoaded && (
                <img
                  ref={imageRef}
                  src={originalImage}
                  alt="Loading"
                  className="hidden"
                  onLoad={handleImageLoad}
                />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="w-full lg:w-64 space-y-4">
            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-300 mb-3">
                Crop Info
              </h4>
              <div className="space-y-2 text-xs text-neutral-400">
                <div>
                  Size: {Math.round(cropArea.width)} ×{" "}
                  {Math.round(cropArea.height)}
                </div>
                <div>
                  Ratio: {(cropArea.width / cropArea.height).toFixed(2)}:1
                </div>
                <div>
                  Position: {Math.round(cropArea.x)}, {Math.round(cropArea.y)}
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-300 mb-3">
                Instructions
              </h4>
              <div className="space-y-2 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <Move className="h-3 w-3" />
                  <span>Click center icon to drag</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 border border-white" />
                  <span>Drag to resize (keeps ratio)</span>
                </div>
                <div className="text-yellow-400">⚡ Aspect ratio locked!</div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>

              <button
                onClick={handleCrop}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Check className="h-4 w-4" />
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GalleryManagement = () => {
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GalleryEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<GalleryEvent, "_id">>({
    title: "",
    description: "",
    date: "",
    location: "",
    attendees: 0,
    category: "",
    thumbnail: "",
    images: [],
    details: "",
    type: "gallery",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [originalImageForCrop, setOriginalImageForCrop] = useState("");

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/gallery-events");
      setEvents(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Updated thumbnail upload handler
  const handleThumbnailUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://127.0.0.1:8000/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageData = `data:image/jpeg;base64,${response.data.image}`;
      setOriginalImageForCrop(imageData);
      setShowCropper(true);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setNewEvent((prev) => ({ ...prev, thumbnail: croppedImage }));
    setShowCropper(false);
    setOriginalImageForCrop("");
  };

  const handleImageUpload = async (file: File, isThumb: boolean = false) => {
    if (isThumb) {
      // Use the cropper for thumbnails
      handleThumbnailUpload(file);
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://127.0.0.1:8000/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageData = `data:image/jpeg;base64,${response.data.image}`;
      setNewEvent((prev) => ({
        ...prev,
        images: [...prev.images, imageData],
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Add new function to handle multiple image uploads:
  const handleMultipleImageUpload = async (files: FileList) => {
    try {
      setUploadingImage(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
          "http://127.0.0.1:8000/upload-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        return `data:image/jpeg;base64,${response.data.image}`;
      });

      const uploadedImages = await Promise.all(uploadPromises);

      setNewEvent((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
      setError("Failed to upload images");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingEvent) {
        await axios.put(
          `http://127.0.0.1:8000/gallery-events/${editingEvent._id}`,
          newEvent
        );
      } else {
        await axios.post("http://127.0.0.1:8000/gallery-events", newEvent);
      }

      await fetchEvents();
      setIsAddingEvent(false);
      setEditingEvent(null);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        location: "",
        attendees: 0,
        category: "",
        thumbnail: "",
        images: [],
        details: "",
        type: "gallery",
      });
    } catch (error) {
      console.error("Error saving event:", error);
      setError("Failed to save event");
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
      type: "gallery",
    });
    setIsAddingEvent(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/gallery-events/${id}`);
        await fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
        setError("Failed to delete event");
      }
    }
  };

  const removeImage = (index: number) => {
    setNewEvent((prev) => ({
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
            <p className="text-neutral-400 mt-2">
              Manage event gallery cards and their details
            </p>
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
                    <h4 className="text-lg font-medium text-white truncate">
                      {event.title}
                    </h4>
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
                        {editingEvent ? "Edit Event" : "Add New Event"}
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
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, title: e.target.value })
                          }
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
                          onChange={(e) =>
                            setNewEvent({
                              ...newEvent,
                              category: e.target.value,
                            })
                          }
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
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            description: e.target.value,
                          })
                        }
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
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, date: e.target.value })
                          }
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
                          onChange={(e) =>
                            setNewEvent({
                              ...newEvent,
                              location: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setNewEvent({
                              ...newEvent,
                              attendees: parseInt(e.target.value),
                            })
                          }
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
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, details: e.target.value })
                        }
                        rows={4}
                        className="w-full px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white resize-none"
                        required
                      />
                    </div>

                    {/* Updated Thumbnail Section */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Thumbnail Image
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer">
                          <div className="relative w-full h-40 bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
                            {newEvent.thumbnail ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={newEvent.thumbnail}
                                  alt="Thumbnail"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-white text-sm">
                                    Click to change
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Upload className="w-8 h-8 text-neutral-500 mb-2" />
                                <span className="text-xs text-neutral-500">
                                  Upload & Crop Thumbnail
                                </span>
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleThumbnailUpload(file);
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
                          <div className="relative w-full h-40 bg-neutral-800 rounded-lg border border-neutral-700 flex flex-col items-center justify-center hover:bg-neutral-700 transition-colors">
                            <Upload className="w-8 h-8 text-neutral-500 mb-2" />
                            <span className="text-xs text-neutral-500 text-center px-2">
                              Click to upload multiple images
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) {
                                handleMultipleImageUpload(files);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Progress indicator */}
                      {uploadingImage && (
                        <div className="mt-4 bg-neutral-800/50 p-4 rounded-lg border border-neutral-700">
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                            <span className="text-sm text-neutral-300">
                              Uploading images... Please wait
                            </span>
                          </div>
                        </div>
                      )}
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
                          {uploadingImage
                            ? "Uploading..."
                            : editingEvent
                            ? "Update Event"
                            : "Create Event"}
                        </motion.button>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Cropper */}
        <ImageCropper
          isOpen={showCropper}
          onClose={() => {
            setShowCropper(false);
            setOriginalImageForCrop("");
          }}
          onCrop={handleCropComplete}
          originalImage={originalImageForCrop}
        />

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default GalleryManagement;
