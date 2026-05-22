/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ScheduledPost, SocialPlatform } from "../types";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Image as ImageIcon,
  CheckSquare,
  Facebook,
  Instagram,
  Linkedin,
  FileCode,
  AlertTriangle
} from "lucide-react";

export const SmartCalendar: React.FC = () => {
  const { posts, createPost, editPost, deletePost } = useApp();

  const [viewType, setViewType] = useState<"month" | "weekly">("month");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);

  // Form states for create/edit
  const [formTopic, setFormTopic] = useState("");
  const [formCaption, setFormCaption] = useState("");
  const [formHashtags, setFormHashtags] = useState("");
  const [formDate, setFormDate] = useState("2026-05-23");
  const [formTime, setFormTime] = useState("15:00");
  const [formPlatforms, setFormPlatforms] = useState<SocialPlatform[]>(["Instagram"]);
  const [formImage, setFormImage] = useState<string | undefined>(undefined);

  // Calendar navigation offsets (Focusing around May 2026)
  const [selectedYear] = useState(2026);
  const [selectedMonth] = useState(4); // 4 = May (0-indexed)

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper May 2026 Layout parameters
  // May 1st, 2026 is a Friday.
  // We offset blank spaces before Friday:
  const blankDaysCount = 5; // Monday=0, Tue=1, Wed=2, Thu=3, Fri=4 -> offset by 5 days (Sunday starting)
  const totalDaysInMay = 31;

  // Render arrays
  const calendarDays = Array.from({ length: totalDaysInMay }, (_, i) => i + 1);

  const handleOpenCreateModal = (day?: number) => {
    setEditingPost(null);
    setFormTopic("");
    setFormCaption("");
    setFormHashtags("");
    setFormDate(day ? `2026-05-${day.toString().padStart(2, "0")}` : "2026-05-23");
    setFormTime("12:00");
    setFormPlatforms(["Instagram"]);
    setFormImage(undefined);
    setModalOpen(true);
  };

  const handleOpenEditModal = (post: ScheduledPost) => {
    setEditingPost(post);
    setFormTopic(post.topic);
    setFormCaption(post.caption);
    setFormHashtags(post.hashtags.join(", "));
    
    // Parse scheduled date/time
    const dateObj = new Date(post.scheduledTime);
    const yearStr = dateObj.getFullYear();
    const monthStr = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const dayStr = dateObj.getDate().toString().padStart(2, "0");
    
    setFormDate(`${yearStr}-${monthStr}-${dayStr}`);
    setFormTime(`${dateObj.getHours().toString().padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}`);
    
    setFormPlatforms(post.platforms);
    setFormImage(post.imageUrl);
    setModalOpen(true);
  };

  // Simulated image upload drag/drop decoder
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePlatformSelection = (p: SocialPlatform) => {
    setFormPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Assemble scheduled date payload
    const dateTimeString = `${formDate}T${formTime}:00`;
    let parsedTags = formHashtags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));

    if (parsedTags.length === 0) {
      parsedTags = ["#SocialMediaHub"];
    }

    if (editingPost) {
      // Edit mode
      editPost({
        ...editingPost,
        topic: formTopic,
        caption: formCaption,
        hashtags: parsedTags,
        scheduledTime: new Date(dateTimeString).toISOString(),
        platforms: formPlatforms,
        imageUrl: formImage,
      });
    } else {
      // Create mode
      createPost({
        topic: formTopic,
        caption: formCaption,
        hashtags: parsedTags,
        optimalPostingTime: "Custom Slot Selected",
        scheduledTime: new Date(dateTimeString).toISOString(),
        platforms: formPlatforms,
        imageUrl: formImage,
      });
    }

    setModalOpen(false);
  };

  // Filters posts strictly according to calendar days
  const getPostsForDay = (day: number) => {
    return posts.filter((post) => {
      const postDate = new Date(post.scheduledTime);
      return (
        postDate.getFullYear() === selectedYear &&
        postDate.getMonth() === selectedMonth &&
        postDate.getDate() === day
      );
    });
  };

  const handlePostDropReschedule = (postId: string, newDay: number) => {
    const pObj = posts.find((p) => p.id === postId);
    if (!pObj) return;

    const dateObj = new Date(pObj.scheduledTime);
    dateObj.setDate(newDay);
    editPost({
      ...pObj,
      scheduledTime: dateObj.toISOString(),
    });
  };

  const getPlatformIcon = (plat: SocialPlatform) => {
    switch (plat) {
      case "Facebook":
        return <Facebook className="h-3 w-3 text-blue-600 shrink-0" />;
      case "Instagram":
        return <Instagram className="h-3 w-3 text-pink-500 shrink-0" />;
      case "LinkedIn":
        return <Linkedin className="h-3 w-3 text-blue-700 shrink-0" />;
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Intro block */}
      <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
            Social Queue Planner
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Publish campaigns fluidly. Click dates in the grid to schedule new content.
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex items-center space-x-3">
          <nav className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setViewType("month")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                viewType === "month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-950"
              }`}
            >
              Month Track
            </button>
            <button
              onClick={() => setViewType("weekly")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                viewType === "weekly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-950"
              }`}
            >
              Agenda Queue
            </button>
          </nav>

          <button
            onClick={() => handleOpenCreateModal()}
            className="flex items-center space-x-1.5 py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold tracking-tight shadow-sm shadow-indigo-100 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Post</span>
          </button>
        </div>
      </div>

      {/* Main Grid Block */}
      {viewType === "month" ? (
        <div className="border border-gray-150 rounded-2xl bg-white overflow-hidden shadow-sm">
          {/* Calendar Header */}
          <div className="flex justify-between items-center py-4 px-6 border-b bg-gray-50/50">
            <span className="font-display text-base font-bold text-gray-950 flex items-center space-x-1">
              <CalendarIcon className="h-4.5 w-4.5 text-indigo-600 mr-1 shrink-0" />
              <span>{monthNames[selectedMonth]} {selectedYear}</span>
            </span>
            <span className="text-[10px] font-semibold text-gray-400 font-mono">
              PRE-FLIGHT SCHEDULER ACTIVE
            </span>
          </div>

          {/* Weekday indicator labels */}
          <div className="grid grid-cols-7 border-b text-center py-2.5 text-xs font-bold text-gray-400 tracking-wider font-display bg-gray-50/30 uppercase">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Date cells grid */}
          <div className="grid grid-cols-7 border-collapse">
            {/* Blanks */}
            {Array.from({ length: blankDaysCount }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-28 border-r border-b border-gray-100 bg-gray-50/30" />
            ))}

            {/* Days cells */}
            {calendarDays.map((day) => {
              const dayPosts = getPostsForDay(day);
              return (
                <div
                  key={day}
                  onClick={() => {
                    if (dayPosts.length === 0) handleOpenCreateModal(day);
                  }}
                  className={`min-h-28 border-r border-b border-gray-100 p-2.5 flex flex-col justify-between transition-colors cursor-pointer group ${
                    day === 22 ? "bg-indigo-50/20" : "hover:bg-gray-50/40"
                  }`}
                  id={`calendar_day_cell_${day}`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${
                      day === 22
                        ? "h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm"
                        : "text-gray-900 font-mono"
                    }`}>
                      {day}
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCreateModal(day);
                      }}
                      className="opacity-0 group-hover:opacity-100 font-semibold text-indigo-600 hover:text-indigo-800 transition-opacity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Day Posts List */}
                  <div className="space-y-1.5 mt-2 flex-1 flex flex-col justify-end">
                    {dayPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(post);
                        }}
                        className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-1.5 text-[10px] space-y-1 leading-tight hover:bg-white hover:shadow-sm transition-all text-left"
                        id={`post_mini_card_${post.id}`}
                      >
                        <div className="font-bold text-gray-900 truncate">{post.topic}</div>
                        
                        <div className="flex justify-between items-center pt-0.5">
                          {/* Platforms */}
                          <div className="flex space-x-1">
                            {post.platforms.map((p) => (
                              <span key={p} title={p}>{getPlatformIcon(p)}</span>
                            ))}
                          </div>

                          <div className="text-[8px] text-gray-400 font-mono">
                            {new Date(post.scheduledTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda / Queue Weekly List view */
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-xs tracking-wider text-gray-400 uppercase">
            Queued Publications ({posts.length})
          </h3>

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-xs text-gray-500">
              No content scheduled in queue yet. Create or generate AI copy.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col sm:flex-row items-start gap-4"
                  id={`agenda_post_row_${post.id}`}
                >
                  {/* Thumbnail */}
                  {post.imageUrl ? (
                    <img
                      referrerPolicy="no-referrer"
                      src={post.imageUrl}
                      alt={post.topic}
                      className="h-20 w-28 rounded-xl object-cover bg-gray-100 shrink-0 self-center"
                    />
                  ) : (
                    <div className="h-20 w-28 rounded-xl bg-gray-50 border flex flex-col items-center justify-center text-gray-400 shrink-0 self-center">
                      <ImageIcon className="h-5 w-5 mb-1 text-gray-300" />
                      <span className="text-[8px] font-mono uppercase tracking-widest text-gray-400">Preview</span>
                    </div>
                  )}

                  {/* Content space */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-display font-bold text-sm text-gray-950">{post.topic}</h4>
                      <span className={`inline-block px-2 py-0.5 text-[8px] font-bold rounded uppercase ${
                        post.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"
                      }`}>
                        {post.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-650 leading-relaxed max-w-2xl line-clamp-2">
                      {post.caption}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {post.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-[9px] font-mono text-indigo-600 font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex space-x-4 pt-1 text-[10px] text-gray-400 font-medium">
                      <span className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-gray-400 shrink-0" />
                        Slot: {new Date(post.scheduledTime).toLocaleString()}
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="text-gray-400">Outlets:</span>
                        {post.platforms.map((p) => (
                          <span key={p} className="inline-block">{getPlatformIcon(p)}</span>
                        ))}
                      </span>
                    </div>
                  </div>

                  {/* Options panel */}
                  <div className="flex sm:flex-col space-x-1 sm:space-x-0 sm:space-y-1 align-middle shrink-0 w-full sm:w-auto self-end sm:self-center">
                    <button
                      onClick={() => handleOpenEditModal(post)}
                      className="flex-1 sm:flex-none text-xs text-gray-600 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50/50 p-2 rounded-lg font-semibold flex justify-center items-center gap-1 border border-gray-150"
                      id={`edit_agenda_post_btn_${post.id}`}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-xs text-gray-400 hover:text-red-600 p-2 rounded-lg flex justify-center items-center border border-gray-150"
                      title="Delete post"
                      id={`delete_agenda_post_btn_${post.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Form Scheduling Builder Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-slide-up">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-105 shadow-2xl overflow-hidden" id="calendar_post_modal">
            <div className="bg-indigo-600 px-6 py-4 text-white flex justify-between items-center">
              <span className="font-display text-sm font-bold tracking-tight">
                {editingPost ? "Edit Campaign publication" : "Schedule New Social Post"}
              </span>
              <button onClick={() => setModalOpen(false)} className="text-white hover:text-indigo-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto scrollbar">
              {/* Platforms */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                  Outlet Destination Platforms
                </label>
                <div className="flex space-x-2.5">
                  {(["Facebook", "Instagram", "LinkedIn"] as SocialPlatform[]).map((p) => {
                    const selected = formPlatforms.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlatformSelection(p)}
                        className={`py-2 px-3.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                          selected 
                            ? "border-indigo-600 bg-indigo-50/40 text-indigo-700" 
                            : "borderColor border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {getPlatformIcon(p)}
                        <span>{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic Headline */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Post Headline / Topic
                </label>
                <input
                  type="text"
                  required
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-gray-200 px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
                  placeholder="E.g., Sustainable Coffee Cup Spotlight"
                />
              </div>

              {/* Post Caption Body */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Caption Copy Body
                </label>
                <textarea
                  required
                  rows={4}
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-gray-200 px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
                  placeholder="Draft your caption copy here..."
                />
              </div>

              {/* Hashtags comma-separated */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Hashtags (separated by comma)
                </label>
                <input
                  type="text"
                  value={formHashtags}
                  onChange={(e) => setFormHashtags(e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-gray-200 px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
                  placeholder="E.g., lifestyle, minimal, ecoStyle"
                />
              </div>

              {/* Scheduled DateTime slots picker */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Target Release Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-gray-200 px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Release Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-gray-200 px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Upload Simulator representation */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Simulated Campaign Media Image
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50/50 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {formImage ? (
                    <div className="space-y-2">
                      <img
                        referrerPolicy="no-referrer"
                        src={formImage}
                        alt="Campaign media"
                        className="h-28 w-44 rounded-lg object-contain bg-gray-50 border"
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFormImage(undefined); }}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-gray-300 mb-1" />
                      <span className="text-xs font-bold text-indigo-650 hover:text-indigo-800">
                        Upload media image
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1">Supports JPEG, PNG file streams</p>
                    </>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-550 hover:bg-gray-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl font-display shadow-md shadow-indigo-100"
                  id="calendar_confirm_post_btn"
                >
                  {editingPost ? "Confirm Changes" : "Queue Publication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
