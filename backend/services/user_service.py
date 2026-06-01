from models.user_model import UserCreate, UserUpdate, UserRoleUpdate, UserStatusUpdate

# In-Memory Database
users_db = {}
current_id = 1

def create_user(user_data: UserCreate):
    global current_id
    new_user = {
        "id": current_id,
        "name": user_data.name,
        "email": user_data.email,
        "role": user_data.role,
        "is_active": True,
        "password": user_data.password  # Storing plain text password for this mock ONLY
    }
    users_db[current_id] = new_user
    current_id += 1
    return new_user

def get_all_users(role: str = None, q: str = None):
    results = list(users_db.values())
    if role:
        results = [u for u in results if u["role"].lower() == role.lower()]
    if q:
        q_lower = q.lower()
        results = [u for u in results if q_lower in u["name"].lower() or q_lower in u["email"].lower()]
    return results

def get_user_by_id(user_id: int):
    if user_id not in users_db:
        raise KeyError(f"User with ID {user_id} not found")
    return users_db[user_id]

def update_user(user_id: int, user_update: UserUpdate):
    user = get_user_by_id(user_id)
    if user_update.name is not None:
        user["name"] = user_update.name
    if user_update.email is not None:
        user["email"] = user_update.email
    return user

def update_user_status(user_id: int, status_update: UserStatusUpdate):
    user = get_user_by_id(user_id)
    user["is_active"] = status_update.is_active
    return user

def update_user_role(user_id: int, role_update: UserRoleUpdate):
    user = get_user_by_id(user_id)
    user["role"] = role_update.role
    return user
