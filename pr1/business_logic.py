"""
Слой бизнес-логики (Business Logic Layer).

Содержит алгоритм авторизации, разграничение прав доступа по ролям
(«охранник» / «начальник охраны») и модули обработки списков учебных
корпусов, сотрудников охраны и тревог. Модуль обработки тревог следит
за ссылочной целостностью: перед записью тревоги проверяет через
слой доступа к данным, что указанные корпус и сотрудник существуют.
"""


class AuthorizationError(Exception):
    """Ошибка входа или регистрации (неверные данные, занятый логин)."""


class AccessDeniedError(Exception):
    """Пользователю не хватает прав для выполнения операции."""


class IncidentReferenceError(Exception):
    """Указанный корпус или сотрудник не найден при объявлении тревоги."""


class AuthorizationModule:
    """Проверка учётных данных при входе и уникальности логина при регистрации."""

    VALID_ROLES = ("охранник", "начальник охраны")

    def __init__(self, users_db):
        self.users_db = users_db

    def login(self, login, password):
        user = self.users_db.find_by_credentials(login, password)
        if user is None:
            raise AuthorizationError("Неверный логин или пароль.")
        return user

    def register(self, full_name, login, password, role):
        if role not in self.VALID_ROLES:
            raise ValueError(f"Недопустимая роль: {role}")
        if self.users_db.find_by_login(login) is not None:
            raise AuthorizationError(f"Логин «{login}» уже занят.")
        user_id = self.users_db.add_user(full_name, login, password, role)
        return {"id": user_id, "full_name": full_name, "login": login, "role": role}


class AccessControlModule:
    """
    Разграничение прав доступа в систему.

    Роль «начальник охраны» получает доступ к управлению учебными
    корпусами и сотрудниками охраны. Роль «охранник» имеет доступ
    только к работе с тревогами.
    """

    CHIEF_ROLE = "начальник охраны"

    def require_chief(self, user):
        if user["role"] != self.CHIEF_ROLE:
            raise AccessDeniedError(
                "Операция доступна только пользователю с ролью «начальник охраны»."
            )


class BuildingsProcessingModule:
    """CRUD-операции над учебными корпусами (доступно роли «начальник охраны»)."""

    def __init__(self, buildings_db, access_control: AccessControlModule):
        self.buildings_db = buildings_db
        self.access_control = access_control

    def list_buildings(self, user):
        self.access_control.require_chief(user)
        return self.buildings_db.get_all()

    def add_building(self, user, name, address, object_type, checkpoints):
        self.access_control.require_chief(user)
        return self.buildings_db.add(name, address, object_type, checkpoints)

    def delete_building(self, user, building_id):
        self.access_control.require_chief(user)
        self.buildings_db.delete(building_id)


class GuardsProcessingModule:
    """CRUD-операции над сотрудниками охраны (доступно роли «начальник охраны»)."""

    def __init__(self, guards_db, access_control: AccessControlModule):
        self.guards_db = guards_db
        self.access_control = access_control

    def list_guards(self, user):
        self.access_control.require_chief(user)
        return self.guards_db.get_all()

    def add_guard(self, user, full_name, position, phone):
        self.access_control.require_chief(user)
        return self.guards_db.add(full_name, position, phone)

    def change_guard_status(self, user, guard_id, status):
        self.access_control.require_chief(user)
        if status not in self.guards_db.STATUSES:
            raise ValueError(f"Недопустимый статус: {status}")
        self.guards_db.update_status(guard_id, status)

    def delete_guard(self, user, guard_id):
        self.access_control.require_chief(user)
        self.guards_db.delete(guard_id)


class IncidentsProcessingModule:
    """
    Обработка списка тревог. Доступна обеим ролям.

    При объявлении тревоги модуль обязан обратиться к модулю доступа
    к корпусам и модулю доступа к сотрудникам, чтобы убедиться, что
    указанные ID действительно существуют, прежде чем сделать запись
    в базу данных тревог.
    """

    def __init__(self, incidents_db, buildings_db, guards_db):
        self.incidents_db = incidents_db
        self.buildings_db = buildings_db
        self.guards_db = guards_db

    def list_incidents(self, user):
        return self.incidents_db.get_all()

    def add_incident(self, user, building_id, guard_id, description, incident_date):
        if self.buildings_db.get_by_id(building_id) is None:
            raise IncidentReferenceError(f"Учебный корпус с ID {building_id} не найден.")
        if self.guards_db.get_by_id(guard_id) is None:
            raise IncidentReferenceError(f"Сотрудник охраны с ID {guard_id} не найден.")
        return self.incidents_db.add(building_id, guard_id, description, incident_date)

    def change_status(self, user, incident_id, status):
        if status not in self.incidents_db.STATUSES:
            raise ValueError(f"Недопустимый статус: {status}")
        self.incidents_db.update_status(incident_id, status)
