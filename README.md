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
