# simple-tagged-error

> A lightweight, type-safe utility for creating discriminated error classes with tagged union support

[![CI](https://github.com/aldotestino/simple-tagged-error/actions/workflows/ci.yml/badge.svg)](https://github.com/aldotestino/simple-tagged-error/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/simple-tagged-error.svg)](https://www.npmjs.com/package/simple-tagged-error)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🏷️ **Tagged Errors** - Automatic `_tag` property for discriminated unions
- 🔒 **Type-Safe** - Full TypeScript support with proper type inference
- 📦 **Tiny** - Zero dependencies, minimal footprint
- ⚡ **Fast** - No runtime overhead

## Installation

```bash
npm install simple-tagged-error
```

## Quick Start

```typescript
import { TaggedError } from 'simple-tagged-error';

// Create error classes
class NetworkError extends TaggedError('NetworkError') {}
class ValidationError extends TaggedError('ValidationError') {}

// Use them like standard errors
throw new NetworkError();
```

## Usage

### Errors with Properties

Add typed properties to your errors:

```typescript
class HttpError extends TaggedError('HttpError')<{
  statusCode: number;
  url: string;
}> {}

const error = new HttpError({
  statusCode: 404,
  url: 'https://api.example.com/users'
});

console.log(error._tag);        // "HttpError"
console.log(error.statusCode);  // 404
console.log(error.url);         // "https://api.example.com/users"
```

### Type-Safe Error Handling

Use discriminated unions with TypeScript's type narrowing:

```typescript
class DatabaseError extends TaggedError('DatabaseError')<{
  query: string;
}> {}

class NetworkError extends TaggedError('NetworkError')<{
  url: string;
}> {}

class ValidationError extends TaggedError('ValidationError')<{
  field: string;
}> {}

type AppError = 
  | InstanceType<typeof DatabaseError>
  | InstanceType<typeof NetworkError>
  | InstanceType<typeof ValidationError>;

function handleError(error: AppError) {
  switch (error._tag) {
    case 'DatabaseError':
      console.error(`Query failed: ${error.query}`);
      break;
    case 'NetworkError':
      console.error(`Request failed: ${error.url}`);
      break;
    case 'ValidationError':
      console.error(`Invalid field: ${error.field}`);
      break;
  }
}
```

### Result Type Pattern

Combine with Result types for functional error handling:

```typescript
type Result<T, E> = 
  | { success: true; data: T }
  | { success: false; error: E };

class FetchError extends TaggedError('FetchError')<{ url: string }> {}
class ParseError extends TaggedError('ParseError')<{ message: string }> {}

async function fetchUser(id: string): Promise<Result<User, FetchError | ParseError>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      return {
        success: false,
        error: new FetchError({ url: response.url })
      };
    }
    const data = await response.json();
    return { success: true, data };
  } catch {
    return {
      success: false,
      error: new ParseError({ message: 'Invalid JSON' })
    };
  }
}

// Usage with type narrowing
const result = await fetchUser('123');
if (!result.success) {
  switch (result.error._tag) {
    case 'FetchError':
      console.error(`Failed to fetch from ${result.error.url}`);
      break;
    case 'ParseError':
      console.error(`Parse error: ${result.error.message}`);
      break;
  }
}
```

## API

### `TaggedError(tag: string)`

Creates a new error class constructor with a `_tag` property.

**Type Parameters:**
- `T extends object` - Optional type for additional properties

**Returns:**
A constructor that creates errors with:
- `_tag` - The discriminant tag (readonly)
- `name` - Set to the tag value
- `message` - Set to the tag value
- `stack` - Standard error stack trace
- Additional properties from type `T`

## Requirements

- TypeScript 5.0 or higher (peer dependency)

## Development

```bash
bun install    # Install dependencies
bun test       # Run tests
bun run build  # Build for production
```

## License

MIT © [aldotestino](https://github.com/aldotestino)
