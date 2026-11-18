import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, AlertCircle } from 'lucide-react';
import { createItem } from '../../services/itemService';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Electronics', 'Wallets & Accessories', 'Books & Stationery',
  'ID Cards', 'Clothing', 'Keys', 'Bags', 'Other'
];

export default function ReportLost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    approximateTime: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.category) errs.category = 'Please select a category';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.date) errs.date = 'Date is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('type', 'lost');
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('location', form.location);
      formData.append('date', form.date);
      if (form.approximateTime) formData.append('approximateTime', form.approximateTime);
      if (imageFile) formData.append('image', imageFile);

      await createItem(formData);
      toast.success('Lost item report submitted successfully!');
      navigate('/my-reports?type=lost');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report a Lost Item</h1>
        <p className="text-gray-500 text-sm mt-1">
          Provide as much detail as possible to help identify your item if someone finds it.
        </p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Item Title *</label>
            <input
              type="text"
              placeholder="e.g. Blue Dell XPS Laptop with sticker"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="input"
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="input"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="form-error">{errors.category}</p>}
            </div>

            <div>
              <label className="label">Location Lost *</label>
              <input
                type="text"
                placeholder="e.g. Science Library 2nd Floor"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="input"
              />
              {errors.location && <p className="form-error">{errors.location}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date Lost *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="input"
              />
              {errors.date && <p className="form-error">{errors.date}</p>}
            </div>

            <div>
              <label className="label">Approximate Time <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. 2:30 PM"
                value={form.approximateTime}
                onChange={e => setForm({ ...form, approximateTime: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Detailed Description *</label>
            <textarea
              rows={4}
              placeholder="Provide a detailed description of the item, colour, distinctive marks, scratches..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input resize-none"
            />
            {errors.description && <p className="form-error">{errors.description}</p>}
          </div>

          {/* Image upload */}
          <div>
            <label className="label">Photo <span className="text-gray-400 font-normal">(optional)</span></label>
            {imagePreview ? (
              <div className="relative inline-block mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700">Click to upload photo</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Submitting...' : 'Submit Lost Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
