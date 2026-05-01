import React, { useState } from 'react';
import { HiOutlinePhotograph, HiTrash, HiCheckCircle } from 'react-icons/hi';
import ProfileButton from '../components/ProfileButton';
import MediaUploader from '../components/MediaUploader';
import { getS3Path } from '../utils/pathUtils';

const CustomerGallery = () => {
  const [selectedUrls, setSelectedUrls] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);

  const handleUpload = () => {
    if (selectedUrls.length === 0) return;
    const newImages = selectedUrls.map((url, i) => ({
      id: Date.now() + i,
      url: url,
      selected: false,
    }));
    setGalleryImages([...newImages, ...galleryImages]);
    setSelectedUrls([]);
    alert("Images added to gallery successfully!");
  };

  const toggleSelect = (id) => {
    setGalleryImages(galleryImages.map(img =>
      img.id === id ? { ...img, selected: !img.selected } : img
    ));
  };

  const deleteSelected = () => {
    const selectedCount = galleryImages.filter(img => img.selected).length;
    if (selectedCount === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedCount} selected images?`)) {
      setGalleryImages(galleryImages.filter(img => !img.selected));
    }
  };

  const selectedCount = galleryImages.filter(img => img.selected).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-900">Customer Gallery</h1>
          <ProfileButton />
        </header>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
          <div className="space-y-4">
            <MediaUploader
              label="Upload New Images (Max 50)"
              existingUrls={selectedUrls}
              onChange={(urls) => setSelectedUrls(urls)}
              multiple={true}
              folder={getS3Path.siteGallery()}
              baseFileName="customer-gallery"
            />
            <button
              onClick={handleUpload}
              disabled={selectedUrls.length === 0}
              className="w-full bg-[#94a3b8] hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-slate-200 active:transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Gallery
            </button>
          </div>
        </div>

        {/* Existing Gallery Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Existing Gallery</h2>
              <p className="text-slate-400 text-sm">Click images to select for bulk deletion.</p>
            </div>
            <button
              onClick={deleteSelected}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${selectedCount > 0
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-red-200 text-white cursor-not-allowed'
                }`}
            >
              <HiTrash className="text-xl" />
              Delete ({selectedCount}) Selected
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                onClick={() => toggleSelect(img.id)}
                className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-4 transition-all group ${img.selected ? 'border-red-500 shadow-lg scale-95' : 'border-slate-100 hover:border-red-200'
                  }`}
              >
                <img
                  src={img.url}
                  alt="Customer submission"
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                {img.selected && (
                  <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                    <HiCheckCircle className="text-white text-4xl drop-shadow-md" />
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-black/40 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] text-white truncate text-center">Customer submission</p>
                </div>
                {!img.selected && (
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <HiTrash className="text-white text-sm" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {galleryImages.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <HiOutlinePhotograph className="text-6xl mx-auto mb-4 opacity-20" />
              <p className="text-xl font-medium">Gallery is empty</p>
              <p>Upload some customer photos to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerGallery;
