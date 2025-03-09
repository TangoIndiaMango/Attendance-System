# Attendance  System

A modern, real-time attendance tracking system built with Next.js 14, MongoDB, and TypeScript. This system provides an efficient way to manage and monitor attendance for organizations, teams, or educational institutions.

<!-- ![License](https://img.shields.io/badge/license-MIT-blue.svg) -->
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## Features

### For Administrators
- **Real-time Attendance Monitoring**
  - Start attendance windows
  - Track present/absent status
  - Monitor late arrivals
  - View attendance analytics

- **User Management**
  - Add/remove users
  - Track individual attendance history
  - Manage penalties for absences
  - Set attendance policies

- **Session Management**
  - Create custom sessions
  - Set duration and policies
  - Manage recurring sessions
  - Control access permissions

### For Users
- **Easy Attendance Marking**
  - Simple one-click attendance
  - Real-time status updates
  - Personal attendance history
  - Late submission handling

- **Dashboard Features**
  - View attendance statistics
  - Track penalties
  - Access session history
  - Personal analytics

## Tech Stack

- **Frontend**
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui Components
  - Framer Motion

- **Backend**
  - MongoDB
  - Mongoose ODM
  - Next.js API Routes
  - Server Actions

- **Authentication**
  - JWT for admin auth
  - Secure session management

## Getting Started

### Prerequisites
- Node.js 18.17 or later
- MongoDB database
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/attendance-system.git
cd attendance-system
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

### Initial Setup

1. Create an admin account using the setup endpoint
2. Configure basic settings
3. Add users to the system
4. Start creating attendance sessions

## API Documentation

### Admin Endpoints
- `POST /api/admin/sessions` - Create new session
- `GET /api/admin/users` - List all users
- `POST /api/admin/attendance/start` - Start attendance window

### User Endpoints
- `POST /api/attendance/:sessionId` - Mark attendance
- `GET /api/users/:userId/stats` - Get user statistics

<!-- [Full API Documentation](docs/API.md)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request -->

<!-- ## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. -->
<!-- 
## MIT License

```text
Copyright (c) 2024 [Your Name/Organization]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. -->
<!-- ``` -->

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- All contributors and supporters

## Support

For support, please open an issue in the GitHub repository or contact [your-email@example.com](mailto:your-email@example.com).

## Roadmap

- [ ] Mobile application
- [ ] Biometric integration
- [ ] Advanced analytics
- [ ] Multi-organization support
- [ ] API access tokens
- [ ] Webhook integrations

---

Built with ❤️ by [Timilehin Aliyu]
