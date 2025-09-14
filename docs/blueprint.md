# **App Name**: MyAdminCaptiva

## Core Features:

- User List Display: Display the list of guest accounts (username, password, MAC address, upload limit, and download limit) in a Bootstrap table format.
- Add User Form: Create a Bootstrap form to add new guest accounts with fields for username, password, MAC address, upload limit (bytes), and download limit (bytes).
- API Endpoint: Develop a micro API endpoint (/api/users) that returns the guest account list in JSON format.
- MAC Address Helper: If a guest account lacks a MAC address, automatically create one that is unique from those in use; suggest it for the user, who can accept or reject the suggestion.

## Style Guidelines:

- Primary color: Blue (#3498db) to provide a sense of trust and security.
- Background color: Light gray (#f0f2f5) for a clean and modern look.
- Accent color: Orange (#e67e22) for interactive elements and call-to-action buttons, creating contrast.
- Font: 'Inter', a sans-serif font for both headings and body text, ensures a modern and easily readable experience. This sans-serif will support digital legibility.
- Bootstrap 5 grid system to create a responsive and user-friendly layout. The user list table and the add user form are contained with cards.
- Use simple and consistent icons from a library like FontAwesome for actions like add, edit, and delete users.