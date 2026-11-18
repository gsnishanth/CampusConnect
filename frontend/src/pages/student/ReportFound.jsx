import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Shield, Plus, Trash2 } from 'lucide-react';
import { createItem } from '../../services/itemService';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Electronics', 'Wallets & Accessories', 'Books & Stationery',
  'ID Cards', 'Clothing', 'Keys', 'Bags', 'Other'
];

export default function ReportFound() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    approximateTime: '',
    brand: '',
    identifyingMarks: '',
    hiddenDetails: '',
  });

  const [questions, setQuestions] = useState([]);
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

  const addQuestion = () => {
    if (questions.length >= 5) {
      toast.error('Maximum of 5 verification questions allowed');
      return;
    }
    setQuestions([...questions, { question: '', answer: '' }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.category) errs.category = 'Please select a category';
    if (!form.description.trim()) errs.description = 'Public description is required';
    if (!form.location.trim()) errs.location = 'Location found is required';
    if (!form.date) errs.date = 'Date found is required';
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
      formData.append('type', 'found');
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('location', form.location);
      formData.append('date', form.date);
      if (form.approximateTime) formData.append('approximateTime', form.approximateTime);
      if (imageFile) formData.append('image', imageFile);

      // Verification details
      const verificationDetails = {
        brand: form.brand,
        identifyingMarks: form.identifyingMarks,
        hiddenDetails: form.hiddenDetails,
        additionalQuestions: questions.filter(q => q.question.trim() !== ''),
      };
      formData.append('verificationDetails', JSON.stringify(verificationDetails));

      await createItem(formData);
      toast.success('Found item reported successfully!');
      navigate('/my-reports?type=found');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report a Found Item</h1>
        <p className="text-gray-500 text-sm mt-1">
          Help return an item to its owner. Keep private details hidden to verify rightful ownership.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Public Information Card */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
            Public Information (Visible to everyone)
          </h2>

          <div>
            <label className="label">Item Title *</label>
            <input
              type="text"
              placeholder="e.g. Black Leather Wallet found near Cafe"
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
              <label className="label">Location Found *</label>
              <input
                type="text"
                placeholder="e.g. Student Center Cafeteria"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="input"
              />
              {errors.location && <p className="form-error">{errors.location}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date Found *</label>
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
                placeholder="e.g. 11:00 AM"
                value={form.approximateTime}
                onChange={e => setForm({ ...form, approximateTime: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Public Description *</label>
            <textarea
              rows={3}
              placeholder="General description without revealing secret/private details (e.g. 'Found a black bi-fold wallet near table 4')."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input resize-none"
            />
            {errors.description && <p className="form-error">{errors.description}</p>}
          </div>

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
        </div>

        {/* Private Verification Details Card */}
        <div className="card p-6 space-y-4 border-blue-200 bg-blue-50/20">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Private Verification Details
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                🔒 Only you (the finder) and admins can see these details. They are used to verify claimants. Never put sensitive passwords here.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="label">Brand / Manufacturer</label>
              <input
                type="text"
                placeholder="e.g. Tommy Hilfiger, Apple, Samsung"
                value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value })}
                className="input bg-white"
              />
            </div>
            <div>
              <label className="label">Identifying Marks / Serial #</label>
              <input
                type="text"
                placeholder="e.g. Scratch on top left, initials 'JD' inside"
                value={form.identifyingMarks}
                onChange={e => setForm({ ...form, identifyingMarks: e.target.value })}
                className="input bg-white"
              />
            </div>
          </div>

          <div>
            <label className="label">Hidden Details / Inside Contents</label>
            <textarea
              rows={2}
              placeholder="e.g. Contains a transit pass with name John, $20 cash, gym card..."
              value={form.hiddenDetails}
              onChange={e => setForm({ ...form, hiddenDetails: e.target.value })}
              className="input bg-white resize-none"
            />
          </div>

          {/* Verification Questions for Claimants */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="label mb-0">Custom Verification Questions</label>
              <button
                type="button"
                onClick={addQuestion}
                disabled={questions.length >= 5}
                className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
              >
                <Plus size={14} /> Add Question ({questions.length}/5)
              </button>
            </div>

            {questions.map((q, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">Question {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Question for claimant (e.g. What is the lock screen wallpaper?)"
                  value={q.question}
                  onChange={e => updateQuestion(idx, 'question', e.target.value)}
                  className="input text-xs"
                />
                <input
                  type="text"
                  placeholder="Correct Answer (private reference for automatic scoring)"
                  value={q.answer}
                  onChange={e => updateQuestion(idx, 'answer', e.target.value)}
                  className="input text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
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
            {loading ? 'Submitting...' : 'Submit Found Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
