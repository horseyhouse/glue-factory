import { createApp } from "vue";
import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import "./style.css";
import App from "./components/App.vue";
import Flyers from "./components/Flyers.vue";
import Booking from "./components/Booking.vue";

const routes = [
  { path: "/", component: Flyers },
  { path: "/booking", component: Booking },
];
const router = createRouter({
  history: ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? createWebHashHistory()
    : createWebHistory(),
  routes,
});

createApp(App).use(router).mount("#app");
