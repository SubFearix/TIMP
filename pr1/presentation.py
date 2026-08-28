"""
Слой представления (Presentation Layer / UI).

Отвечает за весь консольный интерфейс: меню, ввод и базовую
валидацию данных, вывод списков. Не содержит бизнес-логики —
только вызывает соответствующие методы слоя бизнес-логики и
отображает результат или текст ошибки.
"""

from business_logic import (
    AuthorizationError,
    AccessDeniedError,
    IncidentReferenceError,
)


def _read_int(prompt):
    while True:
        value = input(prompt).strip()
        if value.isdigit():
            return int(value)
        print("Введите целое число.")


class LoginUI:
    """Диалоговое окно входа в систему."""

    def __init__(self, authorization_module):
        self.authorization_module = authorization_module

    def run(self):
        print("\n=== Вход в систему ===")
        login = input("Логин: ").strip()
        password = input("Пароль: ").strip()
        try:
            user = self.authorization_module.login(login, password)
            print(f"Добро пожаловать, {user['full_name']}! Роль: {user['role']}.")
            return user
        except AuthorizationError as e:
            print(f"Ошибка входа: {e}")
            return None


class RegistrationUI:
    """Диалоговое окно регистрации нового пользователя."""

    def __init__(self, authorization_module):
        self.authorization_module = authorization_module

    def run(self):
        print("\n=== Регистрация ===")
        full_name = input("ФИО: ").strip()
        login = input("Логин: ").strip()
        password = input("Пароль: ").strip()
        print("Роль: 1 — охранник, 2 — начальник охраны")
        role_choice = input("Выберите роль (1/2): ").strip()
        role = "начальник охраны" if role_choice == "2" else "охранник"
        try:
            user = self.authorization_module.register(full_name, login, password, role)
            print(f"Пользователь «{login}» успешно зарегистрирован с ролью «{role}».")
            return user
        except (AuthorizationError, ValueError) as e:
            print(f"Ошибка регистрации: {e}")
            return None


class BuildingsUI:
    """Меню отображения, добавления и удаления учебных корпусов."""

    def __init__(self, buildings_module):
        self.buildings_module = buildings_module

    def menu(self, user):
        while True:
            print("\n--- Учебные корпуса ---")
            print("1. Просмотреть список")
            print("2. Добавить корпус")
            print("3. Удалить корпус")
            print("0. Назад")
            choice = input("Выбор: ").strip()
            try:
                if choice == "1":
                    self._list(user)
                elif choice == "2":
                    self._add(user)
                elif choice == "3":
                    self._delete(user)
                elif choice == "0":
                    return
                else:
                    print("Неизвестный пункт меню.")
            except AccessDeniedError as e:
                print(f"Доступ запрещён: {e}")

    def _list(self, user):
        buildings = self.buildings_module.list_buildings(user)
        if not buildings:
            print("Список учебных корпусов пуст.")
            return
        for b in buildings:
            print(f"[{b['id']}] {b['name']} — {b['address']} "
                  f"({b['object_type']}, КПП: {b['checkpoints']})")

    def _add(self, user):
        name = input("Название корпуса: ").strip()
        address = input("Адрес: ").strip()
        object_type = input("Тип объекта (учебный корпус/общежитие/спортивный комплекс/"
                             "административное здание): ").strip()
        checkpoints = _read_int("Количество контрольно-пропускных пунктов: ")
        building_id = self.buildings_module.add_building(user, name, address, object_type, checkpoints)
        print(f"Корпус добавлен с ID {building_id}.")

    def _delete(self, user):
        building_id = _read_int("ID корпуса для удаления: ")
        self.buildings_module.delete_building(user, building_id)
        print("Корпус удалён.")


class GuardsUI:
    """Меню отображения, добавления, удаления и смены статуса сотрудников охраны."""

    def __init__(self, guards_module):
        self.guards_module = guards_module

    def menu(self, user):
        while True:
            print("\n--- Сотрудники охраны ---")
            print("1. Просмотреть список")
            print("2. Добавить сотрудника")
            print("3. Изменить статус сотрудника")
            print("4. Удалить сотрудника")
            print("0. Назад")
            choice = input("Выбор: ").strip()
            try:
                if choice == "1":
                    self._list(user)
                elif choice == "2":
                    self._add(user)
                elif choice == "3":
                    self._change_status(user)
                elif choice == "4":
                    self._delete(user)
                elif choice == "0":
                    return
                else:
                    print("Неизвестный пункт меню.")
            except AccessDeniedError as e:
                print(f"Доступ запрещён: {e}")

    def _list(self, user):
        guards = self.guards_module.list_guards(user)
        if not guards:
            print("Список сотрудников охраны пуст.")
            return
        for g in guards:
            print(f"[{g['id']}] {g['full_name']} — {g['position']}, "
                  f"тел. {g['phone']}, статус: {g['status']}")

    def _add(self, user):
        full_name = input("ФИО сотрудника: ").strip()
        position = input("Должность: ").strip()
        phone = input("Номер телефона: ").strip()
        guard_id = self.guards_module.add_guard(user, full_name, position, phone)
        print(f"Сотрудник добавлен с ID {guard_id}.")

    def _change_status(self, user):
        guard_id = _read_int("ID сотрудника: ")
        print("Статусы: на посту / на обходе / не на смене")
        status = input("Новый статус: ").strip()
        try:
            self.guards_module.change_guard_status(user, guard_id, status)
            print("Статус обновлён.")
        except ValueError as e:
            print(f"Ошибка: {e}")

    def _delete(self, user):
        guard_id = _read_int("ID сотрудника для удаления: ")
        self.guards_module.delete_guard(user, guard_id)
        print("Сотрудник удалён.")


class IncidentsUI:
    """Меню отображения, объявления и изменения статуса тревог."""

    def __init__(self, incidents_module):
        self.incidents_module = incidents_module

    def menu(self, user):
        while True:
            print("\n--- Журнал тревог ---")
            print("1. Просмотреть список")
            print("2. Объявить тревогу")
            print("3. Изменить статус тревоги")
            print("0. Назад")
            choice = input("Выбор: ").strip()
            if choice == "1":
                self._list(user)
            elif choice == "2":
                self._add(user)
            elif choice == "3":
                self._change_status(user)
            elif choice == "0":
                return
            else:
                print("Неизвестный пункт меню.")

    def _list(self, user):
        incidents = self.incidents_module.list_incidents(user)
        if not incidents:
            print("Тревог не зафиксировано.")
            return
        for i in incidents:
            print(f"[{i['id']}] корпус #{i['building_id']}, сотрудник #{i['guard_id']}, "
                  f"{i['incident_date']}: {i['description']} — статус: {i['status']}")

    def _add(self, user):
        building_id = _read_int("ID учебного корпуса: ")
        guard_id = _read_int("ID сотрудника охраны: ")
        description = input("Описание происшествия: ").strip()
        incident_date = input("Дата происшествия (ГГГГ-ММ-ДД): ").strip()
        try:
            incident_id = self.incidents_module.add_incident(
                user, building_id, guard_id, description, incident_date
            )
            print(f"Тревога зарегистрирована с ID {incident_id}.")
        except IncidentReferenceError as e:
            print(f"Ошибка: {e}")

    def _change_status(self, user):
        incident_id = _read_int("ID тревоги: ")
        print("Статусы: Активна / Решена / Ложная")
        status = input("Новый статус: ").strip()
        try:
            self.incidents_module.change_status(user, incident_id, status)
            print("Статус тревоги обновлён.")
        except ValueError as e:
            print(f"Ошибка: {e}")
