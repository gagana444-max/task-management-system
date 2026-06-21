import socketio
from services.auth_service import decode_access_token

# Create async socket.io server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio)

@sio.on('connect')
async def connect(sid, environ, auth):
    """
    Authenticate WebSocket connection using JWT.
    Client must provide: auth={"token": "Bearer <jwt>"}
    """
    if not auth or 'token' not in auth:
        raise socketio.exceptions.ConnectionRefusedError('Authentication required')
    
    token = auth['token']
    if token.startswith("Bearer "):
        token = token.split(" ")[1]

    payload = decode_access_token(token)
    if not payload:
        raise socketio.exceptions.ConnectionRefusedError('Invalid or expired token')
    
    user_id = payload.get('sub')
    if not user_id:
        raise socketio.exceptions.ConnectionRefusedError('Invalid token payload')
    
    # Store user_id in session
    async with sio.session(sid) as session:
        session['user_id'] = str(user_id)
        
    # Join private room
    await sio.enter_room(sid, str(user_id))
    print(f"Socket.IO client {sid} connected as user {user_id}")

@sio.on('disconnect')
async def disconnect(sid):
    print(f"Socket.IO client {sid} disconnected")
