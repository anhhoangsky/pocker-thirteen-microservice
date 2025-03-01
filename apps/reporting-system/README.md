# Reporting System

The Reporting System is a microservice that provides comprehensive reporting capabilities for the Poker Thirteen application. It allows users to generate various types of reports, including financial reports, game statistics, player performance reports, and custom reports.

## Features

- **Financial Reporting**: Generate detailed financial reports with transaction summaries, balances, and trends.
- **Game Statistics**: Analyze game data, including win rates, player performance, and game outcomes.
- **Player Performance**: Track individual player statistics, earnings, and game history.
- **Custom Reports**: Create and save custom report templates with specific fields, filters, and layouts.
- **Export Functionality**: Export reports in various formats (JSON, CSV, PDF).

## Report Types

### Financial Reports

Financial reports provide insights into the financial aspects of the application, including:

- Transaction history
- Balance summaries
- Transaction types breakdown
- Daily/monthly financial trends

### Game Statistics Reports

Game statistics reports provide analytics on game data, including:

- Total games played
- Game type distribution
- Player participation
- Win/loss statistics

### Player Performance Reports

Player performance reports focus on individual player statistics, including:

- Win rate
- Total earnings
- Game history
- Performance trends

### Custom Reports

Custom reports allow users to define their own report structure by:

- Selecting specific fields to include
- Applying filters to data
- Defining sorting and grouping
- Configuring layout and visualization

## API Endpoints

The reporting system exposes the following endpoints through the API gateway:

### Report Templates

- `POST /reporting/templates` - Create a new report template
- `GET /reporting/templates` - Get all report templates
- `GET /reporting/templates/:id` - Get a specific report template

### Report Generation

- `POST /reporting/financial` - Generate a financial report
- `POST /reporting/game-statistics` - Generate a game statistics report
- `POST /reporting/player-performance` - Generate a player performance report
- `POST /reporting/custom` - Generate a custom report

### Report Management

- `GET /reporting` - Get all reports
- `GET /reporting/:id` - Get a specific report
- `GET /reporting/:id/download` - Download a report file
- `DELETE /reporting/:id` - Delete a report

## Usage Examples

### Generating a Financial Report

```json
POST /reporting/financial
{
  "name": "Monthly Financial Report",
  "startDate": "2023-01-01",
  "endDate": "2023-01-31",
  "format": "csv"
}
```

### Generating a Player Performance Report

```json
POST /reporting/player-performance
{
  "name": "Player Performance Analysis",
  "playerId": "123456",
  "startDate": "2023-01-01",
  "endDate": "2023-01-31",
  "format": "json"
}
```

### Creating a Custom Report Template

```json
POST /reporting/templates
{
  "name": "Custom Game Analysis",
  "type": "game_statistics",
  "description": "Analyzes game outcomes with custom filters",
  "configuration": {
    "fields": [
      {
        "name": "gameId",
        "label": "Game ID",
        "type": "string"
      },
      {
        "name": "gameType",
        "label": "Game Type",
        "type": "string"
      },
      {
        "name": "points",
        "label": "Points",
        "type": "number",
        "aggregation": "sum"
      }
    ],
    "filters": [
      {
        "field": "gameType",
        "operator": "eq",
        "defaultValue": "poker"
      }
    ],
    "sorting": [
      {
        "field": "createdAt",
        "direction": "desc"
      }
    ],
    "groupBy": ["gameType"]
  },
  "metadata": {
    "isPublic": true,
    "tags": ["games", "analysis"]
  }
}
```