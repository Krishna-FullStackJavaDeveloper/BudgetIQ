# BudgetIQ - A Full Stack Web Application

**BudgetIQ** is a web application designed to provide users with a comprehensive and secure platform for managing their budgets. It leverages Java, Spring Boot, and React with Material UI to offer a seamless user experience. This app uses role-based authentication and a set of advanced features, including two-factor authentication (email), token refresh, and optimized backend functionality.

## Technologies Used

### Backend
- **Java 17**: The core backend is developed using Java.
- **Spring Boot**: A robust and scalable backend framework.
- **Spring Security**: Implemented role-based authentication and security features.
- **Spring Boot Role-Based Authentication**: Utilizes `spring-boot-role-base-auth` for managing user roles and secure access to resources.
- **JWT Tokens**: JSON Web Tokens for secure authentication and token refreshing.
- **Multithreading**: Leveraged for better performance and concurrent processing.
- **Optimized Code**: Focused on optimized time and space complexity, as well as garbage collection efficiency.
- **Global Exception Handling**: Centralized exception handling for consistent API responses.
- **Email Notifications**: Global email configuration for various events (e.g., successful login).
- **Two-Factor Authentication (Email)**: Configured for increased security during login.
- **API Response Standardization**: Updated the API response structure to ensure consistent and clear data formatting.

### Frontend
- **React**: A JavaScript library for building user interfaces.
- **Material UI**: A popular React component library for modern, accessible designs.
- **Redux**: For managing application state.
- **Axios**: For making API requests to the backend.

## Features

### Backend Features
- **Role-Based Authentication**: Secure user authentication and authorization with role-specific access.
- **Token Refresh**: Ensures seamless user experience by refreshing JWT tokens before they expire.
- **Global Exception Handling**: Consistent error handling across all API endpoints.
- **Optimized Code**: Improvements in time and space complexity, better garbage collection, and multithreading for high performance.
- **Email Notifications**: Configured to send notifications (e.g., after successful login).
- **Two-Factor Authentication**: Email-based 2FA for additional security during user login.
- **API Response Standardization**: Structured responses to maintain consistency.

### Frontend Features
- **Material UI**: Responsive design for user-friendly interfaces.
- **Redux**: Centralized state management for better performance and easier maintenance.
- **Axios Integration**: Smooth API request handling with error handling mechanisms.
  
## Setup Instructions

### Prerequisites
- Java 17 or higher
- Node.js and npm
- MySQL (or any other database of your choice)

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Krishna-FullStackJavaDeveloper/BudgetIQ.git

