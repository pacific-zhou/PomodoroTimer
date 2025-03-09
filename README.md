# Pomodoro Timer (Vue 3 Version)

A beautiful and functional Pomodoro Timer web application built with Vue 3, featuring sound notifications and dynamic Unsplash backgrounds.

## Features

- **Pomodoro Technique**: Follow the popular time management method with customizable work and break intervals
- **Sound Notifications**: Audio alerts when a timer starts and ends
- **Beautiful Backgrounds**: Random nature and landscape images from Unsplash that change with each session
- **Responsive Design**: Works on desktop and mobile devices
- **Customizable Settings**: Adjust timer durations, auto-start, and more
- **Visual Progress**: Circular progress indicator shows remaining time
- **Local Storage**: Your settings are saved between sessions

## Technologies Used

- Vue 3 (Composition API)
- Pinia for state management
- Vite for build tooling
- CSS3 with modern features
- Unsplash API for background images
- Local Storage API
- Web Audio API

## Project Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How to Use

1. **Work Session (Pomodoro)**: By default, this is set to 25 minutes
2. **Short Break**: Take a 5-minute break after each Pomodoro
3. **Long Break**: Take a 15-minute break after completing 4 Pomodoros

### Controls

- **Start**: Begin the timer
- **Pause**: Temporarily stop the timer
- **Reset**: Reset the timer to its initial state
- **Settings**: Customize timer durations and other preferences

## Customization

Click the gear icon to access settings where you can:

- Change the duration of Pomodoro, short break, and long break sessions
- Enable/disable automatic start of the next timer
- Enable/disable sound notifications
- Enable/disable background changes between sessions

## Unsplash API

The application uses Unsplash to fetch beautiful background images. To use your own Unsplash API key:

1. Register at [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application to get an API key
3. Replace `YOUR_UNSPLASH_API_KEY` in the App.vue file with your actual API key

If you don't provide an API key, the application will use a fallback method to fetch random images.

## Project Structure

```
pomodoro-timer-vue/
├── public/
├── src/
│   ├── assets/
│   │   └── styles.css
│   ├── components/
│   │   ├── TimerContainer.vue
│   │   └── SettingsPanel.vue
│   ├── stores/
│   │   ├── timer.js
│   │   └── settings.js
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- Sound effects from [Mixkit](https://mixkit.co/)
- Background images from [Unsplash](https://unsplash.com/)
- Icons from [Font Awesome](https://fontawesome.com/) 