import React, { useState, useEffect } from 'react';
import { HiGlobeAlt, HiOfficeBuilding, HiPhotograph, HiPencil, HiTrash, HiUpload } from 'react-icons/hi';
import ProfileButton from '../components/ProfileButton';
import MediaUploader from '../components/MediaUploader';
import { getS3Path } from '../utils/pathUtils';

const CreateCity = () => {
  const [travelType, setTravelType] = useState('Domestic');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCityToEdit, setSelectedCityToEdit] = useState('');
  const [cityName, setCityName] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [categories, setCategories] = useState({
    Trending: false,
    Exclusive: false,
    Popular: false,
    New: false,
  });
  const [images, setImages] = useState(null);

  const [cityImages, setCityImages] = useState([]);
  
  const [destinations] = useState(() => {
    const saved = localStorage.getItem('destinations');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Andaman', type: 'Domestic' },
      { id: 2, name: 'Andhra Pradesh', type: 'Domestic' },
      { id: 3, name: 'Bali', type: 'International' },
    ];
  });

  const [cities, setCities] = useState([
    { id: 1, name: 'Port Blair', destination: 'Andaman', travelType: 'Domestic', visibility: 'Public', categories: ['Trending'] },
    { id: 2, name: 'Havelock', destination: 'Andaman', travelType: 'Domestic', visibility: 'Public', categories: ['Popular'] },
    { id: 3, name: 'Ubud', destination: 'Bali', travelType: 'International', visibility: 'Public', categories: ['Exclusive'] },
  ]);

  const filteredStates = destinations.filter(d => d.type === travelType);
  const citiesInState = cities.filter(c => c.destination === selectedState);

  useEffect(() => {
    if (selectedCityToEdit) {
      const city = cities.find(c => c.id === parseInt(selectedCityToEdit));
      if (city) {
        setCityName(city.name);
        setVisibility(city.visibility || 'Public');
        const newCats = { Trending: false, Exclusive: false, Popular: false, New: false };
        city.categories?.forEach(cat => {
          if (newCats.hasOwnProperty(cat)) newCats[cat] = true;
        });
        setCategories(newCats);
      }
    } else {
      setCityName('');
      setVisibility('Public');
      setCategories({ Trending: false, Exclusive: false, Popular: false, New: false });
    }
  }, [selectedCityToEdit, cities]);

  const handleCategoryChange = (cat) => {
    setCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!cityName || !selectedState) return;

    const activeCategories = Object.keys(categories).filter(k => categories[k]);

    if (selectedCityToEdit) {
      // Update existing
      setCities(cities.map(c => c.id === parseInt(selectedCityToEdit) ? {
        ...c,
        name: cityName,
        visibility,
        categories: activeCategories,
        travelType,
        destination: selectedState,
        images: cityImages,
      } : c));
      alert("City updated successfully!");
    } else {
      // Create new
      const newCity = {
        id: Date.now(),
        name: cityName,
        destination: selectedState,
        travelType,
        visibility,
        categories: activeCategories,
        images: cityImages,
      };
      setCities([...cities, newCity]);
      alert("City created successfully!");
    }

    // Reset form
    setCityName('');
    setCityImages([]);
    setCategories({ Trending: false, Exclusive: false, Popular: false, New: false });
    setSelectedCityToEdit('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 font-sans">City Management</h1>
              <p className="text-slate-500 mt-1">Create a new city by selecting a state.</p>
            </div>
            <ProfileButton />
          </div>
        </header>

        {/* Selection Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Travel Type */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Travel Type</label>
              <div className="flex gap-6 mt-2">
                {['Domestic', 'International'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="travelType"
                      value={type}
                      checked={travelType === type}
                      onChange={(e) => {
                        setTravelType(e.target.value);
                        setSelectedState('');
                        setSelectedCityToEdit('');
                      }}
                      className="w-4 h-4 text-red-600 focus:ring-red-500 border-slate-300"
                    />
                    <span className="text-slate-600 font-medium group-hover:text-red-600 transition-colors">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Select State */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Select State</label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCityToEdit('');
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all bg-white text-slate-600"
              >
                <option value="">-- Select a State --</option>
                {filteredStates.map((dest) => (
                  <option key={dest.id} value={dest.name}>{dest.name}</option>
                ))}
              </select>
            </div>

            {/* Select City (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Select City (Optional)</label>
              <select
                value={selectedCityToEdit}
                onChange={(e) => setSelectedCityToEdit(e.target.value)}
                disabled={!selectedState}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all bg-white text-slate-600 disabled:bg-slate-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Select to Edit --</option>
                {citiesInState.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow overflow-hidden">
          <div className="h-10 bg-slate-50 border-b border-slate-200"></div>
          <form onSubmit={handleSave} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* City Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">City Name</label>
                <input
                  type="text"
                  placeholder="e.g., Los Angeles"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                />
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all bg-slate-50 text-slate-600 font-medium"
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                  <option value="Hidden">Hidden</option>
                </select>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-600 block">Categories</label>
              <div className="flex flex-col gap-3">
                {Object.keys(categories).map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group w-fit">
                    <input
                      type="checkbox"
                      checked={categories[cat]}
                      onChange={() => handleCategoryChange(cat)}
                      className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* City Images */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">City Images</label>
              <MediaUploader
                label=""
                existingUrls={cityImages}
                onChange={(urls) => setCityImages(urls)}
                multiple={true}
                folder={getS3Path.city(selectedState, cityName)}
                baseFileName={cityName}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-red-200 active:transform active:scale-95"
                disabled={!cityName || !selectedState}
              >
                {selectedCityToEdit ? "Update City" : "Create City"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCity;
