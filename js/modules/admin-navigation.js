import * as impHttp from "./http.js";
import * as impPopup from "./popup.js";

export function createAdminButton() {
  // create button in header
  const headerBlock = document.querySelector(".header__user");
  const adminButton = document.createElement("button");
  adminButton.classList.add("admin-button");
  adminButton.textContent = "Admin";
  headerBlock.appendChild(adminButton);
  adminButton.addEventListener("click", () => {
    redirectToAdminPage();
  });
}

function addAdminFunctions() {
  const rooms = document.querySelectorAll(".admin-room");

  rooms.forEach((room) => {
    const botFlag = room.querySelector(".botFlag");
    const botCountInput = room.querySelector(".botCount");
    const ticketCountInput = room.querySelector(".ticketCount");
    const winChanceInput = room.querySelector(".winChance");
    const addBotBtn = room.querySelector(".addBotBtn");
    const roomId = room.getAttribute("roomId");

    if (botFlag.checked == false) {
      botCountInput.disabled = true;
      ticketCountInput.disabled = true;
      winChanceInput.disabled = true;
    }

    addBotBtn.addEventListener("click", () => {
      const botCountInput = room.querySelector(".botCount");
      const ticketCountInput = room.querySelector(".ticketCount");
      const winChanceInput = room.querySelector(".winChance");
      const roomId = room.getAttribute("roomId");
      // validation

      if (
        botCountInput.value < 0 ||
        ticketCountInput.value < 1 ||
        ticketCountInput.value > 6 ||
        winChanceInput.value < 1 ||
        winChanceInput.value > 100
      ) {
        // show popup
        impPopup.open("Ошибка. Введены некорректные данные", 400);
        return;
      }

      setAdminSettings(roomId);
    });

    botFlag.addEventListener("change", function () {
      const isChecked = botFlag.checked;

      botCountInput.disabled = !isChecked;
      ticketCountInput.disabled = !isChecked;
      winChanceInput.disabled = !isChecked;

      room.style.backgroundColor = isChecked ? "white" : "#f7f7f7";
    });
  });
}

async function redirectToAdminPage() {
  let isCurrGamePage = document.querySelector(".loto-game-room-page");
  let isCurrLobbyPage = document.querySelector(".loto-room-page");

  if (isCurrGamePage || isCurrLobbyPage) {
    impPopup.open("Нельзя перейти в админку во время игры", 400);
    return;
  }

  const main = document.querySelector("main");
  // check if there is game in progress

  main.innerHTML = `
    <section class="admin">
      <div class="admin-room" roomId = "1">
        <h2>Комната 1</h2>
        <label> <input type="checkbox" class="botFlag botFlag-1" /> Игра с ботами </label>
        <br />
        <label>
          Макс. количество ботов, 1бот = 1человек: <input type="number" class="botCount botCount-1" />  (по стандарту 4)
        </label>
        <br />
        <label>
          Макс. количество билетов: <input type="number" class="ticketCount ticketCount-1" /> (от 1 до 6)
        </label>
        <br />
        <label>
          Шанс победы, %: <input type="number" class="winChance winChance-1" step="0.01" /> (для команды ботов, от 1 до 100)
        </label>
        <br />
        <button class="addBotBtn">Сохранить</button>
      </div>

      <div class="admin-room"  roomId = "2">
        <h2>Комната 2</h2>
        <label> <input type="checkbox" class="botFlag botFlag-2" /> Игра с ботами </label>
        <br />
        <label>
          Макс. количество ботов, 1бот = 1человек: <input type="number" class="botCount botCount-2" /> (по стандарту 4)
        </label>
        <br />
        <label>
          Макс. количество билетов на одного бота: <input type="number" class="ticketCount ticketCount-2" /> (от 1 до 6)
        </label>
        <br />
        <label>
          Шанс победы, %: <input type="number" class="winChance winChance-2" step="0.01" /> (для команды ботов, от 1 до 100%)
        </label>
        <br />
        <button class="addBotBtn">Сохранить</button>
      </div>

      <div class="admin-room" roomId = "3">
        <h2>Комната 3</h2>
        <label> <input type="checkbox" class="botFlag botFlag-3" /> Игра с ботами </label>
        <br />
        <label>
          Макс. количество ботов, 1бот = 1человек: <input type="number" class="botCount botCount-3" /> (по стандарту 4)
        </label>
        <br />
        <label>
          Макс. количество билетов: <input type="number" class="ticketCount ticketCount-3" /> (от 1 до 6)
        </label>
        <br />
        <label>
          Шанс победы: <input type="number" class="winChance winChance-3" step="0.01" /> (для команды ботов, от 1 до 100%)
        </label>
        <br />
        <button class="addBotBtn">Сохранить</button>
      </div>
    </section>
  `;
  await getAdminSettings();
  addAdminFunctions();
}

async function getAdminSettings() {
  let response = await impHttp.getLotoSettings();

  if (response.status == 200) {
    console.log(response.data);

    const rooms = document.querySelectorAll(".admin-room");

    rooms.forEach((room) => {
      const botFlag = room.querySelector(".botFlag");
      const botCountInput = room.querySelector(".botCount");
      const ticketCountInput = room.querySelector(".ticketCount");
      const winChanceInput = room.querySelector(".winChance");

      const roomId = room.getAttribute("roomId");

      const roomSettings = response.data.find(
        (item) => item.gameLevel == roomId
      );

      if (roomSettings) {
        botFlag.checked = roomSettings.allowBots;
        botCountInput.value = roomSettings.maxBots;
        ticketCountInput.value = roomSettings.maxTickets;
        winChanceInput.value = roomSettings.winChance;
      }
    });
  } else {
  }
}

async function setAdminSettings(roomId) {
  const room = document.querySelector(`.admin-room[roomId="${roomId}"]`);

  const botFlag = room.querySelector(".botFlag");
  const botCountInput = room.querySelector(".botCount");
  const ticketCountInput = room.querySelector(".ticketCount");
  const winChanceInput = room.querySelector(".winChance");

  const body = {
    allowBots: botFlag.checked,
    maxBots: botCountInput.value,
    maxTickets: ticketCountInput.value,
    winChance: winChanceInput.value,
  };

  let response = await impHttp.setLotoSettings(roomId, body);
  console.log(response.data);
}
