import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import "./style.css";
import App from "./components/App.vue";
import Flyers from "./components/Flyers.vue";
import Booking from "./components/Booking.vue";
import HorsesOnly from "./components/HorsesOnly.vue";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";
import { GraffitiRemote } from "@graffiti-garden/implementation-remote";

const redirect = sessionStorage.redirect;
delete sessionStorage.redirect;
if (redirect && redirect !== location.href) {
  history.replaceState(null, "", redirect);
}

const routes = [
  { path: "/", component: Flyers },
  { path: "/booking", component: Booking },
  { path: "/horse", component: HorsesOnly },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App)
  .use(router)
  .use(GraffitiPlugin, {
    graffiti: new GraffitiRemote(),
  })
  .mount("#app");
