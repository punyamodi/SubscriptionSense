# SubSync - Subscription Management App

<p align="center">
  <strong>Never miss a subscription renewal again. Track, manage, and optimize all your subscriptions in one beautiful app.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react&logoColor=white" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-12.3-FFCA28?logo=firebase&logoColor=white" alt="Firebase" />
</p>

## 📱 App Showcase

### Dashboard Overview
Track all your subscriptions at a glance with smart insights and spending analytics.

<img src="./images/WhatsApp Image 2026-03-02 at 02.03.18.jpeg" width="300" alt="Dashboard - Monthly commitment and renewal insights" />

### Manage Subscriptions
View, organize, and filter your active subscriptions with detailed information.

<img src="./images/WhatsApp Image 2026-03-02 at 02.03.18 (1).jpeg" width="300" alt="Subscriptions list with Netflix and Hitser examples" />

### Renewal Calendar
Plan ahead with an interactive calendar showing upcoming subscription renewals by month.

<img src="./images/WhatsApp Image 2026-03-02 at 02.03.19.jpeg" width="300" alt="Calendar view for renewal schedule" />

### Financial Analytics
Get detailed breakdowns of spending by category and smart insights about your subscription habits.

<img src="./images/WhatsApp Image 2026-03-02 at 02.03.19 (1).jpeg" width="300" alt="Analytics with category breakdown and spending insights" />

### Spending Insights
Visualize your subscription spending with advanced metrics and trends.

<img src="./images/WhatsApp Image 2026-03-02 at 02.03.19 (2).jpeg" width="300" alt="Insights showing category breakdown pie chart" />

### Customizable Settings
Control your preferences including language, theme, notifications, and data management.

<img src="./images/WhatsApp Image 2026-03-02 at 02.03.20.jpeg" width="300" alt="Settings with preferences and account options" />

<img src="./images/WhatsApp Image 2026-03-02 at 02.03.20 (1).jpeg" width="300" alt="Settings menu with more options" />

## 🎯 Key Features

- **💰 Smart Dashboard** - See your monthly commitment, daily burn rate, and active subscriptions at a glance
- **📅 Renewal Calendar** - Track upcoming renewals with an interactive calendar view
- **📊 Analytics & Insights** - Understand your spending patterns with category breakdowns and trends
- **🔍 Subscription Search** - Easily find subscriptions with built-in search functionality
- **🏷️ Smart Categorization** - Subscriptions organized by category (Streaming, Software, etc.)
- **🌙 Dark Mode** - Easy on the eyes with native dark theme support
- **🔔 Renewal Notifications** - Get alerts before your subscriptions renew
- **🌍 Multi-Language Support** - Available in multiple languages
- **☁️ Cloud Sync** - Sync your data across devices (when connected to Firebase)
- **💾 Data Export/Import** - Download your data as JSON or restore from backups

## 🛠️ Tech Stack

- **React Native & Expo** - Cross-platform mobile development
- **TypeScript** - Type-safe code
- **React Navigation** - Smooth app navigation
- **Zustand** - Lightweight state management
- **React Query** - Data fetching and caching
- **Firebase** - Backend and authentication
- **React Native Reanimated** - Smooth animations
- **Expo Linear Gradient** - Beautiful gradient UI components

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mobile-app-starterkit

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Your Phone

1. Install **Expo Go** from your app store
2. Scan the QR code from the terminal
3. The app loads instantly on your device!

### Development Commands

```bash
# Start with Expo Go
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator
npm run ios

# Run in web browser
npm run web

# Start with seed data (demo mode)
npm run dev:seed

# Clear cache and restart with seed data
npm run dev:seed:clear
```

## 📋 Project Structure

```
src/
├── app/                    # Navigation and entry points
├── screens/               # App screens (Dashboard, Calendar, etc.)
├── components/            # Reusable UI components
├── services/              # Business logic and API calls
├── state/                 # Zustand stores (global state)
├── theme/                 # Design tokens and styling
├── config/                # App configuration
└── types/                 # TypeScript type definitions
```

## 🔐 Authentication

The app supports both mock authentication (for development) and Firebase authentication (for production). Switch between modes via environment variables.

## 🎨 Design System

The app features a premium dark theme with:
- **Obsidian Finance** typography system using Spectral (serif) and Outfit (sans-serif)
- Golden accent colors (#B8860B) for premium feel
- Smooth animations with React Native Reanimated
- Responsive layouts for all screen sizes

## 🔄 Data Persistence

- **MMKV Storage** - Fast, encrypted local data storage
- **Firebase Realtime Database** - Cloud data sync (optional)
- **React Query** - Intelligent caching and data management

## 📈 Future Roadmap

- [ ] Bill splitting feature
- [ ] AI-powered savings recommendations
- [ ] Subscription sharing insights
- [ ] Integration with payment methods
- [ ] Web dashboard
- [ ] Family/household sharing
- [ ] Advanced analytics and trends

## 🤝 Contributing

We'd love to see community contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows our TypeScript and style conventions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- State management with [Zustand](https://github.com/pmndrs/zustand)
- Data fetching with [React Query](https://tanstack.com/query)
- Animations powered by [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated)

---

**SubSync** - Take control of your subscriptions, one renewal at a time. 🚀
