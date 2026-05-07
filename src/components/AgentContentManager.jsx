import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  HiOutlineTrash, HiOutlinePencilSquare, HiOutlineInformationCircle, HiXMark,
  HiChevronLeft, HiChevronRight
} from "react-icons/hi2";
import {
  HiSave, HiStar, HiTrash, HiPencil, HiExternalLink,
  HiUserGroup, HiTrendingUp, HiFilter, HiSearch, HiOutlineChatAlt2
} from "react-icons/hi";
import { toast } from "../utils/toast";
import {
  FaSuitcase, FaClock, FaMapMarkerAlt, FaUser, FaImage,
  FaInfoCircle, FaListAlt, FaTags, FaImages, FaVideo,
  FaBlog, FaQuoteLeft, FaChevronLeft, FaChevronRight, FaStar
} from "react-icons/fa";
import ProfileButton from "./ProfileButton";
import MediaUploader from "./MediaUploader";
import { getS3Path, sanitize } from "../utils/pathUtils";
import { getImageUrl, API_BASE, PUBLIC_FRONTEND_URL } from "../utils/api";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

/* ─── Design tokens ───────────────────────────────────────────── */
const DESIGN_TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  :root {
    --ink: #111111;
    --ink-2: #333333;
    --ink-3: #666666;
    --ink-4: #999999;
    --rule: #E8E8E8;
    --surface: #F7F7F7;
    --white: #FFFFFF;
    --accent: #C0100A;
    --accent-2: #960C07;
    --accent-muted: #FEF1F1;
    --green: #1A7A3A;
    --green-muted: #EDFAF3;
    --amber: #B45309;
    --amber-muted: #FEF3C7;
    --red: #C0100A;
    --red-muted: #FEF1F1;
    --sidebar-bg: #F2F2F2;
    --sidebar-border: rgba(0,0,0,0.06);
    --sidebar-text: #888888;
    --sidebar-active: #111111;
    --shadow-card: 0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04);
    --shadow-elevated: 0 4px 6px rgba(0,0,0,0.06), 0 10px 30px rgba(0,0,0,0.10);
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --radius-xl: 20px;
  }

  * { box-sizing: border-box; }

  .acm-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    color: var(--ink);
    background: #EFEFEF;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  .acm-root h1, .acm-root h2, .acm-root h3 {
    font-family: 'Instrument Serif', Georgia, serif;
    letter-spacing: -0.02em;
  }

  /* Nav */
  .acm-nav {
    position: sticky; top: 0; z-index: 60;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--rule);
    height: 64px;
    display: flex; align-items: center;
  }
  .acm-nav-inner {
    max-width: 1600px; width: 100%; margin: 0 auto;
    padding: 0 32px;
    display: flex; align-items: center; justify-content: space-between; gap: 24px;
  }
  .acm-nav-brand { display: flex; align-items: center; gap: 12px; }
  .acm-nav-logo {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #111111 0%, #C0100A 100%);
    border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;
  }
  .acm-nav-title { font-size: 15px; font-weight: 600; color: var(--ink); letter-spacing: -0.01em; }
  .acm-nav-sub { font-size: 11px; color: var(--ink-4); font-weight: 400; }

  .acm-select-wrap {
    display: flex; align-items: center; gap: 10px;
    background: var(--surface); border: 1px solid var(--rule);
    border-radius: var(--radius-md); padding: 0 14px; height: 38px;
    min-width: 280px; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .acm-select-wrap:focus-within {
    border-color: var(--accent); box-shadow: 0 0 0 3px rgba(192,16,10,0.1);
  }
  .acm-select-wrap select {
    background: transparent; border: none; outline: none;
    font-size: 13px; font-weight: 500; color: var(--ink); width: 100%;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .acm-select-wrap svg { color: var(--ink-4); flex-shrink: 0; }

  .acm-save-btn {
    display: flex; align-items: center; gap: 8px;
    background: var(--ink); color: white;
    border: none; border-radius: var(--radius-md); padding: 0 18px; height: 38px;
    font-size: 12px; font-weight: 600; letter-spacing: 0.01em;
    cursor: pointer; transition: background 0.15s, transform 0.1s;
    font-family: 'DM Sans', sans-serif;
  }
  .acm-save-btn:hover { background: var(--accent); }
  .acm-save-btn:active { transform: scale(0.98); }
  .acm-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Layout */
  .acm-layout {
    max-width: 1600px; margin: 0 auto; padding: 32px;
    display: grid; grid-template-columns: 270px 1fr; gap: 28px;
  }

  /* Sidebar */
  .acm-sidebar {
    position: sticky; top: 80px; align-self: start;
    background: #FFFFFF !important;
    border: 1px solid #E8E8E8;
    border-radius: var(--radius-xl);
    overflow: hidden; height: calc(100vh - 96px);
    display: flex; flex-direction: column;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
  .acm-sidebar-header {
    padding: 20px 18px 16px;
    border-bottom: 1px solid #EBEBEB;
    background: #FAFAFA;
  }
  .acm-sidebar-header-label {
    font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
    color: #AAAAAA;
  }
  .acm-sidebar-nav { padding: 10px 8px; overflow-y: auto; flex: 1; }
  .acm-sidebar-nav::-webkit-scrollbar { width: 0; }
  .acm-nav-item {
    width: 100%; display: flex; align-items: center; gap: 13px;
    padding: 11px 14px; border-radius: var(--radius-md); margin-bottom: 3px;
    border: none; background: transparent; cursor: pointer;
    color: var(--sidebar-text); text-align: left;
    transition: background 0.15s, color 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .acm-nav-item:hover { background: rgba(0,0,0,0.05); color: #111111; }
  .acm-nav-item.active { background: rgba(192,16,10,0.10); color: var(--sidebar-active); }
  .acm-nav-item-icon {
    width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 15px; transition: background 0.15s; background: rgba(0,0,0,0.07); color: #888888;
  }
  .acm-nav-item.active .acm-nav-item-icon { background: var(--accent); color: white; }
  .acm-nav-item-label { font-size: 15px; font-weight: 500; }
  .acm-nav-item-dot {
    margin-left: auto; width: 5px; height: 5px; border-radius: 50%;
    background: var(--accent); opacity: 0;
  }
  .acm-nav-item.active .acm-nav-item-dot { opacity: 1; }

  /* Main content */
  .acm-main { min-width: 0; }
  .acm-section-header {
    display: flex; align-items: center; justify-between; gap: 16px;
    margin-bottom: 24px;
  }
  .acm-section-title { font-size: 26px; color: var(--ink); line-height: 1.1; }
  .acm-section-crumb { font-size: 12px; color: var(--ink-4); font-weight: 400; margin-top: 4px; }

  /* Cards */
  .acm-card {
    background: var(--white); border: 1px solid var(--rule);
    border-radius: var(--radius-xl); box-shadow: var(--shadow-card);
  }
  .acm-card-body { padding: 28px; }
  .acm-card-header {
    display: flex; align-items: center; gap: 14px;
    padding: 20px 28px; border-bottom: 1px solid var(--rule);
  }
  .acm-card-icon {
    width: 38px; height: 38px; border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .acm-card-title { font-size: 15px; font-weight: 600; color: var(--ink); }
  .acm-card-subtitle { font-size: 11px; color: var(--ink-4); margin-top: 2px; }

  /* Form elements */
  .acm-field { display: flex; flex-direction: column; gap: 6px; }
  .acm-label {
    font-size: 11px; font-weight: 600; color: var(--ink-3);
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .acm-input {
    height: 40px; padding: 0 14px;
    background: var(--surface); border: 1px solid var(--rule);
    border-radius: var(--radius-md); font-size: 13px; font-weight: 500; color: var(--ink);
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
    font-family: 'DM Sans', sans-serif; width: 100%;
  }
  .acm-input:focus {
    border-color: var(--accent); box-shadow: 0 0 0 3px rgba(192,16,10,0.1);
    background: white;
  }
  .acm-input:disabled { opacity: 0.4; cursor: not-allowed; }
  .acm-textarea {
    padding: 12px 14px; resize: vertical;
    background: var(--surface); border: 1px solid var(--rule);
    border-radius: var(--radius-md); font-size: 13px; font-weight: 400; color: var(--ink);
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
    font-family: 'DM Sans', sans-serif; width: 100%; line-height: 1.5;
  }
  .acm-textarea:focus {
    border-color: var(--accent); box-shadow: 0 0 0 3px rgba(192,16,10,0.1);
    background: white;
  }

  /* Grid */
  .acm-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .acm-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .acm-span-2 { grid-column: span 2; }

  /* Tags */
  .acm-tag-container {
    background: var(--surface); border: 1px solid var(--rule);
    border-radius: var(--radius-md); padding: 10px; min-height: 80px;
    display: flex; flex-wrap: wrap; gap: 8px; align-content: flex-start;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .acm-tag-container:focus-within {
    border-color: var(--accent); box-shadow: 0 0 0 3px rgba(192,16,10,0.1); background: white;
  }
  .acm-tag {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; background: white; border: 1px solid var(--rule);
    border-radius: 100px; font-size: 12px; font-weight: 500; color: var(--ink);
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .acm-tag button { display: flex; align-items: center; color: var(--ink-4); background: none; border: none; cursor: pointer; padding: 0; transition: color 0.1s; }
  .acm-tag button:hover { color: var(--red); }
  .acm-tag-input {
    background: transparent; border: none; outline: none;
    font-size: 13px; font-weight: 400; color: var(--ink); min-width: 120px;
    font-family: 'DM Sans', sans-serif; padding: 4px 2px;
  }

  /* Buttons */
  .acm-btn-primary {
    display: inline-flex; align-items: center; gap: 7px;
    background: var(--ink); color: white; border: none;
    border-radius: var(--radius-md); padding: 0 16px; height: 36px;
    font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .acm-btn-primary:hover { background: var(--accent); }
  .acm-btn-secondary {
    display: inline-flex; align-items: center; gap: 7px;
    background: transparent; color: var(--ink-2); border: 1px solid var(--rule);
    border-radius: var(--radius-md); padding: 0 16px; height: 36px;
    font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .acm-btn-secondary:hover { border-color: var(--ink-3); color: var(--ink); background: var(--surface); }
  .acm-btn-ghost {
    background: none; border: none; color: var(--ink-4); cursor: pointer;
    padding: 6px; border-radius: var(--radius-sm); transition: color 0.15s, background 0.15s;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Sans', sans-serif;
  }
  .acm-btn-ghost:hover { color: var(--ink); background: var(--surface); }
  .acm-btn-danger-ghost {
    background: none; border: none; color: var(--ink-4); cursor: pointer;
    padding: 6px; border-radius: var(--radius-sm); transition: color 0.15s, background 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .acm-btn-danger-ghost:hover { color: var(--red); background: var(--red-muted); }
  .acm-btn-add-dashed {
    width: 100%; padding: 18px; border: 1.5px dashed var(--rule);
    border-radius: var(--radius-lg); background: none; cursor: pointer;
    font-size: 12px; font-weight: 600; color: var(--ink-4);
    text-transform: uppercase; letter-spacing: 0.06em;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .acm-btn-add-dashed:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-muted); }

  /* Badges */
  .acm-badge {
    display: inline-flex; align-items: center; padding: 3px 10px;
    border-radius: 100px; font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
  }
  .acm-badge-green { background: var(--green-muted); color: var(--green); }
  .acm-badge-blue { background: var(--accent-muted); color: var(--accent); }
  .acm-badge-amber { background: var(--amber-muted); color: var(--amber); }
  .acm-badge-gray { background: var(--surface); color: var(--ink-3); border: 1px solid var(--rule); }

  /* Table-style stats */
  .acm-stat-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid var(--rule);
  }
  .acm-stat-row:last-child { border-bottom: none; }
  .acm-stat-label { font-size: 12px; font-weight: 500; color: var(--ink-3); }
  .acm-stat-value { font-size: 18px; font-weight: 600; color: var(--ink); font-family: 'Instrument Serif', serif; }

  /* Empty states */
  .acm-empty {
    padding: 64px 32px; text-align: center;
    border: 1.5px dashed var(--rule); border-radius: var(--radius-xl);
  }
  .acm-empty-icon {
    width: 52px; height: 52px; background: var(--surface); border-radius: var(--radius-lg);
    display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--ink-4);
  }
  .acm-empty-title { font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
  .acm-empty-text { font-size: 13px; color: var(--ink-4); }

  /* Package cards */
  .acm-pkg-card {
    background: white; border: 1px solid var(--rule); border-radius: var(--radius-xl);
    overflow: hidden; box-shadow: var(--shadow-card); transition: box-shadow 0.2s, transform 0.2s;
    display: flex; flex-direction: column;
  }
  .acm-pkg-card:hover { box-shadow: var(--shadow-elevated); transform: translateY(-2px); }
  .acm-pkg-img { position: relative; height: 180px; overflow: hidden; }
  .acm-pkg-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
  .acm-pkg-card:hover .acm-pkg-img img { transform: scale(1.04); }
  .acm-pkg-img-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(12,17,23,0.75) 0%, transparent 60%);
  }
  .acm-pkg-img-badges { position: absolute; top: 12px; left: 12px; display: flex; gap: 6px; }
  .acm-pkg-img-title { position: absolute; bottom: 12px; left: 14px; right: 14px; }
  .acm-pkg-img-dest { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.7); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 5px; }
  .acm-pkg-img-name { font-size: 15px; font-weight: 600; color: white; line-height: 1.3; font-family: 'Instrument Serif', serif; }
  .acm-pkg-body { padding: 16px 16px 14px; flex: 1; display: flex; flex-direction: column; gap: 12px; }
  .acm-pkg-meta { display: flex; gap: 16px; }
  .acm-pkg-meta-item { display: flex; flex-direction: column; gap: 2px; }
  .acm-pkg-meta-key { font-size: 10px; font-weight: 600; color: var(--ink-4); text-transform: uppercase; letter-spacing: 0.06em; }
  .acm-pkg-meta-val { font-size: 13px; font-weight: 600; color: var(--ink); }
  .acm-pkg-actions { display: flex; gap: 8px; margin-top: auto; }

  /* Review cards */
  .acm-review-card {
    background: white; border: 1px solid var(--rule); border-radius: var(--radius-xl);
    padding: 20px; box-shadow: var(--shadow-card); transition: box-shadow 0.2s;
    cursor: pointer;
  }
  .acm-review-card:hover { box-shadow: var(--shadow-elevated); }

  /* Pagination */
  .acm-pagination { display: flex; align-items: center; gap: 4px; }
  .acm-page-btn {
    width: 32px; height: 32px; border-radius: var(--radius-sm);
    border: 1px solid var(--rule); background: white; color: var(--ink-3);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    font-size: 12px; font-weight: 600; transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .acm-page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  .acm-page-btn.active { background: var(--ink); color: white; border-color: var(--ink); }
  .acm-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* Modal */
  .acm-modal-backdrop {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(12,17,23,0.7); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .acm-modal {
    background: white; border-radius: var(--radius-xl);
    width: 100%; max-width: 860px; max-height: 90vh;
    display: flex; flex-direction: column;
    box-shadow: 0 25px 50px rgba(0,0,0,0.25); border: 1px solid var(--rule);
    animation: acmModalIn 0.2s ease-out;
  }
  @keyframes acmModalIn {
    from { opacity: 0; transform: translateY(12px) scale(0.98); }
    to   { opacity: 1; transform: none; }
  }
  .acm-modal-header {
    padding: 20px 24px; border-bottom: 1px solid var(--rule);
    display: flex; align-items: center; justify-content: space-between;
  }
  .acm-modal-title { font-size: 18px; color: var(--ink); font-family: 'Instrument Serif', serif; }
  .acm-modal-subtitle { font-size: 12px; color: var(--ink-4); margin-top: 2px; }
  .acm-modal-body { padding: 24px; overflow-y: auto; flex: 1; }
  .acm-modal-footer {
    padding: 16px 24px; border-top: 1px solid var(--rule);
    display: flex; align-items: center; justify-content: flex-end; gap: 10px;
  }
  .acm-modal-close {
    width: 34px; height: 34px; background: var(--surface); border: 1px solid var(--rule);
    border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--ink-3); transition: all 0.15s;
  }
  .acm-modal-close:hover { background: var(--ink); color: white; border-color: var(--ink); }

  /* Divider */
  .acm-divider { border: none; border-top: 1px solid var(--rule); margin: 0; }

  /* Quill overrides */
  .acm-quill .ql-toolbar.ql-snow {
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    border: 1px solid var(--rule) !important;
    background: var(--surface); padding: 8px !important;
    font-family: 'DM Sans', sans-serif;
  }
  .acm-quill .ql-container.ql-snow {
    border: 1px solid var(--rule) !important; border-top: none !important;
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    font-family: 'DM Sans', sans-serif; font-size: 13px;
  }
  .acm-quill .ql-editor { min-height: 200px; line-height: 1.6; color: var(--ink); }
  .acm-quill .ql-editor:focus { outline: none; }

  /* Testimonial */
  .acm-testimonial-card {
    background: white; border: 1px solid var(--rule); border-radius: var(--radius-xl);
    padding: 24px; box-shadow: var(--shadow-card); position: relative;
  }
  .acm-testimonial-remove {
    position: absolute; top: 16px; right: 16px; opacity: 0; transition: opacity 0.15s;
  }
  .acm-testimonial-card:hover .acm-testimonial-remove { opacity: 1; }

  /* Branch card */
  .acm-branch-card {
    background: white; border: 1px solid var(--rule); border-radius: var(--radius-xl);
    padding: 24px; box-shadow: var(--shadow-card); position: relative;
  }
  .acm-branch-num {
    font-size: 11px; font-weight: 700; color: var(--accent); text-transform: uppercase;
    letter-spacing: 0.08em; margin-bottom: 16px;
  }

  /* Blog card */
  .acm-blog-card {
    background: white; border: 1px solid var(--rule); border-radius: var(--radius-xl);
    overflow: hidden; box-shadow: var(--shadow-card);
  }
  .acm-blog-card-bar {
    height: 3px; background: linear-gradient(90deg, var(--accent), #111111);
  }
  .acm-blog-card-body { padding: 24px; }

  /* Day plan */
  .acm-day-card {
    background: var(--surface); border: 1px solid var(--rule); border-radius: var(--radius-lg);
    padding: 14px 16px; position: relative;
  }
  .acm-day-badge {
    width: 28px; height: 28px; background: var(--ink); color: white;
    border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; flex-shrink: 0;
  }

  /* Star rating */
  .acm-stars { display: flex; gap: 3px; }
  .acm-star { color: var(--rule); font-size: 13px; }
  .acm-star.filled { color: #F59E0B; }

  /* Loading spinner */
  .acm-spin {
    width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Landing empty */
  .acm-landing {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 480px; text-align: center;
    background: white; border: 1px solid var(--rule); border-radius: var(--radius-xl);
    box-shadow: var(--shadow-card);
  }
  .acm-landing-icon {
    width: 64px; height: 64px;
    background: linear-gradient(135deg, #111111, #C0100A);
    border-radius: var(--radius-xl);
    display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: white;
  }
  .acm-landing h3 { font-size: 22px; color: var(--ink); margin-bottom: 8px; }
  .acm-landing p { font-size: 13px; color: var(--ink-4); max-width: 280px; line-height: 1.6; }

  @media (max-width: 1024px) {
    .acm-layout { grid-template-columns: 1fr; padding: 20px; }
    .acm-sidebar { position: static; height: auto; flex-direction: row; border-radius: var(--radius-lg); overflow-x: auto; }
    .acm-sidebar-header { display: none; }
    .acm-sidebar-nav { display: flex; padding: 8px; overflow-x: auto; overflow-y: hidden; }
    .acm-nav-item { white-space: nowrap; flex-shrink: 0; }
    .acm-grid-2, .acm-grid-3 { grid-template-columns: 1fr; }
    .acm-span-2 { grid-column: auto; }
  }
`;

/* ─── Sub-components ──────────────────────────────────────────── */
const Field = ({ label, id, name, type = "text", value, onChange, placeholder, disabled }) => (
  <div className="acm-field">
    <label htmlFor={id} className="acm-label">{label}</label>
    <input
      type={type} id={id} name={name || id} value={value || ""} onChange={onChange}
      disabled={disabled} placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      className="acm-input"
    />
  </div>
);

const TextAreaField = ({ label, id, name, rows = 4, value, onChange, placeholder }) => (
  <div className="acm-field">
    <label htmlFor={id} className="acm-label">{label}</label>
    <textarea
      id={id} name={name || id} value={value || ""} onChange={onChange}
      rows={rows} placeholder={placeholder} className="acm-textarea"
    />
  </div>
);

const TagInput = ({ label, value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState("");
  const tags = Array.isArray(value) ? value : (typeof value === "string" ? value.split(",").map(t => t.trim()).filter(Boolean) : []);

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) onChange([...tags, newTag]);
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="acm-field">
      <label className="acm-label">{label}</label>
      <div className="acm-tag-container">
        {tags.map((tag, idx) => (
          <span key={idx} className="acm-tag">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))}><HiXMark size={11} /></button>
          </span>
        ))}
        <input
          type="text" value={inputValue}
          onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : "Add more…"} className="acm-tag-input"
        />
      </div>
    </div>
  );
};

const Stars = ({ value }) => (
  <div className="acm-stars">
    {[1,2,3,4,5].map(i => (
      <FaStar key={i} className={`acm-star ${i <= value ? "filled" : ""}`} />
    ))}
  </div>
);

const ControlledEditor = ({ value, onChange, placeholder, minHeight = "240px" }) => {
  const [local, setLocal] = useState(value);
  useEffect(() => { if (value !== local) setLocal(value); }, [value]);
  const handleChange = (c) => { setLocal(c); onChange(c); };
  return (
    <div className="acm-quill">
      <ReactQuill theme="snow" value={local || ""} onChange={handleChange} style={{ minHeight }} placeholder={placeholder} />
    </div>
  );
};

const Pagination = ({ current, total, onChange }) => {
  if (total <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 20 }}>
      <div className="acm-pagination">
        <button className="acm-page-btn" disabled={current === 1} onClick={() => onChange(current - 1)}>
          <FaChevronLeft size={10} />
        </button>
        {[...Array(total)].map((_, i) => (
          <button key={i} className={`acm-page-btn ${current === i + 1 ? "active" : ""}`} onClick={() => onChange(i + 1)}>{i + 1}</button>
        ))}
        <button className="acm-page-btn" disabled={current === total} onClick={() => onChange(current + 1)}>
          <FaChevronRight size={10} />
        </button>
      </div>
    </div>
  );
};

const TestimonialEditor = ({ testimonials, onChange, agentName }) => {
  const handleAdd = () => onChange([...testimonials, { name: "", text: "", rating: 5, image: "", profile: "", date: "" }]);
  const handleRemove = (idx) => onChange(testimonials.filter((_, i) => i !== idx));
  const handleUpdate = (idx, field, value) => onChange(testimonials.map((t, i) => i === idx ? { ...t, [field]: value } : t));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {testimonials.map((t, idx) => (
        <div key={idx} className="acm-testimonial-card">
          <div className="acm-testimonial-remove">
            <button className="acm-btn-danger-ghost" onClick={() => handleRemove(idx)}><HiTrash size={16} /></button>
          </div>
          <div className="acm-grid-2" style={{ gap: 16 }}>
            <Field label="Customer name" value={t.name} onChange={(e) => handleUpdate(idx, "name", e.target.value)} />
            <div className="acm-field">
              <label className="acm-label">Review date</label>
              <input type="date" value={t.date ? (t.date.includes('-') ? t.date : new Date(t.date).toISOString().split('T')[0]) : ''}
                onChange={(e) => handleUpdate(idx, "date", e.target.value)} className="acm-input" />
            </div>
            <div className="acm-span-2">
              <TextAreaField label="Review" value={t.text} onChange={(e) => handleUpdate(idx, "text", e.target.value)} rows={3} />
            </div>
            <MediaUploader label="Trip photo" existingUrls={t.image ? [t.image] : []} onChange={(urls) => handleUpdate(idx, "image", urls[0] || "")} folder={getS3Path.agentTestimonials(agentName)} />
            <MediaUploader label="Customer photo" existingUrls={t.profile ? [t.profile] : []} onChange={(urls) => handleUpdate(idx, "profile", urls[0] || "")} folder={getS3Path.agentTestimonials(agentName)} />
          </div>
        </div>
      ))}
      <button className="acm-btn-add-dashed" onClick={handleAdd}>+ Add testimonial</button>
    </div>
  );
};

/* ─── Section definitions ─────────────────────────────────────── */
const SECTIONS = [
  { id: "photo",          label: "Profile Photo",icon: <FaUser size={13} />,          accent: "#C0100A" },
  { id: "bannerImage",    label: "Banner",       icon: <FaImage size={13} />,         accent: "#1C5FE5" },
  { id: "branchAddresses",label: "Branches",     icon: <FaMapMarkerAlt size={13} />,  accent: "#0E7A50" },
  { id: "overview",       label: "Overview",     icon: <FaInfoCircle size={13} />,    accent: "#6366F1" },
  { id: "quickInfo",      label: "Quick Info",   icon: <FaListAlt size={13} />,       accent: "#0891B2" },
  { id: "services",       label: "Services",     icon: <FaSuitcase size={13} />,      accent: "#059669" },
  { id: "tourPackages",   label: "Packages",     icon: <FaSuitcase size={13} />,      accent: "#1C5FE5" },
  { id: "agentPhotos",    label: "Gallery",      icon: <FaImages size={13} />,        accent: "#DB2777" },
  { id: "agentVideos",    label: "Videos",       icon: <FaVideo size={13} />,         accent: "#DC2626" },
  { id: "reviewsList",    label: "Reviews",      icon: <FaStar size={13} />,          accent: "#D97706" },
  { id: "blogs",          label: "Blog",         icon: <FaBlog size={13} />,          accent: "#7C3AED" },
  { id: "testimonials",   label: "Testimonials", icon: <HiOutlineChatAlt2 size={14} />, accent: "#BE185D" },
  { id: "teamProfile",    label: "Team",         icon: <HiUserGroup size={14} />,     accent: "#1C5FE5" },
];

const ITEMS_PER_PAGE = 6;

/* ─── Main component ──────────────────────────────────────────── */
const AgentContentManager = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedSection, setSelectedSection] = useState("photo");
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itineraries, setItineraries] = useState([]);
  const [itinerariesLoading, setItinerariesLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [publicReviews, setPublicReviews] = useState([]);
  const [publicReviewsLoading, setPublicReviewsLoading] = useState(false);
  const [showReviewEditModal, setShowReviewEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [itineraryPage, setItineraryPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [itineraryUpdating, setItineraryUpdating] = useState(false);

  const agentName = agentData ? (agentData.company || `${agentData.firstName} ${agentData.lastName}`) : "unknown";

  /* Handlers */
  const handleBranchChange = (idx, e) => {
    const { name, value } = e.target;
    const next = [...agentData.branchAddresses];
    next[idx] = { ...next[idx], [name]: value };
    setAgentData({ ...agentData, branchAddresses: next });
  };
  const addBranch = () => setAgentData({ ...agentData, branchAddresses: [...(agentData.branchAddresses || []), { houseNo: "", street: "", area: "", city: "", postalCode: "", country: "" }] });
  const removeBranch = (idx) => setAgentData({ ...agentData, branchAddresses: agentData.branchAddresses.filter((_, i) => i !== idx) });

  useEffect(() => { fetchAgents(); }, []);
  useEffect(() => { if (selectedAgentId) fetchAgentDetails(selectedAgentId); else setAgentData(null); }, [selectedAgentId]);
  useEffect(() => {
    if (selectedAgentId && selectedSection === "tourPackages") { fetchItineraries(selectedAgentId); setItineraryPage(1); }
    if (selectedAgentId && selectedSection === "reviewsList") { fetchPublicReviews(selectedAgentId); setReviewPage(1); }
  }, [selectedAgentId, selectedSection]);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/agents`, { headers: { Authorization: `Bearer ${token}` } });
      setAgents(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchAgentDetails = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/agents/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAgentData(res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchItineraries = async (agentId) => {
    setItinerariesLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/agent-itineraries?agentId=${agentId}`, { headers: { Authorization: `Bearer ${token}` } });
      setItineraries(res.data.data || []);
    } catch (err) { console.error(err); } finally { setItinerariesLoading(false); }
  };

  const fetchPublicReviews = async (agentId) => {
    setPublicReviewsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/agents/all/reviews`, { headers: { Authorization: `Bearer ${token}` } });
      const id = agentId?._id || agentId;
      setPublicReviews((res.data.data || []).filter(r => r.agentId === id || r.agentId?._id === id));
    } catch (err) { console.error(err); } finally { setPublicReviewsLoading(false); }
  };

  const deleteReview = async (reviewId) => {
    const result = await Swal.fire({ title: "Delete review?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#C0392B", confirmButtonText: "Delete" });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE}/api/agents/reviews/${reviewId}`, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Review deleted"); fetchPublicReviews(selectedAgentId);
      } catch { toast.error("Failed to delete review"); }
    }
  };

  const updateReview = async () => {
    try {
      const token = localStorage.getItem("token");
      if (editingReview._id) {
        await axios.put(`${API_BASE}/api/agents/reviews/${editingReview._id}`, editingReview, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Review updated");
      } else {
        await axios.post(`${API_BASE}/api/agents/${selectedAgentId}/reviews`, editingReview, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Review created");
      }
      setShowReviewEditModal(false); fetchPublicReviews(selectedAgentId);
    } catch { toast.error("Failed to save review"); }
  };

  const handleSave = async () => {
    if (!selectedAgentId || !agentData) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      let payload = {};
      if (selectedSection === "quickInfo") payload = { company: agentData.company, description: agentData.description, phone: agentData.phone, email: agentData.email, photo: agentData.photo, tags: agentData.tags, quickInfo: agentData.quickInfo };
      else if (selectedSection === "photo") payload = { photo: agentData.photo };
      else if (selectedSection === "blogs") { const cleaned = (agentData.blogs || []).map(b => { const c = {...b}; if (c._id?.startsWith?.("temp-")) delete c._id; return c; }); payload = { blogs: cleaned }; }
      else if (selectedSection === "bannerImage") payload = { bannerImage: agentData.bannerImage };
      else if (selectedSection === "overview") payload = { overview: agentData.overview };
      else if (selectedSection === "services") payload = { services: agentData.services };
      else if (selectedSection === "agentVideos") payload = { agentVideos: agentData.agentVideos };
      else if (selectedSection === "teamProfile") payload = { firstName: agentData.firstName, lastName: agentData.lastName, whatsapp: agentData.whatsapp, website: agentData.website };
      else payload = { [selectedSection]: agentData[selectedSection] };

      await axios.put(`${API_BASE}/api/agents/${selectedAgentId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Changes saved"); fetchAgentDetails(selectedAgentId);
    } catch { toast.error("Failed to save changes"); } finally { setSaving(false); }
  };

  /* ─── Section renderers ────────────────────────────────────── */
  const renderSection = () => {
    if (!agentData) return null;

    switch (selectedSection) {
      case "bannerImage":
        return (
          <div className="acm-card">
            <div className="acm-card-header">
              <div className="acm-card-icon" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}><FaImage size={16} /></div>
              <div><div className="acm-card-title">Banner images</div><div className="acm-card-subtitle">Hero images displayed on the public profile</div></div>
            </div>
            <div className="acm-card-body">
              <MediaUploader label="Upload banners" existingUrls={agentData.bannerImage} onChange={(urls) => setAgentData({ ...agentData, bannerImage: urls })} folder={getS3Path.agentBanner(agentName)} />
            </div>
          </div>
        );

      case "photo":
        return (
          <div className="acm-card">
            <div className="acm-card-header">
              <div className="acm-card-icon" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}><FaUser size={16} /></div>
              <div><div className="acm-card-title">Profile image</div><div className="acm-card-subtitle">Logo or agent photo displayed on the public profile</div></div>
            </div>
            <div className="acm-card-body">
              <MediaUploader label="Upload photo" existingUrls={agentData.photo ? [agentData.photo] : []} onChange={(urls) => setAgentData({ ...agentData, photo: urls[0] || "" })} folder={getS3Path.agentBanner(agentName)} maxFiles={1} />
            </div>
          </div>
        );

      case "overview":
        return (
          <div className="acm-card">
            <div className="acm-card-header">
              <div className="acm-card-icon" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}><FaInfoCircle size={16} /></div>
              <div><div className="acm-card-title">Agency overview</div><div className="acm-card-subtitle">Formatted narrative displayed on the public profile</div></div>
            </div>
            <div className="acm-card-body">
              <ControlledEditor value={agentData.overview || ""} onChange={(v) => setAgentData({ ...agentData, overview: v })} placeholder="Describe your agency's story, expertise, and mission…" />
            </div>
          </div>
        );

      case "quickInfo":
        return (
          <div className="acm-card">
            <div className="acm-card-header">
              <div className="acm-card-icon" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}><FaListAlt size={16} /></div>
              <div><div className="acm-card-title">Quick info</div><div className="acm-card-subtitle">Key facts and logistical details</div></div>
            </div>
            <div className="acm-card-body">
              <ControlledEditor value={agentData.quickInfo || ""} onChange={(v) => setAgentData({ ...agentData, quickInfo: v })} placeholder="Add booking info, response times, specialisations…" minHeight="180px" />
            </div>
          </div>
        );

      case "services":
        return (
          <div className="acm-card">
            <div className="acm-card-header">
              <div className="acm-card-icon" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}><FaSuitcase size={16} /></div>
              <div><div className="acm-card-title">Services offered</div><div className="acm-card-subtitle">Press Enter or comma to add a service tag</div></div>
            </div>
            <div className="acm-card-body">
              <TagInput label="Services" value={agentData.services || []} onChange={(v) => setAgentData({ ...agentData, services: v })} placeholder="Type a service and press Enter…" />
            </div>
          </div>
        );

      case "agentVideos":
        return (
          <div className="acm-card">
            <div className="acm-card-header">
              <div className="acm-card-icon" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}><FaVideo size={16} /></div>
              <div><div className="acm-card-title">Video portfolio</div><div className="acm-card-subtitle">Upload videos showcasing tours and destinations</div></div>
            </div>
            <div className="acm-card-body">
              <MediaUploader label="Videos" accept="video/*" existingUrls={agentData.agentVideos || []} onChange={(urls) => setAgentData({ ...agentData, agentVideos: urls })} folder={getS3Path.agentVideos(agentName)} maxFiles={10} />
            </div>
          </div>
        );

      case "teamProfile":
        return (
          <div className="acm-card">
            <div className="acm-card-header">
              <div className="acm-card-icon" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}><HiUserGroup size={18} /></div>
              <div><div className="acm-card-title">Team profile</div><div className="acm-card-subtitle">Personal details and contact information</div></div>
            </div>
            <div className="acm-card-body">
              <div className="acm-grid-2">
                <Field label="First name" value={agentData.firstName} onChange={(e) => setAgentData({ ...agentData, firstName: e.target.value })} />
                <Field label="Last name" value={agentData.lastName} onChange={(e) => setAgentData({ ...agentData, lastName: e.target.value })} />
                <Field label="WhatsApp" value={agentData.whatsapp} onChange={(e) => setAgentData({ ...agentData, whatsapp: e.target.value })} />
                <Field label="Website" value={agentData.website} onChange={(e) => setAgentData({ ...agentData, website: e.target.value })} />
              </div>
            </div>
          </div>
        );

      case "agentPhotos":
        return (
          <div className="acm-card">
            <div className="acm-card-header">
              <div className="acm-card-icon" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}><FaImages size={16} /></div>
              <div><div className="acm-card-title">Photo gallery</div><div className="acm-card-subtitle">Images displayed in the agency's public gallery</div></div>
            </div>
            <div className="acm-card-body">
              <MediaUploader label="Gallery images" existingUrls={agentData.agentPhotos} onChange={(urls) => setAgentData({ ...agentData, agentPhotos: urls })} folder={getS3Path.agentGallery(agentName)} maxFiles={50} />
            </div>
          </div>
        );

      case "branchAddresses":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(agentData.branchAddresses || []).map((addr, idx) => (
              <div key={addr._id || `branch-${idx}`} className="acm-branch-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="acm-branch-num">Branch {idx + 1}</div>
                  <button className="acm-btn-danger-ghost" onClick={() => removeBranch(idx)}><HiTrash size={15} /></button>
                </div>
                <div className="acm-grid-3">
                  <Field label="Building / No." name="houseNo" value={addr.houseNo} onChange={(e) => handleBranchChange(idx, e)} />
                  <Field label="Street" name="street" value={addr.street} onChange={(e) => handleBranchChange(idx, e)} />
                  <Field label="Area" name="area" value={addr.area} onChange={(e) => handleBranchChange(idx, e)} />
                  <Field label="City" name="city" value={addr.city} onChange={(e) => handleBranchChange(idx, e)} />
                  <Field label="Postal code" name="postalCode" value={addr.postalCode} onChange={(e) => handleBranchChange(idx, e)} />
                  <Field label="Country" name="country" value={addr.country} onChange={(e) => handleBranchChange(idx, e)} />
                </div>
              </div>
            ))}
            <button className="acm-btn-add-dashed" onClick={addBranch}>+ Add branch location</button>
          </div>
        );

      case "tourPackages":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="acm-card">
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", fontFamily: "'Instrument Serif', serif" }}>Travel packages</div>
                  <div style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>Itineraries assigned to this agent</div>
                </div>
                <button className="acm-btn-secondary" onClick={() => fetchItineraries(selectedAgentId)}>
                  <HiTrendingUp size={14} /> Refresh
                </button>
              </div>
            </div>

            {itinerariesLoading ? (
              <div style={{ textAlign: "center", padding: "64px 32px", color: "var(--ink-4)", fontSize: 13 }}>Loading packages…</div>
            ) : itineraries.length === 0 ? (
              <div className="acm-empty">
                <div className="acm-empty-icon"><FaSuitcase size={22} /></div>
                <div className="acm-empty-title">No packages assigned</div>
                <div className="acm-empty-text">Link itineraries to this agent to build their inventory.</div>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {itineraries.slice((itineraryPage - 1) * ITEMS_PER_PAGE, itineraryPage * ITEMS_PER_PAGE).map((it) => (
                    <div key={it._id} className="acm-pkg-card">
                      <div className="acm-pkg-img">
                        <img src={getImageUrl(it.coverImageUrl)} alt="" />
                        <div className="acm-pkg-img-overlay" />
                        <div className="acm-pkg-img-badges">
                          <span className="acm-badge acm-badge-gray" style={{ fontSize: 10 }}>{it.type}</span>
                          {it.visibility === "Public" && <span className="acm-badge acm-badge-green" style={{ fontSize: 10 }}>Active</span>}
                        </div>
                        <div className="acm-pkg-img-title">
                          <div className="acm-pkg-img-dest"><FaMapMarkerAlt size={9} /> {it.destination}</div>
                          <div className="acm-pkg-img-name">{it.title}</div>
                        </div>
                      </div>
                      <div className="acm-pkg-body">
                        <div className="acm-pkg-meta">
                          <div className="acm-pkg-meta-item">
                            <span className="acm-pkg-meta-key">Duration</span>
                            <span className="acm-pkg-meta-val">{it.duration}</span>
                          </div>
                          <div className="acm-pkg-meta-item">
                            <span className="acm-pkg-meta-key">Price</span>
                            <span className="acm-pkg-meta-val" style={{ color: "var(--green)" }}>{it.asBestQuote ? "Best Quote" : `₹${it.discountedPrice || it.priceFrom}`}</span>
                          </div>
                        </div>
                        <div className="acm-pkg-actions">
                          <button className="acm-btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: 11 }} onClick={() => { setSelectedItinerary(it); setShowEditModal(true); }}>
                            <HiOutlinePencilSquare size={14} /> Edit package
                          </button>
                          <button className="acm-btn-secondary" style={{ width: 36, padding: 0, justifyContent: "center" }} onClick={() => window.open(`${PUBLIC_FRONTEND_URL}/itinerary/${it.slug}`, "_blank")}>
                            <HiExternalLink size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination current={itineraryPage} total={Math.ceil(itineraries.length / ITEMS_PER_PAGE)} onChange={setItineraryPage} />
              </>
            )}
          </div>
        );

      case "reviewsList": {
        const avgRating = (publicReviews.reduce((a, c) => a + c.rating, 0) / Math.max(1, publicReviews.length)).toFixed(1);
        return (
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }}>
            {/* Stats panel */}
            <div className="acm-card" style={{ padding: "20px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 16, fontFamily: "'Instrument Serif', serif" }}>Overview</div>
              <div className="acm-stat-row"><span className="acm-stat-label">Total reviews</span><span className="acm-stat-value">{publicReviews.length}</span></div>
              <div className="acm-stat-row"><span className="acm-stat-label">Average rating</span><span className="acm-stat-value" style={{ color: "#D97706" }}>{avgRating}</span></div>
              <button className="acm-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16, fontSize: 11 }} onClick={() => { setEditingReview({ userName: "", rating: 5, comment: "", images: [], agentId: selectedAgentId }); setShowReviewEditModal(true); }}>
                + New review
              </button>
            </div>

            {/* Reviews list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {publicReviewsLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: "var(--ink-4)", fontSize: 13 }}>Loading reviews…</div>
              ) : publicReviews.length === 0 ? (
                <div className="acm-empty">
                  <div className="acm-empty-icon"><HiOutlineChatAlt2 size={22} /></div>
                  <div className="acm-empty-title">No reviews yet</div>
                  <div className="acm-empty-text">Reviews submitted by customers will appear here.</div>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                    {publicReviews.slice((reviewPage - 1) * ITEMS_PER_PAGE, reviewPage * ITEMS_PER_PAGE).map(rev => (
                      <div key={rev._id} className="acm-review-card" onClick={() => { setEditingReview(rev); setShowReviewEditModal(true); }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "var(--ink-3)" }}>
                              {rev.userName?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{rev.userName}</div>
                              <Stars value={rev.rating} />
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="acm-btn-ghost" onClick={(e) => { e.stopPropagation(); setEditingReview(rev); setShowReviewEditModal(true); }}><HiPencil size={14} /></button>
                            <button className="acm-btn-danger-ghost" onClick={(e) => { e.stopPropagation(); deleteReview(rev._id); }}><HiTrash size={14} /></button>
                          </div>
                        </div>
                        <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6, margin: 0 }}>"{rev.comment}"</p>
                        {rev.images?.length > 0 && (
                          <div style={{ display: "flex", gap: 6, marginTop: 10, overflowX: "auto" }}>
                            {rev.images.map((img, i) => <img key={i} src={getImageUrl(img)} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} alt="" />)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <Pagination current={reviewPage} total={Math.ceil(publicReviews.length / ITEMS_PER_PAGE)} onChange={setReviewPage} />
                </>
              )}
            </div>
          </div>
        );
      }

      case "blogs":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{(agentData.blogs || []).length} article{(agentData.blogs || []).length !== 1 ? "s" : ""}</div>
              <button className="acm-btn-primary" style={{ fontSize: 11 }} onClick={() => setAgentData({ ...agentData, blogs: [{ _id: `temp-${Date.now()}`, title: "", content: "", image: "", isPublished: true, createdAt: new Date() }, ...(agentData.blogs || [])] })}>
                + New article
              </button>
            </div>
            {(agentData.blogs || []).map((blog, idx) => (
              <div key={blog._id || `blog-${idx}`} className="acm-blog-card">
                <div className="acm-blog-card-bar" />
                <div className="acm-blog-card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span className="acm-badge acm-badge-blue">Article {idx + 1}</span>
                    <button className="acm-btn-danger-ghost" onClick={() => setAgentData({ ...agentData, blogs: agentData.blogs.filter((_, i) => i !== idx) })}><HiTrash size={15} /></button>
                  </div>
                  <div className="acm-grid-2" style={{ gap: 20 }}>
                    <div className="acm-field">
                      <label className="acm-label">Title</label>
                      <input className="acm-input" value={blog.title} onChange={(e) => { const n = [...agentData.blogs]; n[idx].title = e.target.value; setAgentData({ ...agentData, blogs: n }); }} placeholder="Article title" />
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                      <MediaUploader label="Feature image" existingUrls={blog.image ? [blog.image] : []} onChange={(urls) => { const n = [...agentData.blogs]; n[idx].image = urls[0]; setAgentData({ ...agentData, blogs: n }); }} folder={getS3Path.blog(agentName, blog.title)} />
                    </div>
                    <div className="acm-span-2">
                      <div className="acm-field">
                        <label className="acm-label">Content</label>
                        <ControlledEditor value={blog.content} onChange={(v) => { const n = [...agentData.blogs]; n[idx].content = v; setAgentData({ ...agentData, blogs: n }); }} placeholder="Write your article…" minHeight="220px" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(agentData.blogs || []).length === 0 && <div className="acm-empty"><div className="acm-empty-icon"><FaBlog size={20} /></div><div className="acm-empty-title">No articles yet</div><div className="acm-empty-text">Create your first article to share travel stories.</div></div>}
          </div>
        );

      case "testimonials":
        return <TestimonialEditor testimonials={agentData.testimonials || []} onChange={(v) => setAgentData({ ...agentData, testimonials: v })} agentName={agentName} />;

      default: return null;
    }
  };

  const currentSection = SECTIONS.find(s => s.id === selectedSection);

  return (
    <div className="acm-root">
      <style>{DESIGN_TOKENS}</style>

      {/* Nav */}
      <nav className="acm-nav">
        <div className="acm-nav-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div className="acm-nav-brand">
              <div className="acm-nav-logo"><FaUser size={14} /></div>
              <div>
                <div className="acm-nav-title">Content Manager</div>
              </div>
            </div>
            <div style={{ width: 1, height: 28, background: "var(--rule)" }} />
            <div className="acm-select-wrap">
              <HiSearch size={14} />
              <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)}>
                <option value="">Select a partner…</option>
                {agents.map(a => <option key={a._id} value={a._id}>{a.firstName} {a.lastName} ({a.company || 'Individual'})</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {selectedAgentId && (
              <button className="acm-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? <div className="acm-spin" /> : <HiSave size={14} />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            )}
            <div style={{ width: 34, height: 34, borderRadius: "var(--radius-sm)", background: "var(--surface)", border: "1px solid var(--rule)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-4)" }}>
              {agentData?.photo ? <img src={getImageUrl(agentData.photo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <FaUser size={14} />}
            </div>
          </div>
        </div>
      </nav>

      {/* Layout */}
      <div className="acm-layout">
        {/* Sidebar */}
        <aside className="acm-sidebar">
          <div className="acm-sidebar-header">
            <div className="acm-sidebar-header-label">Sections</div>
          </div>
          <nav className="acm-sidebar-nav">
            {SECTIONS.map(s => (
              <button key={s.id} className={`acm-nav-item ${selectedSection === s.id ? "active" : ""}`} onClick={() => setSelectedSection(s.id)}>
                <div className="acm-nav-item-icon">{s.icon}</div>
                <span className="acm-nav-item-label">{s.label}</span>
                <div className="acm-nav-item-dot" />
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="acm-main">
          {!selectedAgentId ? (
            <div className="acm-landing">
              <div className="acm-landing-icon"><FaUser size={26} /></div>
              <h3>Select a partner to begin</h3>
              <p>Choose a verified travel partner from the dropdown above to manage their profile content.</p>
            </div>
          ) : loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-4)", fontSize: 13 }}>Loading profile…</div>
          ) : (
            <>
              <div className="acm-section-header" style={{ marginBottom: 20 }}>
                <div>
                  <h2 className="acm-section-title">{currentSection?.label}</h2>
                  <div className="acm-section-crumb">{agentName} · {currentSection?.label}</div>
                </div>
              </div>
              {renderSection()}
            </>
          )}
        </main>
      </div>

      {/* Itinerary modal */}
      {showEditModal && selectedItinerary && (
        <div className="acm-modal-backdrop">
          <div className="acm-modal" style={{ maxWidth: 900 }}>
            <div className="acm-modal-header">
              <div>
                <div className="acm-modal-title">Edit package</div>
                <div className="acm-modal-subtitle">{selectedItinerary.title}</div>
              </div>
              <button className="acm-modal-close" onClick={() => setShowEditModal(false)}><HiXMark size={16} /></button>
            </div>
            <div className="acm-modal-body" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="acm-grid-2">
                <Field label="Title" value={selectedItinerary.title} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, title: e.target.value })} />
                <Field label="Duration" value={selectedItinerary.duration} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, duration: e.target.value })} />
                <Field label="Destination" value={selectedItinerary.destination} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, destination: e.target.value })} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Standard rate" type="number" value={selectedItinerary.priceFrom} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, priceFrom: e.target.value })} />
                  <Field label="Offer rate" type="number" value={selectedItinerary.discountedPrice} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, discountedPrice: e.target.value })} />
                </div>
              </div>

              <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: 20, border: "1px solid var(--rule)" }}>
                <MediaUploader label="Cover image" existingUrls={selectedItinerary.gallery || [selectedItinerary.coverImageUrl].filter(Boolean)} onChange={(urls) => setSelectedItinerary({ ...selectedItinerary, gallery: urls, coverImageUrl: urls[0] || "" })} onBusy={setMediaBusy} folder={getS3Path.itinerary(agentName, selectedItinerary.title)} />
              </div>

              <TextAreaField label="Description" rows={5} value={selectedItinerary.destinationDetail || selectedItinerary.shortDescription} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, destinationDetail: e.target.value, shortDescription: e.target.value })} />

              <div className="acm-grid-2">
                <TextAreaField label="Inclusions" value={Array.isArray(selectedItinerary.inclusions) ? selectedItinerary.inclusions.join(", ") : selectedItinerary.inclusions} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, inclusions: e.target.value })} rows={4} />
                <TextAreaField label="Exclusions" value={Array.isArray(selectedItinerary.exclusions) ? selectedItinerary.exclusions.join(", ") : selectedItinerary.exclusions} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, exclusions: e.target.value })} rows={4} />
              </div>

              {/* Day plans */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)" }}>Day-by-day itinerary</div>
                  <button className="acm-btn-secondary" style={{ fontSize: 11 }} onClick={() => setSelectedItinerary({ ...selectedItinerary, dayPlans: [...(selectedItinerary.dayPlans || []), { day: (selectedItinerary.dayPlans || []).length + 1, title: `Day ${(selectedItinerary.dayPlans || []).length + 1}`, locationDetail: "" }] })}>
                    + Add day
                  </button>
                </div>
                {(!selectedItinerary.dayPlans || selectedItinerary.dayPlans.length === 0) ? (
                  <div className="acm-empty" style={{ padding: "32px 20px" }}>
                    <div className="acm-empty-text">No day plans added yet.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selectedItinerary.dayPlans.map((plan, i) => (
                      <div key={i} className="acm-day-card">
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div className="acm-day-badge">D{plan.day}</div>
                          <div style={{ flex: 1 }}>
                            <input className="acm-input" value={plan.title} onChange={(e) => { const n = [...selectedItinerary.dayPlans]; n[i].title = e.target.value; setSelectedItinerary({ ...selectedItinerary, dayPlans: n }); }} style={{ marginBottom: 8, fontWeight: 600 }} />
                            <textarea className="acm-textarea" rows={2} value={plan.locationDetail} onChange={(e) => { const n = [...selectedItinerary.dayPlans]; n[i].locationDetail = e.target.value; setSelectedItinerary({ ...selectedItinerary, dayPlans: n }); }} placeholder="Description…" />
                          </div>
                          <button className="acm-btn-danger-ghost" onClick={() => setSelectedItinerary({ ...selectedItinerary, dayPlans: selectedItinerary.dayPlans.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, day: idx + 1 })) })}><HiXMark size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="acm-modal-footer">
              <button className="acm-btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="acm-btn-primary" disabled={itineraryUpdating || mediaBusy} onClick={async () => {
                setItineraryUpdating(true);
                try {
                  const token = localStorage.getItem("token");
                  await axios.put(`${API_BASE}/api/agent-itineraries/${selectedItinerary.slug}`, selectedItinerary, { headers: { Authorization: `Bearer ${token}` } });
                  toast.success("Package updated"); setShowEditModal(false); fetchItineraries(selectedAgentId);
                } catch { toast.error("Failed to update package"); } finally { setItineraryUpdating(false); }
              }}>
                {(itineraryUpdating || mediaBusy) && <div className="acm-spin" />}
                {mediaBusy ? "Uploading…" : itineraryUpdating ? "Saving…" : "Save package"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      {showReviewEditModal && editingReview && (
        <div className="acm-modal-backdrop">
          <div className="acm-modal" style={{ maxWidth: 640 }}>
            <div className="acm-modal-header">
              <div>
                <div className="acm-modal-title">{editingReview._id ? "Edit review" : "New review"}</div>
                <div className="acm-modal-subtitle">Customer feedback entry</div>
              </div>
              <button className="acm-modal-close" onClick={() => setShowReviewEditModal(false)}><HiXMark size={16} /></button>
            </div>
            <div className="acm-modal-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="acm-grid-2">
                <Field label="Reviewer name" value={editingReview.userName} onChange={(e) => setEditingReview({ ...editingReview, userName: e.target.value })} />
                <div className="acm-field">
                  <label className="acm-label">Rating</label>
                  <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setEditingReview({ ...editingReview, rating: s })}
                        style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", border: "1px solid", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.1s", background: editingReview.rating >= s ? "#F59E0B" : "var(--surface)", borderColor: editingReview.rating >= s ? "#F59E0B" : "var(--rule)", color: editingReview.rating >= s ? "white" : "var(--ink-4)" }}>
                        <FaStar size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <TextAreaField label="Review text" rows={5} value={editingReview.comment} onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })} placeholder="Customer's feedback…" />
              <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: 16, border: "1px solid var(--rule)" }}>
                <MediaUploader label="Attached images" existingUrls={editingReview.images || []} onChange={(urls) => setEditingReview({ ...editingReview, images: urls })} onBusy={setMediaBusy} folder={getS3Path.agentReviews(agentName)} maxFiles={5} />
              </div>
            </div>
            <div className="acm-modal-footer">
              <button className="acm-btn-secondary" onClick={() => setShowReviewEditModal(false)}>Cancel</button>
              <button className="acm-btn-primary" disabled={mediaBusy} onClick={updateReview}>
                {mediaBusy && <div className="acm-spin" />}
                {mediaBusy ? "Uploading…" : "Save review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentContentManager;