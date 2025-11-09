# Study Habit Analyzer - Frontend

An AI-powered study tracker web application built with React.js and Tailwind CSS. Track your study sessions, view analytics, and get personalized recommendations and quizzes.

## ✨ Features

### 🔐 User Authentication
- **Login/Signup System**: Secure user authentication with email and password
- **User-Specific Data**: Each user's study sessions are stored separately
- **Session Persistence**: Stay logged in across browser sessions
- **User Profile Display**: Username shown in header with logout functionality

### 📚 Study Session Tracking
- **Add Sessions**: Form to enter subject, start time, and end time
- **Edit Sessions**: Inline editing with validation
- **Delete Sessions**: Remove sessions with confirmation
- **Automatic Duration Calculation**: Duration calculated from start/end times
- **Responsive Design**: Table view on desktop, card view on mobile
- **Data Persistence**: User-specific data stored in localStorage

### 📊 Dashboard & Analytics
- **Summary Cards**: 
  - Total study time (hours and minutes)
  - Current study streak (consecutive days)
  - Total sessions logged
- **Time per Subject Chart**: Bar chart (Recharts) showing hours spent on each subject
- **Subject Distribution**: Pie chart visualizing study time distribution by percentage
- **Weekly Study Time**: Line chart showing study patterns over the last 7 days
- **Strong & Weak Subjects**: 
  - Identifies top 3 performing subjects
  - Highlights areas for improvement

### 🤖 AI Recommendations (Placeholder)
- **Personalized Recommendations**: Priority-based suggestions (High, Medium, Low)
- **Recommendation Types**: Schedule optimization, break reminders, subject balance, consistency tips
- **Visual Indicators**: Color-coded priority badges and icons
- **Ready for AI Integration**: Placeholder structure ready for AI API integration

### ✏️ AI-Generated Quiz (Placeholder)
- **Interactive Quiz**: Multiple-choice questions with real-time selection
- **Subject-Based Questions**: Questions organized by subject
- **Results & Explanations**: 
  - Score calculation with percentage
  - Detailed feedback for each question
  - Explanations for correct answers
- **Reset Functionality**: Take quizzes multiple times
- **Ready for AI Integration**: Structure ready for AI-generated personalized questions

## 🛠️ Tech Stack

- **React 19** - Modern UI library with hooks
- **Vite 7** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework with custom theme
- **Recharts 3** - Chart library for data visualization (Bar, Pie, Line charts)
- **Lucide React** - Beautiful icon library
- **LocalStorage** - Client-side data persistence (per-user)

## 🎨 Design & Theme

- **Modern Purple/Indigo Theme**: Vibrant color scheme with excellent contrast
- **Responsive Design**: Mobile-first approach with breakpoints
- **Interactive UI**: Hover effects, transitions, and animations
- **Accessibility**: High contrast text, clear visual hierarchy
- **Toast Notifications**: Success/error feedback for user actions

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx              # User login component
│   │   ├── Signup.jsx             # User registration component
│   │   ├── Toast.jsx              # Toast notification component
│   │   ├── StudySessionForm.jsx   # Form to add new study sessions
│   │   ├── StudySessionList.jsx   # List/table of study sessions with edit/delete
│   │   ├── Dashboard.jsx          # Analytics dashboard with charts
│   │   ├── Recommendations.jsx   # AI recommendations section (placeholder)
│   │   └── Quiz.jsx               # AI quiz section (placeholder)
│   ├── App.jsx                    # Main app component with navigation and auth
│   ├── main.jsx                   # App entry point
│   └── index.css                  # Global styles and Tailwind imports
├── tailwind.config.js            # Tailwind configuration with custom theme
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🚀 Usage

### Getting Started
1. **Sign Up**: Create a new account with username, email, and password
2. **Log In**: Use your credentials to access the application
3. **Navigate**: Use the top navigation tabs to switch between features

### Adding a Study Session
1. Navigate to the "Study Tracker" tab
2. Fill in the subject name (e.g., "Mathematics", "Physics")
3. Select start time (date and time)
4. Select end time (must be after start time)
5. Click "Add Session" button
6. Session is automatically saved and appears in the list below

### Managing Sessions
- **Edit**: Click the "Edit" button on any session to modify it inline
- **Delete**: Click the "Delete" button to remove a session (with confirmation)
- **View**: Sessions are displayed in a table (desktop) or cards (mobile)

### Viewing Analytics
1. Navigate to the "Dashboard" tab
2. View summary cards showing:
   - Total study time
   - Current streak
   - Total sessions
3. Explore interactive charts:
   - Bar chart: Time spent per subject
   - Pie chart: Subject distribution
   - Line chart: Weekly study patterns
4. Review strong and weak subjects analysis

### Getting Recommendations
1. Navigate to the "Recommendations" tab
2. View AI-generated study recommendations with priorities
3. Each recommendation includes:
   - Title and description
   - Priority level (High/Medium/Low)
   - Visual indicators
4. *Note: Currently showing placeholder data - AI integration coming soon*

### Taking a Quiz
1. Navigate to the "Quiz" tab
2. Read each question carefully
3. Select your answer from multiple-choice options
4. Click "Submit Quiz" when finished
5. View your results:
   - Overall score and percentage
   - Correct/incorrect answers
   - Detailed explanations
6. Click "Take Another Quiz" to reset and try again
7. *Note: Currently showing placeholder questions - AI integration coming soon*

## 💾 Data Persistence

- **User Accounts**: Stored in browser localStorage
- **Study Sessions**: Automatically saved per user (key: `studySessions_${userId}`)
- **Current User**: Session persists across browser refreshes
- **Data Isolation**: Each user's data is completely separate
- **Note**: Data is stored locally and won't sync across devices/browsers

## 🔮 Future Enhancements

### AI Integration Points

1. **Recommendations Component** (`src/components/Recommendations.jsx`)
   - **Location**: Line 12-45 (`getPlaceholderRecommendations()`)
   - **Integration**: Replace with AI API call
   - **Features to add**:
     - Analyze study patterns and identify learning gaps
     - Generate personalized study schedules
     - Recommend optimal study times based on performance
     - Suggest subject prioritization

2. **Quiz Component** (`src/components/Quiz.jsx`)
   - **Location**: Line 15-53 (`placeholderQuestions` array)
   - **Integration**: Replace with AI-generated questions
   - **Features to add**:
     - Generate questions based on logged study subjects
     - Adapt difficulty based on user performance
     - Create subject-specific quizzes
     - Generate questions from study session topics
     - Provide adaptive learning paths

### Backend Integration

To integrate with a backend API:

1. **Authentication**:
   - Replace localStorage user storage with JWT tokens
   - Add API endpoints for login/signup
   - Implement token refresh mechanism

2. **Study Sessions**:
   - Replace localStorage with REST API calls
   - Add endpoints: GET, POST, PUT, DELETE `/api/sessions`
   - Implement real-time sync

3. **Data Sync**:
   - Sync data across devices
   - Add offline support with sync queue
   - Implement conflict resolution

4. **AI Services**:
   - Connect to AI recommendation service
   - Integrate quiz generation API
   - Add real-time AI analysis

## 🎨 Customization

### Styling
- **Tailwind Config**: `tailwind.config.js`
  - Custom primary colors (purple/indigo theme)
  - Accent colors for success states
  - Extend theme as needed
- **Global Styles**: `src/index.css`
  - Custom animations (fade-in, slide-in)
  - Scrollbar hiding utilities
- **Component Styles**: Each component uses Tailwind utility classes

### Adding New Features
- **Component Structure**: Follow existing patterns in `src/components/`
- **State Management**: Use React hooks (useState, useEffect)
- **User Feedback**: Use the Toast component for notifications
- **Icons**: Use Lucide React icons (already imported)
- **Charts**: Use Recharts components (already set up)

### Code Organization
- **Components**: Modular, reusable, well-commented
- **Props**: Clear prop types and documentation
- **Functions**: Pure functions where possible
- **Comments**: JSDoc-style comments for easy understanding

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for educational purposes.
