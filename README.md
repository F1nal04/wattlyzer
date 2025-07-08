[![Version](https://img.shields.io/badge/version-0.24.0-yellow.svg?style=flat-square)](https://github.com/your-repo/tikkit-backend)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?logo=next.js&style=flat-square)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg?style=flat-square)](LICENSE)

[![Production](https://img.shields.io/badge/Production-brightgreen?logo=netlify&label=Env&style=flat-square)](https://wattlyzer.com) [![Netlify Status](https://api.netlify.com/api/v1/badges/9dfe6264-94a3-42a6-b729-dd4b84819d8d/deploy-status?style=flat-square)](https://app.netlify.com/projects/wattlyzer/deploys)

[![Development](https://img.shields.io/badge/Development-orange?logo=netlify&label=Env&style=flat-square)](https://development.wattlyzer.com) [![Netlify Dev Status](https://api.netlify.com/api/v1/badges/9dfe6264-94a3-42a6-b729-dd4b84819d8d/deploy-status?branch=development&style=flat-square)](https://app.netlify.com/projects/wattlyzer/deploys)

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
3. **Debug parameter**: When URL contains `?env=debug` parameter

Examples:

- `https://development.wattlyzer.com/` - Shows debug link
- `https://wattlyzer.com/?env=debug` - Shows debug link
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

MIT License
