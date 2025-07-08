[![Version](https://img.shields.io/github/package-json/v/f1nal04/wattlyzer?style=flat-square&color=yellow)](https://github.com/F1nal04/wattlyzer/releases)
[![License](https://img.shields.io/github/license/f1nal04/wattlyzer?style=flat-square&color=yellow)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?logo=next.js&style=flat-square)](https://nextjs.org/)

[![Production](https://img.shields.io/badge/Production-brightgreen?logo=netlify&label=Env&style=flat-square)](https://wattlyzer.com) [![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fwattlyzer.de&up_color=lightgreen&down_color=red&style=flat-square)](https://wattlyzer.de) [![Netlify Status](https://api.netlify.com/api/v1/badges/9dfe6264-94a3-42a6-b729-dd4b84819d8d/deploy-status?style=flat-square)](https://app.netlify.com/projects/wattlyzer/deploys)

[![Development](https://img.shields.io/badge/Development-orange?logo=netlify&label=Env&style=flat-square)](https://development.wattlyzer.com) [![Website Development Status](https://img.shields.io/website?url=https%3A%2F%2Fdevelopment.wattlyzer.de&up_color=lightgreen&down_color=red&style=flat-square)](https://development.wattlyzer.de) [![Netlify Dev Status](https://api.netlify.com/api/v1/badges/9dfe6264-94a3-42a6-b729-dd4b84819d8d/deploy-status?branch=development&style=flat-square)](https://app.netlify.com/projects/wattlyzer/deploys)

# Wattlyzer

Solar energy optimization tool for smart scheduling.

## Features

- Solar production forecasting
- Market price optimization
- Smart scheduling recommendations
- Responsive design

## Development

### Debug Mode

The debug link is only visible in the following scenarios:

1. **Local development**: When running `bun dev` (NODE_ENV=development)
2. **Development subdomain**: When the hostname contains "dev" or "development" (e.g., `development.wattlyzer.com`)
3. **Debug parameter**: When URL contains `?debug=true` parameter

Examples:

- `https://development.wattlyzer.com/` - Shows debug link
- `https://wattlyzer.com/?debug=true` - Shows debug link
- `https://wattlyzer.com/` - No debug link

### Running locally

```bash
bun install
bun dev
```

## Deployment

The app is deployed on Netlify with separate environments:

- Production: `wattlyzer.com`
- Development: `development.wattlyzer.com`

## License

Released under [Apache 2.0](/LICENSE) by [@F1nal04](https://github.com/F1nal04).
