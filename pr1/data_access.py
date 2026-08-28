"""
Слой доступа к данным (Data Access Layer).

Каждый класс отвечает только за свою сущность, инициирует соединение
со своим локальным файлом SQLite и абстрагирует SQL-запросы от
остальной программы (изолирует слой бизнес-логики от прямой работы
с базой данных).
"""

import os
import sqlite3

DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(DB_DIR, exist_ok=True)


class _BaseDatabase:
    """Общая функциональность для всех классов доступа к данным."""

    db_filename = None

    def __init__(self, db_path=None):
        self.db_path = db_path or os.path.join(DB_DIR, self.db_filename)
        self._init_db()

    def _connect(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def _init_db(self):
        raise NotImplementedError


class UsersDatabase(_BaseDatabase):
    """Хранит учётные записи (Пользователь: ФИО, логин, пароль, роль)."""

    db_filename = "users.db"

    def _init_db(self):
        with self._connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id        INTEGER PRIMARY KEY AUTOINCREMENT,
                    full_name TEXT    NOT NULL,
                    login     TEXT    NOT NULL UNIQUE,
                    password  TEXT    NOT NULL,
                    role      TEXT    NOT NULL CHECK (role IN ('охранник', 'начальник охраны'))
                )
            """)

    def find_by_login(self, login):
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM users WHERE login = ?", (login,)).fetchone()
            return dict(row) if row else None

    def find_by_credentials(self, login, password):
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM users WHERE login = ? AND password = ?",
                (login, password),
            ).fetchone()
            return dict(row) if row else None

    def add_user(self, full_name, login, password, role):
        with self._connect() as conn:
            cur = conn.execute(
                "INSERT INTO users (full_name, login, password, role) VALUES (?, ?, ?, ?)",
                (full_name, login, password, role),
            )
            return cur.lastrowid


class BuildingsDatabase(_BaseDatabase):
    """Хранит охраняемые учебные корпуса."""

    db_filename = "buildings.db"

    def _init_db(self):
        with self._connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS buildings (
                    id           INTEGER PRIMARY KEY AUTOINCREMENT,
                    name         TEXT    NOT NULL,
                    address      TEXT    NOT NULL,
                    object_type  TEXT    NOT NULL,
                    checkpoints  INTEGER NOT NULL DEFAULT 1
                )
            """)

    def get_all(self):
        with self._connect() as conn:
            rows = conn.execute("SELECT * FROM buildings ORDER BY id").fetchall()
            return [dict(r) for r in rows]

    def get_by_id(self, building_id):
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM buildings WHERE id = ?", (building_id,)).fetchone()
            return dict(row) if row else None

    def add(self, name, address, object_type, checkpoints):
        with self._connect() as conn:
            cur = conn.execute(
                "INSERT INTO buildings (name, address, object_type, checkpoints) VALUES (?, ?, ?, ?)",
                (name, address, object_type, checkpoints),
            )
            return cur.lastrowid

    def delete(self, building_id):
        with self._connect() as conn:
            conn.execute("DELETE FROM buildings WHERE id = ?", (building_id,))


class GuardsDatabase(_BaseDatabase):
    """Хранит сотрудников охраны."""

    db_filename = "guards.db"

    STATUSES = ("на посту", "на обходе", "не на смене")

    def _init_db(self):
        with self._connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS guards (
                    id        INTEGER PRIMARY KEY AUTOINCREMENT,
                    full_name TEXT    NOT NULL,
                    position  TEXT    NOT NULL,
                    phone     TEXT    NOT NULL,
                    status    TEXT    NOT NULL DEFAULT 'не на смене'
                )
            """)

    def get_all(self):
        with self._connect() as conn:
            rows = conn.execute("SELECT * FROM guards ORDER BY id").fetchall()
            return [dict(r) for r in rows]

    def get_by_id(self, guard_id):
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM guards WHERE id = ?", (guard_id,)).fetchone()
            return dict(row) if row else None

    def add(self, full_name, position, phone, status="не на смене"):
        with self._connect() as conn:
            cur = conn.execute(
                "INSERT INTO guards (full_name, position, phone, status) VALUES (?, ?, ?, ?)",
                (full_name, position, phone, status),
            )
            return cur.lastrowid

    def update_status(self, guard_id, status):
        with self._connect() as conn:
            conn.execute("UPDATE guards SET status = ? WHERE id = ?", (status, guard_id))

    def delete(self, guard_id):
        with self._connect() as conn:
            conn.execute("DELETE FROM guards WHERE id = ?", (guard_id,))


class IncidentsDatabase(_BaseDatabase):
    """Хранит журнал тревог (инцидентов)."""

    db_filename = "incidents.db"

    STATUSES = ("Активна", "Решена", "Ложная")

    def _init_db(self):
        with self._connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS incidents (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    building_id INTEGER NOT NULL,
                    guard_id    INTEGER NOT NULL,
                    description TEXT    NOT NULL,
                    incident_date TEXT  NOT NULL,
                    status      TEXT    NOT NULL DEFAULT 'Активна'
                )
            """)

    def get_all(self):
        with self._connect() as conn:
            rows = conn.execute("SELECT * FROM incidents ORDER BY id").fetchall()
            return [dict(r) for r in rows]

    def add(self, building_id, guard_id, description, incident_date, status="Активна"):
        with self._connect() as conn:
            cur = conn.execute(
                """INSERT INTO incidents (building_id, guard_id, description, incident_date, status)
                   VALUES (?, ?, ?, ?, ?)""",
                (building_id, guard_id, description, incident_date, status),
            )
            return cur.lastrowid

    def update_status(self, incident_id, status):
        with self._connect() as conn:
            conn.execute("UPDATE incidents SET status = ? WHERE id = ?", (status, incident_id))
