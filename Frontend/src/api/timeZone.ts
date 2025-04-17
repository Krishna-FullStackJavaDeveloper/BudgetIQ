// API calls for users
import axios from "axios";

const API_URL = "http://localhost:1711/api/timezones";

export const getTimezone = async () => {
    return axios.get(`${API_URL}/with-country`);
  };