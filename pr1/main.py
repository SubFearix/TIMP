from data_access import UsersDatabase, BuildingsDatabase, GuardsDatabase, IncidentsDatabase
from business_logic import (
    AuthorizationModule,
    AccessControlModule,
    BuildingsProcessingModule,
    GuardsProcessingModule,
    IncidentsProcessingModule,
)
from presentation import LoginUI, RegistrationUI, BuildingsUI, GuardsUI, IncidentsUI


def build_application():
    users_db = UsersDatabase()
    buildings_db = BuildingsDatabase()
    guards_db = GuardsDatabase()
    incidents_db = IncidentsDatabase()

    authorization_module = AuthorizationModule(users_db)
    access_control = AccessControlModule()
    buildings_module = BuildingsProcessingModule(buildings_db, access_control)
    guards_module = GuardsProcessingModule(guards_db, access_control)
    incidents_module = IncidentsProcessingModule(incidents_db, buildings_db, guards_db)

    login_ui = LoginUI(authorization_module)
    registration_ui = RegistrationUI(authorization_module)
    buildings_ui = BuildingsUI(buildings_module)
    guards_ui = GuardsUI(guards_module)
    incidents_ui = IncidentsUI(incidents_module)

    return login_ui, registration_ui, buildings_ui, guards_ui, incidents_ui


def main_menu(user, buildings_ui, guards_ui, incidents_ui):
    while True:
        print(f"\n=== Главное меню ({user['role']}: {user['full_name']}) ===")
        if user["role"] == "начальник охраны":
            print("1. Учебные корпуса")
            print("2. Сотрудники охраны")
            print("3. Журнал тревог")
            print("0. Выйти из аккаунта")
            choice = input("Выбор: ").strip()
            if choice == "1":
                buildings_ui.menu(user)
            elif choice == "2":
                guards_ui.menu(user)
            elif choice == "3":
                incidents_ui.menu(user)
            elif choice == "0":
                return
            else:
                print("Неизвестный пункт меню.")
        else:
            print("1. Журнал тревог")
            print("0. Выйти из аккаунта")
            choice = input("Выбор: ").strip()
            if choice == "1":
                incidents_ui.menu(user)
            elif choice == "0":
                return
            else:
                print("Неизвестный пункт меню.")


def main():
    login_ui, registration_ui, buildings_ui, guards_ui, incidents_ui = build_application()

    print("Система безопасности образовательного учреждения")
    while True:
        print("\n1. Войти")
        print("2. Зарегистрироваться")
        print("0. Выход из программы")
        choice = input("Выбор: ").strip()

        if choice == "1":
            user = login_ui.run()
            if user:
                main_menu(user, buildings_ui, guards_ui, incidents_ui)
        elif choice == "2":
            registration_ui.run()
        elif choice == "0":
            print("До свидания.")
            break
        else:
            print("Неизвестный пункт меню.")


if __name__ == "__main__":
    main()
