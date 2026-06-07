import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API });

export const getStats = () => client.get("/stats").then((r) => r.data);
export const getCategories = () => client.get("/categories").then((r) => r.data);
export const getCities = () => client.get("/cities").then((r) => r.data);
export const getEvents = (params = {}) =>
  client.get("/events", { params }).then((r) => r.data);
export const getEvent = (id) => client.get(`/events/${id}`).then((r) => r.data);
export const getRelated = (id) =>
  client.get(`/events/${id}/related`).then((r) => r.data);
export const summarizeEvent = (id) =>
  client.post(`/events/${id}/summarize`).then((r) => r.data);
export const getRecommendations = (body) =>
  client.post("/recommendations", body).then((r) => r.data);

export const getBulkEvents = (body) =>
  client.post("/events/bulk", body).then((r) => r.data);

// ---------- Attendee / User ----------
export const attendeeLogin = (body) =>
  client.post("/attendee/login", body).then((r) => r.data);
export const attendeeRegister = (body) =>
  client.post("/attendee/register", body).then((r) => r.data);
export const attendeeForgotPassword = (body) =>
  client.post("/attendee/forgot-password", body).then((r) => r.data);
export const attendeeResetPassword = (body) =>
  client.post("/attendee/reset-password", body).then((r) => r.data);
export const getAttendeeSaved = (email) =>
  client.get(`/attendee/${email}/saved`).then((r) => r.data);
export const toggleAttendeeSaved = (email, body) =>
  client.post(`/attendee/${email}/saved`, body).then((r) => r.data);
export const getAttendeeHistory = (email) =>
  client.get(`/attendee/${email}/history`).then((r) => r.data);

// ---------- Organizer Portal ----------
export const organizerLogin = (body) =>
  client.post("/organizer/login", body).then((r) => r.data);
export const organizerRegister = (body) =>
  client.post("/organizer/register", body).then((r) => r.data);
export const organizerForgotPassword = (body) =>
  client.post("/organizer/forgot-password", body).then((r) => r.data);
export const organizerResetPassword = (body) =>
  client.post("/organizer/reset-password", body).then((r) => r.data);
export const getOrganizer = (slug) =>
  client.get(`/organizer/${slug}`).then((r) => r.data);
export const requestVerification = (slug) =>
  client.post(`/organizer/${slug}/request-verification`).then((r) => r.data);
export const getOrganizerEvents = (slug) =>
  client.get(`/organizer/${slug}/events`).then((r) => r.data);
export const createOrganizerEvent = (slug, body) =>
  client.post(`/organizer/${slug}/events`, body).then((r) => r.data);
export const updateOrganizerEvent = (slug, id, body) =>
  client.put(`/organizer/${slug}/events/${id}`, body).then((r) => r.data);
export const deleteOrganizerEvent = (slug, id) =>
  client.delete(`/organizer/${slug}/events/${id}`).then((r) => r.data);
export const getDashboard = (slug) =>
  client.get(`/organizer/${slug}/dashboard`).then((r) => r.data);
export const registerForEvent = (id, body) =>
  client.post(`/events/${id}/register`, body).then((r) => r.data);
export const trackView = (id) =>
  client.post(`/events/${id}/view`).then((r) => r.data).catch(() => {});

// ---------- Admin Portal ----------
const getAdminHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return token ? { "x-admin-key": token } : {};
};

export const adminLogin = (body) =>
  client.post("/admin/login", body).then((r) => r.data);

export const getAdminPendingEvents = () =>
  client.get("/admin/events/pending", { headers: getAdminHeaders() }).then((r) => r.data);

export const getAdminAllEvents = () =>
  client.get("/admin/events/all", { headers: getAdminHeaders() }).then((r) => r.data);

export const adminApproveEvent = (id) =>
  client.put(`/admin/events/${id}/approve`, {}, { headers: getAdminHeaders() }).then((r) => r.data);

export const adminRejectEvent = (id) =>
  client.put(`/admin/events/${id}/reject`, {}, { headers: getAdminHeaders() }).then((r) => r.data);

export const adminDeleteEvent = (id) =>
  client.delete(`/admin/events/${id}`, { headers: getAdminHeaders() }).then((r) => r.data);

export const getAdminPendingOrganizers = () =>
  client.get("/admin/organizers/pending", { headers: getAdminHeaders() }).then((r) => r.data);

export const getAdminAllOrganizers = () =>
  client.get("/admin/organizers/all", { headers: getAdminHeaders() }).then((r) => r.data);

export const getAdminVerifiedOrganizers = () =>
  client.get("/admin/organizers/verified", { headers: getAdminHeaders() }).then((r) => r.data);

export const adminVerifyOrganizer = (slug) =>
  client.put(`/admin/organizers/${slug}/verify`, {}, { headers: getAdminHeaders() }).then((r) => r.data);

export const adminRejectOrganizerVerification = (slug) =>
  client.put(`/admin/organizers/${slug}/reject`, {}, { headers: getAdminHeaders() }).then((r) => r.data);

export const adminDeleteOrganizer = (slug) =>
  client.delete(`/admin/organizers/${slug}`, { headers: getAdminHeaders() }).then((r) => r.data);
