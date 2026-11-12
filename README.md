# Restaurant Ordering & Kitchen Operations System

A full-featured restaurant ordering and kitchen dispatch system built with HTML, CSS, and JavaScript.

Live Site:  https://noreentolentino.github.io/restaurant-ordering---kitchen-operations-system/

## Features
- **Storefront & POS Ordering:** Interactive menu categorized by Mains, Sides, and Drinks with live cart calculation, service types (Dine-In, Takeout, Delivery), and custom order notes.
- **Kitchen Display System (KDS):** Real-time ticket queue tracking active orders, preparation statuses, and SLA color-coded timers (Green, Amber for >10 mins, Red for >20 mins).
- **Kitchen Performance Metrics:** Live KPI dashboard tracking active order counts, average preparation times, and delayed orders.
- **Menu Management (CRUD):** Add, edit, remove, and toggle availability of menu items directly from the admin panel.
- **Theme Engine:** Built-in Light and Dark mode toggle with eye-friendly neutral tones.
- **Persistence:** All orders, menu catalog, and theme preferences persist locally in the browser (`localStorage`).

## How billing & workflow works
Orders are placed through the storefront and dispatched instantly to the kitchen queue as pending tickets. Kitchen staff advance tickets from "Start Preparing" to "Mark Complete," which clears them from the active queue. Menu catalog changes and order states are updated in real time.

## Run locally
The app uses ES modules, so serve the folder with a static server such as the VS Code Live Server extension.
