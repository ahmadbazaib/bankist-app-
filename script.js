'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Ahmad Bazaib Wani',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2025-04-08T23:36:17.929Z',
    '2025-04-11T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US', // de-DE
};

const account2 = {
  owner: 'Junaid Farooq',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'en-GB',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

////////////////////////////////////////////
// FUNCTIONS

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth()}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const combinedMovsDates = acc.movements.map((mov, i) => ({
    movement: mov,
    movementDate: acc.movementsDates.at(i),
  }));

  if (sort) combinedMovsDates.sort((a, b) => a.movement - b.movement);
  // const movs = sort
  //   ? acc.movements.slice().sort((a, b) => a - b)
  //   : acc.movements;

  combinedMovsDates.forEach(function (obj, i) {
    const { movement, movementDate } = obj;
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(movementDate);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(movement, acc.locale, acc.currency);

    // new Intl.NumberFormat(acc.locale, {
    //   style: 'currency',
    //   currency: acc.currency,
    // }).format(movement);

    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div> <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMov}</div>
        </div>`;
    // ${movement.toFixed(2)} €
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  // labelBalance.textContent = `${acc.balance.toFixed(2)} €`;
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  // labelSumIn.textContent = `${incomes.toFixed(2)} €`;
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  // labelSumOut.textContent = `${Math.abs(out).toFixed(2)} €`;
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  // labelSumInterest.textContent = `${interest.toFixed(2)} €`;
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display Movements
  displayMovements(acc);

  // Display Balance
  calcDisplayBalance(acc);

  // Display Summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 second, stop the timer and logout the user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };
  // Set time to 5 minutes
  let time = 600;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

////////////////////////////////////////////
// EVENT HANDLER

let currentAccount, timer;

// Fake Always Logged In
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 1;

btnLogin.addEventListener('click', function (e) {
  // Prevents form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and Welcome Message
    labelWelcome.textContent = `Welcome Back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 1;

    // Create current date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };
    // const locale = navigator.language;
    // console.log(locale);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth()}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hours = `${now.getHours()}`.padStart(2, 0);
    // const minutes = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hours}:${minutes}`;

    // Clear Input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    amount <= currentAccount.balance &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer Date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);

    // Reset Timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add Movement
      currentAccount.movements.push(amount);

      // Add loan Date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset Timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }

  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;

    inputCloseUsername.value = inputClosePin.value = '';
    labelWelcome.textContent = `Log in to get started`;
  }
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
// WORKING WITH ARRAYS
/*
////////////////////////////////
// SIMPLE ARRAY METHODS

let arr = ['a', 'b', 'c', 'd', 'e'];

// SLICE
console.log(arr.slice(2));
console.log(arr.slice(2, 4));
console.log(arr.slice(-2)); // start from the second-to-last element
console.log(arr.slice(-1));
console.log(arr.slice(0, -2));
console.log(arr.slice()); // Shallow Copy
console.log([...arr]); // Shallow Copy

// SPLICE
// console.log(arr.splice(2));
arr.splice(-1);
console.log(arr);
arr.splice(1, 2);
console.log(arr);

// REVERSE
arr = ['a', 'b', 'c', 'd', 'e'];
const arr2 = ['j', 'i', 'h', 'g', 'f'];
console.log(arr2.reverse());
console.log(arr2); // Mutated original method

// CONCAT
const letters = arr.concat(arr2);
console.log(letters);
console.log([...arr, ...arr2]);

// JOIN
console.log(letters.join(' - '));


////////////////////////////////
// THE NEW 'AT' METHOD

const arr = [23, 11, 64];
console.log(arr[0]);
console.log(arr.at(0));

//getting the last element
console.log(arr[arr.length - 1]);
console.log(arr.slice(-1)[0]);
console.log(arr.at(-1));

console.log('ahmad'.at(0));
console.log('ahmad'.at(-1));


////////////////////////////////
// LOOPING ARRAYS: FOREACH METHOD

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

console.log('----forOf Loop----');
// for (const movement of movements) {
for (const [i, movement] of movements.entries()) {
  if (movement > 0) {
    console.log(`Movement ${i + 1}: You deposited ${movement}`);
  } else {
    console.log(`Movement ${i + 1}: You withdrew ${Math.abs(movement)}`);
  }
}

console.log('----forEach Loop----');
// movements.forEach(function (movement) {
movements.forEach(function (mov, i, arr) {
  if (mov > 0) {
    console.log(`Movement ${i + 1}: You deposited ${mov}`);
  } else {
    console.log(`Movement ${i + 1}: You withdrew ${Math.abs(mov)}`);
  }
});

// 0: function(200)
// 1: function(450)
// 2: function(-400)
// ...

////////////////////////////////
// FOREACH WITH MAPS AND SETS

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

// MAPS
currencies.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`);
});

// SETS
const uniqueCurrencies = new Set(['USD', 'EUR', 'USD', 'GBP', 'EUR']);
console.log(uniqueCurrencies);

uniqueCurrencies.forEach(function (value, _, map) {
  console.log(`${value}: ${value}`);
});
*/

/////////////////////////////////////////////
// CODING CHALLENGE #1
/*
Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners 
about their dog's age, and stored the data into an array (one array for each). For 
now, they are just interested in knowing whether a dog is an adult or a puppy. 
A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years 
old. 

// Your tasks: 
Create a function 'checkDogs', which accepts 2 arrays of dog's ages 
('dogsJulia' and 'dogsKate'), and does the following things: 

1. Julia found out that the owners of the first and the last two dogs actually have 
cats, not dogs! So create a shallow copy of Julia's array, and remove the cat 
ages from that copied array (because it's a bad practice to mutate function 
parameters). 

2. Create an array with both Julia's (corrected) and Kate's data. 

3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 
is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy"). 

4. Run the function for both test datasets.

Test data: 
§ Data 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3] 
§ Data 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4] 
Hints: Use tools from all lectures in this section so far.


//// Solution:
const checkDogs = function (dogsJulia, dogsKate) {
  const dogsJuliaCorrected = dogsJulia.slice();
  dogsJuliaCorrected.splice(0, 1);
  dogsJuliaCorrected.splice(-2);
  // console.log(dogsJuliaCorrected);

  // const dogsBoth = [...dogsJuliaCorrected, ...dogsKate];
  const dogs = dogsJuliaCorrected.concat(dogsKate);

  dogs.forEach(function (dog, i) {
    if (dog >= 3) {
      console.log(`Dog number ${i + 1} is an adult and is ${dog} old`);
    } else {
      console.log(`Dog number ${i + 1} is still a puppy 🐶`);
    }
  });
};

// checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);
checkDogs([9, 16, 6, 8, 3], [10, 5, 6, 1, 4]);


////////////////////////////////
// THE MAP METHOD

const euroToUsd = 1.1;

// const movementsUsd = movements.map(function (mov) {
//   return mov * euroToUsd;
// });
// .map() is a built-in JavaScript method used to create a new array by
// applying a function to each element of the original array.
const movementsUsd = movements.map(mov => mov * euroToUsd);

console.log(movements);
console.log(movementsUsd);

const movementsUsdFor = [];
for (const mov of movements) movementsUsdFor.push(mov * euroToUsd);
console.log(movementsUsdFor);

const movementsDescription = movements.map(
  (mov, i) =>
    `Movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(
      mov
    )}`
);
console.log(movementsDescription);


////////////////////////////////
// FILTER METHOD

const deposited = movements.filter(function (mov, i, arr) {
  return mov > 0;
});

console.log(movements);
console.log(deposited);

const depositedFor = [];
for (const mov of movements) if (mov > 0) depositedFor.push(mov);
console.log(depositedFor);

const withdrawals = movements.filter(mov => mov < 0);
console.log(withdrawals);


////////////////////////////////
// REDUCE METHOD

console.log(movements);

//accumulator -> SNOWBALL
// const balance = movements.reduce(function (acc, cur, i, arr) {
//   console.log(`Iteration ${i}: ${acc}`);
//   return acc + cur;
// }, 0);
// console.log(balance);

const balance = movements.reduce((acc, cur) => acc + cur, 0);
console.log(balance);

let balance2 = 0;
for (const mov of movements) balance2 += mov;
console.log(balance2);

// Maximum Value
const max = movements.reduce((acc, mov) => {
  if (acc > mov) return acc;
  else return mov;
}, movements[0]);
console.log(max);
*/

/////////////////////////////////////////////
// CODING CHALLENGE #2
/*
Let's go back to Julia and Kate's study about dogs. This time, they want to convert 
dog ages to human ages and calculate the average age of the dogs in their study. 

Your tasks: 
Create a function 'calcAverageHumanAge', which accepts an arrays of dog's 
ages ('ages'), and does the following things in order: 

1. Calculate the dog age in human years using the following formula: if the dog is 
<= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old, 
humanAge = 16 + dogAge * 4 

2. Exclude all dogs that are less than 18 human years old (which is the same as 
keeping dogs that are at least 18 years old) 

3. Calculate the average human age of all adult dogs (you should already know 
from other challenges how we calculate averages)

4. Run the function for both test datasets 

Test data: 
§ Data 1: [5, 2, 4, 1, 15, 8, 3] 
§ Data 2: [16, 6, 10, 5, 6, 1, 4] 
*/

// Solution:

// const calcAverageHumanAge = function (ages) {
//   const humanAge = ages.map(age => (age <= 2 ? 2 * age : 16 + age * 4));

//   const adults = humanAge.filter(age => age >= 18);
//   console.log(humanAge);
//   console.log(adults);
//   // const average = adults.reduce((acc, age) => acc + age, 0) / adults.length;
//   const average = adults.reduce(
//     (acc, age, i, arr) => acc + age / arr.length,
//     0
//   );
//   return average;
// };

// const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
// const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);
// console.log(avg1, avg2);

////////////////////////////////
// The MAGIC OF CHAINING METHOD

// const euroToUsd = 1.1;
// console.log(movements);

// // PIPELINE
// const totalDepositUsa = movements
//   .filter(mov => mov > 0)
//   .map((mov, i, arr) => {
//     // console.log(arr);
//     return mov * euroToUsd;
//   })
//   // .map(mov => mov * euroToUsd)
//   .reduce((acc, mov) => acc + mov, 0);

// console.log(Math.trunc(totalDepositUsa));

/////////////////////////////////////////////
// CODING CHALLENGE #3
/*
Rewrite the 'calcAverageHumanAge' function from Challenge #2, but this time 
as an arrow function, and using chaining! 

Test data: 
§ Data 1: [5, 2, 4, 1, 15, 8, 3] 
§ Data 2: [16, 6, 10, 5, 6, 1, 4] 
*/

// Solution:

// const calcAverageHumanAge2 = function (ages) {
//   const humanAge = ages.map(age => (age <= 2 ? 2 * age : 16 + age * 4));

//   const adults = humanAge.filter(age => age >= 18);
//   const average = adults.reduce(
//     (acc, age, i, arr) => acc + age / arr.length,
//     0
//   );
//   return average;
// };

// const calcAverageHumanAge = ages =>
//   ages
//     .map(age => (age <= 2 ? 2 * age : 16 + age * 4))
//     .filter(age => age >= 18)
//     .reduce((acc, age, i, arr) => acc + age / arr.length, 0);

// const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
// const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);
// console.log(avg1, avg2);

/*
////////////////////////////////
// THE FIND METHOD

const firstWithdrawal = movements.find(mov => mov < 0);
console.log(movements);
console.log(firstWithdrawal);

console.log(accounts);

const account = accounts.find(acc => acc.owner === 'Huzaif Shah');
console.log(account);

let accountUser;
for (const acc of accounts) {
  if (acc.owner === 'Huzaif Shah') {
    accountUser = acc;
    break; // Stop the loop once we find the match
  }
}
console.log(accountUser);


////////////////////////////////
// FINDLAST AND FINDLASTINDEX METHODS

console.log(movements);

const lastWithdrawal = movements.findLast(mov => mov < 0);
console.log(lastWithdrawal);

// Your latest larget movement was X movements ago

const latestLargesMovementIndex = movements.findLastIndex(
  mov => Math.abs(mov) > 1000
);
console.log(latestLargesMovementIndex);

console.log(
  `Your latest largest movement was ${
    movements.length - latestLargesMovementIndex
  } movements ago`
);


////////////////////////////////
// SOME AND EVERY METHOD

console.log(movements);

// Equality
console.log(movements.includes(-130));

// SOME: Condition
console.log(movements.some(mov => mov === -130));

const anyDeposit = movements.some(mov => mov > 0);
const greaterDeposit = movements.some(mov => mov > 5000);
console.log(anyDeposit, greaterDeposit);

// EVERY
console.log(movements.every(mov => mov > 0));
console.log(account4.movements.every(mov => mov > 0));
console.log(accounts[3]?.movements?.every(mov => mov > 0));

// Separate CallBack
const deposits = mov => mov > 0;
console.log(movements.some(deposits));
console.log(movements.every(deposits));
console.log(movements.filter(deposits));


////////////////////////////////
// FLAT AND FLATMAP METHOD

const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
console.log(arr.flat());

const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
console.log(arrDeep.flat(2));

const accountsMovements = accounts.map(acc => acc.movements);
console.log(accountsMovements);

const allMovements = accountsMovements.flat();
console.log(allMovements);

const overallBalance = allMovements.reduce((acc, mov) => acc + mov, 0);
console.log(overallBalance);

// Flat
const overallMovements = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov, 0);
console.log(overallMovements);

// FlatMap
const overallMovements1 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, mov) => acc + mov, 0);
console.log(overallMovements1);
*/

/////////////////////////////////////////////
// CODING CHALLENGE #4
/*
This time, Julia and Katie are studying the activity levels of diferent dog
breeds.

// YOUR TASKS:
1. Store the average weight of "Husky" in a variable "huskyWeight".

2. Find the name of the only breed that like both "running" and "fetch"
("dogBothActivities" variable).

3.Create an array "allActivities" of all the activities of all the dog 
breeds.

4. Create an array "uniqueActivities" that contains only the unique activities
(no activity repetitions). Hint: Use a technique with special data structure
that we studied few sections ago.

5. Many dog breeds like to swim. What other activities do these dogs like?
Store all the other activities these breeds like to do, in a uniques array 
called "swimmingAdjacent".

6. Do all breeds have an average weight of 10kg or more? Log to the whether
true or false.

7. Are there any breeds that are "Active"? "Active" means that the dog has 3 or
more activites. Log to the console whether true or false.

BONUS: Whats the average weight of the heaviest dog breed that likes
fetch? HINT: Use the "Math.max" method along with the ... operator.
*/

//// Solution
// const breeds = [
//   {
//     breed: 'German Shephard',
//     averageWeight: 32,
//     activities: ['fetch', 'swimming'],
//   },
//   {
//     breed: 'Dalmatian',
//     averageWeight: 24,
//     activities: ['running', 'fetch', 'agility'],
//   },
//   {
//     breed: 'Labrador',
//     averageWeight: 28,
//     activities: ['swimming', 'fetch'],
//   },
//   {
//     breed: 'Beagle',
//     averageWeight: 12,
//     activities: ['digging', 'fetch'],
//   },
//   {
//     breed: 'Husky',
//     averageWeight: 26,
//     activities: ['running', 'agility', 'swimming'],
//   },
//   {
//     breed: 'Bulldog',
//     averageWeight: 36,
//     activities: ['sleeping'],
//   },
//   {
//     breed: 'Poodle',
//     averageWeight: 18,
//     activities: ['agility', 'fetch'],
//   },
// ];

// // 1.
// const huskyWeight = breeds[4].averageWeight;
// console.log(huskyWeight);

// const huskyWeight1 = breeds.find(
//   husky => husky.breed === 'Husky'
// ).averageWeight;
// console.log(huskyWeight1);

// // 2.
// const dogBothActivities = breeds.find(
//   breed =>
//     breed.activities.includes('fetch') && breed.activities.includes('running')
// ).breed;

// console.log(dogBothActivities);

// // 3.
// const allActivites = breeds.flatMap(breed => breed.activities);
// console.log(allActivites);

// // 4.
// const uniqueActivities = [...new Set(allActivites)];
// console.log(uniqueActivities);

// // 5.
// const swimmingAdjacent = [
//   ...new Set(
//     breeds
//       .filter(breed => breed.activities.includes('swimming'))
//       .flatMap(breed => breed.activities)
//       .filter(activity => activity !== 'swimming')
//   ),
// ];

// console.log(swimmingAdjacent);

// // 6.
// console.log(breeds.every(breed => breed.averageWeight > 10));

// // 7.
// console.log(breeds.some(breed => breed.activities.length >= 3));

// // BONUS
// const fetchWeight = breeds
//   .filter(breed => breed.activities.includes('fetch'))
//   .map(breed => breed.averageWeight);

// const heaviestFetchBreed = Math.max(...fetchWeight);

// console.log(fetchWeight);
// console.log(heaviestFetchBreed);

/*
////////////////////////////////
// SORTING ARRAYS

// Strings
const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
console.log(owners.sort());
console.log(owners); // Mutated

// Numbers
console.log(movements);
console.log(movements.sort());

// return < 0, A, B (Keep Order)
// return > 0, B, A (Switch order)

// Ascending
// movements.sort((a, b) => {
//   if (a > b) return 1;
//   if (a < b) return -1;
// });
movements.sort((a, b) => a - b);
console.log(movements);

// Descending
// movements.sort((a, b) => {
//   if (a > b) return -1;
//   if (a < b) return 1;
// });
movements.sort((a, b) => b - a);
console.log(movements);
*/

////////////////////////////////
// ARRAY GROUPING
// console.log(movements);

// const groupedMovements = Object.groupBy(movements, movement =>
//   movement > 0 ? 'deposits' : 'withdrawals'
// );
// console.log(groupedMovements);

// const groupedByActivity = Object.groupBy(accounts, account => {
//   const movementCount = account.movements.length;

//   if (movementCount >= 8) {
//     return 'very active';
//   } else if (movementCount >= 4) {
//     return 'active';
//   } else if (movementCount >= 1) {
//     return 'moderate';
//   } else {
//     return 'inactive';
//   }
// });

// console.log(groupedByActivity);

// // const groupedAccounts = Object.groupBy(accounts, account => account.type);
// const groupedAccounts = Object.groupBy(accounts, ({ type }) => type);
// /*
// Putting ({type}) in parentheses tells JavaScript:
// “Hey, this is a function parameter, and I’m using destructuring!
// */
// console.log(groupedAccounts);

////////////////////////////////
// MORE WAYS OF CREATING AND FILLING ARRAYS

// const arr = [1, 2, 3, 4, 5, 6, 7];
// console.log(new Array(1, 2, 3, 4, 5, 6, 7));

// // Empty + Fill
// const x = new Array(7);
// console.log(x);
// // console.log(x.map(() => 5));
// x.fill(1, 3, 5);
// x.fill(1);
// console.log(x);

// arr.fill(23, 2, 5);
// console.log(arr);

// // Array.from
// const y = Array.from({ length: 7 }, () => 1);
// console.log(y);

// const z = Array.from({ length: 7 }, (_, i) => i + 1);
// console.log(z);

// labelBalance.addEventListener('click', function () {
//   const movementsUI = Array.from(
//     document.querySelectorAll('.movements__value'),
//     el => Number(el.textContent.replace('€', ''))
//   );

//   console.log(movementsUI);

//   const movementsUI2 = [...document.querySelectorAll('.movements__value')];
//   // but we would have to do apping differently
// });

////////////////////////////////
// NON-DESTRUCTIVE ALTERNATIVES: TOREVERSED, TOSORTED, TOSLICED, WITH

// console.log(movements);
// // const reversedMov = movements.reverse();
// // const reversedMov = movements.slice().reverse();
// const reversedMov = movements.toReversed();
// console.log(reversedMov);

// // toSorted(sort), toSpliced(splice)
// // movements[1] = 2000;
// const newMovements = movements.with(1, 2000);
// console.log(newMovements);
// console.log(movements);

////////////////////////////////
// ARRAY METHODS PRACTICE

// 1.
// const bankDepositsSum = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov > 0)
//   .reduce((acc, cur) => acc + cur, 0);

// console.log(bankDepositsSum);

// // 2.
// // const numDeposits1000 = accounts
// //   .flatMap(acc => acc.movements)
// //   .filter(mov => mov >= 1000).length;

// const numDeposits1000 = accounts
//   .flatMap(acc => acc.movements)
//   // .reduce((count, cur) => (cur >= 1000 ? count + 1 : count), 0);
//   .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0);
// console.log(numDeposits1000);

// let a = 10;
// console.log(a++); // 10
// console.log(a); // 11

// // 3.
// const { deposits, withdrawals } = accounts
//   .flatMap(acc => acc.movements)
//   .reduce(
//     (sums, cur) => {
//       // cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
//       sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
//       return sums;
//     },
//     { deposits: 0, withdrawals: 0 }
//   );

// console.log(deposits, withdrawals);

// // 4.
// // this is a nice title -> This Is a nice title

// const convertTitleCase = function (title) {
//   const captilize = str => str[0].toUpperCase() + str.slice(1);
//   const exceptions = ['a', 'an', 'the', 'and', 'but', 'or', 'on', 'in', 'with'];

//   const titleCase = title
//     .toLowerCase()
//     .split(' ')
//     .map(word => (exceptions.includes(word) ? word : captilize(word)))
//     .join(' ');

//   return captilize(titleCase);
// };

// console.log(convertTitleCase('this is a nice title'));
// console.log(convertTitleCase('this is a LONG title but not too long'));
// console.log(convertTitleCase('and here is another title with an EXAMPLE'));

/////////////////////////////////////////////
// CODING CHALLENGE #5
/*
Julia and Kate are still studying dogs, and this time they are studying if 
dogs are eating too much or too little. 

-Eating too much means the dog's current food portion is larger than the 
recommended portion, and eating too little is the opposite. 
-Eating an okay amount means the dog's current food portion is within a 
range 10% above and 10% below the recommended portion (see hint).

// Your tasks: 
1. Loop over the 'dogs' array containing dog objects, and for each dog, 
calculate the recommended food portion and add it to the object as a new 
property. Do not create a new array, simply loop over the array. Forumla: 
recommendedFood = weight ** 0.75 * 28. (The result is in grams of 
food, and the weight needs to be in kg)

2. Find Sarah's dog and log to the console whether it's eating too much or 
too little. Hint: Some dogs have multiple owners, so you first need to find 
Sarah in the owners array, and so this one is a bit tricky (on purpose) 

3. Create an array containing all owners of dogs who eat too much 
('ownersEatTooMuch') and an array with all owners of dogs who eat too little 
('ownersEatTooLittle').

4. Log a string to the console for each array created in 3., like this: 
"Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and 
Michael's dogs eat too little!"

5. Log to the console whether there is any dog eating exactly the amount of 
food that is recommended (just true or false)

6. Log to the console whether there is any dog eating an okay amount of food 
(just true or false)

7. Create an array containing the dogs that are eating an okay amount of 
food (try to reuse the condition used in 6.) 

8. Create a shallow copy of the 'dogs' array and sort it by recommended food 
portion in an ascending order (keep in mind that the portions are inside the 
array's objects)

// Hints: 
§ Use many different tools to solve these challenges, you can use the summary 
lecture to choose between them 
§ Being within a range 10% above and below the recommended portion means: 
current > (recommended * 0.90) && current < (recommended * 
1.10). Basically, the current portion should be between 90% and 110% of the 
recommended portion. 

// Test data: 
const dogs = [ 
{ weight: 22, curFood: 250, owners: ['Alice', 'Bob'] }, 
{ weight: 8, curFood: 200, owners: ['Matilda'] }, 
{ weight: 13, curFood: 275, owners: ['Sarah', 'John'] }, 
{ weight: 32, curFood: 340, owners: ['Michael'] }, 
]; 
*/

//// Solution:
// const dogs = [
//   { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
//   { weight: 8, curFood: 133, owners: ['Matilda'] },
//   { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
//   { weight: 32, curFood: 340, owners: ['Michael'] },
// ];

// // 1.
// dogs.forEach(dog => (dog.recFood = Math.floor(dog.weight ** 0.75 * 28)));
// console.log(dogs);

// // 2.
// const sarahsDog = dogs.find(dog => dog.owners.includes('Sarah'));
// console.log(
//   `Sarah's dog eats too ${
//     sarahsDog.curFood > sarahsDog.recFood ? 'much' : 'little'
//   }`
// );

// // 3.
// const ownersTooMuch = dogs
//   .filter(dog => dog.curFood > dog.recFood)
//   .flatMap(dog => dog.owners);

// const ownersTooLittle = dogs
//   .filter(dog => dog.curFood < dog.recFood)
//   .flatMap(dog => dog.owners);

// console.log(ownersTooMuch);
// console.log(ownersTooLittle);

// // 4.
// console.log(`${ownersTooMuch.join(', ')}'s dogs are eating too much!`);
// console.log(`${ownersTooLittle.join(', ')}'s dogs are eating too little!`);

// // 5.
// console.log(dogs.some(dog => dog.curFood === dog.recFood));

// // 6.
// const checkEatingOkay = dog =>
//   dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1;

// console.log(dogs.every(checkEatingOkay));

// // 7.
// console.log(dogs.filter(checkEatingOkay).flatMap(dog => dog.owners));

// // 8.
// const dogsSorted = dogs.toSorted((a, b) => a.recFood - b.recFood);
// console.log(dogsSorted);

/////////////////////////////////////////////////
// NUMBERS, DATAES, INTL AND TIMERS

/*
////////////////////////////////
// COUNTING AND CHECKING NUMBERS

console.log(23 === 23.0);

// Base 10 - 0 to 9. 1/10 = 0.1. 3/10 = 3.33333
// Base 2 - 0 1

console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

// Conversion
console.log(Number('23'));
console.log(+'23');

// Parsing
console.log(Number.parseInt('30px'));
console.log(Number.parseInt('e20'));

console.log(Number.parseInt('  2.5rem  '));
console.log(Number.parseFloat('  2.5rem  '));

console.log(parseFloat('2.5rem'));

// check if value is NaN
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'23X'));
console.log(Number.isNaN(20 / 0));

// Checking if the value is number
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20X'));
console.log(Number.isFinite(20 / 0));

console.log(Number.isInteger(20));
console.log(Number.isInteger(20.0));
console.log(Number.isInteger(20 / 0));


////////////////////////////////
// COUNTING AND CHECKING NUMBERS

console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

console.log(Math.max(5, 18, 23, 11, 8));
console.log(Math.max(5, 18, '23', 11, 8));
console.log(Math.max(5, 18, '23px', 11, 8));

console.log(Math.min(5, 18, 23, 11, 8));

console.log(Math.PI * Number.parseFloat('10px') ** 2);

console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

console.log(randomInt(10, 20));
console.log(randomInt(0, 3));

// Rounding Integers
console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.ceil(23.9));
console.log(Math.ceil(23.9));

console.log(Math.floor(23.9));
console.log(Math.ceil('23.9'));

console.log(Math.trunc(23.3));

console.log(Math.trunc(-23.3));
console.log(Math.floor(-23.3));

// Rounding Decimal
console.log((2.7).toFixed(0));
console.log((2.7).toFixed(3));
console.log((3.458).toFixed(2));
console.log(+(3.458).toFixed(2));


////////////////////////////////
// REMAINDER OPERATOR

console.log(5 % 2);
console.log(5 / 2); // 5 = 2 * 2 + 1

console.log(8 % 3);
console.log(8 / 3); // 8 = 3 * 2 + 2

console.log(6 % 2);
console.log(6 / 2);

console.log(7 % 2);
console.log(7 / 2);

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    // 0, 2, 4
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';

    // 0, 3, 6, 9
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});


////////////////////////////////
// NUMERIC SEPARATORS

// 287,460,000,000
const diameter1 = 287460000000;
const diameter2 = 287_460_000_000;
console.log(diameter1, diameter2);

const price = 345_99;
console.log(price);

const transferFee1 = 15_00;
const transferFee2 = 1_500;

const PI = 3.1415;
console.log(PI);

console.log(Number('230000'));
console.log(Number('230_000'));
console.log(parseInt('230_000'));


////////////////////////////////
// WORKING WITH BigInt

console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

console.log(8349575789423458935289045892345289345890273452348958293);
console.log(8349575789423458935289045892345289345890273452348958293n);
console.log(BigInt(4765745458349575));

// Operations
console.log(10000n + 100000n);
console.log(6478231367804214682970189602n * 10000n);
// console.log(Math.sqrt(23n));

const huge = 52346654312678315627n;
const num = 23;

console.log(huge * BigInt(num));

// Exceptions
console.log(20n > 15);
console.log(20n === 20); // type coercion doesn't happen here
console.log(typeof 20n);
console.log(20n == '20');

console.log(huge + ' - really big NUMBER!');

// Divisions

console.log(11n / 3n);
console.log(10 / 3);


////////////////////////////////
// CREATING DATES

const now = new Date();
console.log(now);

console.log(new Date('Apr 11 2025 11:48:57'));
console.log(new Date('December 24, 2015'));
console.log(new Date(account1.movementsDates[0]));

console.log(new Date(2037, 10, 19, 15, 23, 5));
console.log(new Date(2037, 10, 31));

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));

// Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());

console.log(new Date(2142237180000));

console.log(Date.now());

future.setFullYear(2040);
console.log(future);


////////////////////////////////
// OPERATIONS WITH THE DATES

const future = new Date(2037, 10, 19, 15, 23);
console.log(+future);

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const day1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));
console.log(day1);


////////////////////////////////
// INTERNATIONALIZING NUMBERS(INTL)

const num = 332899832.23;
const options = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
};

console.log('USA:', new Intl.NumberFormat('en-US', options).format(num));
console.log('Germany:', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Syria:', new Intl.NumberFormat('ar-SY', options).format(num));
console.log('India:', new Intl.NumberFormat('hi-IN', options).format(num));

////////////////////////////////
// TIMERS: SETTIMEOUT & SETINTERVAL

// setTimeout
const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}!`),
  3000,
  ...ingredients
);
console.log('Waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// setInterval

// setInterval(function () {
//   const now = new Date();
//   console.log(now);
// }, 1000);
*/
