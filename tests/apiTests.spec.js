import { test, expect } from "@playwright/test";

test.describe("API challenge", () => {
  let URL = "https://apichallenges.herokuapp.com/";
  let token;

  test.beforeAll(async ({ request }) => {
    let response = await request.post(`${URL}challenger`);
    let headers = await response.headers();
    token = headers["x-challenger"];
    console.log('Токен:'+ token);
    expect(headers).toEqual(
      expect.objectContaining({ "x-challenger": expect.any(String) }),
    );
  });


  test("Запрет удаления списков задач DELETE /challenges возвращает 405", { tag: '@API' }, async ({ request }) => {
  const response = await request.delete(`${URL}challenges`, {
    headers: {
      "x-challenger": token,
    }
  });
  const body = await response.text(); 
  const status = response.status();
  expect(status).toBe(405);
  expect(body).toBeDefined();
});

  test("Удаление несуществующего todo DELETE /todos/{id}", { tag: '@API'}, async ({ request }) => {
  const nonExistentId = 9999999;
  let response = await request.delete(`${URL}todos/${nonExistentId}`, {
    headers: {
      "x-challenger": token
    }
  });
  let headers = await response.headers();
  expect(response.status()).toBe(404);
  expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("Получить список заданий GET /challenges", { tag: '@API'}, async ({ request }) => {
    let response = await request.get(`${URL}challenges`, {
      headers: {
        "x-challenger": token,
      },
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.challenges.length).toBe(59);
  });

  test("Получить список todos  GET /todos", { tag: '@API'}, async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.todos.length).toBe(10);
  });

  test("Получить список todo not plural GET /todo", { tag: '@API'}, async ({ request }) => {
    let response = await request.get(`${URL}todo`, {
      headers: {
        "x-challenger": token,
      },
    });
    let headers = await response.headers();
    expect(response.status()).toBe(404);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("Получить информацию todos по ID GET /todos/{Id}", { tag: '@API'}, async ({ request }) => {
    let listResponse = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
    });
    let listBody = await listResponse.json();
    const todoId = listBody.todos[0].id;
    let response = await request.get(`${URL}todos/${todoId}`, {
      headers: {
        "x-challenger": token,
      },
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.todos[0].id).toEqual(todoId);
  });

  test("Получить headers todos HEAD /todos", { tag: '@API'}, async ({ request }) => {
    let response = await request.head(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
    });
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("Создание POST /todos", { tag: '@API'}, async ({ request }) => {
    const todoData = {
        title: "Новая задача",
        description: "Описание моей задачи",
        doneStatus: true
    };
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "content-type": "application/json"
      },
      data: todoData
    });
    let responseBody = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(201);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(responseBody).toMatchObject(todoData);
  });

  test("Получить информацию todos по несуществующему ID GET /todos/{Id}", { tag: '@API'}, async ({ request }) => {
    let response = await request.get(`${URL}todos/17`, {
      headers: {
        "x-challenger": token,
      },
    });
    let headers = await response.headers();
    expect(response.status()).toBe(404);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("Получить информацию по todos со статусом Done GET /todos/{Id}", { tag: '@API'}, async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      params: {
        doneStatus: true
      }
    });
    let headers = await response.headers();
    let responseBody = await response.json();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(responseBody).toHaveProperty('todos');
    expect(Array.isArray(responseBody.todos)).toBe(true);
    expect(responseBody.todos).not.toHaveLength(0);
  });

  test("Создание todo с параметром doneStatus содержащим недопустимое значение POST /todos", { tag: '@API'}, async ({ request }) => {
    const todoData = {
        title: "Новая задача",
        description: "Описание моей задачи",
        doneStatus: "string"
    };
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "content-type": "application/json"
      },
      data: todoData
    });
    let headers = await response.headers();
    expect(response.status()).toBe(400);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("Создание todo с description > 200 символов POST /todos", { tag: '@API'}, async ({ request }) => {
    const todoData = {
        title: "Новая задача",
        description: "A".repeat(201),
        doneStatus: true
    };
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "content-type": "application/json"
      },
      data: todoData
    });
    let headers = await response.headers();
    expect(response.status()).toBe(400);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("Создание todo с максимальными значениями title и description POST /todos", { tag: '@API'}, async ({ request }) => {
    const todoData = {
        title: "A".repeat(50),
        description: "A".repeat(200),
        doneStatus: true
    };
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "content-type": "application/json"
      },
      data: todoData
    });
    let headers = await response.headers();
    let responseBody = await response.json();
    expect(response.status()).toBe(201);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(responseBody.title).toBe(todoData.title);
    expect(responseBody.description).toBe(todoData.description);
    expect(responseBody.doneStatus).toBe(todoData.doneStatus);
  });

  test("Создание todo с превышением максимального количества символов в названии POST /todos", { tag: '@API'}, async ({ request }) => {
    const todoData = {
        title: "A".repeat(5000),
        description: "Описание моей задачи",
        doneStatus: true
    };
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "content-type": "application/json"
      },
      data: todoData
    });
    let headers = await response.headers();
    expect(response.status()).toBe(413);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });
  
  test("Создание todo с title > 50 символов POST /todos", { tag: '@API'}, async ({ request }) => {
    const todoData = {
        title: "A".repeat(51),
        description: "Описание моей задачи",
        doneStatus: true
    };
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "content-type": "application/json"
      },
      data: todoData
    });
    let headers = await response.headers();
    expect(response.status()).toBe(400);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("Создание todo с дополнительным параметром priority POST /todos", { tag: '@API'}, async ({ request }) => {
    const todoData = {
        title: "Новая задача",
        description: "Описание моей задачи",
        doneStatus: true,
        priority: "extra"
    };
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "content-type": "application/json"
      },
      data: todoData
    });
    let headers = await response.headers();
    expect(response.status()).toBe(400);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("Отредактировать несуществующее todo в системе PUT /todos/{id} ", async ({ request }) => {
    const todoData = {
      doneStatus: true,
      description: "реклама",
    };
    let response = await request.put(`${URL}todos/122222`, {
      headers: {
        "x-challenger": token,
      },
      data: todoData,
    });
    let headers = await response.headers();
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(response.status()).toBe(400);
  });


  test("Обновление существующего todo POST /todos/{id}", { tag: '@API'}, async ({ request }) => {
    const todoData = {
        title: "Новая задача",
        description: "Описание моей задачи",
        doneStatus: true
    };
    let response = await request.post(`${URL}todos/9`, {
      headers: {
        "x-challenger": token,
        "content-type": "application/json"
      },
      data: todoData
    });
    let responseBody = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(responseBody.title).toBe(todoData.title);
    expect(responseBody.description).toBe(todoData.description);
    expect(responseBody.doneStatus).toBe(todoData.doneStatus);
  });

  test("Отредактировать существующее todo в системе полностью PUT /todos/{id} ", async ({ request }) => {
    const todoData = {
      title: "Новое название",
      doneStatus: true,
      description: "Новое описание"
    };
    let response = await request.put(`${URL}todos/9`, {
      headers: {
        "x-challenger": token,
      },
      data: todoData,
    });
    let headers = await response.headers();
    let responseBody = await response.json();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(responseBody.title).toBe(todoData.title);
    expect(responseBody.description).toBe(todoData.description);
    expect(responseBody.doneStatus).toBe(todoData.doneStatus);
  });

  test("Отредактировать существующее todo в системе частично PUT /todos/{id} ", async ({ request }) => {
    const todoData = {
      title: "Новое название"
    };
    let response = await request.put(`${URL}todos/9`, {
      headers: {
        "x-challenger": token,
      },
      data: todoData,
    });
    let headers = await response.headers();
    let responseBody = await response.json();
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(responseBody.title).toBe(todoData.title);
    expect(response.status()).toBe(200);
  });

  test("Отредактировать существующее todo в системе без параметра title PUT /todos/{id} ", async ({ request }) => {
    const todoData = {
      doneStatus: true,
      description: "Новое описание"
    };
    let response = await request.put(`${URL}todos/9`, {
      headers: {
        "x-challenger": token,
      },
      data: todoData,
    });
    let headers = await response.headers();
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(response.status()).toBe(400);
  });

  test("Обновление несуществующего todo POST /todos/{id}", { tag: '@API'}, async ({ request }) => {
    const todoData = {
        title: "Новая задача",
        description: "Описание моей задачи",
        doneStatus: true
    };
    let response = await request.post(`${URL}todos/989`, {
      headers: {
        "x-challenger": token,
        "content-type": "application/json"
      },
      data: todoData
    });
    let headers = await response.headers();
    expect(response.status()).toBe(404);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("Отредактировать существующее todo в системе PUT /todos/{id} ", async ({ request }) => {
    const todoData = {
      id: 10,
      doneStatus: true,
      description: "Новое описание"
    };
    let response = await request.put(`${URL}todos/9`, {
      headers: {
        "x-challenger": token,
      },
      data: todoData,
    });
    let headers = await response.headers();
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(response.status()).toBe(400);
  });


  test("Удаление существующущего todo в системе DELETE /todos/{id} ", async ({ request }) => {
    let response = await request.delete(`${URL}todos/9`, {
      headers: {
        "x-challenger": token,
      }
    });
    let headers = await response.headers();
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(response.status()).toBe(200);
  });


  test("Проверка доступных типов методов API /todos ", async ({ request }) => {
    let response = await request.fetch(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      }
    });
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("Получить список todos в XML формате GET /todos", { tag: '@API'}, async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "Accept": "application/xml"
      },
    });
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(headers['content-type']).toContain('xml');
  });

  test("Получить список todos с Any форматом GET /todos", { tag: '@API'}, async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "Accept": "*/*"
      },
    });
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(headers['content-type']).toContain('json');
  });

  test("Получить список todos с XML pref форматом GET /todos", { tag: '@API'}, async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "Accept": "application/xml, application/json"
      },
    });
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(headers['content-type']).toContain('xml');
  });

  test("Получить список todos без Accept Header GET /todos", { tag: '@API'}, async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token
      },
    });
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(headers['content-type']).toContain('json');
  });

  test("Получить список todos с неподдерживаемым Accept Header GET /todos", { tag: '@API'}, async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "Accept": "application/gzip"
      },
    });
    let headers = await response.headers();
    expect(response.status()).toBe(406);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(headers['content-type']).toContain('json');
  });

  test("Получить список todos с JSON форматом GET /todos", { tag: '@API'}, async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "Accept": "application/json"
      },
    });
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(headers['content-type']).toContain('json');
  });
});
 //добавил команду для запуска целей по тегу



