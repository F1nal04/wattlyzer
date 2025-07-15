[![Version](https://img.shields.io/github/package-json/v/f1nal04/wattlyzer?style=flat-square&color=yellow)](https://github.com/F1nal04/wattlyzer/releases)
[![License](https://img.shields.io/github/license/f1nal04/wattlyzer?style=flat-square&color=yellow)](LICENSE)
[![Next.js](https://img.shields.io/github/package-json/dependency-version/f1nal04/wattlyzer/next?style=flat-square&logo=next.js&color=black)](https://nextjs.org/)

[![Production](https://img.shields.io/badge/Production-brightgreen?logo=netlify&label=env&style=flat-square)](https://wattlyzer.com) [![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fwattlyzer.de&up_color=lightgreen&down_color=red&style=flat-square)](https://wattlyzer.de) [![Netlify Status](https://api.netlify.com/api/v1/badges/9dfe6264-94a3-42a6-b729-dd4b84819d8d/deploy-status?style=flat-square)](https://app.netlify.com/projects/wattlyzer/deploys)

[![Development](https://img.shields.io/badge/Development-purple?logo=netlify&label=env&style=flat-square)](https://dev.wattlyzer.com) [![Website Development Status](https://img.shields.io/website?url=https%3A%2F%2Fdev.wattlyzer.de&up_color=lightgreen&down_color=red&style=flat-square)](https://dev.wattlyzer.de) [![Netlify Dev Status](https://api.netlify.com/api/v1/badges/9dfe6264-94a3-42a6-b729-dd4b84819d8d/deploy-status?branch=dev&style=flat-square)](https://app.netlify.com/projects/wattlyzer/deploys)

# Wattlyzer

Wattlyzer is a smart solar energy optimization tool that helps you maximize your solar energy usage and minimize costs. The application provides intelligent scheduling recommendations based on solar production forecasts and dynamic energy market prices.

## How it works

- **Intelligent Time Slot Calculation**: Determines the optimal time slots to run energy-intensive appliances like dishwashers, washing machines, and EV charging
- **Location-Based Solar Forecasting**: Uses your browser location to fetch accurate solar production forecasts from weather APIs
- **German Energy Market Integration**: Monitors real-time German energy market prices and stock market fluctuations to find the cheapest electricity rates
- **Personalized Solar Setup**: Integrates your specific solar panel configuration from the settings page to provide tailored recommendations
- **Cost Optimization**: Combines solar forecasts with dynamic pricing to minimize your energy costs by scheduling usage during peak solar production or low market prices
- **Germany-Focused**: Currently optimized for the German energy market and pricing structure

## Development

### Running locally

```bash
bun install
bun dev
```

### Debug Mode

The debug link is only visible in the following scenarios:

1. **Local development**: When running `bun dev` (NODE_ENV=development)
2. **Development subdomain**: When the hostname contains "dev" (e.g., `dev.wattlyzer.com`)
3. **Debug parameter**: When URL contains `?debug=true` parameter

Examples:

- `https://dev.wattlyzer.com/` - Shows debug link
- `https://wattlyzer.com/?debug=true` - Shows debug link
- `https://wattlyzer.com/` - No debug link

## License

Released under [Apache 2.0](/LICENSE) by [@F1nal04](https://github.com/F1nal04).
