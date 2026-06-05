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
export const getAttendeeSaved = (email) =>
  client.get(`/attendee/${email}/saved`).then((r) => r.data);
export const toggleAttendeeSaved = (email, body) =>
  client.post(`/attendee/${email}/saved`, body).then((r) => r.data);
export const getAttendeeHistory = (email) =>
  client.get(`/attendee/${email}/history`).then((r) => r.data);

// ---------- Organizer Portal ----------
export const organizerLogin = (body) =>
  client.post("/organizer/login", body).then((r) => r.data);
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
