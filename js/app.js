import * as impAuth from "./modules/authorization.js";
// import * as impLoto from "./modules/navigation.js";
import * as impLotoNav from "./modules/loto-navigation.js";
import * as impNav from "./modules/navigation.js";
import * as impHttp from "./modules/http.js";
import * as impPopup from "./modules/popup.js";
import * as impGeneralRoom from "./modules/connect-general-ws.js";
import * as impAdminNav from "./modules/admin-navigation.js";
impAuth.registrationForm();
impAuth.createLoginForm();

if (await impAuth.isAuth()) {
  if (await impAuth.isAdmin()) {
    impAdminNav.createAdminButton();
  }
  let ws = impLotoNav.connectWebsocketFunctions();
  impNav.addListeners(ws);
}
