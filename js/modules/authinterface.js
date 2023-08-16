export function showUserInterface(user) {
  let userBlock = document.querySelector(".header__user");
  if (userBlock) {
    let userName = document.querySelector(".header__name");
    let userBalance = document.querySelector(".header__balance");

    userName.innerHTML = user.username;
    userBalance.innerHTML = user.balance;
  }
}
