# Kanban Board UI — Setup & Implementation Guide

## 📋 What's Included

This deliverable for **Member 1 — Phase 2 — Task 9 (feature/kanban-ui)** includes:

### Frontend Components (React)
- ✅ **KanbanBoard.jsx** - Main board component with state management
- ✅ **KanbanColumn.jsx** - Droppable column with task list
- ✅ **TaskCard.jsx** - Individual task card display
- ✅ **ViewToggle.jsx** - Board/Table view switcher
- ✅ **FilterBar.jsx** - Filter controls (priority, status, user)
- ✅ **SortBar.jsx** - Sort order selector
- ✅ **TaskTableView.jsx** - Table view with inline editing
- ✅ **Tasks.jsx** - Page component
- ✅ **App.jsx** - Updated with React Router setup
- ✅ **ProtectedRoute.jsx** - Updated for proper routing

### Updated Configuration
- ✅ **package.json** - Added dependencies:
  - `react-router-dom` (v6.20.0) - Client-side routing
  - `react-beautiful-dnd` (v13.1.1) - Drag-and-drop
  - `axios` (v1.6.2) - HTTP client

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Setup
Ensure `.env` file in frontend root has:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🎯 Features Implemented

### Kanban Board
- **3-Column Layout**: To Do → In Progress → Done
- **Drag-and-Drop**: Move tasks between columns to update status
- **Task Count**: Badge showing number of tasks per column
- **Responsive**: 1 column on mobile, 3 columns on desktop

### Task Card Display
- Task title and description preview
- Priority badge (High/Medium/Low) with color coding
- Status indicator
- Due date display
- Assignee name with avatar initial

### Table View
- All tasks in tabular format
- Sortable columns (click headers)
- Inline status dropdown for quick updates
- Horizontal scroll on mobile
- Compact, professional design

### View Toggle
- Switch between **Board View** and **Table View**
- Visual indicator of active view
- State persists during session

### Filtering
Filter tasks by:
- **Priority**: High, Medium, Low
- **Status**: To Do, In Progress, Done
- **Assigned User**: (populated from `/api/users`)
- **Combined Filters**: All filters work together (AND logic)

### Sorting
6 sort options available:
- Creation Date (Newest) — default
- Creation Date (Oldest)
- Due Date (Soonest)
- Due Date (Latest)
- Priority (High First)
- Priority (Low First)

### Error Handling
- Loading spinners while fetching data
- Error messages for failed requests
- Automatic recovery on drag-and-drop errors
- Graceful fallback UI states

---

## 📡 API Integration

### Expected Endpoints (from Member 2 — Task 6)

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer {token}

Response:
[
  {
    "id": 1,
    "title": "Task Title",
    "description": "Description",
    "status": "to-do",
    "priority": "high",
    "due_date": "2026-06-20T00:00:00Z",
    "assigned_to": "John Doe",
    "created_at": "2026-06-10T00:00:00Z"
  }
]
```

#### Update Task Status
```http
PATCH /api/tasks/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in-progress"
}

Response:
{
  "id": 1,
  "status": "in-progress",
  ...
}
```

#### Get Users (for filter selector)
```http
GET /api/users
Authorization: Bearer {token}

Response:
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
]
```

---

## 🎨 Styling

All components use **Tailwind CSS**:
- Responsive grid layouts
- Color-coded priority levels
- Smooth transitions and hover effects
- Accessible color contrast
- Mobile-first design

### Color Scheme
- **Priority High**: Red (#ef4444)
- **Priority Medium**: Yellow (#eab308)
- **Priority Low**: Green (#22c55e)
- **Primary Action**: Indigo (#4f46e5)
- **Backgrounds**: Gray scales

---

## 🔄 Drag-and-Drop Workflow

1. **User drags task card** in board view
2. **Visual feedback**: Slight rotation and shadow
3. **Card drops into new column**
4. **Optimistic update**: Status changes immediately
5. **Backend sync**: API call to `/api/tasks/{id}`
6. **Success**: Task persists in new status
7. **Error handling**: Automatic refetch on failure

---

## 📱 Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| Mobile    | 1 column (tasks stack) |
| Tablet    | 1-2 columns |
| Desktop   | 3 columns (full board) |

---

## 🔐 Authentication

- Uses JWT tokens stored in localStorage
- Axios interceptor adds token to all requests
- Automatic redirect to login on 401 errors
- Protected route wrapper validates user before rendering

---

## 🧪 Testing Checklist

- [ ] Dependencies installed: `npm list react-beautiful-dnd`
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can login successfully
- [ ] Kanban board loads with tasks
- [ ] Can drag tasks between columns
- [ ] Status updates persist on backend
- [ ] Table view displays all tasks
- [ ] Filters work individually and combined
- [ ] Sorting options apply correctly
- [ ] Responsive design works on mobile/tablet
- [ ] Error messages display on API failures
- [ ] Can view multiple pages without errors

---

## 📝 File Structure

```
frontend/src/
├── components/
│   ├── KanbanBoard.jsx        (Main orchestrator)
│   ├── KanbanColumn.jsx       (Droppable column)
│   ├── TaskCard.jsx           (Task display)
│   ├── ViewToggle.jsx         (View switcher)
│   ├── FilterBar.jsx          (Filters)
│   ├── SortBar.jsx            (Sort selector)
│   ├── TaskTableView.jsx      (Table display)
│   └── ProtectedRoute.jsx     (Route guard)
├── pages/
│   ├── Tasks.jsx              (Page wrapper)
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── context/
│   └── AuthContext.jsx
├── layouts/
│   └── MainLayout.jsx
├── api/
│   └── axios.js
├── App.jsx                    (Routes)
└── main.jsx                   (Entry point)
```

---

## 🚦 Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📦 Dependencies Version Matrix

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.6 | UI library |
| react-dom | 19.2.6 | DOM rendering |
| react-router-dom | 6.20.0 | Client routing |
| react-beautiful-dnd | 13.1.1 | Drag-and-drop |
| axios | 1.6.2 | HTTP requests |
| tailwindcss | 3.4.19 | Styling |

---

## ⚠️ Known Limitations & Notes

1. **Real-time updates**: WebSocket notifications handled separately (Task 8)
2. **Comments/Attachments**: Handled separately (Task 7)
3. **Admin functionality**: Role-based restrictions implemented separately (Phase 3)
4. **Bulk operations**: Not included in this phase
5. **Export functionality**: Not included in this phase

---

## 🔗 Related Tasks

- **Task 6 (Member 2)**: Task Management API backend
- **Task 7 (Member 4)**: Comments & Attachments API
- **Task 8 (Member 3)**: WebSocket real-time notifications
- **Task 10 (Member 5)**: Task creation/edit forms
- **Task 12 (Member 1 — Phase 3)**: Security hardening

---

## 📞 Support & Troubleshooting

### Issue: "react-beautiful-dnd not found"
**Solution**: Run `npm install` in frontend folder

### Issue: "Cannot GET /api/tasks"
**Solution**: Ensure backend is running on port 5000 and Task API is implemented

### Issue: Drag-and-drop not working
**Solution**: Verify react-beautiful-dnd is installed. Check browser console for errors

### Issue: Filters not applying
**Solution**: Ensure backend returns proper `status`, `priority`, and `assigned_to` fields

---

## ✅ Deliverables Summary

✅ Fully functional Kanban board UI  
✅ Drag-and-drop task management  
✅ Board and table view modes  
✅ Multi-criteria filtering  
✅ Dynamic sorting  
✅ Error handling & loading states  
✅ Responsive design  
✅ React Router integration  
✅ Authentication-aware  
✅ Production-ready code  

---

**Branch**: `feature/kanban-ui`  
**Member**: Member 1  
**Phase**: Phase 2  
**Task**: Task 9  
**Submission**: By 10 June 2026
