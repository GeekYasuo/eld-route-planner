# 🚛 ELD Route Planner

A comprehensive full-stack web application that helps commercial truck drivers plan HOS-compliant routes and automatically generate Electronic Logging Device (ELD) logs.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-brightgreen)](https://eld-route-planner-2d26buef0-geekyasuos-projects.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/GeekYasuo/eld-route-planner)

## 🎯 Live Demo

**🌐 Frontend**: [https://eld-route-planner-2d26buef0-geekyasuos-projects.vercel.app](https://eld-route-planner-2d26buef0-geekyasuos-projects.vercel.app)

**Demo Routes to Try**:
- **Short Route** (Compliant): Atlanta, GA → Charlotte, NC → Jacksonville, FL
- **Long Route** (Multi-day): New York, NY → Seattle, WA → Los Angeles, CA

## 📱 Screenshots

### Route Planning Interface
Professional form designed specifically for truck drivers with built-in HOS regulation reminders.

[Route Planning Form]<img width="1367" height="922" alt="image" src="https://github.com/user-attachments/assets/006a1b6f-4a82-4662-85a6-36811851bb19" />


### Interactive Route Visualization
Real-time route mapping with custom markers for pickup, dropoff, fuel stops, and rest areas.

[Route Results with Map]<img width="1220" height="872" alt="image" src="https://github.com/user-attachments/assets/4720c0a7-f153-4454-a957-2a70230e927e" />


### Automated ELD Daily Logs
Visual time grids matching real ELD devices used by commercial drivers for DOT compliance.

[ELD Daily Logs]<img width="768" height="786" alt="image" src="https://github.com/user-attachments/assets/a1536191-04cb-4220-b7c2-19baa72e06c1" />


### HOS Compliance Dashboard
Real-time Hours of Service violation detection with professional color-coded status indicators.

[HOS Compliance]<img width="1456" height="678" alt="image" src="https://github.com/user-attachments/assets/e562e055-04f5-4972-8708-95d61832813e" />


## 🌟 Features

### ✅ HOS Compliance Checking
- **Hours of Service validation** against FMCSA regulations
- **70-hour/8-day cycle** tracking and monitoring
- **Multi-day trip detection** with automatic rest period planning
- **Real-time violation alerts** for driving and duty time limits

### 🗺️ Interactive Route Planning
- **Live route mapping** with Leaflet.js integration
- **GraphHopper API** for accurate truck routing
- **Visual markers** for pickup, dropoff, fuel stops, and rest areas
- **Route optimization** for commercial vehicles

### 📋 Automated ELD Log Generation
- **Visual time grids** matching real ELD devices
- **Duty status tracking** (Driving, On-Duty, Off-Duty, Sleeper)
- **Automatic log entries** based on planned routes
- **FMCSA-compliant formatting** ready for inspection

### 🎨 Professional UI/UX
- **Modern React interface** with responsive design
- **Real-time data visualization** and interactive components
- **Professional color coding** for compliance status
- **Mobile-friendly** design for drivers

## 🛠️ Tech Stack

### Backend
- **Django 5.1.4** - Web framework
- **Django REST Framework** - API development
- **SQLite** - Database (development)
- **GraphHopper API** - Route calculation
- **Python 3.13** - Programming language

### Frontend
- **React.js 18** - User interface
- **Leaflet.js** - Interactive mapping
- **Modern JavaScript (ES6+)** - Client-side logic
- **CSS3 & Flexbox/Grid** - Styling and layout

### Deployment & Tools
- **Vercel** - Frontend hosting
- **Git & GitHub** - Version control
- **npm** - Package management

## 📁 Project Structure

```
eld-route-planner/
├── eld_backend/                 # Django REST API
│   ├── eld_backend/            # Project settings
│   ├── routes/                 # Route calculation & HOS logic
│   ├── eld_logs/              # ELD log generation
│   └── manage.py              # Django management
├── eld-frontend/               # React application
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API integration
│   │   └── App.js            # Main application
│   └── package.json          # Frontend dependencies
├── screenshots/                # UI Screenshots
└── README.md                  # This file
```

## 🔧 Installation & Setup

### Prerequisites
- Python 3.13+
- Node.js 16+
- npm or yarn

### Backend Setup (Django)
```bash
cd eld_backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup (React)
```bash
cd eld-frontend
npm install
npm start
```

The application will be available at:
- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000

## 🎯 Key Components

### Route Calculation Service
- Integrates with GraphHopper API for truck-specific routing
- Calculates realistic driving times and distances
- Handles geocoding for address-to-coordinates conversion

### HOS Compliance Calculator
- Implements FMCSA regulations (11-hour driving, 14-hour duty limits)
- Tracks 70-hour/8-day cycles
- Detects required rest breaks and multi-day trips

### ELD Log Generator
- Creates visual daily logs with 24-hour time grids
- Automatically populates duty status changes
- Formats logs for regulatory compliance

### Interactive Map Component
- Real-time route visualization
- Custom markers for different stop types
- Responsive design with detailed legends

## 🏗️ Architecture

### API Endpoints
```
GET  /api/health/                    # Health check
POST /api/calculate-route/           # Route planning & ELD generation
```

### Data Flow
1. **User Input** → Route form (current location, pickup, dropoff, cycle hours)
2. **Route Calculation** → GraphHopper API integration
3. **HOS Analysis** → Compliance checking against regulations
4. **ELD Generation** → Automatic log creation
5. **Visualization** → Interactive maps and time grids

## 📊 Compliance Standards

This application implements:
- **FMCSA Part 395** - Hours of Service regulations
- **Property-carrying drivers** - 70-hour/8-day rule
- **Electronic Logging Device** specifications
- **Fuel stop requirements** - Every 1,000 miles

## 👤 Developer

**Himanshu Singh** - Full Stack Developer
- GitHub: [@GeekYasuo](https://github.com/GeekYasuo)
- LinkedIn: [himanshu-singh](https://www.linkedin.com/in/geekhimanshu/)

## 📝 Assessment

This project was built as a **Full Stack Developer Assessment** demonstrating:
- ✅ Full-stack application architecture
- ✅ Real-world API integration
- ✅ Complex business logic implementation
- ✅ Professional UI/UX design
- ✅ Industry-specific domain knowledge
- ✅ Production deployment capabilities

## 🚀 Future Enhancements

- [ ] Real-time GPS tracking integration
- [ ] Driver authentication system
- [ ] Fleet management dashboard
- [ ] Mobile app development
- [ ] Weather and traffic integration
- [ ] Automated IFTA reporting

---

*Built with ❤️ for the trucking industry. Helping drivers stay compliant and safe on the road.*
