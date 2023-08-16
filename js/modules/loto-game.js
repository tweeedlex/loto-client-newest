import * as impHttp from "./http.js";
import * as impLoto from "./navigation.js";
import * as impPopup from "./popup.js";

function generateRandomNumbersWithoutRepeats(min, max, count) {
  if (count > max - min + 1) {
    throw new Error("Can't generate random numbers without repeats");
  }

  let numbers = [];
  while (numbers.length < count) {
    let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber);
    }
  }

  return numbers;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const deleteNumbers = (card) => {
  const newCard = [...card];
  // delete 4 numbers from each row

  for (let i = 0; i < 3; i++) {
    let row = newCard.slice(i * 9, i * 9 + 9);
    let numbers = [];
    for (let j = 0; j < 9; j++) {
      if (row[j] != " ") {
        numbers.push(j);
      }
    }

    let numbersToDelete = generateRandomNumbersWithoutRepeats(0, 8, 4);
    numbersToDelete.forEach((number) => {
      row[number] = " ";
    });

    for (let j = 0; j < 9; j++) {
      newCard[i * 9 + j] = row[j];
    }
  }

  return newCard;
};

export function generateLotoCard() {
  //   Карта состоит из таблицы, 9х3 поля. Используемые номера от 1 до 90.
  // В каждой колонке карты может быть 1 или 2 числа (не 0 и не 3). В каждой строке 5 заполненных клеток. Таким образом, в карте 27 полей, 15 из которых заполнены.

  //В первой колонке используется числа от 1 до 9 (9 штук); в колонках со 2-ой по 8-ую числа одного десятка (от 10 до 19, 10 штук); и в последней 9-ой колонке числа от 80 до 90 (11 штук).

  let card = [];

  for (let i = 0; i < 27; i++) {
    card.push(0);
  }

  for (let i = 1; i <= 9; i++) {
    const column = generateRandomNumbersWithoutRepeats(i * 10 - 9, i * 10, 3);

    for (let j = 0; j < 3; j++) {
      let index = j * 9 + i - 1;
      card[index] = column[j];
    }
  }

  let isValid = false;
  let newCard;

  while (!isValid) {
    isValid = true;
    newCard = deleteNumbers(card);

    for (let i = 0; i < 9; i++) {
      if (
        newCard[i] == " " &&
        newCard[i + 9] == " " &&
        newCard[i + 18] == " "
      ) {
        isValid = false;
      }
    }

    let rows = [];
    for (let i = 1; i <= 3; i++) {
      for (let j = 0; j < 9; j++) {
        rows.push(newCard[j]);
      }
    }

    // check if each row has 5 numbers
    for (let i = 0; i < 27; i += 9) {
      let row = rows.slice(i, i + 9);
      let count = 0;
      row.forEach((cell) => {
        if (cell != " ") {
          count++;
        }
      });

      if (count != 5) {
        isValid = false;
      }
    }
  }

  // make unique id
  let id = "";
  for (let i = 0; i < 27; i++) {
    if (newCard[i] != " ") {
      id += newCard[i];
    }
  }
  id += new Date().getTime();

  // for (let i = 1; i <= 9; i++) {
  //   if (newCard[i] == " " && newCard[i + 9] == " " && newCard[i + 18] == " ") {
  //     newCard = deleteNumbers(card);
  //   }
  // }

  return { newCard, id };
}

export async function openGamePage(online, bet, bank) {
  let body = document.querySelector("main");
  body.innerHTML = `<div class="loto-game-room-page">
  <div class="loto-game-room-page-content">
    <div class="loto-game-room__gameinfo loto-gameinfo">
      <p class="loto-gameinfo__bet">Ставка: <span>${bet}р</span></p>
      <p class="loto-gameinfo__online">Игроков: <span>${online}</span></p>
      <p class="loto-gameinfo__bank">Банк: <span>${bank}р</span></p>
    </div>
    <div class="loto-game-room__gameprocess"></div>
    <div class="loto-gamemain__body">
      <div class="col-div empty-left-sidebar"></div>
      <div class="col-div loto-game-room__main loto-gamemain"></div>
      <div class="col-div information-sidebar">
        <div class="information-sidebar__item left3">
          У <span>0</span> карточек осталось 3 номера
        </div>
      </div>
    </div>
  </div>
</div>`;
}

export function showUserTickets(tickets) {
  tickets.forEach((ticket) => {
    let cells = JSON.parse(ticket.card);
    let id = ticket.id;
    let ticketsBody = document.querySelector(".loto-gamemain");
    if (ticketsBody) {
      let ticket = document.createElement("ul");
      ticket.classList.add("loto-gamemain__ticket", "bought-ticket");
      ticket.setAttribute("id", id);
      cells.forEach((cell) => {
        let ticketCell = document.createElement("li");
        ticketCell.classList.add("ticket-cell");
        ticketCell.innerHTML = cell;
        ticket.appendChild(ticketCell);
      });
      ticketsBody.appendChild(ticket);
    }
  });
}

export function createCask(cask, caskNumber, pastCasks) {
  let gameprocessBlock = document.querySelector(".loto-game-room__gameprocess");
  let caskBlock = document.createElement("div");

  caskBlock.classList.add("loto-game-room__cask");
  caskBlock.innerHTML = cask;

  let caskNumberBlock = document.createElement("span");
  caskNumberBlock.innerHTML = caskNumber;
  caskNumberBlock.classList.add("cask-number");

  // убираем все бочки что старее 5
  if (gameprocessBlock.children.length > 5) {
    gameprocessBlock.removeChild(gameprocessBlock.children[0]);
  }
  // убираем все цвета с бочек
  gameprocessBlock.querySelectorAll(".loto-game-room__cask").forEach((cask) => {
    cask.style.background = "#fff";
  });
  // удаляем предидущик номера бочки

  let allOldCasks = document.querySelectorAll(".cask-number");
  allOldCasks.forEach((oldCaskNum) => {
    if (oldCaskNum) {
      oldCaskNum.remove();
    }
  });
  // Устанавливаем желтый цвет только для последней вставленной бочки
  caskBlock.style.background = "#cac832";
  caskBlock.appendChild(caskNumberBlock);
  gameprocessBlock.appendChild(caskBlock);

  colorCask(cask, pastCasks);
}

function colorCask(cask, pastCasks) {
  let ticketsBody = document.querySelector(".loto-game-room__main");
  if (ticketsBody) {
    let tickets = ticketsBody.querySelectorAll(".loto-gamemain__ticket");
    // заполнение старых цифр которые сейчас не заполнены
    tickets.forEach((ticket) => {
      let ticketCells = ticket.querySelectorAll(".ticket-cell");
      ticketCells.forEach((cell) => {
        if (!cell.classList.contains("active")) {
          if (pastCasks.includes(Number(cell.innerHTML))) {
            cell.classList.add("active");
          }
        }
      });
    });

    // показ новой цифры
    tickets.forEach((ticket) => {
      let ticketCells = ticket.querySelectorAll(".ticket-cell");
      ticketCells.forEach((cell) => {
        if (cell.innerHTML == cask) {
          cell.classList.add("active");
        }
      });
    });
  }
}

export function checkWin(winners, bank, winnersAmount, ws) {
  let winnersIds = winners;
  let ticketsBody = document.querySelector(".loto-game-room__main");
  if (ticketsBody) {
    let tickets = ticketsBody.querySelectorAll(".loto-gamemain__ticket");
    let winTickets = 0;
    tickets.forEach((ticket) => {
      let ticketId = ticket.getAttribute("id");
      if (winnersIds.includes(ticketId)) {
        winTickets++;
      }
    });

    if (winTickets > 0) {
      impPopup.open(
        `Общая сума выиграша ${bank}, ее разделяет количество билетов: ${winnersAmount}`,
        200,
        true,
        ws
      );
      return;
    } else {
      impPopup.open(
        `К сожалению вы не смогли выиграть попробуйте еще раз.`,
        300,
        true,
        ws
      );
    }
  }
}
