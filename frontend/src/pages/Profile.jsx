// Profile and skills manager page
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Star, Plus, X, Quote } from 'lucide-react';

const Profile = () => {
  const { user, token, updateProfile, API_URL } = useAuth();
  const [bio, setBio] = useState(user?.bio || '');
  const [skillsOffered, setSkillsOffered] = useState(user?.skillsOffered || []);
  const [skillsNeeded, setSkillsNeeded] = useState(user?.skillsNeeded || []);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // New skill tags input state variables
  const [newOfferedSkill, setNewOfferedSkill] = useState('');
  const [newNeededSkill, setNewNeededSkill] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setSkillsOffered(user.skillsOffered || []);
      setSkillsNeeded(user.skillsNeeded || []);
      fetchReviews();
    }
  }, [user]);

  // Fetch reviews written for this user by peers
  const fetchReviews = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/reviews/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Add skill to offered list
  const handleAddOfferedSkill = (e) => {
    e.preventDefault();
    const skill = newOfferedSkill.trim();
    if (skill && !skillsOffered.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setSkillsOffered([...skillsOffered, skill]);
      setNewOfferedSkill('');
    }
  };

  const handleRemoveOfferedSkill = (indexToRemove) => {
    setSkillsOffered(skillsOffered.filter((_, idx) => idx !== indexToRemove));
  };

  // Add skill to needed list
  const handleAddNeededSkill = (e) => {
    e.preventDefault();
    const skill = newNeededSkill.trim();
    if (skill && !skillsNeeded.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setSkillsNeeded([...skillsNeeded, skill]);
      setNewNeededSkill('');
    }
  };

  const handleRemoveNeededSkill = (indexToRemove) => {
    setSkillsNeeded(skillsNeeded.filter((_, idx) => idx !== indexToRemove));
  };

  // Save profile updates to database
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    if (skillsOffered.length === 0) {
      setError('Add at least one skill you can teach.');
      setSaving(false);
      return;
    }
    if (skillsNeeded.length === 0) {
      setError('Add at least one skill you want to learn.');
      setSaving(false);
      return;
    }

    try {
      await updateProfile({
        name: user.name,
        bio,
        skillsOffered,
        skillsNeeded,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            My Profile & Skills
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage your skills and bio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Profile Edit form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              Edit Profile Info
            </h3>

            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs font-semibold">
                Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Biography / Bio
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your peers who you are..."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Skills Offered (Tags Input list) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Skills I Offer (Teach)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {skillsOffered.map((skill, idx) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveOfferedSkill(idx)}
                        className="text-indigo-400 hover:text-indigo-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOfferedSkill}
                    onChange={(e) => setNewOfferedSkill(e.target.value)}
                    placeholder="Add a skill you can teach (e.g. Python)"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddOfferedSkill}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Skills Needed (Tags Input list) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Skills I Need (Learn)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {skillsNeeded.map((skill, idx) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveNeededSkill(idx)}
                        className="text-emerald-400 hover:text-emerald-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNeededSkill}
                    onChange={(e) => setNewNeededSkill(e.target.value)}
                    placeholder="Add a skill you want to learn (e.g. Figma)"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNeededSkill}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Save changes */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Reviews lists */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-indigo-400" />
              Peer Reviews
            </h3>

            {loadingReviews ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-indigo-500"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 opacity-50 space-y-1.5">
                <Quote className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500">No reviews received yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={review.reviewer.avatar || 'https://via.placeholder.com/150'}
                          alt={review.reviewer.name}
                          className="w-8 h-8 rounded-full border border-slate-800 object-cover"
                        />
                        <div>
                          <h4 className="text-[11px] font-bold text-white leading-snug">
                            {review.reviewer.name}
                          </h4>
                          <span className="text-[9px] text-slate-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/15">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-extrabold text-amber-300">
                          {review.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
