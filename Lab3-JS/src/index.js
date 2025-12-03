const serviceIdentitySymbol = Symbol("serviceIdentity");

class Service {
  static entityTag = Symbol("serviceEntity");

  constructor({
    id,
    name,
    doctor,
    usersMonth1,
    usersMonth2,
    cost,
    durationMinutes,
  }) {
    this.id = Number(id);
    this.name = String(name);
    this.doctor = String(doctor);
    this.usersMonth1 = Number(usersMonth1);
    this.usersMonth2 = Number(usersMonth2);
    this.cost = Number(cost);
    this.durationMinutes = Number(durationMinutes);
    this.meta = {
      [Service.entityTag]: true,
      [serviceIdentitySymbol]: BigInt(1000 + this.id),
    };
  }

  hasCompleteInfo() {
    const requiredKeys = [
      "id",
      "name",
      "doctor",
      "usersMonth1",
      "usersMonth2",
      "cost",
      "durationMinutes",
    ];
    return requiredKeys.every((key) => Boolean(this[key]) || this[key] === 0);
  }
}

class ServiceManager {
  constructor(services = []) {
    this.services = services;
  }

  sortByCostWithAverageDuration() {
    const grouped = new Map();
    for (const service of this.services) {
      if (!grouped.has(service.cost)) {
        grouped.set(service.cost, []);
      }
      grouped.get(service.cost).push(service.durationMinutes);
    }
    const summary = [];
    grouped.forEach((durations, cost) => {
      const total = durations.reduce((sum, value) => sum + value, 0);
      summary.push({
        cost,
        averageDuration: Number((total / durations.length).toFixed(2)),
      });
    });
    return summary.sort((a, b) => a.cost - b.cost);
  }

  findMostReadServiceMonth1() {
    let maxService = this.services[0];
    for (const service of this.services) {
      if (service.usersMonth1 > maxService.usersMonth1) {
        maxService = service;
      }
    }
    return maxService;
  }

  addService(rawService) {
    const newService =
      rawService instanceof Service ? rawService : new Service(rawService);
    if (!newService.hasCompleteInfo()) {
      this.services.push(newService);
      return {
        placement: "appended",
        index: this.services.length - 1,
      };
    }

    let idx = 0;
    while (idx < this.services.length && this.services[idx].cost > newService.cost) {
      idx += 1;
    }
    this.services.splice(idx, 0, newService);
    return { placement: "sorted", index: idx };
  }

  computeUpdatedCosts() {
    return this.services.map((service) => {
      const delta = service.usersMonth2 - service.usersMonth1;
      let multiplier;
      switch (true) {
        case delta > 0:
          multiplier = 1.15;
          break;
        case delta === 0:
          multiplier = 1;
          break;
        default:
          multiplier = 0.95;
      }
      const updatedCostRaw = service.cost * multiplier;
      const updatedCost = Number(Math.round(updatedCostRaw * 100) / 100);
      return {
        name: service.name,
        doctor: service.doctor,
        updatedCost,
      };
    });
  }
}

const serviceSeed = [
  {
    id: 1,
    name: "Кардіо Check",
    doctor: "Анна Горова",
    usersMonth1: 120,
    usersMonth2: 150,
    cost: 1800,
    durationMinutes: 50,
  },
  {
    id: 2,
    name: "Психо Detox",
    doctor: "Ігор Литвин",
    usersMonth1: 95,
    usersMonth2: 80,
    cost: 1400,
    durationMinutes: 60,
  },
  {
    id: 3,
    name: "Нутрі Контроль",
    doctor: "Оля Стасюк",
    usersMonth1: 210,
    usersMonth2: 215,
    cost: 1600,
    durationMinutes: 45,
  },
  {
    id: 4,
    name: "Сонний Ритм",
    doctor: "Максим Чалий",
    usersMonth1: 180,
    usersMonth2: 170,
    cost: 1600,
    durationMinutes: 35,
  },
  {
    id: 5,
    name: "Розбір аналізів",
    doctor: "Діана Гумена",
    usersMonth1: 250,
    usersMonth2: 300,
    cost: 2200,
    durationMinutes: 55,
  },
  {
    id: 6,
    name: "Сімейна розмова",
    doctor: "Кирило Вій",
    usersMonth1: 60,
    usersMonth2: 62,
    cost: 1100,
    durationMinutes: 70,
  },
  {
    id: 7,
    name: "Mindfulness",
    doctor: "Ірина Сойко",
    usersMonth1: 310,
    usersMonth2: 350,
    cost: 2600,
    durationMinutes: 40,
  },
  {
    id: 8,
    name: "Кар'єрний баланс",
    doctor: "Марта Шумило",
    usersMonth1: 90,
    usersMonth2: 130,
    cost: 1500,
    durationMinutes: 65,
  },
  {
    id: 9,
    name: "Мобільний check-up",
    doctor: "Роман Войтко",
    usersMonth1: 400,
    usersMonth2: 398,
    cost: 2800,
    durationMinutes: 30,
  },
  {
    id: 10,
    name: "Дитячий супровід",
    doctor: "Катерина Гринь",
    usersMonth1: 75,
    usersMonth2: 90,
    cost: 1350,
    durationMinutes: 80,
  },
].map((svc) => new Service(svc));

const serviceManager = new ServiceManager([...serviceSeed]);

const serviceTests = () => {
  console.group("Service tasks");
  console.dir(serviceManager.sortByCostWithAverageDuration(), {
    depth: null,
    colors: false,
  });
  console.log(
    "ID послуги з найбільшою кількістю переглядів у місяць 1:",
    serviceManager.findMostReadServiceMonth1().id,
  );

  const insertion1 = serviceManager.addService({
    id: 11,
    name: "Express консалтинг",
    doctor: "Олег Жук",
    usersMonth1: 50,
    usersMonth2: 60,
    cost: 1250,
    durationMinutes: 25,
  });
  console.log("Вставка повної послуги відбулась у позицію:", insertion1);

  const insertion2 = serviceManager.addService({
    id: 12,
    name: "Без назви",
  });
  console.log("Неповна послуга додана у кінець:", insertion2);

  console.log("Оновлені вартості послуг:");
  console.table(serviceManager.computeUpdatedCosts());
  console.groupEnd();
};

const formatTimeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map((value) => Number(value));
  return hours * 60 + minutes;
};

class UserAccount {
  constructor({
    lastName,
    firstName,
    age,
    education,
    feedbackGoal,
    requestDate,
    requestTime,
  }) {
    this.lastName = lastName;
    this.firstName = firstName;
    this.age = Number(age);
    this.education = education;
    this.feedbackGoal = feedbackGoal;
    this.requestDate = new Date(`${requestDate}T${requestTime}:00`);
    this.requestTime = requestTime;
  }

  get month() {
    return this.requestDate.getMonth() + 1;
  }

  isWithinWorkingHours() {
    const totalMinutes = formatTimeToMinutes(this.requestTime);
    return totalMinutes >= 9 * 60 && totalMinutes <= 17 * 60;
  }

  occursAt(timeString) {
    return this.requestTime === timeString;
  }
}

class UserRegistry {
  constructor(users = []) {
    this.users = users;
  }

  listByMonthAndExactTime(month, time) {
    return this.users.filter(
      (user) => user.month === month && user.occursAt(time),
    );
  }

  findYoungestUserInfo() {
    let youngest = this.users[0];
    for (const user of this.users) {
      if (user.age < youngest.age) {
        youngest = user;
      }
    }
    return {
      firstName: youngest.firstName,
      lastName: youngest.lastName,
      age: youngest.age,
      education: youngest.education,
    };
  }

  classifyByWorkingHours() {
    const buckets = {
      working: { count: 0, totalAge: 0 },
      off: { count: 0, totalAge: 0 },
    };
    let index = 0;
    do {
      const user = this.users[index];
      const bucket = user.isWithinWorkingHours() ? buckets.working : buckets.off;
      bucket.count += 1;
      bucket.totalAge += user.age;
      index += 1;
    } while (index < this.users.length);

    const toSummary = (bucket) => ({
      count: bucket.count,
      averageAge:
        bucket.count === 0 ? 0 : Number((bucket.totalAge / bucket.count).toFixed(2)),
    });

    return {
      working: toSummary(buckets.working),
      off: toSummary(buckets.off),
    };
  }

  sortUsersAlphabetically() {
    return [...this.users]
      .sort((a, b) => {
        const nameA = `${a.lastName} ${a.firstName}`;
        const nameB = `${b.lastName} ${b.firstName}`;
        return nameA.localeCompare(nameB);
      })
      .map((user) => ({
        fullName: `${user.lastName} ${user.firstName}`,
        goal: user.feedbackGoal,
      }));
  }
}

const userSeed = [
  {
    lastName: "Коваль",
    firstName: "Олена",
    age: 28,
    education: "MA",
    feedbackGoal: "Співпраця",
    requestDate: "2025-01-12",
    requestTime: "09:15",
  },
  {
    lastName: "Гуменюк",
    firstName: "Артем",
    age: 35,
    education: "BA",
    feedbackGoal: "Технічне питання",
    requestDate: "2025-02-04",
    requestTime: "21:40",
  },
  {
    lastName: "Лисенко",
    firstName: "Наталія",
    age: 31,
    education: "MBA",
    feedbackGoal: "Запис на консультацію",
    requestDate: "2025-01-21",
    requestTime: "17:00",
  },
  {
    lastName: "Савчук",
    firstName: "Ілля",
    age: 22,
    education: "BSc",
    feedbackGoal: "Знижка",
    requestDate: "2025-01-21",
    requestTime: "07:45",
  },
  {
    lastName: "Данилюк",
    firstName: "Марія",
    age: 44,
    education: "PhD",
    feedbackGoal: "Співпраця",
    requestDate: "2025-03-05",
    requestTime: "10:30",
  },
  {
    lastName: "Синюк",
    firstName: "Ганна",
    age: 19,
    education: "College",
    feedbackGoal: "Зворотній зв'язок",
    requestDate: "2025-02-10",
    requestTime: "12:00",
  },
  {
    lastName: "Гнатюк",
    firstName: "Руслан",
    age: 52,
    education: "MD",
    feedbackGoal: "Сервіс",
    requestDate: "2025-01-31",
    requestTime: "16:50",
  },
  {
    lastName: "Мельник",
    firstName: "Ірина",
    age: 27,
    education: "BA",
    feedbackGoal: "Питання по оплаті",
    requestDate: "2025-01-20",
    requestTime: "23:10",
  },
  {
    lastName: "Петренко",
    firstName: "Олег",
    age: 33,
    education: "MA",
    feedbackGoal: "Співпраця",
    requestDate: "2025-01-12",
    requestTime: "09:15",
  },
  {
    lastName: "Іващенко",
    firstName: "Лілія",
    age: 29,
    education: "BSc",
    feedbackGoal: "Відгук",
    requestDate: "2025-04-01",
    requestTime: "14:05",
  },
].map((user) => new UserAccount(user));

const userRegistry = new UserRegistry(userSeed);

const userTests = () => {
  console.group("User tasks");
  console.log(
    "Користувачі за січень о 09:15:",
    userRegistry.listByMonthAndExactTime(1, "09:15").map((u) => `${u.lastName} ${u.firstName}`),
  );
  console.log("Наймолодший користувач:", userRegistry.findYoungestUserInfo());
  console.log("Класи робочий/неробочий час:", userRegistry.classifyByWorkingHours());
  console.table(userRegistry.sortUsersAlphabetically());
  console.groupEnd();
};

const boundaryTests = () => {
  const scenarios = [
    () => serviceManager.addService({
      id: 13,
      name: "Майстерня сну",
      doctor: "Софія Нікітюк",
      usersMonth1: 0,
      usersMonth2: 5,
      cost: 900,
      durationMinutes: 20,
    }),
    () => userRegistry.listByMonthAndExactTime(1, "07:45").map((u) => u.lastName),
  ];
  let pointer = 0;
  console.group("Boundary tests");
  do {
    console.log(`Перевірка ${pointer + 1}:`, scenarios[pointer]());
    pointer += 1;
  } while (pointer < scenarios.length);
  console.groupEnd();
};

serviceTests();
userTests();
boundaryTests();
