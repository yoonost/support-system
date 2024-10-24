# Customer Support System

[![tests](https://github.com/yoonost/support-system/actions/workflows/tests.yml/badge.svg)](https://github.com/yoonost/support-system/actions/workflows/tests.yml)

## Overview
This is a comprehensive customer support system that allows users to submit tickets through multiple channels: website, email, and Telegram. All tickets are synchronized within the system, ensuring smooth management and enabling support agents to respond more quickly to customer requests.

## Project Status
All systems are stable but it is not recommended to use the project for production, because of lack of time all servers are divided instead of one service.

## Features
- **Multi-channel ticket submission**: Users can submit support tickets via:
  - Website
  - Email
  - Telegram
- **Ticket synchronization**: All tickets, regardless of the source, are fully synchronized within the system for easier management and tracking.
- **Fast response**: Thanks to synchronization and an optimized workflow, support agents can quickly respond to customer requests and resolve issues.

## How It Works
1. A customer submits a ticket from any supported channel (website, email, Telegram).
2. The ticket is instantly synchronized with the support system and assigned to an available agent.
3. Agents receive notifications and can respond promptly, reducing customer wait times.
4. All communications and ticket statuses are updated in real time across all platforms.

## Requirements
- Configuration of the system is required.
- IMAP support for handling tickets submitted via email.
- Telegram bot integration for ticket submission via Telegram.

## Usage
- **Website**: Navigate to the support page and fill out the ticket submission form.
- **Email**: Send an email to the configured support address.
- **Telegram**: Interact with the Telegram bot to submit tickets.

## Contributing
We welcome contributions! Please submit a pull request or report any issues via GitHub.
